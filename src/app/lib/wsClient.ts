type MessageHandler = (data: any) => void;

class RealtimeWebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private userId: str = "anonymous";
  private isConnecting: boolean = false;
  private reconnectInterval: any = null;

  public connect(userId: string) {
    this.userId = userId || "anonymous";
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    try {
      this.socket = new WebSocket(`ws://localhost:8000/ws/${this.userId}`);

      this.socket.onopen = () => {
        console.log(`[Realtime WS] Connected for user: ${this.userId}`);
        this.isConnecting = false;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(parsed));
        } catch (e) {
          console.error("[Realtime WS] Error parsing message:", e);
        }
      };

      this.socket.onclose = () => {
        console.warn("[Realtime WS] Closed. Reconnecting in 3s...");
        this.socket = null;
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.error("[Realtime WS] Socket error:", err);
      };
    } catch (e) {
      console.error("[Realtime WS] Connection exception:", e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.connect(this.userId);
      }, 3000);
    }
  }

  public subscribe(handler: MessageHandler) {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  public disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const realtimeWS = new RealtimeWebSocketClient();
