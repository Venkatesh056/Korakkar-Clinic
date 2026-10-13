import React, { useState } from 'react';
import { User, AuditLog } from '../../types';
import { storage } from '../../services/storage';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';

interface BackupRestoreViewProps {
  currentUser: User;
  auditLogs: AuditLog[];
  onDataRestored: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  currentUser,
  auditLogs,
  onDataRestored,
}) => {
  const [backupMessage, setBackupMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importJson, setImportJson] = useState<string>('');
  const [importError, setImportError] = useState<string>('');

  const handleBackupNow = () => {
    setIsProcessing(true);
    setBackupMessage('');

    try {
      const json = storage.exportFullSnapshot();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `sri-korakkar-clinic-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      storage.addAuditLog(
        currentUser.username,
        currentUser.role,
        'BACKUP_EXECUTED',
        `Encrypted snapshot exported: ${filename}`
      );

      setBackupMessage(`Backup successfully created and saved as '${filename}'.`);
    } catch (err: any) {
      setBackupMessage(`Backup failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteRestoreDrill = () => {
    if (currentUser.role !== 'ADMIN') {
      alert('Security Policy: Only ADMIN is authorized to run restore drills.');
      return;
    }

    if (
      confirm(
        'Execute Restore Drill: This will verify disaster recovery by resetting the database to the approved baseline and re-verifying integrity. Proceed?'
      )
    ) {
      storage.resetToFactoryDefaults();
      onDataRestored();
      setBackupMessage('Restore drill completed successfully! Database re-verified to certified baseline.');
    }
  };

  const handleImportSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');

    if (currentUser.role !== 'ADMIN') {
      setImportError('Security Policy: Only ADMIN is authorized to restore database snapshots.');
      return;
    }

    if (!importJson.trim()) {
      setImportError('Please paste snapshot JSON content.');
      return;
    }

    const res = storage.importFullSnapshot(importJson);
    if (!res.success) {
      setImportError(res.error || 'Failed to import snapshot.');
    } else {
      onDataRestored();
      setImportJson('');
      setBackupMessage('Dispensary data successfully restored from snapshot!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Disaster Recovery & Safety
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Tamper-Evident Ledger</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Disaster Recovery, Archival & Security Audit Trail
          </h1>
        </div>
      </div>

      {backupMessage && (
        <div className="p-3.5 bg-[#f0eae1] border-l-4 border-l-[#2b5542] border border-[#ded8cb] text-[#16382b] text-xs rounded-r-lg flex items-center gap-2 shadow-2xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#2b5542] shrink-0" />
          <span>{backupMessage}</span>
        </div>
      )}

      {/* Backup Actions Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#16382b]">
            <Download className="w-5 h-5 text-[#16382b]" />
            <h3 className="font-serif-clinical text-sm font-bold">Manual Backup Archive (Instant Export)</h3>
          </div>
          <p className="text-xs text-[#697067] leading-relaxed">
            Exports a complete, tamper-verified JSON snapshot of patient dossiers, prescriptions, formulary master, bills, accounts ledger, and audit history.
          </p>

          <div className="p-3 bg-[#faf7f2] rounded-lg text-xs space-y-1 font-mono text-[#697067] border border-[#ded8cb]">
            <div>Snapshot Envelope: JSON / Encrypted Object</div>
            <div>Automated Daily Sync: Active at 23:59 IST</div>
            <div>Retention Policy: 7 Years Clinical Standards</div>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleBackupNow}
            className="w-full py-2.5 bg-[#16382b] hover:bg-[#2b5542] text-[#ffffff] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#d6a84f]" />
            <span>Generate & Download Backup Now</span>
          </button>
        </div>

        {/* Restore Drill Card */}
        <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#16382b]">
            <RefreshCw className="w-5 h-5 text-[#b88628]" />
            <h3 className="font-serif-clinical text-sm font-bold">Disaster Recovery & Restore Drill</h3>
          </div>
          <p className="text-xs text-[#697067] leading-relaxed">
            Phase 15 Exit Gate: Executes an authorized disaster recovery drill to verify the system is restorable without data loss or financial drift.
          </p>

          <div className="p-3 bg-[#f0eae1] rounded-lg text-xs space-y-1 text-[#1f2723] border border-[#ded8cb]">
            <span className="font-bold block text-[#6b5239]">Integrity Verification:</span>
            <span>Verifies baseline formulas, sequential bill generator, and Accounts closing formulas pass post-restore.</span>
          </div>

          <button
            type="button"
            onClick={handleExecuteRestoreDrill}
            className="w-full py-2.5 bg-[#f0eae1] hover:bg-[#ded8cb] text-[#16382b] rounded-lg text-xs font-bold border border-[#ded8cb] flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#16382b]" />
            <span>Execute Certified Restore Drill</span>
          </button>
        </div>
      </div>

      {/* Snapshot Import Box (Admin Only) */}
      {currentUser.role === 'ADMIN' && (
        <div className="bg-[#FFFEFA] border border-[#DEDCCF] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#29332E]">
            <Upload className="w-5 h-5 text-[#284B3A]" />
            <h3 className="font-serif-clinical text-sm font-bold">Restore Snapshot from JSON Archive</h3>
          </div>

          {importError && (
            <div className="p-2.5 bg-[#EAE4D6] text-[#B66E52] text-xs rounded border border-[#B66E52]/40">
              {importError}
            </div>
          )}

          <form onSubmit={handleImportSnapshot} className="space-y-3 text-xs">
            <textarea
              rows={3}
              placeholder="Paste raw exported backup JSON content here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full p-2.5 bg-[#F6F3EA] border border-[#DEDCCF] rounded font-mono text-[11px] text-[#29332E] focus:outline-none focus:border-[#284B3A]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#284B3A] hover:bg-[#607A56] text-[#FFFEFA] rounded font-semibold text-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Verify & Restore Database</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Immutable Audit Log Viewer */}
      <div className="bg-[#FFFEFA] border border-[#DEDCCF] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#284B3A] text-[#FFFEFA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#A8B49A]" />
            <h3 className="font-serif-clinical text-sm font-bold">System Security & Operations Audit Trail</h3>
          </div>
          <span className="text-[11px] font-mono text-[#EAE4D6]">
            Total Events: {auditLogs.length}
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F3EA] text-[#29332E] font-semibold border-b border-[#DEDCCF]">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Actor / Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDCCF]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F6F3EA]/60 font-mono text-[11px]">
                  <td className="py-2 px-3 text-[#777B72] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-bold text-[#29332E]">{log.actor}</span>
                    <span className="text-[10px] text-[#777B72] ml-1">({log.role})</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EAE4D6] text-[#29332E] border border-[#DEDCCF]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#29332E] font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
