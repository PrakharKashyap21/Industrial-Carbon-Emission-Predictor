import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, asc

from app.models.prediction import Prediction
from app.models.industrial_reading import IndustrialReading
from app.models.plant import Plant
from app.ml.prediction_service import prediction_service
from app.ml.explainability.explanation_service import explanation_service
from app.analytics.prediction_analytics import (
    compute_prediction_error_metrics,
    compute_prediction_scatter_points,
)


class PredictionManagementService:
    """Service managing Prediction lifecycle: generation, database persistence, pagination, actual matching, error calculations, and historical analytics."""

    def create_prediction(self, db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Generate ML prediction via ML ensemble engine and save record to PostgreSQL predictions table."""
        # 1. Run ML Ensemble Prediction
        pred_res = prediction_service.predict(payload)

        plant_id = payload.get("plant_id", 1)
        reading_id = payload.get("reading_id")

        reading_ts = None
        if payload.get("reading_timestamp"):
            try:
                reading_ts = datetime.fromisoformat(payload["reading_timestamp"])
            except Exception:
                reading_ts = datetime.utcnow()

        # 2. Check if reading has actual CO2 already recorded in database
        actual_co2 = None
        status = "pending_actual"
        signed_err = None
        abs_err = None
        pct_err = None

        if reading_id:
            reading_obj = db.execute(select(IndustrialReading).where(IndustrialReading.id == reading_id)).scalar_one_or_none()
            if reading_obj and reading_obj.actual_co2_emission_kg is not None:
                actual_co2 = reading_obj.actual_co2_emission_kg
                status = "evaluated"
                signed_err = float(round(pred_res["ensemble_prediction_kg"] - actual_co2, 2))
                abs_err = float(round(abs(actual_co2 - pred_res["ensemble_prediction_kg"]), 2))
                if actual_co2 > 0:
                    pct_err = float(round((abs_err / actual_co2) * 100.0, 2))

        # 3. Create Prediction Model Entry
        rf_val = pred_res.get("random_forest_prediction_kg", pred_res.get("rf_prediction_kg", 0.0))
        xgb_val = pred_res.get("xgboost_prediction_kg", pred_res.get("xgb_prediction_kg", 0.0))
        ens_val = pred_res.get("ensemble_prediction_kg", 0.0)

        pred_obj = Prediction(
            plant_id=plant_id,
            reading_id=reading_id,
            prediction_timestamp=datetime.utcnow(),
            reading_timestamp=reading_ts or datetime.utcnow(),
            rf_prediction=rf_val,
            xgb_prediction=xgb_val,
            ensemble_prediction=ens_val,
            actual_co2=actual_co2,
            signed_error=signed_err,
            absolute_error=abs_err,
            percentage_error=pct_err,
            model_version=pred_res.get("model_version", "ensemble_v1"),
            model_type="rf_xgb_ensemble",
            feature_pipeline_version="features_v1",
            prediction_horizon="current",
            status=status,
        )

        db.add(pred_obj)
        db.commit()
        db.refresh(pred_obj)

        return self._format_prediction_dict(pred_obj)

    def get_predictions(
        self,
        db: Session,
        plant_id: Optional[int] = None,
        days: Optional[int] = None,
        status: Optional[str] = None,
        model_version: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "newest",
    ) -> Dict[str, Any]:
        """Fetch paginated prediction history with filtering and sorting."""
        limit = min(limit, 100)
        query = select(Prediction)

        if plant_id:
            query = query.where(Prediction.plant_id == plant_id)
        if status:
            query = query.where(Prediction.status == status)
        if model_version:
            query = query.where(Prediction.model_version == model_version)
        if days:
            cutoff = datetime.utcnow() - timedelta(days=days)
            query = query.where(Prediction.prediction_timestamp >= cutoff)

        # Sorting
        if sort_by == "oldest":
            query = query.order_by(asc(Prediction.prediction_timestamp))
        elif sort_by == "highest_error":
            query = query.order_by(desc(Prediction.absolute_error))
        elif sort_by == "lowest_error":
            query = query.order_by(asc(Prediction.absolute_error))
        elif sort_by == "highest_predicted":
            query = query.order_by(desc(Prediction.ensemble_prediction))
        else:
            query = query.order_by(desc(Prediction.prediction_timestamp))

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar() or 0

        # Paginate
        offset = (page - 1) * limit
        items_objs = db.execute(query.offset(offset).limit(limit)).scalars().all()

        items = [self._format_prediction_dict(p) for p in items_objs]
        total_pages = math.ceil(total / limit) if total > 0 else 1

        return {
            "items": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": total_pages,
            },
        }

    def get_prediction_by_id(self, db: Session, prediction_id: int) -> Dict[str, Any]:
        """Retrieve detailed prediction record with input features and SHAP local explanation."""
        pred = db.execute(select(Prediction).where(Prediction.id == prediction_id)).scalar_one_or_none()
        if not pred:
            return None

        formatted = self._format_prediction_dict(pred)

        # Load reading features if available
        features = {}
        if pred.reading_id:
            r = db.execute(select(IndustrialReading).where(IndustrialReading.id == pred.reading_id)).scalar_one_or_none()
            if r:
                features = {
                    "plant_id": r.plant_id,
                    "electricity_consumption_kwh": r.electricity_consumption_kwh,
                    "diesel_consumption_liters": r.diesel_consumption_liters,
                    "natural_gas_consumption_m3": r.natural_gas_consumption_m3,
                    "production_quantity": r.production_quantity,
                    "raw_material_consumption_kg": r.raw_material_consumption_kg,
                    "machine_runtime_hours": r.machine_runtime_hours,
                    "temperature_c": r.temperature_c,
                    "pressure_bar": r.pressure_bar,
                    "previous_co2_emission_kg": r.previous_co2_emission_kg,
                }

        # Generate SHAP explanation if features exist
        shap_explanation = None
        if features:
            try:
                shap_res = explanation_service.explain_prediction(features)
                shap_explanation = shap_res.get("local_explanation")
            except Exception:
                shap_explanation = None

        formatted["input_features"] = features
        formatted["shap_explanation"] = shap_explanation

        return formatted

    def update_actual_co2(self, db: Session, prediction_id: int, actual_co2: float) -> Dict[str, Any]:
        """Match actual CO₂ emission value to prediction record, calculate errors, and update status to evaluated."""
        pred = db.execute(select(Prediction).where(Prediction.id == prediction_id)).scalar_one_or_none()
        if not pred:
            return None

        signed_err = float(round(pred.ensemble_prediction - actual_co2, 2))
        abs_err = float(round(abs(actual_co2 - pred.ensemble_prediction), 2))
        pct_err = float(round((abs_err / actual_co2) * 100.0, 2)) if actual_co2 > 0 else None

        pred.actual_co2 = actual_co2
        pred.signed_error = signed_err
        pred.absolute_error = abs_err
        pred.percentage_error = pct_err
        pred.status = "evaluated"
        pred.updated_at = datetime.utcnow()

        # Update associated industrial reading if linked
        if pred.reading_id:
            r = db.execute(select(IndustrialReading).where(IndustrialReading.id == pred.reading_id)).scalar_one_or_none()
            if r:
                r.actual_co2_emission_kg = actual_co2

        db.commit()
        db.refresh(pred)

        return self._format_prediction_dict(pred)

    def get_prediction_analytics(self, db: Session, plant_id: Optional[int] = None, days: Optional[int] = None) -> Dict[str, Any]:
        """Calculate historical prediction metrics (MAE, RMSE, MAPE, Bias) across evaluated prediction records."""
        query = select(Prediction)
        if plant_id:
            query = query.where(Prediction.plant_id == plant_id)
        if days:
            cutoff = datetime.utcnow() - timedelta(days=days)
            query = query.where(Prediction.prediction_timestamp >= cutoff)

        all_preds = db.execute(query).scalars().all()
        total_preds = len(all_preds)

        evaluated = [p for p in all_preds if p.status == "evaluated" and p.actual_co2 is not None]
        pending_count = total_preds - len(evaluated)

        error_metrics = compute_prediction_error_metrics(evaluated)
        scatter_points = compute_prediction_scatter_points(evaluated)

        return {
            "total_predictions": total_preds,
            "evaluated_count": len(evaluated),
            "pending_count": pending_count,
            "mae": error_metrics["mae"],
            "rmse": error_metrics["rmse"],
            "mape": error_metrics["mape"],
            "r2": error_metrics["r2"],
            "mean_bias": error_metrics["mean_bias"],
            "model_comparison": error_metrics["model_comparison"],
            "scatter_points": scatter_points,
        }

    def _format_prediction_dict(self, pred: Prediction) -> Dict[str, Any]:
        """Convert Prediction model instance to dictionary."""
        return {
            "id": pred.id,
            "plant_id": pred.plant_id,
            "reading_id": pred.reading_id,
            "prediction_timestamp": pred.prediction_timestamp.isoformat() if pred.prediction_timestamp else "",
            "reading_timestamp": pred.reading_timestamp.isoformat() if pred.reading_timestamp else None,
            "rf_prediction": round(pred.rf_prediction, 2),
            "xgb_prediction": round(pred.xgb_prediction, 2),
            "ensemble_prediction": round(pred.ensemble_prediction, 2),
            "actual_co2": round(pred.actual_co2, 2) if pred.actual_co2 is not None else None,
            "signed_error": round(pred.signed_error, 2) if pred.signed_error is not None else None,
            "absolute_error": round(pred.absolute_error, 2) if pred.absolute_error is not None else None,
            "percentage_error": round(pred.percentage_error, 2) if pred.percentage_error is not None else None,
            "model_version": pred.model_version,
            "model_type": pred.model_type,
            "feature_pipeline_version": pred.feature_pipeline_version,
            "prediction_horizon": pred.prediction_horizon,
            "status": pred.status,
            "created_at": pred.created_at.isoformat() if pred.created_at else "",
        }


prediction_management_service = PredictionManagementService()
