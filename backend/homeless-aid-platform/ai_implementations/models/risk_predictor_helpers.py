"""Helper methods for RiskPredictor class."""

from typing import Dict, List


def categorize_probability(probability: float, thresholds: Dict) -> str:
    """Categorize probability into risk levels."""
    if probability >= thresholds["high"]:
        return "high"
    elif probability >= thresholds["medium"]:
        return "medium"
    else:
        return "low"


def encode_education(education: str) -> float:
    """Encode education level as numeric value."""
    education_map = {
        "Less than High School": 0.2,
        "High School/GED": 0.4,
        "Some College": 0.6,
        "Associate Degree": 0.7,
        "Bachelor Degree": 0.9,
        "Graduate Degree": 1.0,
    }
    return education_map.get(education, 0.4)


def encode_health_status(health_conditions: List[str]) -> float:
    """Encode health status as numeric value."""
    if not health_conditions:
        return 1.0

    severity_map = {
        "mental health": 0.3,
        "substance abuse": 0.4,
        "chronic": 0.3,
        "disability": 0.2,
    }

    total_impact = 0.0
    for condition in health_conditions:
        condition_lower = condition.lower()
        for key, impact in severity_map.items():
            if key in condition_lower:
                total_impact += impact

    return max(0.0, 1.0 - min(total_impact, 0.8))


def parse_duration(duration_str: str) -> int:
    """Parse duration string to months."""
    duration_lower = duration_str.lower()

    if "first time" in duration_lower:
        return 0
    elif "less than 6" in duration_lower or "< 6" in duration_lower:
        return 3
    elif "6-12" in duration_lower or "6 to 12" in duration_lower:
        return 9
    elif "1-2 year" in duration_lower:
        return 18
    elif (
        "more than 2" in duration_lower
        or "> 2" in duration_lower
        or "chronic" in duration_lower
    ):
        return 30

    return 6


def explain_job_prediction(profile: Dict, probability: float) -> List[str]:
    """Explain factors affecting job placement prediction."""
    factors = []

    if profile.get("age", 100) < 40:
        factors.append("Age favorable for employment")
    elif profile.get("age", 0) > 55:
        factors.append("Age may present employment challenges")

    skills_count = len(profile.get("skills", []))
    if skills_count > 3:
        factors.append(f"Strong skill set ({skills_count} skills)")
    elif skills_count == 0:
        factors.append("Limited documented skills")

    if profile.get("education") in ["Bachelor Degree", "Associate Degree"]:
        factors.append("Higher education completed")

    if not profile.get("has_id"):
        factors.append("Lacks identification documents")

    if profile.get("substance_abuse"):
        factors.append("Substance abuse may require support")

    return factors


def job_recommendations(profile: Dict, probability: float) -> List[str]:
    """Generate recommendations to improve job placement success."""
    recommendations = []

    if not profile.get("has_id"):
        recommendations.append("Assist with obtaining ID documents")

    if len(profile.get("skills", [])) < 2:
        recommendations.append("Enroll in skills training program")

    if not profile.get("has_transportation"):
        recommendations.append("Provide transportation assistance or bus pass")

    if profile.get("substance_abuse"):
        recommendations.append("Connect with substance abuse treatment")

    if probability < 0.5:
        recommendations.append("Consider supported employment program")

    return recommendations


def explain_chronic_risk(profile: Dict, probability: float) -> List[str]:
    """Explain chronic homelessness risk factors."""
    factors = []

    duration_months = parse_duration(profile.get("duration_homeless", ""))
    if duration_months > 12:
        factors.append(f"Extended homelessness duration ({duration_months} months)")

    if profile.get("substance_abuse"):
        factors.append("Substance abuse history")

    if profile.get("mental_health_issues"):
        factors.append("Mental health challenges")

    if not profile.get("family_support"):
        factors.append("Limited family support network")

    if profile.get("age", 0) > 50:
        factors.append("Age increases vulnerability")

    return factors


