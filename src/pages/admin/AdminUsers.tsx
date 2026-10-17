import React, { useState } from 'react';
import { User, Role, UserStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  loadUsersFromStorage,
  toggleUserRoleInStorage,
  toggleUserBlockInStorage,
  deleteUserFromStorage,
} from '@/services/userService';
import { getGivenName } from '@/utils/nameUtils';

export const AdminUsersPage: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>(() => loadUsersFromStorage());

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleToggleRole = (uid: string, currentRole: Role, name: string | null) => {
    const next = toggleUserRoleInStorage(uid);
    setUsersList(next);
    const newRole = currentRole === 'admin' ? 'MEMBER' : 'ADMIN';
    toast.success(`Đã đổi vai trò của ${name || uid} thành: ${newRole}`);
  };

  const handleToggleBlock = (uid: string, currentStatus: UserStatus, name: string | null) => {
    const next = toggleUserBlockInStorage(uid);
    setUsersList(next);
    const isNowBlocked = currentStatus !== 'blocked';
    toast.info(isNowBlocked ? `Đã khóa tài khoản ${name}` : `Đã mở khóa tài khoản ${name}`);
  };

  const handleDelete = (uid: string, name: string | null) => {
    if (confirm(`Bạn có chắc muốn xóa tài khoản "${name || uid}" khỏi hệ thống?`)) {
      const next = deleteUserFromStorage(uid);
      setUsersList(next);
      toast.success(`Đã xóa tài khoản ${name || uid}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/15 text-blue-300 rounded-2xl border border-blue-500/25 backdrop-blur-md">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Quản Lý Tài Khoản Thành Viên</h1>
            <p className="text-xs text-slate-300 mt-1">
              Cấp quyền Ban cán sự (Admin), quản lý trạng thái và danh sách tài khoản lớp
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder:text-slate-400 focus:border-white/40"
          />
        </div>
      </Card>

      {/* Tabs lọc trạng thái */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
        {[
          { id: 'all', label: `Tất cả (${usersList.length})`, color: 'text-white' },
          { id: 'active', label: `Đang hoạt động (${usersList.filter((u) => u.status !== 'blocked').length})`, color: 'text-emerald-300' },
          { id: 'blocked', label: `Bị khóa (${usersList.filter((u) => u.status === 'blocked').length})`, color: 'text-red-300' },
        ].map((tab) =>
          statusFilter === tab.id ? (
            <GlassButton
              key={tab.id}
              size="sm"
              onClick={() => setStatusFilter(tab.id as any)}
              contentClassName={`px-3.5 py-1.5 text-xs font-semibold ${tab.color}`}
            >
              <span>{tab.label}</span>
            </GlassButton>
          ) : (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {tab.label}
            </button>
          )
        )}
      </div>

      {/* Bảng danh sách User */}
      <Card className="shadow-2xl overflow-hidden p-0 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06] text-slate-300 uppercase font-semibold backdrop-blur-md">
                <th className="p-4">Học sinh</th>
                <th className="p-4">Lớp</th>
                <th className="p-4">Vai trò (Role)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow text-xs px-1 select-none">
                        <span className="truncate max-w-full">{getGivenName(u.displayName) || 'U'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.displayName}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-semibold text-primary">{u.classId}</td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        u.role === 'admin'
                          ? 'text-indigo-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {u.role === 'admin' ? (
                        <>
                          <ShieldAlert className="w-3 h-3 text-indigo-400" /> ADMIN
                        </>
                      ) : (
                        'MEMBER'
                      )}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`font-semibold ${
                        u.status === 'blocked'
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {u.status === 'blocked' ? 'Bị khóa' : 'Đang hoạt động'}
                    </span>
                  </td>

                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">

                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleToggleRole(u.uid, u.role, u.displayName)}
                    >
                      <Shield className="w-3 h-3 text-white" />
                      <span>{u.role === 'admin' ? 'Hạ xuống Member' : 'Cấp quyền Admin'}</span>
                    </GlassButton>

                    <GlassButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggleBlock(u.uid, u.status, u.displayName)}
                    >
                      <span>{u.status === 'blocked' ? 'Mở khóa' : 'Khóa'}</span>
                    </GlassButton>

                    <GlassButton
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(u.uid, u.displayName)}
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </GlassButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
