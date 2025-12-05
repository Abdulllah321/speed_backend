// Helper function to get client info from request
export const getClientInfo = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
  userAgent: req.headers['user-agent'] || 'unknown',
});

// Helper function to log activity consistently
export const logActivity = async (activityLogService, {
  userId,
  action,
  module,
  entity,
  entityId,
  description,
  oldValues,
  newValues,
  req,
  status = 'success',
  errorMessage = null,
  metadata = null,
}) => {
  const { ipAddress, userAgent } = getClientInfo(req);
  
  await activityLogService.log({
    userId,
    action,
    module,
    entity,
    entityId,
    description,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    status,
    errorMessage,
    metadata,
  });
};


