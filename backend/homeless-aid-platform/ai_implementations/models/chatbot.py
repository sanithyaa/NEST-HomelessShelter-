import openai
from typing import Dict, List, Optional, Tuple
import json
from datetime import datetime
from config import Config


class HomelessAidChatbot:
    """
    AI-powered chatbot assistant for the Homeless Aid Platform.
    Context-aware, multilingual, with guided workflows.
    """

    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
        self.conversation_history = {}
        self.confidence_threshold = 0.7

        # Role-specific system prompts
        self.system_prompts = {
            "volunteer": self._get_volunteer_prompt(),
            "staff": self._get_staff_prompt(),
            "admin": self._get_admin_prompt(),
        }

        # Available functions for GPT function calling
        self.functions = self._define_functions()

    def _get_volunteer_prompt(self) -> str:
        """System prompt for volunteer users."""
        return """You are a helpful assistant for the Homeless Aid Platform, speaking to a volunteer.
        
Your role:
- Guide volunteers through registration and assessment processes
- Answer questions about shelter availability and resources
- Provide step-by-step instructions for common tasks
- Be empathetic and supportive
- Keep responses concise and actionable

Common tasks volunteers need help with:
1. Registering new homeless individuals
2. Conducting needs assessments
3. Finding available shelters
4. Connecting individuals with resources
5. Recording volunteer hours

Always offer to provide more detailed steps if needed.
If you don't know something, say so and offer to escalate to staff."""

    def _get_staff_prompt(self) -> str:
        """System prompt for staff users."""
        return """You are a helpful assistant for the Homeless Aid Platform, speaking to a staff member.
        
Your role:
- Provide detailed information about platform operations
- Help with case management workflows
- Assist with reporting and analytics
- Guide through administrative tasks
- Provide policy and procedure information

Staff have access to:
- Full individual profiles and history
- Shelter and resource management
- Volunteer coordination
- Reporting and analytics
- System configuration

Be professional, efficient, and provide comprehensive information."""

    def _get_admin_prompt(self) -> str:
        """System prompt for admin users."""
        return """You are a helpful assistant for the Homeless Aid Platform, speaking to an administrator.
        
Your role:
- Assist with system administration and configuration
- Provide insights on platform usage and metrics
- Help with user management and permissions
- Guide through advanced features and integrations
- Support troubleshooting and technical issues

Admins have full system access including:
- User and role management
- System configuration
- API integrations
- Data exports and analytics
- Security settings

Provide technical details when appropriate."""

    def _define_functions(self) -> List[Dict]:
        """Define functions for GPT function calling."""
        return [
            {
                "name": "get_available_shelters",
                "description": "Get list of shelters with available beds",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City or area to search for shelters",
                        },
                        "capacity_needed": {
                            "type": "integer",
                            "description": "Number of beds needed",
                        },
                    },
                },
            },
            {
                "name": "get_individual_info",
                "description": "Get information about a specific homeless individual",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "individual_id": {
                            "type": "string",
                            "description": "The ID of the individual",
                        }
                    },
                    "required": ["individual_id"],
                },
            },
            {
                "name": "start_registration_workflow",
                "description": "Start the guided workflow for registering a new individual",
                "parameters": {"type": "object", "properties": {}},
            },
            {
                "name": "get_resource_info",
                "description": "Get information about available resources (jobs, training, services)",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "resource_type": {
                            "type": "string",
                            "enum": ["jobs", "training", "medical", "legal"],
                            "description": "Type of resource",
                        }
                    },
                    "required": ["resource_type"],
                },
            },
            {
                "name": "escalate_to_human",
                "description": "Escalate the conversation to a human staff member",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "reason": {
                            "type": "string",
                            "description": "Reason for escalation",
                        }
                    },
                    "required": ["reason"],
                },
            },
        ]

    def chat(
        self,
        user_id: str,
        message: str,
        user_role: str = "volunteer",
        language: str = "en",
        context: Dict = None,
    ) -> Dict:
        """
        Process a chat message and return response.

        Args:
            user_id: Unique user identifier
            message: User's message
            user_role: User role (volunteer, staff, admin)
            language: Language code (en, hi, ta, te)
            context: Additional context (current page, selected individual, etc.)

        Returns:
            Dict with response, confidence, and metadata
        """
        # Initialize conversation history
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []

        # Translate message if not English
        if language != "en":
            message = self._translate(message, language, "en")

        # Build messages for GPT
        messages = [
            {
                "role": "system",
                "content": self.system_prompts.get(
                    user_role, self.system_prompts["volunteer"]
                ),
            }
        ]

        # Add context if provided
        if context:
            context_msg = f"Current context: {json.dumps(context)}"
            messages.append({"role": "system", "content": context_msg})

        # Add conversation history (last 10 messages)
        messages.extend(self.conversation_history[user_id][-10:])

        # Add current message
        messages.append({"role": "user", "content": message})

        try:
            # Call GPT with function calling
            response = openai.ChatCompletion.create(
                model="gpt-4" if Config.USE_GPT4 else "gpt-3.5-turbo",
                messages=messages,
                functions=self.functions,
                function_call="auto",
                temperature=0.7,
                max_tokens=500,
            )

            response_message = response.choices[0].message

            # Check if function call is needed
            if response_message.get("function_call"):
                function_response = self._handle_function_call(
                    response_message["function_call"], context
                )

                # Add function response to conversation
                messages.append(response_message)
                messages.append(
                    {
                        "role": "function",
                        "name": response_message["function_call"]["name"],
                        "content": json.dumps(function_response),
                    }
                )

                # Get final response
                second_response = openai.ChatCompletion.create(
                    model="gpt-4" if Config.USE_GPT4 else "gpt-3.5-turbo",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500,
                )

                response_text = second_response.choices[0].message.content
            else:
                response_text = response_message.content

            # Calculate confidence (simplified)
            confidence = self._calculate_confidence(response)

            # Translate response if needed
            if language != "en":
                response_text = self._translate(response_text, "en", language)

            # Update conversation history
            self.conversation_history[user_id].append(
                {"role": "user", "content": message}
            )
            self.conversation_history[user_id].append(
                {"role": "assistant", "content": response_text}
            )

            # Check if escalation needed
            should_escalate = confidence < self.confidence_threshold

            result = {
                "response": response_text,
                "confidence": confidence,
                "should_escalate": should_escalate,
                "language": language,
                "timestamp": datetime.utcnow().isoformat(),
            }

            if should_escalate:
                result["escalation_message"] = (
                    "I'm not entirely confident in my response. Would you like me to connect you with a staff member?"
                )

            return result

        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error. Please try again or contact support. Error: {str(e)}",
                "confidence": 0.0,
                "should_escalate": True,
                "error": str(e),
            }

    def _handle_function_call(self, function_call: Dict, context: Dict = None) -> Dict:
        """Handle GPT function calls."""
        function_name = function_call["name"]
        arguments = json.loads(function_call["arguments"])

        if function_name == "get_available_shelters":
            return self._get_available_shelters(
                arguments.get("location"), arguments.get("capacity_needed", 1)
            )

        elif function_name == "get_individual_info":
            return self._get_individual_info(arguments["individual_id"])

        elif function_name == "start_registration_workflow":
            return self._get_registration_workflow()

        elif function_name == "get_resource_info":
            return self._get_resource_info(arguments["resource_type"])

        elif function_name == "escalate_to_human":
            return {"escalated": True, "reason": arguments["reason"]}

        return {"error": "Unknown function"}

    def _get_available_shelters(self, location: str, capacity_needed: int) -> Dict:
        """Mock function - would query actual database."""
        return {
            "shelters": [
                {
                    "name": "Hope Shelter",
                    "available_beds": 15,
                    "location": location or "Downtown",
                    "amenities": ["meals", "showers", "counseling"],
                },
                {
                    "name": "Community Haven",
                    "available_beds": 8,
                    "location": location or "Downtown",
                    "amenities": ["meals", "medical"],
                },
            ],
            "total_available": 23,
        }

    def _get_individual_info(self, individual_id: str) -> Dict:
        """Mock function - would query actual database."""
        return {
            "id": individual_id,
            "name": "John Doe",
            "age": 35,
            "current_shelter": "Hope Shelter",
            "case_manager": "Sarah Johnson",
            "last_assessment": "2024-11-05",
        }

    def _get_registration_workflow(self) -> Dict:
        """Return registration workflow steps."""
        return {
            "workflow": "registration",
            "steps": [
                {
                    "step": 1,
                    "title": "Navigate to Registration",
                    "description": "Go to Dashboard > Add New Individual",
                    "action": "Click the 'Add New Individual' button",
                },
                {
                    "step": 2,
                    "title": "Basic Information",
                    "description": "Fill in name, age, gender, and contact info",
                    "required_fields": ["name", "age", "gender"],
                },
                {
                    "step": 3,
                    "title": "Location",
                    "description": "Capture current location using GPS or enter manually",
                    "action": "Click 'Use Current Location' or enter address",
                },
                {
                    "step": 4,
                    "title": "Documentation",
                    "description": "Upload ID documents if available",
                    "optional": True,
                },
                {
                    "step": 5,
                    "title": "Needs Assessment",
                    "description": "Complete the needs assessment questionnaire",
                    "action": "Click 'Start Assessment'",
                },
            ],
        }

    def _get_resource_info(self, resource_type: str) -> Dict:
        """Mock function - would query actual database."""
        resources = {
            "jobs": [
                {
                    "title": "Construction Worker",
                    "available": 5,
                    "location": "Downtown",
                },
                {
                    "title": "Warehouse Associate",
                    "available": 3,
                    "location": "Industrial Area",
                },
            ],
            "training": [
                {"program": "IT Skills", "duration": "8 weeks", "spots": 12},
                {"program": "Culinary Arts", "duration": "6 weeks", "spots": 8},
            ],
            "medical": [
                {
                    "facility": "Community Health Center",
                    "services": ["primary care", "dental"],
                },
                {
                    "facility": "Mobile Clinic",
                    "services": ["basic care", "medications"],
                },
            ],
            "legal": [
                {
                    "service": "Legal Aid Society",
                    "services": ["document assistance", "court support"],
                }
            ],
        }

        return {
            "resource_type": resource_type,
            "resources": resources.get(resource_type, []),
        }

    def _calculate_confidence(self, response: Dict) -> float:
        """Calculate confidence score for response."""
        # Simplified confidence calculation
        # In production, use logprobs or fine-tuned model
        finish_reason = response.choices[0].finish_reason

        if finish_reason == "stop":
            return 0.85
        elif finish_reason == "function_call":
            return 0.90
        else:
            return 0.60

    def _translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text using Google Translate API."""
        # This would use actual Google Translate API
        # For now, return original text
        # In production: from googletrans import Translator
        return text

    def clear_history(self, user_id: str):
        """Clear conversation history for a user."""
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]

    def get_history(self, user_id: str) -> List[Dict]:
        """Get conversation history for a user."""
        return self.conversation_history.get(user_id, [])
