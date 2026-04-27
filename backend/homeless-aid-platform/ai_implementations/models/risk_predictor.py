import numpy as np
import torch
from typing import Dict, List, Tuple
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import os


class RiskPredictor:
    """
    Predicts risk levels and outcomes for homeless individuals.
    - Job placement success likelihood
    - Chronic homelessness risk
    - Cases requiring immediate intervention
    GPU-accelerated for batch predictions and feature processing.
    """

    def __init__(self):
        self.job_placement_model = None
        self.chronic_risk_model = None
        self.intervention_model = None
        self.scaler = StandardScaler()
        
        # Set up device for GPU acceleration
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"RiskPredictor using device: {self.device}")

        self._load_models()

        # Risk thresholds
        self.thresholds = {
            "job_placement": {"low": 0.3, "medium": 0.6, "high": 0.8},
            "chronic_risk": {"low": 0.3, "medium": 0.6, "high": 0.8},
            "intervention": {"low": 0.4, "medium": 0.7, "high": 0.9},
        }

    def predict_job_placement_success(self, profile: Dict) -> Dict:
        """
        Predict likelihood of successful job placement.
        """
        features = self._extract_job_features(profile)

        if self.job_placement_model:
            probability = self.job_placement_model.predict_proba([features])[0][1]
        else:
            # Rule-based fallback
            probability = self._rule_based_job_prediction(profile)

        risk_level = self._categorize_probability(probability, "job_placement")

        return {
            "probability": round(probability, 3),
            "risk_level": risk_level,
            "factors": self._explain_job_prediction(profile, probability),
            "recommendations": self._job_recommendations(profile, probability),
        }

    def predict_chronic_homelessness_risk(self, profile: Dict) -> Dict:
        """
        Identify individuals at high risk of chronic homelessness.
        """
        features = self._extract_chronic_risk_features(profile)

        if self.chronic_risk_model:
            probability = self.chronic_risk_model.predict_proba([features])[0][1]
        else:
            probability = self._rule_based_chronic_risk(profile)

        risk_level = self._categorize_probability(probability, "chronic_risk")

        return {
            "probability": round(probability, 3),
            "risk_level": risk_level,
            "factors": self._explain_chronic_risk(profile, probability),
            "interventions": self._chronic_risk_interventions(risk_level),
        }

    def flag_immediate_intervention(
        self, profile: Dict, nlp_analysis: Dict = None
    ) -> Dict:
        """
        Flag cases requiring immediate intervention.
        """
        features = self._extract_intervention_features(profile, nlp_analysis)

        if self.intervention_model:
            probability = self.intervention_model.predict_proba([features])[0][1]
        else:
            probability = self._rule_based_intervention(profile, nlp_analysis)

        requires_intervention = probability > self.thresholds["intervention"]["medium"]
        urgency = self._categorize_probability(probability, "intervention")

        return {
            "requires_intervention": requires_intervention,
            "urgency": urgency,
            "probability": round(probability, 3),
            "reasons": self._explain_intervention_need(profile, nlp_analysis),
            "immediate_actions": self._get_immediate_actions(
                urgency, profile, nlp_analysis
            ),
        }

    def comprehensive_risk_assessment(
        self, profile: Dict, nlp_analysis: Dict = None
    ) -> Dict:
        """
        Complete risk assessment combining all predictors.
        """
        return {
            "job_placement": self.predict_job_placement_success(profile),
            "chronic_homelessness": self.predict_chronic_homelessness_risk(profile),
            "immediate_intervention": self.flag_immediate_intervention(
                profile, nlp_analysis
            ),
            "overall_risk_score": self._calculate_overall_risk(profile, nlp_analysis),
        }

    def _extract_job_features(self, profile: Dict) -> List[float]:
        """Extract features for job placement prediction. GPU-accelerated."""
        features = [
            profile.get("age", 40) / 100.0,
            len(profile.get("skills", [])) / 10.0,
            self._encode_education(profile.get("education", "")),
            profile.get("work_experience_years", 0) / 20.0,
            1.0 if profile.get("has_transportation", False) else 0.0,
            1.0 if profile.get("has_phone", False) else 0.0,
            1.0 if profile.get("has_id", False) else 0.0,
            self._encode_health_status(profile.get("health_conditions", [])),
        ]
        
        # Convert to tensor for GPU processing if needed for batch operations
        if hasattr(self, '_batch_mode') and self._batch_mode:
            return torch.tensor(features, device=self.device, dtype=torch.float32)
        
        return features

    def _extract_chronic_risk_features(self, profile: Dict) -> List[float]:
        """Extract features for chronic homelessness risk."""
        duration_months = self._parse_duration(profile.get("duration_homeless", ""))

        features = [
            duration_months / 24.0,  # Normalize to 2 years
            profile.get("age", 40) / 100.0,
            1.0 if profile.get("substance_abuse", False) else 0.0,
            1.0 if profile.get("mental_health_issues", False) else 0.0,
            1.0 if profile.get("chronic_health_conditions", False) else 0.0,
            len(profile.get("previous_shelter_stays", [])) / 10.0,
            1.0 if profile.get("criminal_history", False) else 0.0,
            1.0 if profile.get("family_support", False) else 0.0,
        ]
        return features

    def _extract_intervention_features(
        self, profile: Dict, nlp_analysis: Dict = None
    ) -> List[float]:
        """Extract features for intervention flagging."""
        features = [
            1.0 if profile.get("current_situation") == "Street" else 0.0,
            1.0
            if nlp_analysis and nlp_analysis.get("urgency_level") == "critical"
            else 0.0,
            1.0
            if nlp_analysis
            and nlp_analysis.get("sentiment", {}).get("mental_health_risk") == "high"
            else 0.0,
            1.0 if profile.get("medications_needed", False) else 0.0,
            1.0 if "Medical Care" in profile.get("urgent_needs", []) else 0.0,
            profile.get("age", 40) / 100.0,
            1.0 if profile.get("has_disability", False) else 0.0,
        ]
        return features

    def _rule_based_job_prediction(self, profile: Dict) -> float:
        """Rule-based job placement prediction."""
        score = 0.5

        # Positive factors
        if profile.get("age", 100) < 50:
            score += 0.1
        if len(profile.get("skills", [])) > 2:
            score += 0.15
        if profile.get("education") in [
            "Bachelor Degree",
            "Associate Degree",
            "Some College",
        ]:
            score += 0.1
        if profile.get("work_experience_years", 0) > 2:
            score += 0.1
        if profile.get("has_transportation"):
            score += 0.05

        # Negative factors
        if profile.get("substance_abuse"):
            score -= 0.15
        if profile.get("chronic_health_conditions"):
            score -= 0.1
        if not profile.get("has_id"):
            score -= 0.1

        return max(0.0, min(1.0, score))

    def _rule_based_chronic_risk(self, profile: Dict) -> float:
        """Rule-based chronic homelessness risk."""
        score = 0.3

        duration_months = self._parse_duration(profile.get("duration_homeless", ""))
        if duration_months > 12:
            score += 0.3
        elif duration_months > 6:
            score += 0.15

        if profile.get("substance_abuse"):
            score += 0.2
        if profile.get("mental_health_issues"):
            score += 0.15
        if profile.get("age", 0) > 50:
            score += 0.1
        if not profile.get("family_support"):
            score += 0.1

        return max(0.0, min(1.0, score))

    def _rule_based_intervention(
        self, profile: Dict, nlp_analysis: Dict = None
    ) -> float:
        """Rule-based intervention need."""
        score = 0.2

        if profile.get("current_situation") == "Street":
            score += 0.2
        if nlp_analysis and nlp_analysis.get("urgency_level") == "critical":
            score += 0.3
        if (
            nlp_analysis
            and nlp_analysis.get("sentiment", {}).get("mental_health_risk") == "high"
        ):
            score += 0.25
        if "Medical Care" in profile.get("urgent_needs", []):
            score += 0.15

        return max(0.0, min(1.0, score))

    def _categorize_probability(self, probability: float, risk_type: str) -> str:
        """Categorize probability into risk levels."""
        thresholds = self.thresholds[risk_type]
        if probability >= thresholds["high"]:
            return "high"
        elif probability >= thresholds["medium"]:
            return "medium"
        else:
            return "low"

    def _encode_education(self, education: str) -> float:
        """Encode education level as numeric value."""
        from models.risk_predictor_helpers import encode_education

        return encode_education(education)

    def _encode_health_status(self, health_conditions: List[str]) -> float:
        """Encode health status as numeric value."""
        from models.risk_predictor_helpers import encode_health_status

        return encode_health_status(health_conditions)

    def _parse_duration(self, duration_str: str) -> int:
        """Parse duration string to months."""
        from models.risk_predictor_helpers import parse_duration

        return parse_duration(duration_str)

    def _explain_job_prediction(self, profile: Dict, probability: float) -> List[str]:
        """Explain job prediction factors."""
        from models.risk_predictor_helpers import explain_job_prediction

        return explain_job_prediction(profile, probability)

    def _job_recommendations(self, profile: Dict, probability: float) -> List[str]:
        """Generate job recommendations."""
        from models.risk_predictor_helpers import job_recommendations

        return job_recommendations(profile, probability)

    def _explain_chronic_risk(self, profile: Dict, probability: float) -> List[str]:
        """Explain chronic risk factors."""
        from models.risk_predictor_helpers import explain_chronic_risk

        return explain_chronic_risk(profile, probability)

    def _chronic_risk_interventions(self, risk_level: str) -> List[str]:
        """Get chronic risk interventions."""
        from models.risk_predictor_helpers import chronic_risk_interventions

        return chronic_risk_interventions(risk_level)

    def _explain_intervention_need(
        self, profile: Dict, nlp_analysis: Dict = None
    ) -> List[str]:
        """Explain intervention need."""
        from models.risk_predictor_helpers import explain_intervention_need

        return explain_intervention_need(profile, nlp_analysis)

    def _get_immediate_actions(
        self, urgency: str, profile: Dict, nlp_analysis: Dict = None
    ) -> List[str]:
        """Get immediate actions."""
        from models.risk_predictor_helpers import get_immediate_actions

        return get_immediate_actions(urgency, profile, nlp_analysis)

    def _calculate_overall_risk(
        self, profile: Dict, nlp_analysis: Dict = None
    ) -> float:
        """Calculate overall risk score."""
        from models.risk_predictor_helpers import calculate_overall_risk

        return calculate_overall_risk(profile, nlp_analysis)

    def _load_models(self):
        """Load pre-trained models if available."""
        from models.risk_predictor_helpers import load_models

        models = load_models()
        self.job_placement_model = models.get("job_placement")
        self.chronic_risk_model = models.get("chronic_risk")
        self.intervention_model = models.get("intervention")
