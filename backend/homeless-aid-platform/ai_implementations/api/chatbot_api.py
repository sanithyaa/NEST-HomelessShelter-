from flask import Blueprint, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from models.chatbot import HomelessAidChatbot
from datetime import datetime
import json

# Create blueprint
chatbot_bp = Blueprint("chatbot", __name__)

# Initialize chatbot
chatbot = HomelessAidChatbot()

# Store for conversation sessions
conversation_sessions = {}


@chatbot_bp.route("/api/v1/chat/message", methods=["POST"])
def send_message():
    """
    Send a message to the chatbot (REST endpoint).

    Request body:
    {
        "user_id": "user_123",
        "message": "How do I register a new person?",
        "user_role": "volunteer",
        "language": "en",
        "context": {
            "current_page": "dashboard",
            "selected_individual": null
        }
    }
    """
    try:
        data = request.get_json()

        user_id = data.get("user_id")
        message = data.get("message")
        user_role = data.get("user_role", "volunteer")
        language = data.get("language", "en")
        context = data.get("context", {})

        if not user_id or not message:
            return jsonify({"error": "user_id and message are required"}), 400

        # Get chatbot response
        response = chatbot.chat(user_id, message, user_role, language, context)

        # Store in session
        if user_id not in conversation_sessions:
            conversation_sessions[user_id] = []

        conversation_sessions[user_id].append(
            {
                "user_message": message,
                "bot_response": response["response"],
                "timestamp": response["timestamp"],
                "confidence": response["confidence"],
            }
        )

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/api/v1/chat/history/<user_id>", methods=["GET"])
def get_chat_history(user_id: str):
    """
    Get chat history for a user.
    """
    try:
        history = chatbot.get_history(user_id)

        return jsonify(
            {"user_id": user_id, "history": history, "message_count": len(history)}
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/api/v1/chat/clear/<user_id>", methods=["POST"])
def clear_chat_history(user_id: str):
    """
    Clear chat history for a user.
    """
    try:
        chatbot.clear_history(user_id)

        if user_id in conversation_sessions:
            del conversation_sessions[user_id]

        return jsonify({"message": "Chat history cleared", "user_id": user_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/api/v1/chat/detect-language", methods=["POST"])
def detect_language():
    """
    Detect language from text.

    Request body:
    {
        "text": "नमस्ते, मुझे मदद चाहिए"
    }
    """
    try:
        data = request.get_json()
        text = data.get("text", "")

        # Simple language detection (would use langdetect library in production)
        detected_lang = _detect_language_simple(text)

        return jsonify(
            {
                "detected_language": detected_lang,
                "supported": detected_lang in ["en", "hi", "ta", "te"],
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/api/v1/chat/translate", methods=["POST"])
def translate_text():
    """
    Translate text between languages.

    Request body:
    {
        "text": "Hello, how are you?",
        "source_lang": "en",
        "target_lang": "hi"
    }
    """
    try:
        data = request.get_json()
        text = data.get("text", "")
        source_lang = data.get("source_lang", "en")
        target_lang = data.get("target_lang", "en")

        # Would use Google Translate API in production
        translated = chatbot._translate(text, source_lang, target_lang)

        return jsonify(
            {
                "original": text,
                "translated": translated,
                "source_lang": source_lang,
                "target_lang": target_lang,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/api/v1/chat/workflows", methods=["GET"])
def get_workflows():
    """
    Get available guided workflows.
    """
    workflows = {
        "registration": {
            "name": "Register New Individual",
            "description": "Step-by-step guide to register a new homeless individual",
            "estimated_time": "10-15 minutes",
        },
        "assessment": {
            "name": "Conduct Needs Assessment",
            "description": "Complete a comprehensive needs assessment",
            "estimated_time": "15-20 minutes",
        },
        "shelter_placement": {
            "name": "Find Shelter Placement",
            "description": "Search and place individual in available shelter",
            "estimated_time": "5-10 minutes",
        },
        "resource_connection": {
            "name": "Connect to Resources",
            "description": "Link individual with jobs, training, or services",
            "estimated_time": "10 minutes",
        },
    }

    return jsonify({"workflows": workflows}), 200


@chatbot_bp.route("/api/v1/chat/quick-answers", methods=["GET"])
def get_quick_answers():
    """
    Get common quick answer topics.
    """
    quick_answers = {
        "shelter_availability": "What shelters have beds available?",
        "registration_process": "How do I register a new person?",
        "needs_assessment": "How do I conduct a needs assessment?",
        "resource_search": "How do I find jobs or training programs?",
        "volunteer_hours": "How do I log my volunteer hours?",
        "emergency_contact": "What do I do in an emergency?",
    }

    return jsonify({"quick_answers": quick_answers}), 200


def _detect_language_simple(text: str) -> str:
    """Simple language detection based on character sets."""
    # Devanagari script (Hindi)
    if any("\u0900" <= char <= "\u097f" for char in text):
        return "hi"
    # Tamil script
    elif any("\u0b80" <= char <= "\u0bff" for char in text):
        return "ta"
    # Telugu script
    elif any("\u0c00" <= char <= "\u0c7f" for char in text):
        return "te"
    else:
        return "en"


# WebSocket event handlers (requires Flask-SocketIO)
def init_socketio_events(socketio: SocketIO):
    """Initialize WebSocket event handlers."""

    @socketio.on("connect", namespace="/chat")
    def handle_connect():
        """Handle client connection."""
        emit("connected", {"message": "Connected to chat server"})

    @socketio.on("disconnect", namespace="/chat")
    def handle_disconnect():
        """Handle client disconnection."""
        print("Client disconnected")

    @socketio.on("join", namespace="/chat")
    def handle_join(data):
        """Handle user joining chat room."""
        user_id = data.get("user_id")
        if user_id:
            join_room(user_id)
            emit("joined", {"user_id": user_id, "message": "Joined chat room"})

    @socketio.on("leave", namespace="/chat")
    def handle_leave(data):
        """Handle user leaving chat room."""
        user_id = data.get("user_id")
        if user_id:
            leave_room(user_id)
            emit("left", {"user_id": user_id, "message": "Left chat room"})

    @socketio.on("message", namespace="/chat")
    def handle_message(data):
        """Handle incoming chat message via WebSocket."""
        user_id = data.get("user_id")
        message = data.get("message")
        user_role = data.get("user_role", "volunteer")
        language = data.get("language", "en")
        context = data.get("context", {})

        if not user_id or not message:
            emit("error", {"error": "user_id and message are required"})
            return

        # Get chatbot response
        response = chatbot.chat(user_id, message, user_role, language, context)

        # Send response back to user
        emit("response", response, room=user_id)

        # If escalation needed, notify staff
        if response.get("should_escalate"):
            emit(
                "escalation_needed",
                {
                    "user_id": user_id,
                    "message": message,
                    "reason": "Low confidence response",
                },
                broadcast=True,
                namespace="/staff",
            )

    @socketio.on("typing", namespace="/chat")
    def handle_typing(data):
        """Handle typing indicator."""
        user_id = data.get("user_id")
        emit("user_typing", {"user_id": user_id}, room=user_id)
