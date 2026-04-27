from flask import Blueprint, request, jsonify
from models.nlp_analyzer import NLPAnalyzer
from models.smart_questionnaire import SmartQuestionnaire
from models.risk_predictor import RiskPredictor

# Create blueprint
needs_bp = Blueprint("needs_assessment", __name__)

# Initialize models
nlp_analyzer = NLPAnalyzer(use_openai=False)
questionnaire = SmartQuestionnaire()
risk_predictor = RiskPredictor()


@needs_bp.route("/api/v1/analyze-notes", methods=["POST"])
def analyze_notes():
    """
    Analyze volunteer notes using NLP.

    Request body:
    {
        "notes": "John has construction experience and carpentry skills. He mentioned feeling depressed lately. Needs shelter urgently."
    }
    """
    try:
        data = request.get_json()
        notes = data.get("notes", "")

        if not notes:
            return jsonify({"error": "Notes text is required"}), 400

        analysis = nlp_analyzer.analyze_notes(notes)

        return jsonify({"analysis": analysis, "success": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@needs_bp.route("/api/v1/questionnaire/start", methods=["POST"])
def start_questionnaire():
    """
    Start a new questionnaire session.

    Request body:
    {
        "individual_id": "ind_123",
        "initial_data": {}
    }
    """
    try:
        data = request.get_json()
        individual_id = data.get("individual_id")
        initial_data = data.get("initial_data", {})

        # Get first section questions
        first_section = "basic_info"
        questions = questionnaire.get_next_questions(first_section, initial_data)
        next_section = questionnaire.get_next_section(first_section)

        return jsonify(
            {
                "session_id": individual_id,
                "current_section": first_section,
                "questions": questions,
                "next_section": next_section,
                "progress": 0.0,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@needs_bp.route("/api/v1/questionnaire/next", methods=["POST"])
def next_questions():
    """
    Get next set of questions based on previous answers.

    Request body:
    {
        "current_section": "basic_info",
        "answers": {
            "age": 35,
            "gender": "Male",
            "education": "High School/GED"
        }
    }
    """
    try:
        data = request.get_json()
        current_section = data.get("current_section")
        answers = data.get("answers", {})

        # Get next section
        next_section = questionnaire.get_next_section(current_section)

        if not next_section:
            # Questionnaire complete
            predictions = questionnaire.predict_missing_info(answers)
            return jsonify(
                {"complete": True, "profile": answers, "predictions": predictions}
            ), 200

        # Get questions for next section
        questions = questionnaire.get_next_questions(next_section, answers)

        # Calculate progress
        sections = [
            "basic_info",
            "housing_situation",
            "employment_skills",
            "health_assessment",
            "immediate_needs",
        ]
        current_index = sections.index(next_section) if next_section in sections else 0
        progress = (current_index / len(sections)) * 100

        return jsonify(
            {
                "current_section": next_section,
                "questions": questions,
                "next_section": questionnaire.get_next_section(next_section),
                "progress": round(progress, 1),
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@needs_bp.route("/api/v1/questionnaire/predict", methods=["POST"])
def predict_missing():
    """
    Predict missing information based on partial profile.

    Request body:
    {
        "profile": {
            "age": 35,
            "education": "High School/GED",
            "skills": ["Construction", "Carpentry"]
        }
    }
    """
    try:
        data = request.get_json()
        profile = data.get("profile", {})

        predictions = questionnaire.predict_missing_info(profile)

        return jsonify({"predictions": predictions, "success": True}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@needs_bp.route("/api/v1/risk-assessment", methods=["POST"])
def risk_assessment():
    """
    Comprehensive risk assessment for an individual.

    Request body:
    {
        "profile": {
            "id": "ind_123",
            "age": 35,
            "skills": ["construction"],
            "education": "High School/GED",
            "duration_homeless": "6-12 months",
            "current_situation": "Street",
            "substance_abuse": false,
            "mental_health_issues": true
        },
        "notes": "Optional volunteer notes for NLP analysis"
    }
    """
    try:
        data = request.get_json()
        profile = data.get("profile", {})
        notes = data.get("notes")

        if not profile:
            return jsonify({"error": "Profile data is required"}), 400

        # Analyze notes if provided
        nlp_analysis = None
        if notes:
            nlp_analysis = nlp_analyzer.analyze_notes(notes)

        # Perform comprehensive risk assessment
        assessment = risk_predictor.comprehensive_risk_assessment(profile, nlp_analysis)

        return jsonify(
            {
                "assessment": assessment,
                "nlp_analysis": nlp_analysis,
                "individual_id": profile.get("id"),
                "success": True,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@needs_bp.route("/api/v1/risk-assessment/job-placement", methods=["POST"])
def job_placement_risk():
    """
    Predict job placement success likelihood.
    """
    try:
        data = request.get_json()
        profile = data.get("profile", {})

        result = risk_predictor.predict_job_placement_success(profile)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@needs_bp.route("/api/v1/risk-assessment/chronic-homelessness", methods=["POST"])
def chronic_homelessness_risk():
    """
    Predict chronic homelessness risk.
    """
    try:
        data = request.get_json()
        profile = data.get("profile", {})

        result = risk_predictor.predict_chronic_homelessness_risk(profile)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@needs_bp.route("/api/v1/risk-assessment/intervention", methods=["POST"])
def intervention_flag():
    """
    Flag cases requiring immediate intervention.
    """
    try:
        data = request.get_json()
        profile = data.get("profile", {})
        notes = data.get("notes")

        nlp_analysis = None
        if notes:
            nlp_analysis = nlp_analyzer.analyze_notes(notes)

        result = risk_predictor.flag_immediate_intervention(profile, nlp_analysis)

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
