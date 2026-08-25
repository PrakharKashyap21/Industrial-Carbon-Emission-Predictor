from typing import Dict, Any, List


class ScenarioValidator:
    """Operational Feasibility Constraint Validator evaluating minimum production outputs and extreme parameter reductions."""

    DEFAULT_MIN_PRODUCTION = 4800.0
    DEFAULT_MAX_ELEC_REDUCTION_PCT = 35.0
    DEFAULT_MAX_FUEL_REDUCTION_PCT = 35.0
    DEFAULT_MAX_RUNTIME_REDUCTION_PCT = 30.0

    def validate_feasibility(
        self,
        scenario_inputs: Dict[str, Any],
        baseline_inputs: Dict[str, Any],
        constraints: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Check scenario input parameters against operational feasibility constraints."""
        constraints = constraints or {}
        min_prod = constraints.get("min_production_output", self.DEFAULT_MIN_PRODUCTION)
        max_elec_red = constraints.get("max_electricity_reduction_pct", self.DEFAULT_MAX_ELEC_REDUCTION_PCT)
        max_fuel_red = constraints.get("max_fuel_reduction_pct", self.DEFAULT_MAX_FUEL_REDUCTION_PCT)
        max_runtime_red = constraints.get("max_runtime_reduction_pct", self.DEFAULT_MAX_RUNTIME_REDUCTION_PCT)

        violations = []

        # 1. Minimum Production Check
        scen_prod = float(scenario_inputs.get("production_quantity", 0.0))
        if scen_prod < min_prod:
            violations.append(
                f"Production output ({scen_prod} units) falls below minimum operational constraint ({min_prod} units)"
            )

        # 2. Electricity Extreme Reduction Check
        base_elec = float(baseline_inputs.get("electricity_consumption_kwh", 1.0))
        scen_elec = float(scenario_inputs.get("electricity_consumption_kwh", 1.0))
        if base_elec > 0:
            elec_red_pct = ((base_elec - scen_elec) / base_elec) * 100.0
            if elec_red_pct > max_elec_red:
                violations.append(
                    f"Electricity reduction ({round(elec_red_pct, 1)}%) exceeds maximum feasible limit ({max_elec_red}%)"
                )

        # 3. Fuel Extreme Reduction Check
        base_diesel = float(baseline_inputs.get("diesel_consumption_liters", 1.0))
        scen_diesel = float(scenario_inputs.get("diesel_consumption_liters", 1.0))
        if base_diesel > 0:
            diesel_red_pct = ((base_diesel - scen_diesel) / base_diesel) * 100.0
            if diesel_red_pct > max_fuel_red:
                violations.append(
                    f"Diesel fuel reduction ({round(diesel_red_pct, 1)}%) exceeds maximum feasible limit ({max_fuel_red}%)"
                )

        # 4. Machine Runtime Upper Bound
        runtime = float(scenario_inputs.get("machine_runtime_hours", 0.0))
        if runtime > 24.0:
            violations.append(f"Machine runtime ({runtime}h) exceeds physical 24-hour daily limit")

        feasible = len(violations) == 0

        return {
            "feasible": feasible,
            "violations": violations,
        }


scenario_validator = ScenarioValidator()
