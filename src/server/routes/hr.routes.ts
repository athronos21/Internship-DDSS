import { Router } from 'express';
import { db } from '../db.js';
import { UserRepository } from '../db/repositories/user.repository.js';
import { requireRole } from '../roleGuard.js';

export const hrRouter = Router();

// USERS & STAFF MANAGEMENT API
hrRouter.get('/users', (req, res) => {
  res.json({ success: true, data: UserRepository.list() });
});

hrRouter.post('/users', requireRole('STORE_OWNER', 'SUPER_ADMIN'), (req, res) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      department,
      employeeId,
      temporaryPassword,
      pin,
      mustChangePassword = true,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Staff Name and Work Email are required' });
    }

    const existing = UserRepository.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: `An account with email ${email} already exists.` });
    }

    const roleCodeMap: Record<string, string> = {
      SUPER_ADMIN: 'SYS',
      STORE_OWNER: 'OWN',
      PHARMACIST: 'PH',
    };
    const prefix = roleCodeMap[role] || 'PH';
    const count = db.users.length + 1;
    const genEmployeeId = employeeId || `KZN-${prefix}-${String(count).padStart(3, '0')}`;
    const tempPass = temporaryPassword || `Kaziniya#${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newUser: any = {
      id: `u-${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      role: role || 'PHARMACIST',
      department:
        department ||
        (role === 'STORE_OWNER'
          ? 'Drug Store Ownership & Management'
          : role === 'SUPER_ADMIN'
          ? 'System Administration'
          : 'Prescription Dispensary & POS'),
      phone: phone || '+251 911 000 000',
      employeeId: genEmployeeId,
      isActive: true,
      temporaryPassword: tempPass,
      password: tempPass,
      pin: pin || String(Math.floor(1000 + Math.random() * 9000)),
      mustChangePassword,
      status: mustChangePassword ? 'PENDING_FIRST_LOGIN' : 'ACTIVE',
      permissions: [],
      createdAt: now,
    };

    db.users.push(newUser);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: (req.headers['x-user-id'] as string) || 'u-1',
      action: 'STAFF_ONBOARDED',
      entityType: 'USER',
      entityId: newUser.id,
      newData: { name: newUser.name, email: newUser.email, role: newUser.role, employeeId: newUser.employeeId },
      createdAt: now,
    });

    res.status(201).json({
      success: true,
      message: 'Staff account successfully created! Temporary credentials generated.',
      data: newUser,
      temporaryPassword: tempPass,
      credentials: {
        email: newUser.email,
        temporaryPassword: tempPass,
        mustChangePassword,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

hrRouter.put('/users/:id', requireRole('STORE_OWNER', 'SUPER_ADMIN'), (req, res) => {
  const user = UserRepository.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { name, phone, department, status, role } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (department) user.department = department;
  if (status) user.status = status;
  if (role) user.role = role;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: (req.headers['x-user-id'] as string) || 'u-1',
    action: 'USER_PROFILE_UPDATED',
    entityType: 'USER',
    entityId: user.id,
    newData: { name: user.name, role: user.role, status: user.status },
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Staff profile updated', data: user });
});

hrRouter.post('/users/:id/change-password', (req, res) => {
  const user = UserRepository.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  user.mustChangePassword = false;
  (user as any).temporaryPassword = newPassword;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: user.id,
    action: 'PASSWORD_RESET_COMPLETED',
    entityType: 'USER',
    entityId: user.id,
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Password updated successfully. Account fully activated.' });
});
