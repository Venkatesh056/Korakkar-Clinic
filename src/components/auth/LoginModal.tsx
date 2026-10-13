import React, { useState } from 'react';
import { User } from '../../types';
import { authService } from '../../services/auth';
import { ClinicLogo } from '../common/ClinicLogo';
import { Shield, Lock, User as UserIcon, AlertCircle, KeyRound } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = authService.login(username, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed.');
      return;
    }

    if (res.user?.forcePasswordChange) {
      setPendingUser(res.user);
      setMustChangePassword(true);
      return;
    }

    if (res.user) {
      onLoginSuccess(res.user);
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Security standard: New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (pendingUser) {
      const updateRes = authService.updatePassword(pendingUser.id, newPassword);
      if (!updateRes.success) {
        setErrorMsg(updateRes.error || 'Failed to update password.');
        return;
      }
      onLoginSuccess({ ...pendingUser, forcePasswordChange: false });
    }
  };

  const handleFillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f271e]/85 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-2xl max-w-md w-full shadow-2xl border border-[#ded8cb] overflow-hidden">
        {/* Botanical Clinic Header */}
        <div className="bg-[#16382b] p-6 text-[#ffffff] text-center border-b border-[#2b5542]">
          <div className="flex justify-center mb-3">
            <ClinicLogo size={46} variant="forest" />
          </div>
          <span className="text-[11px] font-medium text-[#d6a84f] block mb-0.5">
            ஸ்ரீ கோரக்கர் சித்தா & ஆயுர்வேத கிளினிக்
          </span>
          <h2 className="font-serif-clinical text-lg font-bold tracking-tight text-[#ffffff]">
            Sri Korakkar Siddha & Ayurvedha Clinic
          </h2>
          <p className="text-xs text-[#9bb09f] font-mono mt-0.5">
            Dispensary Billing & Accounts Station
          </p>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#EAE4D6] text-[#B66E52] text-xs rounded border border-[#B66E52]/40 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#B66E52] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!mustChangePassword ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#29332E] block mb-1">
                  Pharmacist / Administrator ID
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#777B72] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or staff"
                    className="w-full pl-9 pr-3 py-2 bg-[#F6F3EA] border border-[#DEDCCF] rounded font-mono text-[#29332E] focus:outline-none focus:border-[#284B3A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#29332E] block mb-1">Passphrase</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#777B72] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 bg-[#F6F3EA] border border-[#DEDCCF] rounded focus:outline-none focus:border-[#284B3A] text-[#29332E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#284B3A] hover:bg-[#607A56] text-[#FFFEFA] font-bold rounded transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#A8B49A]" />
                <span>Authenticate Session</span>
              </button>

              {/* Demo quick access chips */}
              <div className="pt-3 border-t border-[#DEDCCF] text-[11px] text-[#777B72] space-y-1.5">
                <span className="font-semibold text-[#29332E] block">Authorized Accounts:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin', 'admin123')}
                    className="p-2 bg-[#F6F3EA] hover:bg-[#EAE4D6] rounded border border-[#DEDCCF] text-left transition-colors"
                  >
                    <span className="font-bold text-[#29332E] block">Chief Physician</span>
                    <code className="text-[10px] text-[#777B72]">admin / admin123</code>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('staff', 'staff123')}
                    className="p-2 bg-[#F6F3EA] hover:bg-[#EAE4D6] rounded border border-[#DEDCCF] text-left transition-colors"
                  >
                    <span className="font-bold text-[#29332E] block">Dispensary Staff</span>
                    <code className="text-[10px] text-[#777B72]">staff / staff123</code>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Forced Password Change Form */
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-[#EAE4D6] rounded border border-[#DEDCCF] text-[#29332E]">
                <span className="font-bold block mb-1">Credential Security Policy</span>
                <p className="text-[#777B72]">
                  New clinical personnel must configure an 8+ character password before accessing patient records.
                </p>
              </div>

              <div>
                <label className="font-semibold text-[#29332E] block mb-1">
                  New Password (min 8 chars) <span className="text-[#B66E52]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 bg-[#F6F3EA] border border-[#DEDCCF] rounded text-[#29332E] focus:outline-none focus:border-[#284B3A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#29332E] block mb-1">
                  Confirm New Password <span className="text-[#B66E52]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 bg-[#F6F3EA] border border-[#DEDCCF] rounded text-[#29332E] focus:outline-none focus:border-[#284B3A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#284B3A] hover:bg-[#607A56] text-[#FFFEFA] font-bold rounded transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-[#A8B49A]" />
                <span>Save New Password & Enter</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
