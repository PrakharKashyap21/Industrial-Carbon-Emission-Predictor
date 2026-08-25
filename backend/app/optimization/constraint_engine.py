from typing import Dict, Any, Tuple


class ConstraintEngine:
    """Operational Constraint Engine evaluating candidate feasibility against hard production and parameter limits."""

    DEFAULT_MIN_PRODUCTION = 5000.0

    def evaluate_constraints(
        self,
        candidate_inputs: Dict[str, Any],
        baseline_inputs: Dict[str, Any],
        constraints: Dict[str, Any] = None,
    ) -> Tuple[bool, str]:
        """Check candidate physical features against configured operational hard constraints."""
        constraints = constraints or {}
        min_prod = float(constraints.get("minimum_production", self.DEFAULT_MIN_PRODUCTION))

        cand_prod = float(candidate_inputs.get("production_quantity", 0.0))
        if cand_prod < min_prod:
            return False, f"Production output ({cand_prod} units) below required minimum constraint ({min_prod} units)"

        runtime = float(candidate_inputs.get("machine_runtime_hours", 0.0))
        if runtime > 24.0:
            return False, f"Machine runtime ({runtime}h) exceeds physical 24-hour daily limit"

        if runtime < 0.0:
            return False, "Machine runtime cannot be negative"

        # Check negative consumption inputs
        for key in ["electricity_consumption_kwh", "diesel_consumption_liters", "natural_gas_consumption_m3"]:
            if float(candidate_inputs.get(key, 0.0)) < 0.0:
                return False, f"{key} cannot be negative"

        return True, ""


constraint_engine = ConstraintEngine()
