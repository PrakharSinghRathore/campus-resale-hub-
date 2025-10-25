import { io, Socket } from 'socket.io-client';
import { auth } from './firebase';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      // Get Firebase ID token for authentication
      auth.currentUser?.getIdToken().then((idToken) => {
        this.socket = io(SOCKET_URL, {
          auth: {
            token: idToken,
          },
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to server');
          this.reconnectAttempts = 0;
          resolve(this.socket!);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection failed:', error);
          this.handleReconnect();
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected:', reason);
          if (reason === 'io server disconnect') {
            // Server disconnected - try to reconnect
            this.handleReconnect();
          }
        });

        this.socket.on('auth_error', (error) => {
          console.error('🚫 Authentication error:', error);
          this.disconnect();
          // You might want to redirect to login here
        });

        // Global error handler
        this.socket.on('error', (error) => {
          console.error('🔥 Socket error:', error);
        });

      }).catch((error) => {
        console.error('Failed to get ID token:', error);
        reject(error);
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => {
        this.connect().catch(console.error);
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Chat-related methods
  joinChat(chatId: string) {
    this.socket?.emit('join_chat', { chatId });
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave_chat', { chatId });
  }

  sendMessage(chatId: string, message: any) {
    this.socket?.emit('send_message', { chatId, ...message });
  }

  startTyping(chatId: string) {
    this.socket?.emit('typing_start', { chatId });
  }

  stopTyping(chatId: string) {
    this.socket?.emit('typing_stop', { chatId });
  }

  // Presence methods
  setOnline() {
    this.socket?.emit('user_online');
  }

  setOffline() {
    this.socket?.emit('user_offline');
  }

  // Event listeners
  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onMessageUpdate(callback: (data: any) => void) {
    this.socket?.on('message_update', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    this.socket?.on('user_stopped_typing', callback);
  }

  onUserOnline(callback: (data: any) => void) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: any) => void) {
    this.socket?.on('user_offline', callback);
  }

  onListingUpdate(callback: (data: any) => void) {
    this.socket?.on('listing_update', callback);
  }

  onNewListing(callback: (data: any) => void) {
    this.socket?.on('new_listing', callback);
  }

  onListingDeleted(callback: (data: { id: string }) => void) {
    this.socket?.on('listing_delete', callback);
  }

  // Generic event listeners
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
export default socketManager;