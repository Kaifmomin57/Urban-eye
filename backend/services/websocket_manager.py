import json
from typing import List, Dict
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        # Map user_id -> List of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Global connection list for broadcasting
        self.all_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: str = "anonymous"):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        self.all_connections.append(websocket)
        print(f"[WebSocket] Connected client: user={user_id}. Total active: {len(self.all_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: str = "anonymous"):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)
        print(f"[WebSocket] Disconnected client: user={user_id}. Remaining: {len(self.all_connections)}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            data = json.dumps(message)
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(data)
                except Exception as e:
                    print(f"[WebSocket Error] Send personal failed: {e}")

    async def broadcast(self, message: dict):
        data = json.dumps(message)
        disconnected = []
        for connection in self.all_connections:
            try:
                await connection.send_text(data)
            except Exception as e:
                disconnected.append(connection)

        # Cleanup dead connections
        for dead in disconnected:
            if dead in self.all_connections:
                self.all_connections.remove(dead)

ws_manager = WebSocketManager()
