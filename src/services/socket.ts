type EventHandler<T = unknown> = (payload: T) => void;

class SocketService {
  private socket: WebSocket | null = null;

  private listeners = new Map<string, Set<EventHandler>>();
  private manualDisconnect = false;

  connect(token: string) {
    console.log("Socket connect called");

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log("Socket already connected/connecting");
      return;
    }

    const urls = [
      process.env.EXPO_PUBLIC_WS_BACKENDURL,
      process.env.EXPO_PUBLIC_WS_BACKENDURL2,
    ].filter(Boolean) as string[];

    this.connectWithFallback(urls, token, 0);
  }

  private connectWithFallback(urls: string[], token: string, index: number) {
    if (index >= urls.length) {
      console.info("❌ All WebSocket URLs failed");
      return;
    }

    const wsBackendUrl = urls[index];

    const wsSocket = `${wsBackendUrl}ws?token=${token}`;

    console.info(`🔌 Trying WebSocket ${index + 1}/${urls.length}:`, wsSocket);

    const socket = new WebSocket(wsSocket);

    this.socket = socket;

    socket.onopen = () => {
      console.info("✅ WebSocket connected:", wsBackendUrl);
    };

    socket.onclose = (event) => {
      if (!this.manualDisconnect) {
        this.connectWithFallback(urls, token, index + 1);
      }
      console.warn(
        "❌ WebSocket disconnected:",
        wsBackendUrl,
        event.code,
        event.reason,
      );

      this.socket = null;

      // If connection never opened, try next URL
      if (event.code !== 1000) {
        console.info("🔄 Trying next WebSocket URL...");

        this.connectWithFallback(urls, token, index + 1);
      }
    };

    socket.onerror = (error) => {
      console.info("❌ WebSocket error:", wsBackendUrl, error);

      socket.close();
    };

    socket.onmessage = (event) => {
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
        console.info("WS parse error:", error);
      }
    };
  }

  disconnect() {
    this.manualDisconnect = true;
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
