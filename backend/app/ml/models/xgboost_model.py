import pandas as pd
import numpy as np
from typing import Dict, Any
from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit, RandomizedSearchCV


def train_xgb_baseline(X_train: pd.DataFrame, y_train: pd.Series, random_state: int = 42) -> XGBRegressor:
    """Train baseline XGBoost Regressor."""
    model = XGBRegressor(
        n_estimators=100,
        random_state=random_state,
        objective="reg:squarederror",
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    return model


def tune_xgb_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    random_state: int = 42
) -> XGBRegressor:
    """Perform hyperparameter tuning for XGBoost Regressor using TimeSeriesSplit CV."""
    param_distributions = {
        "n_estimators": [50, 100, 150],
        "max_depth": [3, 5, 7],
        "learning_rate": [0.03, 0.05, 0.1, 0.2],
        "subsample": [0.7, 0.85, 1.0],
        "colsample_bytree": [0.7, 0.85, 1.0],
        "min_child_weight": [1, 3, 5],
        "reg_alpha": [0.0, 0.1, 1.0],
        "reg_lambda": [0.1, 1.0, 5.0],
    }

    tscv = TimeSeriesSplit(n_splits=3)
    xgb = XGBRegressor(random_state=random_state, objective="reg:squarederror", n_jobs=-1)

    search = RandomizedSearchCV(
        estimator=xgb,
        param_distributions=param_distributions,
        n_iter=10,
        cv=tscv,
        scoring="neg_root_mean_squared_error",
        random_state=random_state,
        n_jobs=-1,
    )

    search.fit(X_train, y_train)
    print(f"[XGB Tuning] Best Params: {search.best_params_}")
    return search.best_estimator_


def get_xgb_feature_importance(model: XGBRegressor, feature_names: list) -> pd.DataFrame:
    """Extract and sort XGBoost feature importances."""
    importances = model.feature_importances_
    fi_df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    }).sort_values("importance", ascending=False).reset_index(drop=True)
    return fi_df
