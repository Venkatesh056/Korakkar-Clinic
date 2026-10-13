import React, { useState } from 'react';
import { User, Role } from '../../types';
import { storage } from '../../services/storage';
import { Plus, KeyRound } from 'lucide-react';

interface UserManagementViewProps {
  currentUser: User;
  users: User[];
  onUsersUpdated: (updatedList: User[]) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  onUsersUpdated,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newRole, setNewRole] = useState<Role>('STAFF');
  const [formError, setFormError] = useState<string>('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUser = newUsername.trim().toLowerCase();
    if (cleanUser.length < 3 || cleanUser.length > 20) {
      setFormError('Username must be 3 to 20 characters.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setFormError(`Username '${cleanUser}' is already taken.`);
      return;
    }

    const newUser: User = {
      id: `u_${Date.now()}`,
      username: cleanUser,
      fullName: newFullName.trim() || cleanUser,
      role: newRole,
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      forcePasswordChange: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    const updated = [...users, newUser];
    storage.saveUsers(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'USER_CREATED',
      `User '${newUser.username}' created with role ${newUser.role}.`
    );

    onUsersUpdated(updated);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
  };

  const handleToggleUserStatus = (u: User) => {
    if (u.id === currentUser.id) {
      alert('Security Policy: You cannot deactivate your own active session.');
      return;
    }

    const updated = users.map((item) => {
      if (item.id === u.id) {
        return { ...item, active: !item.active };
      }
      return item;
    });

    storage.saveUsers(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'USER_STATUS_CHANGED',
      `User '${u.username}' status set to ${!u.active ? 'ACTIVE' : 'DEACTIVATED'}.`
    );
    onUsersUpdated(updated);
  };

  const handleForcePasswordChange = (u: User) => {
    const updated = users.map((item) => {
      if (item.id === u.id) {
        return { ...item, forcePasswordChange: true, failedAttempts: 0, lockedUntil: null };
      }
      return item;
    });

    storage.saveUsers(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'PASSWORD_CHANGE_FORCED',
      `Forced password change reset for user '${u.username}'.`
    );
    onUsersUpdated(updated);
    alert(`User '${u.username}' will be prompted to choose a new password upon next login.`);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#DEDCCF]">
        <div>
          <span className="text-[11px] font-semibold text-[#80664A] tracking-wider uppercase block">
            Administrative Access Control
          </span>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#29332E] tracking-tight">
            Staff Personnel & Role-Based Permissions
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="px-3.5 py-2 bg-[#284B3A] hover:bg-[#607A56] text-[#FFFEFA] rounded text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#A8B49A]" />
          <span>Add Personnel Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-[#FFFEFA] border border-[#DEDCCF] rounded-xl overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F6F3EA] text-[#29332E] font-semibold border-b border-[#DEDCCF]">
            <tr>
              <th className="py-3 px-3">Username</th>
              <th className="py-3 px-3">Full Name & Designation</th>
              <th className="py-3 px-3 text-center">Role Scope</th>
              <th className="py-3 px-3 text-center">Account Status</th>
              <th className="py-3 px-3">Last Login</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEDCCF]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#F6F3EA]/60">
                <td className="py-3 px-3 font-mono font-bold text-[#29332E]">{u.username}</td>
                <td className="py-3 px-3 font-semibold text-[#29332E]">{u.fullName}</td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-[#284B3A]/15 text-[#284B3A] border border-[#284B3A]/30'
                        : 'bg-[#EAE4D6] text-[#29332E] border border-[#DEDCCF]'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  {u.active ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#607A56]/15 text-[#284B3A] border border-[#607A56]/40">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#B66E52]/15 text-[#B66E52] border border-[#B66E52]/40">
                      Deactivated
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 font-mono text-[#777B72] text-[11px]">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleForcePasswordChange(u)}
                      className="px-2 py-1 bg-[#EAE4D6] hover:bg-[#DEDCCF] text-[#29332E] rounded text-[11px] font-medium flex items-center gap-1 border border-[#DEDCCF]"
                      title="Force Password Change on Next Login"
                    >
                      <KeyRound className="w-3 h-3 text-[#777B72]" />
                      <span>Reset Pass</span>
                    </button>

                    {u.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(u)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                          u.active
                            ? 'bg-[#EAE4D6] text-[#B66E52] hover:bg-[#DEDCCF]'
                            : 'bg-[#EAE4D6] text-[#284B3A] hover:bg-[#DEDCCF]'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FFFEFA] rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-[#DEDCCF]">
            <div className="flex items-center justify-between pb-2 border-b border-[#DEDCCF]">
              <h3 className="font-serif-clinical text-sm font-bold text-[#29332E]">Add Clinical Personnel</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#777B72] hover:text-[#29332E] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2 bg-[#EAE4D6] text-[#B66E52] text-xs rounded border border-[#B66E52]/40">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#29332E] block mb-1">
                  User ID (3–20 chars) <span className="text-[#B66E52]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kavitha"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F6F3EA] border border-[#DEDCCF] rounded font-mono text-[#29332E]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#29332E] block mb-1">
                  Full Name & Title <span className="text-[#B66E52]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kavitha M. (Consultant)"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F6F3EA] border border-[#DEDCCF] rounded text-[#29332E]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#29332E] block mb-1">Role Scope</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-1.5 bg-[#F6F3EA] border border-[#DEDCCF] rounded font-semibold text-[#29332E]"
                >
                  <option value="STAFF">STAFF (Dispensary Pharmacist / Billing)</option>
                  <option value="ADMIN">ADMIN (Full Accounting, Void & System Access)</option>
                </select>
              </div>

              <p className="text-[11px] text-[#777B72]">
                Default password for new accounts is <code>Korakkar#2026</code>.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#777B72] hover:bg-[#EAE4D6] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#284B3A] hover:bg-[#607A56] text-[#FFFEFA] font-semibold rounded"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
