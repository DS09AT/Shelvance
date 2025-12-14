import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { EventEmitter } from '@/shared/lib/eventEmitter';

class SignalRService extends EventEmitter {
  private connection: HubConnection | null = null;
  private isConnected = false;

  public async start() {
    if (this.connection && this.isConnected) return;

    const url = `${window.Readarr.urlBase}/signalr/messages`;

    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => window.Readarr.apiKey
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on('receiveMessage', (message: { name: string; body: any }) => {
      console.debug('[SignalR] Received:', message);
      this.emit(message.name, message.body);
      this.emit('all', message);
    });

    this.connection.onclose(() => {
      this.isConnected = false;
      console.log('[SignalR] Disconnected');
    });

    try {
      await this.connection.start();
      this.isConnected = true;
      console.log('[SignalR] Connected');
    } catch (err) {
      console.error('[SignalR] Connection failed', err);
    }
  }

  public stop() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.isConnected = false;
    }
  }
}

export const signalRService = new SignalRService();
