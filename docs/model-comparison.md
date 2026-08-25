# Model Performance Comparison

**Primary Selection Metric:** RMSE (Evaluated on Validation Set)

**Selected Production Model:** Ensemble

## Test Set Performance

| Model             |    MAE |   RMSE |     R² |   MAPE (%) | Status          |
|:------------------|-------:|-------:|-------:|-----------:|:----------------|
| Random Forest     | 220.18 | 277.73 | 0.9984 |       2.87 | Candidate       |
| XGBoost           | 300.42 | 439.86 | 0.996  |       3    | Candidate       |
| Ensemble (RF+XGB) | 225.46 | 307.94 | 0.998  |       2.61 | Selected Winner |

**Ensemble Weights:** 0.45 × Random Forest + 0.55 × XGBoost
