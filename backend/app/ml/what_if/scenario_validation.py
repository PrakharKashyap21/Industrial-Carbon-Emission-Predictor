import os
import json
from typing import Dict, Any, List, Tuple
from app.ml.feature_metadata import get_feature_metadata

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
FEATURE_RANGES_PATH = os.path.join(BASE_DIR, "models", "feature_ranges.json")


class ScenarioValidator:
    """Validates physical bounds and checks training distribution ranges."""

    def __init__(self, ranges_path: str = FEATURE_RANGES_PATH):
        self.ranges_path = ranges_path
        self.feature_ranges = {}
        self._load_ranges()

    def _load_ranges(self):
        """Load feature min/max training ranges from disk."""
        if os.path.exists(self.ranges_path):
            try:
                with open(self.ranges_path, "r") as f:
                    self.feature_ranges = json.load(f)
            except Exception as e:
                print(f"[Validator Warning] Could not load feature ranges: {e}")

    def validate_scenario(self, scenario_dict: dict) -> Tuple[bool, List[str]]:
        """Validate input values against historical training distribution.
        
        Args:
            scenario_dict (dict): Dictionary of raw or engineered feature values.
            
        Returns:
            Tuple[bool, List[str]]: (out_of_range_flag, list_of_warning_messages)
        """
        if not self.feature_ranges:
            self._load_ranges()

        warnings = []
        out_of_range = False

        for feature_name, val in scenario_dict.items():
            if feature_name in self.feature_ranges and isinstance(val, (int, float)):
                f_min = self.feature_ranges[feature_name]["min"]
                f_max = self.feature_ranges[feature_name]["max"]

                if val < f_min or val > f_max:
                    out_of_range = True
                    meta = get_feature_metadata(feature_name)
                    if val < f_min:
                        warnings.append(
                            f"{meta['display_name']} ({val} {meta['unit']}) is below historical training minimum ({f_min:.2f} {meta['unit']}). Prediction uncertainty may be increased."
                        )
                    else:
                        warnings.append(
                            f"{meta['display_name']} ({val} {meta['unit']}) exceeds historical training maximum ({f_max:.2f} {meta['unit']}). Prediction uncertainty may be increased."
                        )

        return out_of_range, warnings


scenario_validator = ScenarioValidator()
