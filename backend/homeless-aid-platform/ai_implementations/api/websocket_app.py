from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from api.app import app
from api.chatbot_api import chatbot_bp, init_socketio_events
from config import Config

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading",
    logger=True,
    engineio_logger=True,
)

# Register chatbot blueprint
app.register_blueprint(chatbot_bp)

# Initialize WebSocket events
init_socketio_events(socketio)

if __name__ == "__main__":
    socketio.run(app, host=Config.API_HOST, port=Config.API_PORT, debug=Config.DEBUG)
