import numpy as np
import torch
from typing import Dict, List, Tuple
from collections import defaultdict


class MultiArmedBandit:
    """
    Contextual Multi-Armed Bandit for recommendation optimization.
    Uses Upper Confidence Bound (UCB) strategy with context awareness.
    GPU-accelerated for faster computations.
    """

    def __init__(
        self,
        epsilon: float = 0.1,
        epsilon_decay: float = 0.995,
        min_epsilon: float = 0.01,
        device: str = None,
    ):
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.min_epsilon = min_epsilon
        
        # Set up device
        self.device = torch.device(device if device else ("cuda" if torch.cuda.is_available() else "cpu"))
        print(f"MultiArmedBandit using device: {self.device}")

        # Track rewards for each resource type and ID
        self.rewards = defaultdict(lambda: defaultdict(list))
        self.counts = defaultdict(lambda: defaultdict(int))

    def select_action(
        self, resource_type: str, candidates: List[Dict], scores: Dict[str, float]
    ) -> str:
        """
        Select best resource using epsilon-greedy with UCB.
        GPU-accelerated UCB score calculation.
        """
        if np.random.random() < self.epsilon:
            # Exploration: random selection
            return np.random.choice([c["id"] for c in candidates])

        # Exploitation: select based on UCB score using GPU
        candidate_ids = [c["id"] for c in candidates]
        n_candidates = len(candidate_ids)
        
        # Prepare data for GPU processing
        base_scores = torch.tensor(
            [scores.get(cid, 0.0) for cid in candidate_ids],
            device=self.device,
            dtype=torch.float32
        )
        
        counts = torch.tensor(
            [self.counts[resource_type][cid] for cid in candidate_ids],
            device=self.device,
            dtype=torch.float32
        )
        
        total_counts = sum(self.counts[resource_type].values())
        
        # Calculate UCB bonuses on GPU
        # For unexplored options (count=0), set high bonus
        ucb_bonuses = torch.where(
            counts == 0,
            torch.tensor(1.0, device=self.device),
            torch.sqrt(2 * torch.log(torch.tensor(total_counts + 1, device=self.device)) / (counts + 1e-8))
        )
        
        # Calculate total UCB scores
        ucb_scores = base_scores + ucb_bonuses
        
        # Find best action
        best_idx = torch.argmax(ucb_scores).item()
        best_id = candidate_ids[best_idx]

        return best_id

    def update(self, resource_type: str, resource_id: str, reward: float):
        """
        Update the bandit with feedback from a placement.
        """
        self.rewards[resource_type][resource_id].append(reward)
        self.counts[resource_type][resource_id] += 1

        # Decay epsilon for less exploration over time
        self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)

    def get_average_reward(self, resource_type: str, resource_id: str) -> float:
        """
        Get historical success rate for a resource.
        GPU-accelerated mean calculation for large reward lists.
        """
        rewards_list = self.rewards[resource_type].get(resource_id, [])
        if not rewards_list:
            return 0.5  # Neutral default for cold start
        
        # Use GPU for mean calculation if list is large enough
        if len(rewards_list) > 100:
            rewards_tensor = torch.tensor(rewards_list, device=self.device, dtype=torch.float32)
            return rewards_tensor.mean().item()
        else:
            return np.mean(rewards_list)

    def get_stats(self) -> Dict:
        """
        Get statistics about the bandit's learning.
        GPU-accelerated for computing aggregate statistics.
        """
        stats = {}
        for resource_type in self.rewards:
            total_interactions = sum(self.counts[resource_type].values())
            unique_resources = len(self.counts[resource_type])
            
            # Calculate average reward using GPU for efficiency
            all_rewards = []
            for rewards in self.rewards[resource_type].values():
                if rewards:
                    all_rewards.extend(rewards)
            
            if all_rewards:
                if len(all_rewards) > 100:
                    # Use GPU for large datasets
                    rewards_tensor = torch.tensor(all_rewards, device=self.device, dtype=torch.float32)
                    avg_reward = rewards_tensor.mean().item()
                else:
                    avg_reward = np.mean(all_rewards)
            else:
                avg_reward = 0.0
            
            stats[resource_type] = {
                "total_interactions": total_interactions,
                "unique_resources": unique_resources,
                "avg_reward": avg_reward,
            }
        
        return stats