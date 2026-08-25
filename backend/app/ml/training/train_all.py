import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from app.ml.evaluation.metrics import evaluate_regression_metrics
from app.ml.models.random_forest import train_rf_baseline, tune_rf_model, get_rf_feature_importance
from app.ml.models.xgboost_model import train_xgb_baseline, tune_xgb_model, get_xgb_feature_importance
from app.ml.models.ensemble import predict_ensemble, optimize_ensemble_weights
from app.ml.models.model_loader import save_model_artifacts

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
DOCS_DIR = os.path.join(BASE_DIR, "docs")
REPORTS_DIR = os.path.join(BASE_DIR, "data", "reports")
MODELS_DIR = os.path.join(BASE_DIR, "models")


def run_training_pipeline() -> dict:
    """Execute complete end-to-end model training, tuning, ensemble optimization, and evaluation."""
    os.makedirs(DOCS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. Load Processed Datasets
    X_train = pd.read_csv(os.path.join(PROCESSED_DIR, "X_train.csv"))
    X_val = pd.read_csv(os.path.join(PROCESSED_DIR, "X_validation.csv"))
    X_test = pd.read_csv(os.path.join(PROCESSED_DIR, "X_test.csv"))

    y_train = pd.read_csv(os.path.join(PROCESSED_DIR, "y_train.csv")).iloc[:, 0]
    y_val = pd.read_csv(os.path.join(PROCESSED_DIR, "y_validation.csv")).iloc[:, 0]
    y_test = pd.read_csv(os.path.join(PROCESSED_DIR, "y_test.csv")).iloc[:, 0]

    feature_names = list(X_train.columns)

    # 2. Train & Tune Random Forest
    print("\n--- Training Random Forest ---")
    rf_baseline = train_rf_baseline(X_train, y_train)
    rf_model = tune_rf_model(X_train, y_train)
    rf_val_preds = np.maximum(0, rf_model.predict(X_val))
    rf_val_metrics = evaluate_regression_metrics(y_val, rf_val_preds)
    print(f"[RF Validation Metrics] {rf_val_metrics}")

    # 3. Train & Tune XGBoost
    print("\n--- Training XGBoost ---")
    xgb_baseline = train_xgb_baseline(X_train, y_train)
    xgb_model = tune_xgb_model(X_train, y_train)
    xgb_val_preds = np.maximum(0, xgb_model.predict(X_val))
    xgb_val_metrics = evaluate_regression_metrics(y_val, xgb_val_preds)
    print(f"[XGB Validation Metrics] {xgb_val_metrics}")

    # 4. Optimize Ensemble Weight on Validation Set
    print("\n--- Optimizing Weighted Ensemble ---")
    best_rf_weight, best_val_rmse = optimize_ensemble_weights(y_val, rf_val_preds, xgb_val_preds)
    ens_val_preds = predict_ensemble(rf_val_preds, xgb_val_preds, best_rf_weight)
    ens_val_metrics = evaluate_regression_metrics(y_val, ens_val_preds)
    print(f"[Ensemble Validation Metrics] {ens_val_metrics}")

    # 5. Determine Best Candidate Based on Validation RMSE
    models_val_rmse = {
        "Random Forest": rf_val_metrics["rmse"],
        "XGBoost": xgb_val_metrics["rmse"],
        "Ensemble": ens_val_metrics["rmse"],
    }
    selected_model_name = min(models_val_rmse, key=models_val_rmse.get)
    print(f"\n>> Selected Model based on Validation RMSE: {selected_model_name}")

    # 6. Final Unbiased Evaluation on Test Set (Evaluated ONCE)
    rf_test_preds = np.maximum(0, rf_model.predict(X_test))
    xgb_test_preds = np.maximum(0, xgb_model.predict(X_test))
    ens_test_preds = predict_ensemble(rf_test_preds, xgb_test_preds, best_rf_weight)

    rf_test_metrics = evaluate_regression_metrics(y_test, rf_test_preds)
    xgb_test_metrics = evaluate_regression_metrics(y_test, xgb_test_preds)
    ens_test_metrics = evaluate_regression_metrics(y_test, ens_test_preds)

    # 7. Generate Model Comparison Table
    comparison_data = [
        {"Model": "Random Forest", "MAE": rf_test_metrics["mae"], "RMSE": rf_test_metrics["rmse"], "R²": rf_test_metrics["r2"], "MAPE (%)": rf_test_metrics["mape"], "Status": "Candidate" if selected_model_name != "Random Forest" else "Selected Winner"},
        {"Model": "XGBoost", "MAE": xgb_test_metrics["mae"], "RMSE": xgb_test_metrics["rmse"], "R²": xgb_test_metrics["r2"], "MAPE (%)": xgb_test_metrics["mape"], "Status": "Candidate" if selected_model_name != "XGBoost" else "Selected Winner"},
        {"Model": "Ensemble (RF+XGB)", "MAE": ens_test_metrics["mae"], "RMSE": ens_test_metrics["rmse"], "R²": ens_test_metrics["r2"], "MAPE (%)": ens_test_metrics["mape"], "Status": "Selected Winner" if selected_model_name == "Ensemble" else "Candidate"},
    ]

    comp_df = pd.DataFrame(comparison_data)
    comp_df.to_csv(os.path.join(DOCS_DIR, "model-comparison.csv"), index=False)

    md_table = comp_df.to_markdown(index=False)
    with open(os.path.join(DOCS_DIR, "model-comparison.md"), "w") as f:
        f.write("# Model Performance Comparison\n\n")
        f.write(f"**Primary Selection Metric:** RMSE (Evaluated on Validation Set)\n\n")
        f.write(f"**Selected Production Model:** {selected_model_name}\n\n")
        f.write("## Test Set Performance\n\n")
        f.write(md_table + "\n\n")
        f.write(f"**Ensemble Weights:** {best_rf_weight:.2f} × Random Forest + {1.0 - best_rf_weight:.2f} × XGBoost\n")

    # 8. Feature Importance & Residual Visualizations
    rf_fi = get_rf_feature_importance(rf_model, feature_names)
    xgb_fi = get_xgb_feature_importance(xgb_model, feature_names)

    # RF Feature Importance Plot
    plt.figure(figsize=(10, 6))
    sns.barplot(data=rf_fi.head(10), x="importance", y="feature", palette="Blues_r")
    plt.title("Random Forest — Top 10 Feature Importances")
    plt.xlabel("Importance Score")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "rf_feature_importance.png"))
    plt.close()

    # XGB Feature Importance Plot
    plt.figure(figsize=(10, 6))
    sns.barplot(data=xgb_fi.head(10), x="importance", y="feature", palette="Greens_r")
    plt.title("XGBoost — Top 10 Feature Importances")
    plt.xlabel("Importance Score")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "xgb_feature_importance.png"))
    plt.close()

    # Actual vs Predicted Plot (Selected Model)
    selected_test_preds = ens_test_preds if selected_model_name == "Ensemble" else (rf_test_preds if selected_model_name == "Random Forest" else xgb_test_preds)
    plt.figure(figsize=(8, 8))
    plt.scatter(y_test, selected_test_preds, alpha=0.8, color="#0284c7", edgecolors="k")
    max_val = max(y_test.max(), selected_test_preds.max())
    min_val = min(y_test.min(), selected_test_preds.min())
    plt.plot([min_val, max_val], [min_val, max_val], "r--", label="y = x (Perfect Prediction)")
    plt.title(f"Actual vs Predicted CO₂ Emission ({selected_model_name})")
    plt.xlabel("Actual CO₂ Emission (kg)")
    plt.ylabel("Predicted CO₂ Emission (kg)")
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "actual_vs_predicted.png"))
    plt.close()

    # Residuals Plot
    residuals = y_test - selected_test_preds
    plt.figure(figsize=(10, 5))
    plt.scatter(selected_test_preds, residuals, alpha=0.8, color="#059669", edgecolors="k")
    plt.axhline(0, color="r", linestyle="--")
    plt.title(f"Residual Plot ({selected_model_name})")
    plt.xlabel("Predicted CO₂ Emission (kg)")
    plt.ylabel("Residuals (Actual - Predicted kg)")
    plt.tight_layout()
    plt.savefig(os.path.join(REPORTS_DIR, "residuals.png"))
    plt.close()

    # 9. Save Model Artifacts & Metadata
    rf_metadata = {
        "model_name": "random_forest",
        "model_version": "rf_v1",
        "validation_metrics": rf_val_metrics,
        "test_metrics": rf_test_metrics,
        "best_params": rf_model.get_params(),
    }
    xgb_metadata = {
        "model_name": "xgboost",
        "model_version": "xgb_v1",
        "validation_metrics": xgb_val_metrics,
        "test_metrics": xgb_test_metrics,
        "best_params": xgb_model.get_params(),
    }
    ens_metadata = {
        "model_name": "ensemble",
        "model_version": "ensemble_v1",
        "selected_winner": selected_model_name,
        "rf_weight": best_rf_weight,
        "xgb_weight": round(1.0 - best_rf_weight, 2),
        "validation_metrics": ens_val_metrics,
        "test_metrics": ens_test_metrics,
    }

    save_model_artifacts(
        rf_model=rf_model,
        xgb_model=xgb_model,
        rf_weight=best_rf_weight,
        feature_list=feature_names,
        rf_metadata=rf_metadata,
        xgb_metadata=xgb_metadata,
        ens_metadata=ens_metadata,
        models_dir=MODELS_DIR,
    )

    # Save Models README
    with open(os.path.join(MODELS_DIR, "README.md"), "w") as f:
        f.write("# Model Registry\n\n")
        f.write("| Model Name | Version | Val RMSE | Test RMSE | Status |\n")
        f.write("| :--- | :--- | :--- | :--- | :--- |\n")
        f.write(f"| Random Forest | rf_v1 | {rf_val_metrics['rmse']} | {rf_test_metrics['rmse']} | Candidate |\n")
        f.write(f"| XGBoost | xgb_v1 | {xgb_val_metrics['rmse']} | {xgb_test_metrics['rmse']} | Candidate |\n")
        f.write(f"| **Ensemble** | **ensemble_v1** | **{ens_val_metrics['rmse']}** | **{ens_test_metrics['rmse']}** | **{selected_model_name}** |\n")

    print("\n=================================")
    print("MODEL TRAINING & SELECTION COMPLETE")
    print("=================================")
    print(f"Random Forest Test RMSE: {rf_test_metrics['rmse']} kg CO₂ (R²: {rf_test_metrics['r2']})")
    print(f"XGBoost Test RMSE:       {xgb_test_metrics['rmse']} kg CO₂ (R²: {xgb_test_metrics['r2']})")
    print(f"Ensemble Test RMSE:      {ens_test_metrics['rmse']} kg CO₂ (R²: {ens_test_metrics['r2']})")
    print(f"Optimal Ensemble Weight: {best_rf_weight:.2f} × RF + {1.0-best_rf_weight:.2f} × XGB")
    print(f"Selected Winner Model:   {selected_model_name}")
    print("=================================\n")

    return {
        "rf_test_metrics": rf_test_metrics,
        "xgb_test_metrics": xgb_test_metrics,
        "ens_test_metrics": ens_test_metrics,
        "selected_model": selected_model_name,
        "best_rf_weight": best_rf_weight,
    }


if __name__ == "__main__":
    run_training_pipeline()
