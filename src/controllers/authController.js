import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../models/database.js";
import authConfig from "../config/auth.config.js";
import emailService from "../services/emailService.js";
import activityLogService from "../services/activityLogService.js";
import securityService from "../services/securityService.js";

// Helper functions
const generateTokens = (user, tokenFamily = null) => {
  const family = tokenFamily || crypto.randomUUID();

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, roleId: user.roleId },
    authConfig.jwt.accessSecret,
    { expiresIn: authConfig.jwt.accessExpiresIn, issuer: authConfig.jwt.issuer }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, family },
    authConfig.jwt.refreshSecret,
    {
      expiresIn: authConfig.jwt.refreshExpiresIn,
      issuer: authConfig.jwt.issuer,
    }
  );

  return { accessToken, refreshToken, family };
};

const validatePassword = (password) => {
  const { minLength } = authConfig.password;
  if (password.length < minLength)
    return [`Password must be at least ${minLength} characters`];
  return [];
};

const getClientInfo = (req) => ({
  ipAddress:
    req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
  userAgent: req.headers["user-agent"],
});

// Controllers
export const register = async (req, res) => {
  const { email, password, firstName, lastName, phone, roleId } = req.body;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res
        .status(400)
        .json({ status: false, message: passwordErrors[0] });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      authConfig.password.saltRounds
    );

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        roleId,
      },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    await activityLogService.log({
      userId: user.id,
      action: "register",
      module: "auth",
      description: `New user registered: ${email}`,
      ipAddress,
      userAgent,
    });

    // Send welcome notification email
    await emailService.sendWelcomeEmail(email, firstName);

    res.status(201).json({
      status: true,
      message: "Registration successful",
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ status: false, message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user) {
      await activityLogService.log({
        action: "login",
        module: "auth",
        ipAddress,
        userAgent,
        status: "failure",
        errorMessage: "User not found",
      });
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Check if account is locked
    const lockStatus = await securityService.isAccountLocked(user);
    if (lockStatus.locked) {
      return res
        .status(423)
        .json({
          status: false,
          message: "Account is locked",
          lockedUntil: lockStatus.lockedUntil,
        });
    }

    // Check status
    if (user.status !== "active") {
      return res
        .status(403)
        .json({ status: false, message: "Account is not active" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const result = await securityService.checkAndHandleFailedLogin(
        user,
        ipAddress,
        userAgent
      );
      await activityLogService.logLogin(
        user.id,
        ipAddress,
        userAgent,
        "failed",
        "Invalid password"
      );

      if (result.locked) {
        // Send email notification about account lock
        await emailService.sendSecurityAlertEmail(
          user.email,
          "account_locked",
          { ipAddress, device: userAgent },
          user.firstName
        );
        return res
          .status(423)
          .json({
            status: false,
            message: "Account locked due to too many failed attempts",
            lockedUntil: result.lockedUntil,
          });
      }
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Reset failed attempts
    await securityService.resetFailedAttempts(user.id);

    // Generate tokens
    const { accessToken, refreshToken, family } = generateTokens(user);

    // Store refresh token (1 day session)
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        family,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      },
    });

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + authConfig.security.sessionTimeout),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
    });

    await activityLogService.logLogin(user.id, ipAddress, userAgent, "success");

    // Format permissions
    const permissions =
      user.role?.permissions?.map((rp) => rp.permission.name) || [];

    res.json({
      status: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role?.name || null,
          permissions,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, message: "Login failed" });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  try {
    const decoded = jwt.verify(token, authConfig.jwt.refreshSecret);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      new Date() > storedToken.expiresAt
    ) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user || user.status !== "active") {
      return res
        .status(401)
        .json({ status: false, message: "User not found or inactive" });
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      family,
    } = generateTokens(user, decoded.family);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        family,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      },
    });

    res.json({
      status: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ status: false, message: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  const { ipAddress, userAgent } = getClientInfo(req);
  const userId = req.user.userId;

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (token) {
      await prisma.session.updateMany({
        where: { token, userId },
        data: { isActive: false },
      });
    }

    await activityLogService.logLogout(userId, ipAddress, userAgent);
    res.json({ status: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ status: false, message: "Logout failed" });
  }
};

export const logoutAllDevices = async (req, res) => {
  const userId = req.user.userId;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    await securityService.terminateAllSessions(userId);
    await securityService.revokeAllRefreshTokens(userId);

    await activityLogService.log({
      userId,
      action: "logout_all_devices",
      module: "auth",
      description: "Logged out from all devices",
      ipAddress,
      userAgent,
    });

    res.json({ status: true, message: "Logged out from all devices" });
  } catch (error) {
    console.error("Logout all error:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to logout from all devices" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res
        .status(400)
        .json({ status: false, message: "Current password is incorrect" });
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res
        .status(400)
        .json({ status: false, message: passwordErrors[0] });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      authConfig.password.saltRounds
    );
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      },
    });

    // Send notification email
    await emailService.sendSecurityAlertEmail(
      user.email,
      "password_changed",
      { ipAddress, device: userAgent },
      user.firstName
    );
    await activityLogService.logPasswordChange(userId, ipAddress, userAgent);

    res.json({ status: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to change password" });
  }
};

