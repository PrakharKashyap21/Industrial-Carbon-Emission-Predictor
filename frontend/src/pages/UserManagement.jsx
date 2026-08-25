import React, { useState, useEffect } from 'react';
import { Users, UserPlus, AlertCircle, BookmarkCheck } from 'lucide-react';
import { listUsers, createUser, updateUserStatus, getAuditLogs } from '../services/authService';
import UserTable from '../components/users/UserTable';
import CreateUser from '../components/users/CreateUser';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await listUsers();
    setLoading(false);
    if (res.success) {
      setUsers(res.data);
    } else {
      setError(res.error);
    }
  };

  const fetchLogs = async () => {
    const res = await getAuditLogs({ limit: 15 });
    if (res.success) {
      setAuditLogs(res.data);
    }
  };

  const handleCreateUser = async (userData) => {
    const res = await createUser(userData);
    if (res.success) {
      fetchUsers();
      fetchLogs();
    } else {
      setError(res.error);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    const res = await updateUserStatus(userId, newStatus);
    if (res.success) {
      fetchUsers();
      fetchLogs();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded-lg text-[10px] font-bold border border-cyan-800 uppercase tracking-widest flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Admin Control
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Role-Based Access Control & Audit Log</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">System User Management & Access Audit</h1>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create System User Account</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-4 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* User Table */}
      <UserTable users={users} onToggleStatus={handleToggleStatus} />

      {/* System Audit Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <BookmarkCheck className="w-4 h-4 mr-1.5 text-cyan-400" />
            System Security & Action Audit Logs
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time audit log tracking logins, failed credentials, user management, predictions, and optimization runs.
          </p>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-[11px]">
              <div>
                <span className="font-bold text-cyan-400 uppercase mr-2">[{log.action}]</span>
                <span className="text-slate-300 font-sans">{log.user_email}</span>
              </div>
              <div className="text-slate-500 font-mono text-[10px]">
                {log.timestamp?.split('T')[0]} {log.timestamp?.split('T')[1]?.substring(0, 8)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateUser
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
};

export default UserManagement;
