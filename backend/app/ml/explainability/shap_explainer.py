import shap
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor


class SHAPExplainerManager:
    """Manages cached TreeExplainer instances for Random Forest and XGBoost models."""

    def __init__(self):
        self._rf_explainer = None
        self._xgb_explainer = None
        self._rf_model_id = None
        self._xgb_model_id = None

    def get_rf_explainer(self, rf_model: RandomForestRegressor) -> shap.TreeExplainer:
        """Get or initialize cached TreeExplainer for Random Forest."""
        model_id = id(rf_model)
        if self._rf_explainer is None or self._rf_model_id != model_id:
            self._rf_explainer = shap.TreeExplainer(rf_model)
            self._rf_model_id = model_id
        return self._rf_explainer

    def get_xgb_explainer(self, xgb_model: XGBRegressor) -> shap.TreeExplainer:
        """Get or initialize cached TreeExplainer for XGBoost."""
        model_id = id(xgb_model)
        if self._xgb_explainer is None or self._xgb_model_id != model_id:
            self._xgb_explainer = shap.TreeExplainer(xgb_model)
            self._xgb_model_id = model_id
        return self._xgb_explainer


explainer_manager = SHAPExplainerManager()
