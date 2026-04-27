from flask import Blueprint, request, jsonify
from models.route_optimizer import RouteOptimizer
from datetime import datetime

# Create blueprint
route_bp = Blueprint("routes", __name__)

# Initialize optimizer
optimizer = RouteOptimizer()


@route_bp.route("/api/v1/routes/optimize", methods=["POST"])
def optimize_route():
    """
    Optimize route for multiple destinations.

    Request body:
    {
        "start_location": {"lat": 40.7128, "lon": -74.0060},
        "destinations": [
            {
                "id": "shelter_1",
                "name": "Hope Shelter",
                "lat": 40.7580,
                "lon": -73.9855,
                "type": "shelter",
                "hours": {"monday": {"open": "08:00", "close": "20:00"}},
                "wait_time": 15
            }
        ],
        "constraints": {
            "max_time": 480,
            "max_distance": 50,
            "transport_mode": "public_transport"
        }
    }
    """
    try:
        data = request.get_json()

        start_loc = data.get("start_location")
        destinations = data.get("destinations", [])
        constraints = data.get("constraints", {})

        if not start_loc or not destinations:
            return jsonify(
                {"error": "start_location and destinations are required"}
            ), 400

        start = (start_loc["lat"], start_loc["lon"])

        result = optimizer.optimize_multi_stop_route(start, destinations, constraints)

        return jsonify({"success": True, "route": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@route_bp.route("/api/v1/routes/volunteer-optimization", methods=["POST"])
def optimize_volunteer_routes():
    """
    Optimize routes for multiple volunteers.

    Request body:
    {
        "volunteers": [
            {
                "id": "vol_1",
                "name": "John Doe",
                "lat": 40.7128,
                "lon": -74.0060,
                "available_hours": 8,
                "transport_mode": "driving"
            }
        ],
        "individuals": [
            {
                "id": "ind_1",
                "name": "Jane Smith",
                "lat": 40.7580,
                "lon": -73.9855,
                "priority": "high"
            }
        ],
        "date": "2024-11-10"
    }
    """
    try:
        data = request.get_json()

        volunteers = data.get("volunteers", [])
        individuals = data.get("individuals", [])
        date_str = data.get("date")

        if not volunteers or not individuals:
            return jsonify({"error": "volunteers and individuals are required"}), 400

        date = datetime.fromisoformat(date_str) if date_str else None

        result = optimizer.optimize_volunteer_routes(volunteers, individuals, date)

        return jsonify({"success": True, "optimization": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@route_bp.route("/api/v1/routes/accessibility-score", methods=["POST"])
def score_accessibility():
    """
    Score resources by accessibility for an individual.

    Request body:
    {
        "individual_location": {"lat": 40.7128, "lon": -74.0060},
        "resources": [
            {
                "id": "shelter_1",
                "name": "Hope Shelter",
                "lat": 40.7580,
                "lon": -73.9855,
                "type": "shelter",
                "wheelchair_accessible": true,
                "public_transport_nearby": true
            }
        ],
        "individual_profile": {
            "mobility_issues": false,
            "has_transportation": false
        }
    }
    """
    try:
        data = request.get_json()

        individual_loc = data.get("individual_location")
        resources = data.get("resources", [])
        profile = data.get("individual_profile", {})

        if not individual_loc or not resources:
            return jsonify(
                {"error": "individual_location and resources are required"}
            ), 400

        location = (individual_loc["lat"], individual_loc["lon"])

        scored = optimizer.score_resource_accessibility(location, resources, profile)

        return jsonify(
            {
                "success": True,
                "scored_resources": scored,
                "total_resources": len(scored),
                "most_accessible": scored[0] if scored else None,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@route_bp.route("/api/v1/routes/visit-times", methods=["POST"])
def suggest_visit_times():
    """
    Suggest best times to visit a location.

    Request body:
    {
        "location": {
            "id": "shelter_1",
            "name": "Hope Shelter",
            "hours": {
                "monday": {"open": "08:00", "close": "20:00"},
                "tuesday": {"open": "08:00", "close": "20:00"}
            }
        },
        "date": "2024-11-10"
    }
    """
    try:
        data = request.get_json()

        location = data.get("location")
        date_str = data.get("date")

        if not location:
            return jsonify({"error": "location is required"}), 400

        date = datetime.fromisoformat(date_str) if date_str else None

        suggestions = optimizer.suggest_visit_times(location, date)

        return jsonify(
            {
                "success": True,
                "location_name": location.get("name"),
                "date": date.isoformat() if date else datetime.now().isoformat(),
                "suggestions": suggestions,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@route_bp.route("/api/v1/routes/service-gaps", methods=["POST"])
def identify_service_gaps():
    """
    Identify underserved areas.

    Request body:
    {
        "service_locations": [
            {
                "id": "shelter_1",
                "name": "Hope Shelter",
                "lat": 40.7580,
                "lon": -73.9855,
                "type": "shelter"
            }
        ],
        "coverage_area": {
            "min_lat": 40.7,
            "max_lat": 40.8,
            "min_lon": -74.1,
            "max_lon": -73.9
        },
        "population_density": []
    }
    """
    try:
        data = request.get_json()

        service_locations = data.get("service_locations", [])
        coverage_area = data.get("coverage_area")
        population_density = data.get("population_density", [])

        if not coverage_area:
            return jsonify({"error": "coverage_area is required"}), 400

        result = optimizer.identify_service_gaps(
            service_locations, coverage_area, population_density
        )

        return jsonify({"success": True, "analysis": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@route_bp.route("/api/v1/routes/distance", methods=["POST"])
def calculate_distance():
    """
    Calculate distance between two points.

    Request body:
    {
        "origin": {"lat": 40.7128, "lon": -74.0060},
        "destination": {"lat": 40.7580, "lon": -73.9855}
    }
    """
    try:
        data = request.get_json()

        origin = data.get("origin")
        destination = data.get("destination")

        if not origin or not destination:
            return jsonify({"error": "origin and destination are required"}), 400

        distance = optimizer._haversine_distance(
            (origin["lat"], origin["lon"]), (destination["lat"], destination["lon"])
        )

        return jsonify(
            {
                "success": True,
                "distance_km": round(distance, 2),
                "distance_miles": round(distance * 0.621371, 2),
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@route_bp.route("/api/v1/routes/travel-estimate", methods=["POST"])
def estimate_travel():
    """
    Estimate travel time and cost.

    Request body:
    {
        "origin": {"lat": 40.7128, "lon": -74.0060},
        "destination": {"lat": 40.7580, "lon": -73.9855},
        "transport_mode": "public_transport"
    }
    """
    try:
        data = request.get_json()

        origin = data.get("origin")
        destination = data.get("destination")
        transport_mode = data.get("transport_mode", "public_transport")

        if not origin or not destination:
            return jsonify({"error": "origin and destination are required"}), 400

        distance = optimizer._haversine_distance(
            (origin["lat"], origin["lon"]), (destination["lat"], destination["lon"])
        )

        time = optimizer._estimate_travel_time(distance, transport_mode)
        cost = optimizer._estimate_travel_cost(distance, transport_mode)

        return jsonify(
            {
                "success": True,
                "distance_km": round(distance, 2),
                "estimated_time_minutes": time,
                "estimated_cost": round(cost, 2),
                "transport_mode": transport_mode,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
