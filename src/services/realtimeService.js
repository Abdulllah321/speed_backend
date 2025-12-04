// Realtime service for Server-Sent Events (SSE)
class RealtimeService {
  constructor() {
    this.clients = new Map(); // Map of clientId -> response object
  }

  // Add a new client connection
  addClient(clientId, res) {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Store the response
    this.clients.set(clientId, res);

    // Send initial connection message
    this.sendToClient(clientId, { type: 'connected', message: 'Connected to activity log stream' });

    // Handle client disconnect
    res.on('close', () => {
      this.removeClient(clientId);
    });

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      if (this.clients.has(clientId)) {
        try {
          res.write(': heartbeat\n\n');
        } catch (error) {
          clearInterval(heartbeat);
          this.removeClient(clientId);
        }
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // Every 30 seconds
  }

  // Remove a client connection
  removeClient(clientId) {
    this.clients.delete(clientId);
  }

  // Send data to a specific client
  sendToClient(clientId, data) {
    const res = this.clients.get(clientId);
    if (res) {
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error('Error sending to client:', error);
        this.removeClient(clientId);
      }
    }
  }

  // Broadcast to all connected clients
  broadcast(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const disconnectedClients = [];

    this.clients.forEach((res, clientId) => {
      try {
        res.write(message);
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        disconnectedClients.push(clientId);
      }
    });

    // Clean up disconnected clients
    disconnectedClients.forEach(clientId => this.removeClient(clientId));
  }

  // Emit activity log event
  emitActivityLog(activityLog) {
    this.broadcast({
      type: 'activity_log',
      data: activityLog,
    });
  }

  // Get number of connected clients
  getClientCount() {
    return this.clients.size;
  }
}

export default new RealtimeService();

