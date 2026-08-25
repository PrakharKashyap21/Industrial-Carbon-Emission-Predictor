import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit, RandomizedSearchCV


def train_rf_baseline(X_train: pd.DataFrame, y_train: pd.Series, random_state: int = 42) -> RandomForestRegressor:
    """Train baseline Random Forest Regressor."""
    model = RandomForestRegressor(
        n_estimators=100,
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    return model


def tune_rf_model(X_train: pd.DataFrame, y_train: pd.Series, random_state: int = 42) -> RandomForestRegressor:
    """Perform hyperparameter tuning for Random Forest using TimeSeriesSplit CV."""
    param_distributions = {
        "n_estimators": [50, 100, 150, 200],
        "max_depth": [None, 5, 10, 15, 20],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4],
        "max_features": ["sqrt", "log2", 1.0],
    }

    tscv = TimeSeriesSplit(n_splits=3)
    rf = RandomForestRegressor(random_state=random_state, n_jobs=-1)

    search = RandomizedSearchCV(
        estimator=rf,
        param_distributions=param_distributions,
        n_iter=10,
        cv=tscv,
        scoring="neg_root_mean_squared_error",
        random_state=random_state,
        n_jobs=-1,
    )

    search.fit(X_train, y_train)
    print(f"[RF Tuning] Best Params: {search.best_params_}")
    return search.best_estimator_


def get_rf_feature_importance(model: RandomForestRegressor, feature_names: list) -> pd.DataFrame:
    """Extract and sort Random Forest feature importances."""
    importances = model.feature_importances_
    fi_df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    }).sort_values("importance", ascending=False).reset_index(drop=True)
    return fi_df
