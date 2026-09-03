"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  User, 
  Pencil, 
  Trash2, 
  Lock, 
  X, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Search,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { UserProfile, UserRole } from "@/lib/services/user.service";

export default function UserManagementPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserProfile | null>(null);

  // Form states
  const [formUsername, setFormUsername] = useState<string>("");
  const [formPassword, setFormPassword] = useState<string>("");
  const [formDisplayName, setFormDisplayName] = useState<string>("");
  const [formRole, setFormRole] = useState<UserRole>("member");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setUsers(json.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formPassword.trim()) {
      setFeedback({ type: "error", message: "Username dan password wajib diisi." });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formUsername.trim(),
          password: formPassword.trim(),
          displayName: formDisplayName.trim() || undefined,
          role: formRole,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: `Pengguna '${json.data.username}' berhasil ditambahkan.` });
        setIsAddModalOpen(false);
        resetForm();
        await loadUsers();
      } else {
        setFeedback({ type: "error", message: json.error || "Gagal menambahkan pengguna." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;

    try {
      setIsSubmitting(true);
      const payload: any = {
        role: formRole,
        displayName: formDisplayName.trim(),
      };
      if (formPassword.trim()) {
        payload.password = formPassword.trim();
      }

      const res = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: `Data pengguna berhasil diperbarui.` });
        setIsEditModalOpen(false);
        resetForm();
        await loadUsers();
      } else {
        setFeedback({ type: "error", message: json.error || "Gagal memperbarui pengguna." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/users/${deleteTargetUser.id}`, { method: "DELETE" });
      const json = await res.json();

      if (res.ok && json.success) {
        setFeedback({ type: "success", message: `Pengguna '${deleteTargetUser.username}' berhasil dihapus.` });
        setDeleteTargetUser(null);
        await loadUsers();
      } else {
        setFeedback({ type: "error", message: json.error || "Gagal menghapus pengguna." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (target: UserProfile) => {
    setEditingUserId(target.id);
    setFormUsername(target.username);
    setFormDisplayName(target.displayName);
    setFormRole(target.role);
    setFormPassword("");
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormUsername("");
    setFormPassword("");
    setFormDisplayName("");
    setFormRole("member");
    setEditingUserId(null);
  };

  // If not admin, restrict page
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Akses Dibatasi</h2>
        <p className="text-xs text-slate-400 mt-2">
          Menu Manajemen Pengguna hanya dapat diakses oleh akun dengan peran <strong>Admin</strong>.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/10">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Manajemen Pengguna & Peran</span>
              <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 font-mono">
                {users.length} User
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola akun yang dapat mengakses LeonorePortal dan atur hak akses (Role: Admin / Member)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-xl shadow-indigo-600/25 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari pengguna berdasarkan nama atau role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 font-semibold text-slate-400">
              <tr>
                <th className="py-3.5 px-5">Pengguna</th>
                <th className="py-3.5 px-5">Peran (Role)</th>
                <th className="py-3.5 px-5">Akses Sistem</th>
                <th className="py-3.5 px-5">Terdaftar Sejak</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.map((item) => {
                const isMaster = item.username === "leonorexyz";
                const isSelf = currentUser?.id === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold uppercase">
                          {item.username[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{item.displayName || item.username}</span>
                            {isMaster && (
                              <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-mono text-amber-300">
                                Master
                              </span>
                            )}
                            {isSelf && (
                              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">@{item.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold font-mono uppercase ${
                          item.role === "admin"
                            ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                            : "bg-sky-500/15 border border-sky-500/30 text-sky-300"
                        }`}
                      >
                        {item.role === "admin" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span>{item.role}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-400 text-[11px]">
                      {item.role === "admin" ? (
                        <span className="text-emerald-400">Penuh (Kelola App & User)</span>
                      ) : (
                        <span className="text-slate-400">Viewer / Pengguna Portal</span>
                      )}
                    </td>

                    <td className="py-4 px-5 font-mono text-[11px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors"
                          title="Sunting Pengguna"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {!isMaster && (
                          <button
                            onClick={() => setDeleteTargetUser(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH PENGGUNA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-400" />
                <span>Tambah Pengguna Baru</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Username (Unik):</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: operator1"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password:</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password..."
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Tampilan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Operator Konten"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Peran (Role):</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="member">Member (Akses Lihat Portal)</option>
                  <option value="admin">Admin (Akses Kelola App Portal & User)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUNTING PENGGUNA */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-indigo-400" />
                <span>Sunting Pengguna (@{formUsername})</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Tampilan:</label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Peran (Role):</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                >
                  <option value="member">Member (Akses Lihat Portal)</option>
                  <option value="admin">Admin (Akses Kelola App Portal & User)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ganti Password (Kosongkan jika tidak ingin mengubah):
                </label>
                <input
                  type="password"
                  placeholder="Masukkan password baru..."
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Perbarui Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS PENGGUNA */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Hapus Pengguna</h3>
            <p className="text-xs text-slate-400">
              Apakah Anda yakin ingin menghapus akun <strong>@{deleteTargetUser.username}</strong>? Akun ini tidak akan dapat mengakses portal lagi.
            </p>
            <div className="flex gap-2 pt-2 text-xs">
              <button
                onClick={() => setDeleteTargetUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 font-bold text-slate-300 hover:bg-slate-750"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white shadow-lg shadow-rose-600/30"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Pengguna"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}