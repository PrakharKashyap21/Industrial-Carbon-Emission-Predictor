import React, { useState, useEffect } from 'react';
import { Users, UserPlus, BookmarkCheck, RefreshCw } from 'lucide-react';
import { listUsers, createUser, updateUserStatus, getAuditLogs } from '../services/authService';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

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
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="User & RBAC Administration"
        subtitle="Manage system user accounts, assigned plant access permissions, active status, and security audit logs."
        badge={
          <Badge variant="healthy" dot>
            Admin Authorization
          </Badge>
        }
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={fetchUsers}
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={UserPlus}
          onClick={() => setIsCreateOpen(true)}
        >
          Create New User Account
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="User Management Error">
          {error}
        </Alert>
      )}

      {/* User Table */}
      <UserTable users={users} onToggleStatus={handleToggleStatus} />

      {/* System Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <BookmarkCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
            System Security & Action Audit Logs
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time audit log tracking logins, failed credentials, user management, predictions, and optimization runs.
          </p>
        </div>

        <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-[11px]">
              <div>
                <span className="font-bold text-emerald-700 uppercase mr-2">[{log.action}]</span>
                <span className="text-slate-800 font-sans">{log.user_email}</span>
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
