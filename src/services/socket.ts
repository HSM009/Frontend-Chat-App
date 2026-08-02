type EventHandler<T = unknown> = (payload: T) => void;

class SocketService {
  private socket: WebSocket | null = null;

  private listeners = new Map<string, Set<EventHandler>>();

  connect(token: string) {
    console.log("Socket connect called");

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    console.log("Creating websocket...");
    const wsBackendUrl = process.env.EXPO_PUBLIC_WS_BACKENDURL;
    const wsSocket = `${wsBackendUrl}ws?token=${token}`;
    this.socket = new WebSocket(wsSocket);
    this.socket.onopen = () => {
      console.info("✅ WebSocket connected");
    };

    this.socket.onclose = () => {
      console.warn("❌ WebSocket disconnected");

      this.socket = null;
      //   setTimeout(() => {
      //     this.connect(savedToken);
      //   }, 3000);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onmessage = (event) => {
      console.log("RAW WS:", event.data);

      try {
        const data = JSON.parse(event.data);

        console.log("WS Event:", data.event);
        console.log("WS Payload:", data.payload);

        const handlers = this.listeners.get(data.event);

        if (!handlers) {
          console.log("No listeners for:", data.event);
          return;
        }

        handlers.forEach((handler) => handler(data.payload));
      } catch (error) {
        console.error(error);
      }
    };
  }

  disconnect() {
    this.socket?.close();

    this.socket = null;

    this.listeners.clear();
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  subscribe<T>(event: string, handler: EventHandler<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as EventHandler);
  }

  unsubscribe<T>(event: string, handler: EventHandler<T>) {
    this.listeners.get(event)?.delete(handler as EventHandler);
  }

  send(event: string, payload: unknown) {
    if (!this.socket) return;

    if (this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        event,
        payload,
      }),
    );
  }
  sendTyping(conversationId: string, typing: boolean) {
    this.send("typing", {
      conversationId,
      typing,
    });
  }
}

export const socketService = new SocketService();
