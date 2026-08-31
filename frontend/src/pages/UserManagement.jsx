import React, { useState, useEffect } from 'react';
import { Users, UserPlus, BookmarkCheck, RefreshCw, Server, Database, Cpu, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { listUsers, createUser, updateUserStatus, getAuditLogs, getSystemHealth } from '../services/authService';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

import UserTable from '../components/users/UserTable';
import CreateUser from '../components/users/CreateUser';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchHealth();
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
    const res = await getAuditLogs({ limit: 25 });
    if (res.success) {
      setAuditLogs(res.data);
    }
  };

  const fetchHealth = async () => {
    const res = await getSystemHealth();
    if (res.success) {
      setHealth(res.data);
    }
  };

  const handleCreateUser = async (userData) => {
    const res = await createUser(userData);
    if (res.success) {
      fetchUsers();
      fetchLogs();
      fetchHealth();
    } else {
      setError(res.error);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    const res = await updateUserStatus(userId, newStatus);
    if (res.success) {
      fetchUsers();
      fetchLogs();
      fetchHealth();
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
          onClick={() => { fetchUsers(); fetchLogs(); fetchHealth(); }}
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

      {/* System Infrastructure Health Grid */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center">
              <Server className="w-3.5 h-3.5 mr-1 text-cyan-600" /> System API Status
            </span>
            <div className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="capitalize">{health.api_status}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            </div>
            <span className="text-[10px] text-slate-500 block">FastAPI production server active</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center">
              <Database className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Database Health
            </span>
            <div className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="capitalize">{health.database_status}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            </div>
            <span className="text-[10px] text-slate-500 block">{health.total_readings.toLocaleString()} operational records stored</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center">
              <Cpu className="w-3.5 h-3.5 mr-1 text-purple-600" /> ML Prediction Ensemble
            </span>
            <div className="text-lg font-extrabold text-purple-900">
              {health.model_name}
            </div>
            <span className="text-[10px] text-slate-500 block">Version: {health.model_version} ({health.model_status})</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-600" /> System Metrics
            </span>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {health.total_users} Users | {health.total_plants} Plants
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Active Alerts: {health.active_alerts}</span>
          </div>
        </div>
      )}

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

        <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-[11px]">
              <div>
                <span className="font-bold text-emerald-700 uppercase mr-2">[{log.action}]</span>
                <span className="text-slate-800 font-sans">{log.user_email}</span>
                {log.details && (
                  <span className="text-slate-500 font-sans ml-2 text-[10px]">({log.details})</span>
                )}
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
