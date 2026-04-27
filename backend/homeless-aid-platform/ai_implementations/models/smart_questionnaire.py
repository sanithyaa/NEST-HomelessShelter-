from typing import Dict, List, Optional
import numpy as np
import torch
from sklearn.ensemble import RandomForestClassifier
import pickle
import os


class SmartQuestionnaire:
    """
    Dynamic questionnaire that adapts based on responses and predicts missing info.
    GPU-accelerated for prediction operations.
    """

    def __init__(self):
        # Set up device for GPU acceleration
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"SmartQuestionnaire using device: {self.device}")

        # Common response suggestions
        self.suggestions = {
            "skills": [
                "Construction",
                "Cooking",
                "Cleaning",
                "Retail",
                "Customer Service",
                "Warehouse",
                "Driving",
                "Computer Skills",
                "Carpentry",
                "Painting",
            ],
            "health_conditions": [
                "None",
                "Diabetes",
                "Hypertension",
                "Asthma",
                "Mental Health",
                "Substance Abuse",
                "Chronic Pain",
                "Mobility Issues",
            ],
            "education": [
                "Less than High School",
                "High School/GED",
                "Some College",
                "Associate Degree",
                "Bachelor Degree",
                "Graduate Degree",
            ],
            "housing_history": [
                "First time homeless",
                "Less than 6 months",
                "6-12 months",
                "1-2 years",
                "More than 2 years",
                "Chronic homelessness",
            ],
        }
        self.question_tree = self._build_question_tree()
        self.predictor = None
        self._load_predictor()

    def _build_question_tree(self) -> Dict:
        """
        Build adaptive question tree with conditional logic.
        """
        return {
            "basic_info": {
                "questions": [
                    {
                        "id": "age",
                        "text": "What is your age?",
                        "type": "number",
                        "required": True,
                        "validation": {"min": 0, "max": 120},
                    },
                    {
                        "id": "gender",
                        "text": "Gender",
                        "type": "select",
                        "options": [
                            "Male",
                            "Female",
                            "Non-binary",
                            "Prefer not to say",
                        ],
                        "required": True,
                    },
                    {
                        "id": "education",
                        "text": "Highest level of education",
                        "type": "select",
                        "options": self.suggestions["education"],
                        "required": True,
                    },
                ],
                "next": "housing_situation",
            },
            "housing_situation": {
                "questions": [
                    {
                        "id": "current_situation",
                        "text": "Where are you currently staying?",
                        "type": "select",
                        "options": [
                            "Street",
                            "Shelter",
                            "Car",
                            "Friend/Family",
                            "Other",
                        ],
                        "required": True,
                    },
                    {
                        "id": "duration_homeless",
                        "text": "How long have you been without permanent housing?",
                        "type": "select",
                        "options": self.suggestions["housing_history"],
                        "required": True,
                    },
                    {
                        "id": "previous_housing",
                        "text": "What was your last permanent housing situation?",
                        "type": "text",
                        "required": False,
                    },
                ],
                "next": "employment_skills",
            },
            "employment_skills": {
                "questions": [
                    {
                        "id": "employment_status",
                        "text": "Current employment status",
                        "type": "select",
                        "options": [
                            "Unemployed",
                            "Part-time",
                            "Full-time",
                            "Disabled",
                            "Retired",
                        ],
                        "required": True,
                    },
                    {
                        "id": "skills",
                        "text": "What skills or work experience do you have?",
                        "type": "multi-select",
                        "options": self.suggestions["skills"],
                        "suggestions": True,
                        "required": False,
                    },
                    {
                        "id": "work_history",
                        "text": "Years of work experience",
                        "type": "number",
                        "required": False,
                        "skip_if": {"employment_status": ["Disabled", "Retired"]},
                    },
                    {
                        "id": "seeking_employment",
                        "text": "Are you interested in employment assistance?",
                        "type": "boolean",
                        "required": True,
                        "skip_if": {
                            "employment_status": ["Full-time", "Disabled", "Retired"]
                        },
                    },
                ],
                "next": "health_assessment",
            },
            "health_assessment": {
                "questions": [
                    {
                        "id": "health_conditions",
                        "text": "Do you have any health conditions we should know about?",
                        "type": "multi-select",
                        "options": self.suggestions["health_conditions"],
                        "required": True,
                    },
                    {
                        "id": "medications",
                        "text": "Are you currently taking any medications?",
                        "type": "boolean",
                        "required": True,
                    },
                    {
                        "id": "medication_access",
                        "text": "Do you have access to your medications?",
                        "type": "boolean",
                        "required": True,
                        "show_if": {"medications": True},
                    },
                    {
                        "id": "mental_health_support",
                        "text": "Would you like mental health support?",
                        "type": "boolean",
                        "required": False,
                        "show_if": {"health_conditions": ["Mental Health"]},
                    },
                ],
                "next": "immediate_needs",
            },
            "immediate_needs": {
                "questions": [
                    {
                        "id": "urgent_needs",
                        "text": "What are your most urgent needs right now?",
                        "type": "multi-select",
                        "options": [
                            "Food",
                            "Shelter",
                            "Medical Care",
                            "Clothing",
                            "Transportation",
                            "Phone",
                            "ID/Documents",
                        ],
                        "required": True,
                    },
                    {
                        "id": "priority_goal",
                        "text": "What is your primary goal?",
                        "type": "select",
                        "options": [
                            "Find shelter",
                            "Get a job",
                            "Access healthcare",
                            "Reunite with family",
                            "Get training",
                            "Find housing",
                        ],
                        "required": True,
                    },
                ],
                "next": None,
            },
        }

    def get_next_questions(self, section: str, previous_answers: Dict) -> List[Dict]:
        """
        Get next set of questions based on current section and previous answers.
        """
        if section not in self.question_tree:
            return []

        section_data = self.question_tree[section]
        questions = []

        for question in section_data["questions"]:
            # Check skip conditions
            if "skip_if" in question:
                should_skip = False
                for key, values in question["skip_if"].items():
                    if key in previous_answers and previous_answers[key] in values:
                        should_skip = True
                        break
                if should_skip:
                    continue

            # Check show conditions
            if "show_if" in question:
                should_show = True
                for key, value in question["show_if"].items():
                    if key not in previous_answers or previous_answers[key] != value:
                        should_show = False
                        break
                if not should_show:
                    continue

            # Add suggestions if applicable
            if question.get("suggestions") and question["id"] in self.suggestions:
                question["auto_complete"] = self.suggestions[question["id"]]

            questions.append(question)

        return questions

    def get_next_section(self, current_section: str) -> Optional[str]:
        """Get the next section in the questionnaire."""
        if current_section in self.question_tree:
            return self.question_tree[current_section].get("next")
        return None

    def predict_missing_info(self, partial_profile: Dict) -> Dict:
        """
        Predict missing information based on similar profiles.
        """
        if not self.predictor:
            return {}

        predictions = {}

        # Example: Predict employment success likelihood
        if "age" in partial_profile and "education" in partial_profile:
            # This would use trained model in production
            predictions["employment_likelihood"] = self._predict_employment_success(
                partial_profile
            )

        # Predict suitable programs
        if "skills" in partial_profile:
            predictions["recommended_training"] = self._suggest_training(
                partial_profile
            )

        return predictions

    def _predict_employment_success(self, profile: Dict) -> float:
        """Predict likelihood of employment success."""
        # Simplified scoring - would use ML model in production
        score = 0.5

        if profile.get("age", 100) < 50:
            score += 0.1
        if profile.get("education") in ["Bachelor Degree", "Associate Degree"]:
            score += 0.2
        if profile.get("skills"):
            score += min(len(profile["skills"]) * 0.05, 0.2)

        return min(score, 1.0)

    def _suggest_training(self, profile: Dict) -> List[str]:
        """Suggest training programs based on profile."""
        suggestions = []
        skills = profile.get("skills", [])

        if not skills or len(skills) < 2:
            suggestions.append("Basic Skills Training")

        if any(s in skills for s in ["Construction", "Carpentry"]):
            suggestions.append("Advanced Construction Certification")

        if any(s in skills for s in ["Computer Skills", "Data Entry"]):
            suggestions.append("IT Skills Development")

        return suggestions or ["General Vocational Training"]

    def _load_predictor(self):
        """Load pre-trained predictor model if available."""
        model_path = "models/artifacts/questionnaire_predictor.pkl"
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                self.predictor = pickle.load(f)
