import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Definim tipurile pentru callback-uri
export type MessageCallback = (message: any) => void;
export type ReactionCallback = (reaction: any) => void;
export type TypingCallback = (typing: any) => void;
export type StatusCallback = (status: any) => void;

// Clasa singleton pentru gestionarea conexiunii STOMP
class StompService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscriptions: Map<string, { id: string }> = new Map();
  private userId: number | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private socketUrl: string;

  constructor(
    socketUrl: string = process.env.NEXT_PUBLIC_SOCKET_URL ||
      "http://localhost:8080/ws"
  ) {
    this.socketUrl = socketUrl;
  }

  /**
   * Inițializează și conectează clientul STOMP
   */
  public connect(userId: number): Promise<void> {
    if (this.connected && this.client) {
      return Promise.resolve();
    }

    this.userId = userId;

    return new Promise((resolve, reject) => {
      const socket = new SockJS(this.socketUrl);

      this.client = new Client({
        webSocketFactory: () => socket,
        debug: function (str) {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log("Connected to STOMP WebSocket");
        this.connected = true;

        // Autentifică utilizatorul
        this.authenticate(userId);

        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error("STOMP error:", frame);
        this.connected = false;
        reject(new Error(`STOMP error: ${frame.headers.message}`));
      };

      this.client.onWebSocketClose = () => {
        console.log("WebSocket connection closed");
        this.connected = false;
        this.handleReconnect();
      };

      this.client.activate();
    });
  }

  /**
   * Gestionează reconectarea
   */
  private handleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect...");
      if (this.userId) {
        this.connect(this.userId).catch(() => {
          this.handleReconnect();
        });
      }
    }, 5000);
  }

  /**
   * Autentifică utilizatorul cu serverul
   */
  private authenticate(userId: number): void {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/authenticate",
      body: JSON.stringify({ userId }),
    });
  }

  /**
   * Abonează la actualizări de status pentru utilizatori
   */
  public subscribeToUserStatus(callback: StatusCallback): () => void {
    if (!this.client || !this.connected) return () => {};

    const destination = "/topic/user-status";

    if (this.subscriptions.has(destination)) {
      const subscription = this.subscriptions.get(destination);
      if (subscription) {
        this.client.unsubscribe(subscription.id);
      }
    }

    const subscription = this.client.subscribe(destination, (message) => {
      const statusData = JSON.parse(message.body);
      callback(statusData);
    });

    this.subscriptions.set(destination, subscription);

    return () => {
      if (this.client && this.subscriptions.has(destination)) {
        const sub = this.subscriptions.get(destination);
        if (sub) {
          this.client.unsubscribe(sub.id);
          this.subscriptions.delete(destination);
        }
      }
    };
  }

  /**
   * Abonează la un canal pentru mesaje
   */
  public joinChannel(channelId: number): void {
    if (!this.client || !this.connected) return;

    // Notifică serverul de alăturarea la canal
    this.client.publish({
      destination: "/app/join-channel",
      body: JSON.stringify(channelId),
    });
  }

  /**
   * Abonează la mesajele unui canal
   */
  public subscribeToChannel(
    channelId: number,
    messageCallback: MessageCallback,
    reactionCallback: ReactionCallback
  ): () => void {
    if (!this.client || !this.connected) return () => {};

    const destination = `/topic/channel/${channelId}`;

    if (this.subscriptions.has(destination)) {
      const subscription = this.subscriptions.get(destination);
      if (subscription) {
        this.client.unsubscribe(subscription.id);
      }
    }

    const subscription = this.client.subscribe(destination, (message) => {
      const data = JSON.parse(message.body);

      // Determină tipul mesajului în funcție de proprietăți
      if (data.messageId && data.reactionType) {
        // Acesta este un update de reacție
        reactionCallback(data);
      } else if (data.content !== undefined) {
        // Acesta este un mesaj nou
        messageCallback(data);
      }
    });

    this.subscriptions.set(destination, subscription);

    return () => {
      if (this.client && this.subscriptions.has(destination)) {
        const sub = this.subscriptions.get(destination);
        if (sub) {
          this.client.unsubscribe(sub.id);
          this.subscriptions.delete(destination);
        }
      }
    };
  }

  /**
   * Abonează la indicatorii de scriere pentru un canal
   */
  public subscribeToTyping(
    channelId: number,
    callback: TypingCallback
  ): () => void {
    if (!this.client || !this.connected) return () => {};

    const destination = `/topic/channel/${channelId}/typing`;

    if (this.subscriptions.has(destination)) {
      const subscription = this.subscriptions.get(destination);
      if (subscription) {
        this.client.unsubscribe(subscription.id);
      }
    }

    const subscription = this.client.subscribe(destination, (message) => {
      const typingData = JSON.parse(message.body);
      callback(typingData);
    });

    this.subscriptions.set(destination, subscription);

    return () => {
      if (this.client && this.subscriptions.has(destination)) {
        const sub = this.subscriptions.get(destination);
        if (sub) {
          this.client.unsubscribe(sub.id);
          this.subscriptions.delete(destination);
        }
      }
    };
  }

  /**
   * Părăsește un canal
   */
  public leaveChannel(channelId: number): void {
    if (!this.client || !this.connected) return;

    // Notifică serverul de părăsirea canalului
    this.client.publish({
      destination: "/app/leave-channel",
      body: JSON.stringify(channelId),
    });

    // Dezabonează de la canalul respectiv
    const channelDestination = `/topic/channel/${channelId}`;
    if (this.subscriptions.has(channelDestination)) {
      const subscription = this.subscriptions.get(channelDestination);
      if (subscription) {
        this.client.unsubscribe(subscription.id);
        this.subscriptions.delete(channelDestination);
      }
    }

    // Dezabonează de la indicatorii de scriere
    const typingDestination = `/topic/channel/${channelId}/typing`;
    if (this.subscriptions.has(typingDestination)) {
      const subscription = this.subscriptions.get(typingDestination);
      if (subscription) {
        this.client.unsubscribe(subscription.id);
        this.subscriptions.delete(typingDestination);
      }
    }
  }

  /**
   * Focalizează pe un canal (mesaje citite)
   */
  public focusChannel(channelId: number): void {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/focus-channel",
      body: JSON.stringify(channelId),
    });
  }

  /**
   * Anulează focalizarea de pe un canal
   */
  public unfocusChannel(channelId: number): void {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/unfocus-channel",
      body: JSON.stringify(channelId),
    });
  }

  /**
   * Trimite un mesaj nou
   */
  public sendMessage(messageData: any): void {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/send-message",
      body: JSON.stringify(messageData),
    });
  }

  /**
   * Trimite o reacție la un mesaj
   */
  public sendReaction(reactionData: any): void {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: "/app/message-reaction",
      body: JSON.stringify(reactionData),
    });
  }

  /**
   * Trimite un indicator de scriere
   */
  public sendTypingIndicator(channelId: number, isTyping: boolean): void {
    if (!this.client || !this.connected || !this.userId) return;

    const typingData = {
      userId: this.userId,
      channelId,
      isTyping,
    };

    this.client.publish({
      destination: "/app/typing-indicator",
      body: JSON.stringify(typingData),
    });
  }

  /**
   * Actualizează statusul utilizatorului
   */
  public updateUserStatus(status: string): void {
    if (!this.client || !this.connected || !this.userId) return;

    const statusData = {
      userId: this.userId,
      status,
    };

    this.client.publish({
      destination: "/app/update-status",
      body: JSON.stringify(statusData),
    });
  }

  /**
   * Verifică dacă conexiunea este activă
   */
  public isConnected(): boolean {
    return this.connected && this.client !== null;
  }

  /**
   * Deconectează clientul STOMP
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      // Dezabonează de la toate canalele
      this.subscriptions.forEach((subscription) => {
        this.client?.unsubscribe(subscription.id);
      });

      this.subscriptions.clear();

      // Deconectează clientul
      this.client.deactivate();
      this.client = null;
    }

    this.connected = false;
    this.userId = null;
  }
}

// Exportă instanța singleton
const stompService = new StompService();
export default stompService;
