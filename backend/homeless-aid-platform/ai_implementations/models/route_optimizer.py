import numpy as np
import torch
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import heapq
from dataclasses import dataclass
from config import Config


@dataclass
class Location:
    """Represents a location with coordinates and metadata."""

    id: str
    name: str
    lat: float
    lon: float
    type: str  # 'shelter', 'job', 'medical', 'individual', etc.
    hours: Optional[Dict] = None
    wait_time_avg: int = 0  # minutes
    accessibility_score: float = 0.0


@dataclass
class Route:
    """Represents a route between locations."""

    locations: List[Location]
    total_distance: float  # km
    total_time: int  # minutes
    transport_modes: List[str]
    cost: float
    accessibility_score: float
    waypoints: List[Tuple[float, float]]


class RouteOptimizer:
    """
    AI-powered route optimization for volunteers and individuals.
    Uses A* algorithm with custom heuristics.
    GPU-accelerated for distance calculations and batch operations.
    """

    def __init__(self):
        self.locations_cache = {}
        self.distance_cache = {}
        
        # Set up device for GPU acceleration
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"RouteOptimizer using device: {self.device}")

        # Weights for route scoring
        self.weights = {
            "distance": 0.30,
            "time": 0.25,
            "cost": 0.15,
            "safety": 0.15,
            "accessibility": 0.15,
        }

    def optimize_multi_stop_route(
        self,
        start_location: Tuple[float, float],
        destinations: List[Dict],
        constraints: Dict = None,
    ) -> Dict:
        """
        Calculate optimal route visiting multiple destinations.

        Args:
            start_location: (lat, lon) starting point
            destinations: List of destination dicts with lat, lon, type
            constraints: Optional constraints (max_time, max_distance, transport_mode)

        Returns:
            Optimized route with waypoints and metadata
        """
        constraints = constraints or {}

        # Convert to Location objects
        locations = [
            Location(
                id=dest.get("id", f"loc_{i}"),
                name=dest.get("name", f"Location {i}"),
                lat=dest["lat"],
                lon=dest["lon"],
                type=dest.get("type", "unknown"),
                hours=dest.get("hours"),
                wait_time_avg=dest.get("wait_time", 0),
            )
            for i, dest in enumerate(destinations)
        ]

        # Solve TSP using nearest neighbor with improvements
        route_order = self._solve_tsp(start_location, locations, constraints)

        # Build detailed route
        route = self._build_route(start_location, route_order, constraints)

        # Calculate scores
        route_data = {
            "route": route,
            "order": [loc.id for loc in route_order],
            "total_distance": route.total_distance,
            "total_time": route.total_time,
            "estimated_cost": route.cost,
            "accessibility_score": route.accessibility_score,
            "waypoints": route.waypoints,
            "transport_modes": route.transport_modes,
            "alternatives": self._generate_alternatives(
                start_location, locations, constraints
            ),
        }

        return route_data

    def optimize_volunteer_routes(
        self, volunteers: List[Dict], individuals: List[Dict], date: datetime = None
    ) -> Dict:
        """
        Optimize daily routes for multiple volunteers conducting outreach.

        Args:
            volunteers: List of volunteer dicts with id, location, capacity
            individuals: List of individual dicts with id, location, priority
            date: Date for route planning

        Returns:
            Optimized assignments and routes for each volunteer
        """
        date = date or datetime.now()

        # Cluster individuals by location
        clusters = self._cluster_locations(individuals)

        # Assign clusters to volunteers
        assignments = self._assign_clusters_to_volunteers(volunteers, clusters)

        # Optimize route for each volunteer
        volunteer_routes = {}
        for volunteer_id, assigned_individuals in assignments.items():
            volunteer = next(v for v in volunteers if v["id"] == volunteer_id)

            route = self.optimize_multi_stop_route(
                start_location=(volunteer["lat"], volunteer["lon"]),
                destinations=assigned_individuals,
                constraints={
                    "max_time": volunteer.get("available_hours", 8) * 60,
                    "transport_mode": volunteer.get("transport_mode", "driving"),
                },
            )

            volunteer_routes[volunteer_id] = {
                "volunteer_name": volunteer.get("name"),
                "route": route,
                "individuals_count": len(assigned_individuals),
                "estimated_duration": route["total_time"],
                "workload_score": self._calculate_workload_score(route),
            }

        return {
            "date": date.isoformat(),
            "volunteer_routes": volunteer_routes,
            "total_individuals": len(individuals),
            "coverage": self._calculate_coverage(assignments, individuals),
            "balance_score": self._calculate_balance_score(volunteer_routes),
        }

    def score_resource_accessibility(
        self,
        individual_location: Tuple[float, float],
        resources: List[Dict],
        individual_profile: Dict = None,
    ) -> List[Dict]:
        """
        Score resources based on accessibility for an individual.

        Args:
            individual_location: (lat, lon) of individual
            resources: List of resource locations
            individual_profile: Optional profile with mobility constraints

        Returns:
            Resources sorted by accessibility score
        """
        individual_profile = individual_profile or {}

        scored_resources = []

        for resource in resources:
            resource_loc = (resource["lat"], resource["lon"])

            # Calculate distance
            distance = self._haversine_distance(individual_location, resource_loc)

            # Get transport options
            transport_options = self._get_transport_options(
                individual_location, resource_loc, individual_profile
            )

            # Calculate accessibility score
            accessibility = self._calculate_accessibility_score(
                distance, transport_options, resource, individual_profile
            )

            scored_resources.append(
                {
                    "resource_id": resource.get("id"),
                    "resource_name": resource.get("name"),
                    "resource_type": resource.get("type"),
                    "distance_km": round(distance, 2),
                    "accessibility_score": round(accessibility, 3),
                    "transport_options": transport_options,
                    "estimated_time": transport_options[0]["time"]
                    if transport_options
                    else None,
                    "estimated_cost": transport_options[0]["cost"]
                    if transport_options
                    else None,
                    "accessibility_notes": self._get_accessibility_notes(
                        accessibility, transport_options, individual_profile
                    ),
                    "resource_details": resource,
                }
            )

        # Sort by accessibility score (descending)
        scored_resources.sort(key=lambda x: x["accessibility_score"], reverse=True)

        return scored_resources

    def suggest_visit_times(self, location: Dict, date: datetime = None) -> List[Dict]:
        """
        Suggest best times to visit based on hours and wait times.

        Args:
            location: Location dict with hours and wait time data
            date: Target date

        Returns:
            List of suggested time slots with scores
        """
        date = date or datetime.now()
        hours = location.get("hours", {})

        # Get operating hours for the day
        day_name = date.strftime("%A").lower()
        day_hours = hours.get(day_name, {"open": "09:00", "close": "17:00"})

        if not day_hours or day_hours.get("closed"):
            return [
                {
                    "message": f"Location is closed on {day_name.capitalize()}",
                    "alternative_days": self._get_alternative_days(hours),
                }
            ]

        # Generate time slots
        suggestions = []
        open_time = datetime.strptime(day_hours["open"], "%H:%M").time()
        close_time = datetime.strptime(day_hours["close"], "%H:%M").time()

        # Early morning (less crowded)
        if open_time.hour < 10:
            suggestions.append(
                {
                    "time_slot": f"{day_hours['open']} - {min(open_time.hour + 2, close_time.hour):02d}:00",
                    "score": 0.9,
                    "wait_time_estimate": "Low (5-10 min)",
                    "reason": "Early morning - typically less crowded",
                    "recommended": True,
                }
            )

        # Mid-morning
        suggestions.append(
            {
                "time_slot": f"10:00 - 12:00",
                "score": 0.7,
                "wait_time_estimate": "Medium (15-25 min)",
                "reason": "Mid-morning - moderate crowd",
                "recommended": False,
            }
        )

        # Afternoon
        suggestions.append(
            {
                "time_slot": f"14:00 - 16:00",
                "score": 0.6,
                "wait_time_estimate": "Medium-High (20-30 min)",
                "reason": "Afternoon - busier period",
                "recommended": False,
            }
        )

        # Late afternoon (if open)
        if close_time.hour >= 17:
            suggestions.append(
                {
                    "time_slot": f"16:00 - {day_hours['close']}",
                    "score": 0.8,
                    "wait_time_estimate": "Low-Medium (10-20 min)",
                    "reason": "Late afternoon - crowd decreasing",
                    "recommended": True,
                }
            )

        return suggestions

    def identify_service_gaps(
        self,
        service_locations: List[Dict],
        coverage_area: Dict,
        population_density: List[Dict] = None,
    ) -> Dict:
        """
        Identify underserved areas lacking service coverage.

        Args:
            service_locations: List of existing service locations
            coverage_area: Dict with bounds (min_lat, max_lat, min_lon, max_lon)
            population_density: Optional population density data

        Returns:
            Analysis of service gaps and recommendations
        """
        # Create grid of coverage area
        grid = self._create_coverage_grid(coverage_area)

        # Calculate coverage for each grid cell
        coverage_map = self._calculate_coverage_map(grid, service_locations)

        # Identify gaps
        gaps = []
        for cell in grid:
            if coverage_map[cell["id"]]["coverage_score"] < 0.5:
                gaps.append(
                    {
                        "location": cell["center"],
                        "coverage_score": coverage_map[cell["id"]]["coverage_score"],
                        "nearest_service": coverage_map[cell["id"]]["nearest_service"],
                        "distance_to_nearest": coverage_map[cell["id"]]["distance"],
                        "population_estimate": cell.get("population", 0),
                        "priority": self._calculate_gap_priority(
                            cell, coverage_map[cell["id"]]
                        ),
                    }
                )

        # Sort by priority
        gaps.sort(key=lambda x: x["priority"], reverse=True)

        return {
            "total_gaps": len(gaps),
            "high_priority_gaps": [g for g in gaps if g["priority"] > 0.7],
            "coverage_percentage": self._calculate_overall_coverage(coverage_map),
            "recommendations": self._generate_gap_recommendations(gaps[:5]),
            "gap_details": gaps,
        }

    def _solve_tsp(
        self, start: Tuple[float, float], locations: List[Location], constraints: Dict
    ) -> List[Location]:
        """Solve Traveling Salesman Problem using nearest neighbor + 2-opt."""
        if not locations:
            return []

        # Nearest neighbor construction
        unvisited = locations.copy()
        route = []
        current = start

        while unvisited:
            # Find nearest unvisited location
            nearest = min(
                unvisited,
                key=lambda loc: self._haversine_distance(current, (loc.lat, loc.lon)),
            )
            route.append(nearest)
            unvisited.remove(nearest)
            current = (nearest.lat, nearest.lon)

        # Improve with 2-opt
        route = self._two_opt_improve(start, route)

        return route

    def _two_opt_improve(
        self,
        start: Tuple[float, float],
        route: List[Location],
        max_iterations: int = 100,
    ) -> List[Location]:
        """Improve route using 2-opt algorithm."""
        improved = True
        iterations = 0

        while improved and iterations < max_iterations:
            improved = False
            iterations += 1

            for i in range(len(route) - 1):
                for j in range(i + 2, len(route)):
                    # Calculate current distance
                    current_dist = (
                        self._route_segment_distance(start, route[: i + 1])
                        + self._route_segment_distance(
                            (route[i].lat, route[i].lon), route[i + 1 : j + 1]
                        )
                        + self._route_segment_distance(
                            (route[j].lat, route[j].lon), route[j + 1 :]
                        )
                    )

                    # Reverse segment and calculate new distance
                    new_route = (
                        route[: i + 1] + route[i + 1 : j + 1][::-1] + route[j + 1 :]
                    )
                    new_dist = (
                        self._route_segment_distance(start, new_route[: i + 1])
                        + self._route_segment_distance(
                            (new_route[i].lat, new_route[i].lon),
                            new_route[i + 1 : j + 1],
                        )
                        + self._route_segment_distance(
                            (new_route[j].lat, new_route[j].lon), new_route[j + 1 :]
                        )
                    )

                    if new_dist < current_dist:
                        route = new_route
                        improved = True

        return route

    def _build_route(
        self, start: Tuple[float, float], locations: List[Location], constraints: Dict
    ) -> Route:
        """Build detailed route with all metadata."""
        waypoints = [start]
        total_distance = 0.0
        total_time = 0
        transport_modes = []
        total_cost = 0.0

        current = start
        for location in locations:
            dest = (location.lat, location.lon)

            # Calculate segment
            distance = self._haversine_distance(current, dest)
            transport = constraints.get("transport_mode", "driving")
            time = self._estimate_travel_time(distance, transport)
            cost = self._estimate_travel_cost(distance, transport)

            total_distance += distance
            total_time += time + location.wait_time_avg
            total_cost += cost
            transport_modes.append(transport)
            waypoints.append(dest)

            current = dest

        # Calculate accessibility score
        accessibility = self._calculate_route_accessibility(
            locations, transport_modes, constraints
        )

        return Route(
            locations=locations,
            total_distance=round(total_distance, 2),
            total_time=total_time,
            transport_modes=transport_modes,
            cost=round(total_cost, 2),
            accessibility_score=round(accessibility, 3),
            waypoints=waypoints,
        )

    def _haversine_distance(
        self, loc1: Tuple[float, float], loc2: Tuple[float, float]
    ) -> float:
        """Calculate distance between two points using Haversine formula. GPU-accelerated."""
        # Convert to tensors for GPU computation
        lat1, lon1 = loc1
        lat2, lon2 = loc2

        R = 6371  # Earth's radius in km

        # Use PyTorch for GPU-accelerated trigonometric operations
        lat1_t = torch.tensor(np.radians(lat1), device=self.device, dtype=torch.float32)
        lon1_t = torch.tensor(np.radians(lon1), device=self.device, dtype=torch.float32)
        lat2_t = torch.tensor(np.radians(lat2), device=self.device, dtype=torch.float32)
        lon2_t = torch.tensor(np.radians(lon2), device=self.device, dtype=torch.float32)

        dlat = lat2_t - lat1_t
        dlon = lon2_t - lon1_t

        a = (
            torch.sin(dlat / 2) ** 2
            + torch.cos(lat1_t)
            * torch.cos(lat2_t)
            * torch.sin(dlon / 2) ** 2
        )

        c = 2 * torch.atan2(torch.sqrt(a), torch.sqrt(1 - a))

        return (R * c).item()

    def _estimate_travel_time(self, distance_km: float, transport_mode: str) -> int:
        """Estimate travel time in minutes."""
        speeds = {
            "walking": 5,  # km/h
            "cycling": 15,
            "public_transport": 25,
            "driving": 40,
        }

        speed = speeds.get(transport_mode, 25)
        return int((distance_km / speed) * 60)

    def _estimate_travel_cost(self, distance_km: float, transport_mode: str) -> float:
        """Estimate travel cost."""
        costs = {
            "walking": 0.0,
            "cycling": 0.0,
            "public_transport": 2.5,  # Base fare
            "driving": distance_km * 0.5,  # Per km
        }

        if transport_mode == "public_transport":
            # Add per-km cost for longer distances
            return costs[transport_mode] + max(0, (distance_km - 5) * 0.3)

        return costs.get(transport_mode, 0.0)

    def _cluster_locations(
        self, individuals: List[Dict], max_cluster_radius: float = 5.0
    ) -> List[List[Dict]]:
        """Cluster individuals by geographic proximity."""
        clusters = []
        unclustered = individuals.copy()

        while unclustered:
            # Start new cluster with first individual
            seed = unclustered.pop(0)
            cluster = [seed]
            seed_loc = (seed["lat"], seed["lon"])

            # Add nearby individuals to cluster
            remaining = []
            for individual in unclustered:
                ind_loc = (individual["lat"], individual["lon"])
                if self._haversine_distance(seed_loc, ind_loc) <= max_cluster_radius:
                    cluster.append(individual)
                else:
                    remaining.append(individual)

            unclustered = remaining
            clusters.append(cluster)

        return clusters

    def _assign_clusters_to_volunteers(
        self, volunteers: List[Dict], clusters: List[List[Dict]]
    ) -> Dict[str, List[Dict]]:
        """Assign clusters to volunteers to balance workload."""
        assignments = {v["id"]: [] for v in volunteers}

        # Sort clusters by size (largest first)
        sorted_clusters = sorted(clusters, key=len, reverse=True)

        # Assign clusters using greedy approach
        for cluster in sorted_clusters:
            # Find volunteer with least workload
            volunteer_id = min(
                assignments.keys(), key=lambda v_id: len(assignments[v_id])
            )
            assignments[volunteer_id].extend(cluster)

        return assignments

    def _calculate_accessibility_score(
        self,
        distance: float,
        transport_options: List[Dict],
        resource: Dict,
        profile: Dict,
    ) -> float:
        """Calculate accessibility score (0-1)."""
        score = 1.0

        # Distance penalty
        if distance > 10:
            score -= 0.3
        elif distance > 5:
            score -= 0.15

        # Transport availability
        if not transport_options:
            score -= 0.4
        elif len(transport_options) == 1:
            score -= 0.1

        # Cost consideration
        if transport_options:
            min_cost = min(opt["cost"] for opt in transport_options)
            if min_cost > 5:
                score -= 0.2
            elif min_cost > 2:
                score -= 0.1

        # Mobility constraints
        if profile.get("mobility_issues"):
            if not any(opt["mode"] == "public_transport" for opt in transport_options):
                score -= 0.3

        # Resource accessibility features
        if resource.get("wheelchair_accessible"):
            score += 0.1
        if resource.get("public_transport_nearby"):
            score += 0.1

        return max(0.0, min(1.0, score))

    def _get_transport_options(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        profile: Dict,
    ) -> List[Dict]:
        """Get available transport options with time and cost."""
        distance = self._haversine_distance(origin, destination)
        options = []

        # Walking (if reasonable distance)
        if distance <= 3:
            options.append(
                {
                    "mode": "walking",
                    "time": self._estimate_travel_time(distance, "walking"),
                    "cost": 0.0,
                    "distance_km": distance,
                    "accessibility": "high"
                    if not profile.get("mobility_issues")
                    else "low",
                }
            )

        # Public transport
        options.append(
            {
                "mode": "public_transport",
                "time": self._estimate_travel_time(distance, "public_transport"),
                "cost": self._estimate_travel_cost(distance, "public_transport"),
                "distance_km": distance,
                "accessibility": "high",
            }
        )

        # Cycling (if available and reasonable)
        if distance <= 10 and not profile.get("mobility_issues"):
            options.append(
                {
                    "mode": "cycling",
                    "time": self._estimate_travel_time(distance, "cycling"),
                    "cost": 0.0,
                    "distance_km": distance,
                    "accessibility": "medium",
                }
            )

        return options

    def _route_segment_distance(
        self, start: Tuple[float, float], segment: List[Location]
    ) -> float:
        """Calculate total distance for a route segment."""
        if not segment:
            return 0.0

        total = self._haversine_distance(start, (segment[0].lat, segment[0].lon))
        for i in range(len(segment) - 1):
            total += self._haversine_distance(
                (segment[i].lat, segment[i].lon),
                (segment[i + 1].lat, segment[i + 1].lon),
            )
        return total

    def _generate_alternatives(
        self, start: Tuple[float, float], locations: List[Location], constraints: Dict
    ) -> List[Dict]:
        """Generate alternative routes."""
        # For now, return empty list
        # In production, would generate 2-3 alternative routes
        return []

    def _calculate_workload_score(self, route: Dict) -> float:
        """Calculate workload score for a route."""
        # Normalize based on time and distance
        time_score = min(route["total_time"] / 480, 1.0)  # 8 hours max
        distance_score = min(route["total_distance"] / 100, 1.0)  # 100km max
        return (time_score + distance_score) / 2

    def _calculate_coverage(self, assignments: Dict, individuals: List[Dict]) -> float:
        """Calculate coverage percentage."""
        assigned_count = sum(len(inds) for inds in assignments.values())
        return assigned_count / len(individuals) if individuals else 0.0

    def _calculate_balance_score(self, volunteer_routes: Dict) -> float:
        """Calculate workload balance score."""
        if not volunteer_routes:
            return 1.0

        workloads = [r["workload_score"] for r in volunteer_routes.values()]
        avg = np.mean(workloads)
        std = np.std(workloads)

        # Lower std = better balance
        return max(0.0, 1.0 - std)

    def _get_accessibility_notes(
        self, score: float, transport_options: List[Dict], profile: Dict
    ) -> List[str]:
        """Generate accessibility notes."""
        notes = []

        if score >= 0.8:
            notes.append("Highly accessible location")
        elif score >= 0.6:
            notes.append("Moderately accessible")
        else:
            notes.append("Limited accessibility - may require assistance")

        if transport_options:
            cheapest = min(transport_options, key=lambda x: x["cost"])
            notes.append(f"Best option: {cheapest['mode']} (${cheapest['cost']:.2f})")

        if profile.get("mobility_issues") and score < 0.7:
            notes.append("Consider arranging transportation assistance")

        return notes

    def _calculate_route_accessibility(
        self, locations: List[Location], transport_modes: List[str], constraints: Dict
    ) -> float:
        """Calculate overall route accessibility."""
        # Average of location accessibility scores
        if not locations:
            return 1.0

        scores = [loc.accessibility_score or 0.7 for loc in locations]
        return np.mean(scores)

    def _get_alternative_days(self, hours: Dict) -> List[str]:
        """Get alternative days when location is open."""
        open_days = [
            day.capitalize()
            for day, info in hours.items()
            if info and not info.get("closed")
        ]
        return open_days

    def _create_coverage_grid(
        self, coverage_area: Dict, grid_size: float = 2.0
    ) -> List[Dict]:
        """Create grid cells for coverage analysis."""
        cells = []
        lat_range = np.arange(
            coverage_area["min_lat"],
            coverage_area["max_lat"],
            grid_size / 111,  # Approx km to degrees
        )
        lon_range = np.arange(
            coverage_area["min_lon"], coverage_area["max_lon"], grid_size / 111
        )

        for i, lat in enumerate(lat_range):
            for j, lon in enumerate(lon_range):
                cells.append(
                    {
                        "id": f"cell_{i}_{j}",
                        "center": (lat, lon),
                        "bounds": {
                            "min_lat": lat,
                            "max_lat": lat + grid_size / 111,
                            "min_lon": lon,
                            "max_lon": lon + grid_size / 111,
                        },
                    }
                )

        return cells

    def _calculate_coverage_map(
        self, grid: List[Dict], service_locations: List[Dict]
    ) -> Dict:
        """Calculate coverage for each grid cell."""
        coverage_map = {}

        for cell in grid:
            cell_center = cell["center"]

            # Find nearest service
            if service_locations:
                nearest = min(
                    service_locations,
                    key=lambda s: self._haversine_distance(
                        cell_center, (s["lat"], s["lon"])
                    ),
                )
                distance = self._haversine_distance(
                    cell_center, (nearest["lat"], nearest["lon"])
                )
            else:
                nearest = None
                distance = float("inf")

            # Calculate coverage score (inverse of distance)
            coverage_score = max(0.0, 1.0 - (distance / 10))  # 10km threshold

            coverage_map[cell["id"]] = {
                "coverage_score": coverage_score,
                "nearest_service": nearest,
                "distance": distance,
            }

        return coverage_map

    def _calculate_gap_priority(self, cell: Dict, coverage_info: Dict) -> float:
        """Calculate priority for addressing a service gap."""
        priority = 1.0 - coverage_info["coverage_score"]

        # Increase priority if high population
        if cell.get("population", 0) > 1000:
            priority += 0.2

        return min(1.0, priority)

    def _calculate_overall_coverage(self, coverage_map: Dict) -> float:
        """Calculate overall coverage percentage."""
        if not coverage_map:
            return 0.0

        scores = [info["coverage_score"] for info in coverage_map.values()]
        return np.mean(scores) * 100

    def _generate_gap_recommendations(self, gaps: List[Dict]) -> List[Dict]:
        """Generate recommendations for addressing service gaps."""
        recommendations = []

        for gap in gaps:
            recommendations.append(
                {
                    "location": gap["location"],
                    "priority": gap["priority"],
                    "recommendation": f"Consider opening new service location",
                    "estimated_impact": f"Would serve {gap.get('population_estimate', 'unknown')} people",
                    "distance_improvement": f"Reduce distance by {gap['distance_to_nearest']:.1f}km",
                }
            )

        return recommendations
