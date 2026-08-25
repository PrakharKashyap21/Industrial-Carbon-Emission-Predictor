import itertools
from typing import Dict, Any, List, Tuple


class CandidateGenerator:
    """Generates candidate operating configurations using constrained grid search over parameter variation steps."""

    DEFAULT_SEARCH_PARAMS = {
        "max_electricity_reduction": 20.0,
        "electricity_step": 5.0,
        "max_fuel_reduction": 20.0,
        "fuel_step": 5.0,
        "max_runtime_reduction": 15.0,
        "runtime_step": 5.0,
    }

    def _generate_steps(self, max_red: float, step: float) -> List[float]:
        """Generate discrete percentage reduction step list from 0 down to -max_red."""
        if step <= 0:
            step = 5.0
        steps = []
        curr = 0.0
        while curr <= max_red + 1e-5:
            steps.append(float(round(-curr, 2)))
            curr += step
        return sorted(list(set(steps)), reverse=True)

    def generate_candidates(
        self,
        baseline_features: Dict[str, Any],
        search_parameters: Dict[str, Any] = None,
    ) -> List[Dict[str, Any]]:
        """Generate grid search candidate operating input configurations."""
        params = search_parameters or {}
        max_elec = float(params.get("max_electricity_reduction", self.DEFAULT_SEARCH_PARAMS["max_electricity_reduction"]))
        step_elec = float(params.get("electricity_step", self.DEFAULT_SEARCH_PARAMS["electricity_step"]))

        max_fuel = float(params.get("max_fuel_reduction", self.DEFAULT_SEARCH_PARAMS["max_fuel_reduction"]))
        step_fuel = float(params.get("fuel_step", self.DEFAULT_SEARCH_PARAMS["fuel_step"]))

        max_runtime = float(params.get("max_runtime_reduction", self.DEFAULT_SEARCH_PARAMS["max_runtime_reduction"]))
        step_runtime = float(params.get("runtime_step", self.DEFAULT_SEARCH_PARAMS["runtime_step"]))

        elec_steps = self._generate_steps(max_elec, step_elec)
        fuel_steps = self._generate_steps(max_fuel, step_fuel)
        runtime_steps = self._generate_steps(max_runtime, step_runtime)

        combinations = list(itertools.product(elec_steps, fuel_steps, runtime_steps))

        candidates = []
        # Ensure Candidate 0 is Baseline (0%, 0%, 0%)
        combinations.sort(key=lambda c: abs(c[0]) + abs(c[1]) + abs(c[2]))

        base_elec = float(baseline_features.get("electricity_consumption_kwh", 14000.0))
        base_diesel = float(baseline_features.get("diesel_consumption_liters", 600.0))
        base_gas = float(baseline_features.get("natural_gas_consumption_m3", 2500.0))
        base_runtime = float(baseline_features.get("machine_runtime_hours", 18.0))

        for idx, (e_pct, f_pct, r_pct) in enumerate(combinations):
            cand_id = f"CND-{idx:04d}"

            # Calculate new physical parameters
            new_elec = max(0.0, base_elec * (1.0 + (e_pct / 100.0)))
            new_diesel = max(0.0, base_diesel * (1.0 + (f_pct / 100.0)))
            new_gas = max(0.0, base_gas * (1.0 + (f_pct / 100.0)))  # Applying fuel reduction to both fuel types
            new_runtime = min(24.0, max(0.0, base_runtime * (1.0 + (r_pct / 100.0))))

            mod_inputs = dict(baseline_features)
            mod_inputs["electricity_consumption_kwh"] = float(round(new_elec, 2))
            mod_inputs["diesel_consumption_liters"] = float(round(new_diesel, 2))
            mod_inputs["natural_gas_consumption_m3"] = float(round(new_gas, 2))
            mod_inputs["machine_runtime_hours"] = float(round(new_runtime, 2))

            changes = {
                "electricity_change": e_pct,
                "fuel_change": f_pct,
                "runtime_change": r_pct,
            }

            candidates.append({
                "candidate_id": cand_id,
                "is_baseline": (idx == 0),
                "changes": changes,
                "input_values": mod_inputs,
            })

        return candidates


candidate_generator = CandidateGenerator()
