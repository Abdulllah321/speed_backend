import express from 'express';
import { authenticate } from '@/middleware/authMiddleware.js';
import realtimeService from '@/services/realtimeService.js';
import crypto from 'crypto';

const router = express.Router();

// SSE endpoint for activity logs
router.get('/api/realtime/activity-logs', authenticate, (req, res) => {
  const clientId = crypto.randomUUID();
  realtimeService.addClient(clientId, res);

  // Clean up on client disconnect
  req.on('close', () => {
    realtimeService.removeClient(clientId);
  });
});

export default router;

