import { db } from '../../db.js';
import type { User } from '../../types.js';

export const UserRepository = {
  list(): User[] {
    return db.users;
  },

  findById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  },

  findByEmail(email: string): User | undefined {
    const clean = (email || '').trim().toLowerCase();
    return db.users.find((u) => u.email.toLowerCase() === clean);
  },

  create(userData: any): User {
    const newUser: User = {
      id: userData.id || `u-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      role: userData.role || 'PHARMACIST',
      department: userData.department,
      phone: userData.phone,
      employeeId: userData.employeeId,
      mustChangePassword: userData.mustChangePassword ?? true,
      createdAt: new Date().toISOString(),
      status: 'Active',
      permissions: [],
    };
    db.users.push(newUser);
    return newUser;
  },

  update(id: string, updates: Partial<User>): User | null {
    const u = db.users.find((user) => user.id === id);
    if (!u) return null;
    Object.assign(u, updates);
    return u;
  },
};
