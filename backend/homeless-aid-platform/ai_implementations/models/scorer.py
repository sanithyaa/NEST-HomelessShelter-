import numpy as np
import torch
from typing import Dict, List
from scipy.spatial.distance import euclidean
from config import Config

# Try to import sentence transformers for semantic similarity
try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("⚠️  sentence-transformers not available, using fallback skill matching")


class RecommendationScorer:
    """
    Calculates weighted scores for matching individuals with resources.
    GPU-accelerated for batch scoring operations.
    """

    def __init__(self, bandit=None, device=None):
        self.bandit = bandit
        
        # Set up device for GPU acceleration
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = device
        print(f"RecommendationScorer using device: {self.device}")
        
        # Initialize sentence transformer for semantic skill matching
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.skill_model = SentenceTransformer('all-MiniLM-L6-v2')
                self.skill_model.to(self.device)
                print(f"✅ Semantic skill matching enabled (using {self.device})")
            except Exception as e:
                print(f"⚠️  Failed to load sentence transformer: {e}")
                self.skill_model = None
        else:
            self.skill_model = None

    def calculate_location_score(
        self, individual_location: tuple, resource_location: tuple
    ) -> float:
        """
        Calculate proximity score (closer is better).
        GPU-accelerated for batch operations.
        """
        if not individual_location or not resource_location:
            return 0.5

        # Use GPU for distance calculation
        ind_loc = torch.tensor(individual_location, device=self.device, dtype=torch.float32)
        res_loc = torch.tensor(resource_location, device=self.device, dtype=torch.float32)
        
        distance = torch.dist(ind_loc, res_loc).item()
        # Normalize: assume max relevant distance is 50 units (e.g., km)
        normalized_distance = min(distance / 50.0, 1.0)
        return 1.0 - normalized_distance

    def calculate_skill_match_score(
        self, individual_skills: List[str], required_skills: List[str]
    ) -> float:
        """
        Calculate skill alignment score with semantic similarity using NLP.
        Falls back to fuzzy matching if NLP model not available.
        """
        if not required_skills:
            return 1.0
        if not individual_skills:
            return 0.0
        
        # Use semantic similarity if available
        if self.skill_model is not None:
            return self._semantic_skill_match(individual_skills, required_skills)
        
        # Fallback to rule-based matching
        return self._fallback_skill_match(individual_skills, required_skills)
    
    def _semantic_skill_match(self, individual_skills: List[str], required_skills: List[str]) -> float:
        """
        Use sentence transformers for semantic skill matching.
        """
        try:
            # Encode skills
            ind_embeddings = self.skill_model.encode(individual_skills, convert_to_tensor=True)
            req_embeddings = self.skill_model.encode(required_skills, convert_to_tensor=True)
            
            # Calculate cosine similarity matrix
            similarities = util.cos_sim(ind_embeddings, req_embeddings)
            
            # For each required skill, find the best matching individual skill
            matches = 0.0
            for req_idx in range(len(required_skills)):
                best_match = torch.max(similarities[:, req_idx]).item()
                # Consider it a match if similarity > 0.5 (50%)
                if best_match > 0.5:
                    matches += best_match
            
            return min(matches / len(required_skills), 1.0)
        except Exception as e:
            print(f"⚠️  Semantic matching failed: {e}, falling back")
            return self._fallback_skill_match(individual_skills, required_skills)
    
    def _fallback_skill_match(self, individual_skills: List[str], required_skills: List[str]) -> float:
        """
        Fallback rule-based skill matching with synonyms.
        """

        # Skill synonyms and related terms
        skill_synonyms = {
            'drive': ['driving', 'driver', 'can drive', 'valid license', 'license', 'navigation', 'delivery'],
            'construction': ['carpentry', 'building', 'physical labor', 'laborer', 'builder'],
            'cook': ['cooking', 'food service', 'kitchen', 'culinary', 'chef'],
            'clean': ['cleaning', 'housekeeping', 'janitorial', 'maintenance', 'janitor'],
            'customer service': ['retail', 'sales', 'cashier', 'service', 'customer'],
            'organize': ['organization', 'organizing', 'stocking', 'inventory'],
            'computer': ['typing', 'data entry', 'office', 'microsoft', 'tech'],
            'warehouse': ['loading', 'unloading', 'forklift', 'physical labor'],
            'language': ['languages', 'multilingual', 'bilingual', 'translation'],
        }

        individual_set = set(s.lower().strip() for s in individual_skills)
        required_set = set(s.lower().strip() for s in required_skills)

        matches = 0
        
        # Check for exact matches first
        exact_matches = individual_set.intersection(required_set)
        matches += len(exact_matches)
        
        # Check for fuzzy/synonym matches
        for ind_skill in individual_set:
            if ind_skill in exact_matches:
                continue  # Already counted
                
            for req_skill in required_set:
                if req_skill in exact_matches:
                    continue  # Already counted
                
                # Check if skills contain each other (partial match)
                if ind_skill in req_skill or req_skill in ind_skill:
                    matches += 0.8  # Partial match worth 80%
                    continue
                
                # Check synonyms - also check if any word in the skill matches
                for base_skill, synonyms in skill_synonyms.items():
                    ind_words = ind_skill.split()
                    req_words = req_skill.split()
                    
                    # Check if the skill or any word in it matches the synonym group
                    ind_match = (ind_skill in synonyms or ind_skill == base_skill or 
                                any(word in synonyms or word == base_skill for word in ind_words))
                    req_match = (req_skill in synonyms or req_skill == base_skill or
                                any(word in synonyms or word == base_skill for word in req_words))
                    
                    if ind_match and req_match:
                        matches += 0.7  # Synonym match worth 70%
                        break

        return min(matches / len(required_set), 1.0)

    def calculate_availability_score(
        self, resource_capacity: int, resource_occupied: int
    ) -> float:
        """
        Calculate availability score based on capacity.
        """
        if resource_capacity <= 0:
            return 0.0

        available = resource_capacity - resource_occupied
        if available <= 0:
            return 0.0

        utilization = resource_occupied / resource_capacity
        # Prefer resources that aren't too empty or too full
        if utilization < 0.3:
            return 0.7 + (utilization / 0.3) * 0.3
        elif utilization < 0.8:
            return 1.0
        else:
            return 1.0 - ((utilization - 0.8) / 0.2) * 0.5

    def calculate_priority_score(
        self, individual_priority: str, resource_priority_support: List[str]
    ) -> float:
        """
        Calculate priority alignment score.
        """
        priority_levels = {"low": 1, "medium": 2, "high": 3, "critical": 4}

        individual_level = priority_levels.get(individual_priority.lower(), 2)

        if not resource_priority_support:
            return 0.5

        supported_levels = [
            priority_levels.get(p.lower(), 2) for p in resource_priority_support
        ]

        if individual_level in supported_levels:
            return 1.0

        # Partial score based on proximity
        min_diff = min(abs(individual_level - level) for level in supported_levels)
        return max(0.0, 1.0 - (min_diff * 0.25))

    def calculate_historical_score(self, resource_type: str, resource_id: str) -> float:
        """
        Get historical success rate from the bandit.
        """
        if self.bandit:
            return self.bandit.get_average_reward(resource_type, resource_id)
        return 0.5

    def calculate_composite_score(
        self, individual: Dict, resource: Dict, resource_type: str
    ) -> tuple[float, Dict]:
        """
        Calculate weighted composite score with explanation.
        """
        # Location score
        location_score = self.calculate_location_score(
            individual.get("location"), resource.get("location")
        )

        # Skill match score
        skill_score = self.calculate_skill_match_score(
            individual.get("skills", []), resource.get("required_skills", [])
        )

        # Availability score
        availability_score = self.calculate_availability_score(
            resource.get("capacity", 0), resource.get("occupied", 0)
        )

        # Priority score
        priority_score = self.calculate_priority_score(
            individual.get("priority", "medium"),
            resource.get("priority_support", ["low", "medium", "high"]),
        )

        # Historical score
        historical_score = self.calculate_historical_score(
            resource_type, resource["id"]
        )

        # Calculate weighted composite
        composite = (
            Config.WEIGHT_LOCATION * location_score
            + Config.WEIGHT_SKILL_MATCH * skill_score
            + Config.WEIGHT_AVAILABILITY * availability_score
            + Config.WEIGHT_PRIORITY * priority_score
            + Config.WEIGHT_HISTORICAL * historical_score
        )

        # Cold start bonus
        if (
            self.bandit
            and self.bandit.counts[resource_type][resource["id"]]
            < Config.MIN_INTERACTIONS_FOR_LEARNING
        ):
            composite += Config.COLD_START_BONUS

        explanation = {
            "location_score": round(location_score, 3),
            "skill_match_score": round(skill_score, 3),
            "availability_score": round(availability_score, 3),
            "priority_score": round(priority_score, 3),
            "historical_score": round(historical_score, 3),
            "composite_score": round(composite, 3),
        }

        return composite, explanation