// Lightweight session check for polling
export const checkSession = async (req, res) => {
  res.json({ status: true, valid: true });
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const permissions =
      user.role?.permissions?.map((rp) => rp.permission.name) || [];

    res.json({ status: true, data: { ...user, permissions } });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ status: false, message: "Failed to get user" });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.userId, isActive: true },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        createdAt: true,
        lastActivityAt: true,
      },
      orderBy: { lastActivityAt: "desc" },
    });

    res.json({ status: true, data: sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ status: false, message: "Failed to get sessions" });
  }
};

export const terminateSession = async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.userId;

  try {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      return res
        .status(404)
        .json({ status: false, message: "Session not found" });
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
    res.json({ status: true, message: "Session terminated" });
  } catch (error) {
    console.error("Terminate session error:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to terminate session" });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const history = await activityLogService.getLoginHistory(
      req.user.userId,
      20
    );
    res.json({ status: true, data: history });
  } catch (error) {
    console.error("Get login history error:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to get login history" });
  }
};

// Admin: Get all activity logs
export const getAllActivityLogs = async (req, res) => {
  const {
    page = 1,
    limit = 50,
    userId,
    action,
    module,
    startDate,
    endDate,
  } = req.query;

  try {
    const result = await activityLogService.getAllActivities({
      page: parseInt(page),
      limit: parseInt(limit),
      userId: userId ? parseInt(userId) : null,
      action,
      module,
      startDate,
      endDate,
    });

    res.json({ status: true, data: result });
  } catch (error) {
    console.error("Get all activity logs error:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to get activity logs" });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search, status, roleId } = req.query;

  try {
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (roleId) where.roleId = parseInt(roleId);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          role: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      status: true,
      data: {
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ status: false, message: "Failed to get users" });
  }
};

// Admin: Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, status, roleId } = req.body;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    const oldUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!oldUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, phone, status, roleId },
      include: { role: true },
    });

    await activityLogService.log({
      userId: req.user.userId,
      action: "update",
      module: "users",
      entity: "User",
      entityId: id,
      description: `Updated user: ${user.email}`,
      oldValues: {
        firstName: oldUser.firstName,
        lastName: oldUser.lastName,
        status: oldUser.status,
        roleId: oldUser.roleId,
      },
      newValues: { firstName, lastName, status, roleId },
      ipAddress,
      userAgent,
    });

    res.json({ status: true, message: "User updated", data: user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ status: false, message: "Failed to update user" });
  }
};

// Roles & Permissions
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });
    res.json({ status: true, data: roles });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ status: false, message: "Failed to get roles" });
  }
};

export const createRole = async (req, res) => {
  const { name, description, permissionIds } = req.body;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds?.map((id) => ({ permissionId: id })) || [],
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    await activityLogService.log({
      userId: req.user.userId,
      action: "create",
      module: "roles",
      entity: "Role",
      entityId: role.id.toString(),
      description: `Created role: ${name}`,
      ipAddress,
      userAgent,
    });

    res.status(201).json({ status: true, message: "Role created", data: role });
  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({ status: false, message: "Failed to create role" });
  }
};

export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, permissionIds } = req.body;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    const oldRole = await prisma.role.findUnique({
      where: { id: parseInt(id) },
      include: { permissions: true },
    });
    if (!oldRole) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    if (oldRole.isSystem) {
      return res
        .status(403)
        .json({ status: false, message: "Cannot modify system role" });
    }

    // Update role and permissions
    await prisma.rolePermission.deleteMany({ where: { roleId: parseInt(id) } });

    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        permissions: {
          create: permissionIds?.map((pid) => ({ permissionId: pid })) || [],
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    await activityLogService.log({
      userId: req.user.userId,
      action: "update",
      module: "roles",
      entity: "Role",
      entityId: id,
      description: `Updated role: ${name}`,
      ipAddress,
      userAgent,
    });

    res.json({ status: true, message: "Role updated", data: role });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ status: false, message: "Failed to update role" });
  }
};

export const deleteRole = async (req, res) => {
  const { id } = req.params;
  const { ipAddress, userAgent } = getClientInfo(req);

  try {
    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (!role) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    if (role.isSystem) {
      return res
        .status(403)
        .json({ status: false, message: "Cannot delete system role" });
    }

    await prisma.role.delete({ where: { id: parseInt(id) } });

    await activityLogService.log({
      userId: req.user.userId,
      action: "delete",
      module: "roles",
      entity: "Role",
      entityId: id,
      description: `Deleted role: ${role.name}`,
      ipAddress,
      userAgent,
    });

    res.json({ status: true, message: "Role deleted" });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({ status: false, message: "Failed to delete role" });
  }
};

export const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    });
    res.json({ status: true, data: permissions });
  } catch (error) {
    console.error("Get permissions error:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to get permissions" });
  }
};
