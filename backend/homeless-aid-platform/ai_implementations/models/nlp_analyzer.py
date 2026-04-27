import re
from typing import Dict, List, Tuple
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch


class NLPAnalyzer:
    """
    NLP-powered analysis of volunteer notes about homeless individuals.
    Extracts skills, health concerns, urgency, and sentiment.
    """

    def __init__(self, use_openai: bool = False):
        self.use_openai = use_openai
        
        # Set up device for GPU acceleration
        self.device = 0 if torch.cuda.is_available() else -1
        device_name = 'GPU (cuda)' if self.device == 0 else 'CPU'
        print(f"NLPAnalyzer using device: {device_name}")

        if use_openai:
            import openai
            from config import Config

            openai.api_key = Config.OPENAI_API_KEY
            self.openai = openai
        else:
            # Use Hugging Face transformers with GPU support
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=self.device,
            )
            self.ner_pipeline = pipeline(
                "ner", 
                model="dslim/bert-base-NER", 
                aggregation_strategy="simple",
                device=self.device,
            )

        # Keywords for extraction
        self.skill_keywords = [
            "cooking",
            "cleaning",
            "construction",
            "carpentry",
            "painting",
            "plumbing",
            "electrical",
            "driving",
            "retail",
            "customer service",
            "warehouse",
            "forklift",
            "computer",
            "typing",
            "data entry",
            "welding",
            "mechanic",
            "landscaping",
            "security",
            "janitorial",
        ]

        self.health_keywords = {
            "mental": [
                "depression",
                "anxiety",
                "ptsd",
                "bipolar",
                "schizophrenia",
                "mental health",
                "psychiatric",
                "therapy",
                "counseling",
            ],
            "physical": [
                "diabetes",
                "hypertension",
                "asthma",
                "injury",
                "disability",
                "chronic pain",
                "medication",
                "hospital",
                "doctor",
            ],
            "substance": [
                "alcohol",
                "drugs",
                "addiction",
                "substance abuse",
                "recovery",
                "rehab",
                "sobriety",
                "withdrawal",
            ],
        }

        self.urgency_keywords = {
            "critical": [
                "emergency",
                "urgent",
                "immediate",
                "crisis",
                "danger",
                "life-threatening",
                "critical",
                "severe",
            ],
            "high": ["soon", "quickly", "asap", "priority", "important", "serious"],
            "medium": ["needed", "should", "would help", "beneficial"],
            "low": ["eventually", "future", "long-term", "when possible"],
        }

    def analyze_notes(self, notes: str) -> Dict:
        """
        Comprehensive analysis of volunteer notes.
        """
        if self.use_openai:
            return self._analyze_with_openai(notes)
        else:
            return self._analyze_with_transformers(notes)

    def _analyze_with_transformers(self, notes: str) -> Dict:
        """
        Analyze using Hugging Face transformers.
        """
        notes_lower = notes.lower()

        # Extract skills
        skills = self._extract_skills(notes_lower)

        # Extract health concerns
        health_concerns = self._extract_health_concerns(notes_lower)

        # Determine urgency
        urgency = self._determine_urgency(notes_lower)

        # Sentiment analysis
        sentiment_result = self.sentiment_analyzer(notes[:512])[0]
        sentiment_score = (
            sentiment_result["score"]
            if sentiment_result["label"] == "POSITIVE"
            else -sentiment_result["score"]
        )

        # Mental health risk detection
        mental_health_risk = self._detect_mental_health_risk(
            notes_lower, sentiment_score
        )

        # Categorize needs
        needs = self._categorize_needs(notes_lower, urgency, health_concerns)

        return {
            "skills": skills,
            "health_concerns": health_concerns,
            "urgency_level": urgency,
            "sentiment": {
                "label": sentiment_result["label"],
                "score": sentiment_score,
                "mental_health_risk": mental_health_risk,
            },
            "needs_categories": needs,
            "extracted_entities": self._extract_entities(notes),
        }

    def _analyze_with_openai(self, notes: str) -> Dict:
        """
        Analyze using OpenAI API.
        """
        prompt = f"""Analyze the following volunteer notes about a homeless individual and extract:
1. Skills mentioned (list)
2. Health concerns (categorize as mental, physical, or substance-related)
3. Urgency level (critical, high, medium, or low)
4. Sentiment (positive, negative, or neutral with score -1 to 1)
5. Mental health risk (low, medium, or high)
6. Needs categories (immediate, short-term, long-term)

Notes: {notes}

Respond in JSON format."""

        response = self.openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert social worker analyzing case notes.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        import json

        return json.loads(response.choices[0].message.content)

    def _extract_skills(self, text: str) -> List[str]:
        """Extract mentioned skills from text."""
        found_skills = []
        for skill in self.skill_keywords:
            if skill in text:
                found_skills.append(skill)
        return found_skills

    def _extract_health_concerns(self, text: str) -> Dict[str, List[str]]:
        """Extract health-related concerns."""
        concerns = {"mental": [], "physical": [], "substance": []}

        for category, keywords in self.health_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    concerns[category].append(keyword)

        return {k: list(set(v)) for k, v in concerns.items() if v}

    def _determine_urgency(self, text: str) -> str:
        """Determine urgency level from text."""
        urgency_scores = {"critical": 0, "high": 0, "medium": 0, "low": 0}

        for level, keywords in self.urgency_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    urgency_scores[level] += 1

        if urgency_scores["critical"] > 0:
            return "critical"
        elif urgency_scores["high"] > 0:
            return "high"
        elif urgency_scores["medium"] > 0:
            return "medium"
        else:
            return "low"

    def _detect_mental_health_risk(self, text: str, sentiment_score: float) -> str:
        """Detect mental health risk level."""
        risk_indicators = [
            "suicide",
            "kill myself",
            "end it all",
            "no hope",
            "give up",
            "worthless",
            "hopeless",
            "can't go on",
            "want to die",
        ]

        high_risk_count = sum(1 for indicator in risk_indicators if indicator in text)

        if high_risk_count > 0 or sentiment_score < -0.7:
            return "high"
        elif sentiment_score < -0.3 or any(
            word in text for word in ["depressed", "anxious", "struggling"]
        ):
            return "medium"
        else:
            return "low"

    def _categorize_needs(
        self, text: str, urgency: str, health_concerns: Dict
    ) -> Dict[str, List[str]]:
        """Categorize needs into immediate, short-term, and long-term."""
        needs = {"immediate": [], "short_term": [], "long_term": []}

        # Immediate needs
        if any(word in text for word in ["hungry", "food", "meal", "eat"]):
            needs["immediate"].append("food")
        if any(word in text for word in ["shelter", "bed", "sleep", "cold", "weather"]):
            needs["immediate"].append("shelter")
        if urgency == "critical":
            needs["immediate"].append("crisis_intervention")

        # Short-term needs
        if health_concerns:
            needs["short_term"].append("medical_care")
        if any(word in text for word in ["clothes", "clothing", "hygiene"]):
            needs["short_term"].append("basic_supplies")
        if any(
            word in text
            for word in ["id", "documents", "birth certificate", "social security"]
        ):
            needs["short_term"].append("documentation")

        # Long-term needs
        if any(word in text for word in ["job", "work", "employment", "income"]):
            needs["long_term"].append("employment")
        if any(word in text for word in ["training", "education", "learn", "skill"]):
            needs["long_term"].append("training")
        if any(word in text for word in ["housing", "apartment", "permanent"]):
            needs["long_term"].append("permanent_housing")

        return {k: list(set(v)) for k, v in needs.items() if v}

    def _extract_entities(self, text: str) -> List[Dict]:
        """Extract named entities from text."""
        try:
            entities = self.ner_pipeline(text[:512])
            return [
                {
                    "text": ent["word"],
                    "type": ent["entity_group"],
                    "score": round(ent["score"], 3),
                }
                for ent in entities
            ]
        except:
            return []
