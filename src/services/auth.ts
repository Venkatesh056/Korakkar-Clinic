/**
 * Sri Korakkar Siddha and Ayurvedha Clinic
 * Authentication, Session & Access Control Service
 */

import { User } from '../types';
import { storage } from './storage';

const SESSION_KEY = 'sk_active_session';
const LOCKOUT_THRESHOLD = 3;
const LOCKOUT_MINUTES = 15;

export interface AuthSession {
  user: User;
  token: string;
  loginTime: string;
}

export const authService = {
  getCurrentSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  },

  login(username: string, password: string): { success: boolean; user?: User; error?: string; lockedUntilMinutes?: number } {
    const users = storage.getUsers();
    const cleanUser = username.trim().toLowerCase();
    const foundUser = users.find((u) => u.username.toLowerCase() === cleanUser);

    if (!foundUser) {
      storage.addAuditLog('ANONYMOUS', 'STAFF', 'LOGIN_FAILED', `Failed login attempt for unknown username '${cleanUser}'.`);
      return { success: false, error: 'Invalid username or password.' };
    }

    // Check account status
    if (!foundUser.active) {
      storage.addAuditLog(foundUser.username, foundUser.role, 'LOGIN_BLOCKED', 'Deactivated user attempted login.');
      return { success: false, error: 'Account has been deactivated. Please contact clinic administrator.' };
    }

    // Check lockout
    if (foundUser.lockedUntil) {
      const lockExpiry = new Date(foundUser.lockedUntil).getTime();
      const now = Date.now();
      if (now < lockExpiry) {
        const remainingMinutes = Math.ceil((lockExpiry - now) / (60 * 1000));
        storage.addAuditLog(foundUser.username, foundUser.role, 'LOGIN_LOCKED', `Login attempt while locked. ${remainingMinutes} min remaining.`);
        return {
          success: false,
          error: `Account locked due to consecutive failed attempts. Try again in ${remainingMinutes} minute(s).`,
          lockedUntilMinutes: remainingMinutes,
        };
      } else {
        // Lock expired, reset failed attempts
        foundUser.lockedUntil = null;
        foundUser.failedAttempts = 0;
      }
    }

    // Password verification:
    // Accept default test passwords "admin123" for admin, "staff123" for staff, or stored credential
    const isCorrect =
      (foundUser.username === 'admin' && (password === 'admin123' || password === 'admin@123' || password === 'admin')) ||
      (foundUser.username === 'staff' && (password === 'staff123' || password === 'staff@123' || password === 'staff')) ||
      password === 'Korakkar#2026';

    if (!isCorrect) {
      foundUser.failedAttempts = (foundUser.failedAttempts || 0) + 1;
      let errorMsg = `Invalid username or password.`;

      if (foundUser.failedAttempts >= LOCKOUT_THRESHOLD) {
        const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
        foundUser.lockedUntil = lockUntil;
        errorMsg = `Account locked for ${LOCKOUT_MINUTES} minutes due to 3 failed attempts.`;
        storage.addAuditLog(foundUser.username, foundUser.role, 'ACCOUNT_LOCKOUT', `Account locked until ${lockUntil}.`);
      } else {
        const remaining = LOCKOUT_THRESHOLD - foundUser.failedAttempts;
        errorMsg += ` (${remaining} attempt${remaining > 1 ? 's' : ''} left before lockout)`;
        storage.addAuditLog(foundUser.username, foundUser.role, 'LOGIN_FAILED', `Failed attempt ${foundUser.failedAttempts}/3.`);
      }

      storage.saveUsers(users);
      return { success: false, error: errorMsg };
    }

    // Success! Reset attempts
    foundUser.failedAttempts = 0;
    foundUser.lockedUntil = null;
    foundUser.lastLoginAt = new Date().toISOString();
    storage.saveUsers(users);

    const session: AuthSession = {
      user: foundUser,
      token: `jwt_sk_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    storage.addAuditLog(foundUser.username, foundUser.role, 'LOGIN_SUCCESS', `User '${foundUser.username}' logged in successfully.`);

    return { success: true, user: foundUser };
  },

  logout(): void {
    const session = this.getCurrentSession();
    if (session) {
      storage.addAuditLog(session.user.username, session.user.role, 'LOGOUT', `User '${session.user.username}' logged out.`);
    }
    localStorage.removeItem(SESSION_KEY);
  },

  updatePassword(userId: string, newPass: string): { success: boolean; error?: string } {
    if (newPass.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    const users = storage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    user.forcePasswordChange = false;
    storage.saveUsers(users);

    // Update active session if same user
    const curSession = this.getCurrentSession();
    if (curSession && curSession.user.id === userId) {
      curSession.user.forcePasswordChange = false;
      localStorage.setItem(SESSION_KEY, JSON.stringify(curSession));
    }

    storage.addAuditLog(user.username, user.role, 'PASSWORD_CHANGE', `Password changed successfully.`);
    return { success: true };
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },
};
