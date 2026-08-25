import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, List
from app.ml.feature_metadata import get_feature_metadata

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
SHAP_VIS_DIR = os.path.join(BASE_DIR, "docs", "visualizations", "shap")


def calculate_global_shap_importance(
    shap_matrix: np.ndarray,
    feature_names: List[str],
    save_plot: bool = True
) -> List[Dict[str, Any]]:
    """Calculate mean absolute SHAP values across dataset for global feature importance.
    
    Args:
        shap_matrix (np.ndarray): Matrix of SHAP values (n_samples x n_features).
        feature_names (List[str]): List of feature column names.
        save_plot (bool): Whether to export global SHAP importance bar chart.
        
    Returns:
        List[Dict[str, Any]]: Sorted list of global feature importances.
    """
    mean_abs_shap = np.mean(np.abs(shap_matrix), axis=0)

    importance_list = []
    for idx, feat in enumerate(feature_names):
        meta = get_feature_metadata(feat)
        val = float(round(mean_abs_shap[idx], 2))
        importance_list.append({
            "feature": feat,
            "display_name": meta["display_name"],
            "unit": meta["unit"],
            "mean_abs_shap": val,
        })

    importance_list.sort(key=lambda x: x["mean_abs_shap"], reverse=True)

    if save_plot:
        os.makedirs(SHAP_VIS_DIR, exist_ok=True)
        top_df = pd.DataFrame(importance_list[:12])

        plt.figure(figsize=(10, 6))
        sns.barplot(data=top_df, x="mean_abs_shap", y="display_name", palette="viridis")
        plt.title("Global SHAP Feature Importance (Mean |SHAP Value| in kg CO₂)")
        plt.xlabel("Mean |SHAP Value| (kg CO₂)")
        plt.ylabel("Operational Feature")
        plt.tight_layout()
        plt.savefig(os.path.join(SHAP_VIS_DIR, "global_shap_importance.png"))
        plt.close()

    return importance_list
