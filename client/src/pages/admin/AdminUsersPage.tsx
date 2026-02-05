import { useEffect, useState } from 'react';
import { Search, Shield, ShieldOff, UserCog, ChevronLeft, ChevronRight, ExternalLink, X, Ban } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { AdminUser } from '../../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Block modal
  const [blockUser, setBlockUser] = useState<AdminUser | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  // Role modal
  const [roleUser, setRoleUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState('');
  const [changingRole, setChangingRole] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ page, search, blocked: blockedFilter, role: roleFilter })
      .then(({ data }) => {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, blockedFilter, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleBlock = async () => {
    if (!blockUser) return;
    setBlocking(true);
    try {
      const shouldBlock = !blockUser.blocked;
      await adminApi.blockUser(blockUser.id, { blocked: shouldBlock, blockedReason: shouldBlock ? blockReason : undefined });
      setBlockUser(null);
      setBlockReason('');
      fetchUsers();
    } catch {} finally {
      setBlocking(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleUser || !newRole) return;
    setChangingRole(true);
    try {
      await adminApi.changeRole(roleUser.id, newRole);
      setRoleUser(null);
      fetchUsers();
    } catch {} finally {
      setChangingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Uzytkownicy</h1>
        <p className="text-sm text-gray-500">{total} uzytkownikow</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[250px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Szukaj uzytkownikow..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
            Szukaj
          </button>
        </form>

        <select
          value={blockedFilter}
          onChange={e => { setBlockedFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Wszyscy</option>
          <option value="true">Zablokowani</option>
          <option value="false">Aktywni</option>
        </select>

        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Wszystkie role</option>
          <option value="USER">Uzytkownik</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-700 rounded-2xl border border-gray-200 dark:border-dark-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uzytkownik</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Miasto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rola</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ogloszen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-dark-600">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    Brak uzytkownikow
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">{u.name[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.city || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.plan === 'PREMIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.blocked ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Zablokowany
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Aktywny
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{u._count?.listings || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/uzytkownik/${u.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg transition-colors"
                          title="Profil"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </a>
                        <button
                          onClick={() => {
                            setBlockUser(u);
                            setBlockReason(u.blockedReason || '');
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            u.blocked
                              ? 'hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={u.blocked ? 'Odblokuj' : 'Zablokuj'}
                        >
                          {u.blocked ? (
                            <ShieldOff className="w-4 h-4 text-green-500" />
                          ) : (
                            <Ban className="w-4 h-4 text-red-500" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setRoleUser(u);
                            setNewRole(u.role === 'ADMIN' ? 'USER' : 'ADMIN');
                          }}
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Zmien role"
                        >
                          <UserCog className="w-4 h-4 text-purple-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-600">
            <p className="text-sm text-gray-500">Strona {page} z {totalPages}</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Block Modal */}
      {blockUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setBlockUser(null)}>
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {blockUser.blocked ? 'Odblokuj uzytkownika' : 'Zablokuj uzytkownika'}
              </h3>
              <button onClick={() => setBlockUser(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {blockUser.blocked
                ? `Czy na pewno chcesz odblokowac uzytkownika ${blockUser.name} (${blockUser.email})?`
                : `Czy na pewno chcesz zablokowac uzytkownika ${blockUser.name} (${blockUser.email})?`
              }
            </p>

            {!blockUser.blocked && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Powod blokady (opcjonalnie)</label>
                <textarea
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Podaj powod blokady..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setBlockUser(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-dark-500 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleBlock}
                disabled={blocking}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                  blockUser.blocked
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {blocking ? '...' : blockUser.blocked ? 'Odblokuj' : 'Zablokuj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {roleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setRoleUser(null)}>
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Zmien role</h3>
              <button onClick={() => setRoleUser(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Zmien role uzytkownika <strong>{roleUser.name}</strong> z <strong>{roleUser.role}</strong> na <strong>{newRole}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRoleUser(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-dark-500 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleRoleChange}
                disabled={changingRole}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {changingRole ? '...' : 'Zmien role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
