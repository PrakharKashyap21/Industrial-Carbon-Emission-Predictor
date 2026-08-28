# Machine Learning Research Methodology — Industrial $CO_2$ Prediction

## 1. Problem Formulation
Industrial facility $CO_2$ prediction is framed as a supervised non-linear regression problem:

$$y_t = f(X_t) + \epsilon_t$$

where $y_t \in \mathbb{R}^+$ represents daily greenhouse gas emissions ($kg CO_2$) for operational day $t$, and $X_t \in \mathbb{R}^d$ represents a $d$-dimensional vector of telemetry, fuel, production, and environmental indicators.

---

## 2. Model Selection & Theoretical Rationale
1. **Random Forest Regressor**: Selected for its variance-reduction properties through bootstrap aggregation (bagging) over decorrelated decision trees.
2. **XGBoost Regressor**: Selected for its gradient boosting capability, minimizing second-order Taylor expansion loss functions with regularization.
3. **Convex Weighted Ensemble**: Combines bagging (RF) and boosting (XGBoost) predictions:

$$\hat{y} = w_{\text{RF}} \cdot \hat{y}_{\text{RF}} + w_{\text{XGB}} \cdot \hat{y}_{\text{XGB}}, \quad w_{\text{RF}} + w_{\text{XGB}} = 1.0$$

---

## 3. Preprocessing & Leakage Mitigation
- **Chronological Splitting**: $70\%$ Train, $15\%$ Validation, $15\%$ Test.
- **Normalization**: `StandardScaler` fitted on training split only.
- **Target Exclusion**: Target variable $CO_2$ emissions is strictly removed from feature matrix $X$.