def chronic_risk_interventions(risk_level: str) -> List[str]:
    """Recommend interventions based on chronic risk level."""
    interventions = {
        "high": [
            "Immediate case management assignment",
            "Housing First program enrollment",
            "Intensive mental health/substance abuse treatment",
            "Weekly check-ins and support",
            "Connect with disability services if applicable",
        ],
        "medium": [
            "Regular case management",
            "Transitional housing program",
            "Mental health/substance abuse counseling",
            "Job training and placement services",
            "Bi-weekly check-ins",
        ],
        "low": [
            "Standard case management",
            "Job placement assistance",
            "Life skills training",
            "Monthly check-ins",
            "Connect with community resources",
        ],
    }
    return interventions.get(risk_level, interventions["medium"])


def explain_intervention_need(profile: Dict, nlp_analysis: Dict = None) -> List[str]:
    """Explain why immediate intervention is needed."""
    reasons = []

    if profile.get("current_situation") == "Street":
        reasons.append("Currently unsheltered - exposure risk")

    if nlp_analysis:
        if nlp_analysis.get("urgency_level") == "critical":
            reasons.append("Critical urgency indicators in notes")

        if nlp_analysis.get("sentiment", {}).get("mental_health_risk") == "high":
            reasons.append("High mental health risk detected")

    if "Medical Care" in profile.get("urgent_needs", []):
        reasons.append("Urgent medical needs identified")

    if profile.get("medications_needed") and not profile.get("medication_access"):
        reasons.append("Lacks access to needed medications")

    return reasons


def get_immediate_actions(
    urgency: str, profile: Dict, nlp_analysis: Dict = None
) -> List[str]:
    """Get immediate actions based on urgency level."""
    actions = {
        "high": [
            "Contact emergency services if life-threatening",
            "Arrange immediate shelter placement",
            "Schedule urgent medical evaluation",
            "Assign crisis counselor",
            "Provide emergency supplies (food, water, blanket)",
        ],
        "medium": [
            "Schedule intake within 24 hours",
            "Arrange temporary shelter",
            "Connect with medical services",
            "Provide basic necessities",
            "Begin case management process",
        ],
        "low": [
            "Schedule standard intake",
            "Provide resource information",
            "Add to case management queue",
            "Offer basic services",
        ],
    }
    return actions.get(urgency, actions["medium"])


def calculate_overall_risk(profile: Dict, nlp_analysis: Dict = None) -> float:
    """Calculate overall risk score combining all factors."""
    # Weighted combination of different risk factors
    job_features = [
        profile.get("age", 40) / 100.0,
        len(profile.get("skills", [])) / 10.0,
        encode_education(profile.get("education", "")),
    ]
    job_risk = 1.0 - (sum(job_features) / len(job_features))

    chronic_features = [
        parse_duration(profile.get("duration_homeless", "")) / 24.0,
        1.0 if profile.get("substance_abuse") else 0.0,
        1.0 if profile.get("mental_health_issues") else 0.0,
    ]
    chronic_risk = sum(chronic_features) / len(chronic_features)

    intervention_risk = 0.5
    if nlp_analysis and nlp_analysis.get("urgency_level") == "critical":
        intervention_risk = 0.9
    elif profile.get("current_situation") == "Street":
        intervention_risk = 0.7

    overall = job_risk * 0.3 + chronic_risk * 0.4 + intervention_risk * 0.3
    return round(overall, 3)


def load_models():
    """Load pre-trained models if available."""
    import os
    import pickle

    models = {}
    model_dir = "models/artifacts"

    if os.path.exists(model_dir):
        for model_name in ["job_placement", "chronic_risk", "intervention"]:
            model_path = os.path.join(model_dir, f"{model_name}_model.pkl")
            if os.path.exists(model_path):
                with open(model_path, "rb") as f:
                    models[model_name] = pickle.load(f)

    return models
