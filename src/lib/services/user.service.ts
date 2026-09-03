import { ensureDbInitialized } from "@/lib/db";

export type UserRole = "admin" | "member";

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  static async authenticate(username: string, password: string): Promise<UserProfile | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT * FROM users WHERE username = ? AND password = ?",
      args: [username.trim(), password.trim()],
    });

    const row = res.rows[0];
    if (!row) return null;

    return {
      id: String(row.id),
      username: String(row.username),
      role: (String(row.role) as UserRole) || "member",
      displayName: String(row.display_name || row.username),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    const db = await ensureDbInitialized();
    const res = await db.execute("SELECT id, username, role, display_name, created_at, updated_at FROM users ORDER BY created_at ASC");

    return res.rows.map((row) => ({
      id: String(row.id),
      username: String(row.username),
      role: (String(row.role) as UserRole) || "member",
      displayName: String(row.display_name || row.username),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  }

  static async getUserById(id: string): Promise<UserProfile | null> {
    const db = await ensureDbInitialized();
    const res = await db.execute({
      sql: "SELECT id, username, role, display_name, created_at, updated_at FROM users WHERE id = ?",
      args: [id],
    });

    const row = res.rows[0];
    if (!row) return null;

    return {
      id: String(row.id),
      username: String(row.username),
      role: (String(row.role) as UserRole) || "member",
      displayName: String(row.display_name || row.username),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }

  static async createUser(data: {
    username: string;
    password: string;
    role?: UserRole;
    displayName?: string;
  }): Promise<UserProfile> {
    const db = await ensureDbInitialized();
    const username = data.username.trim().toLowerCase();
    
    // Check if username already exists
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [username],
    });
    if (existing.rows.length > 0) {
      throw new Error(`Username "${username}" sudah digunakan.`);
    }

    const id = `usr-${Date.now()}`;
    const role = data.role || "member";
    const displayName = data.displayName?.trim() || username;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO users (id, username, password, role, display_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, username, data.password.trim(), role, displayName, now, now],
    });

    return (await this.getUserById(id))!;
  }

  static async updateUser(
    id: string,
    data: {
      role?: UserRole;
      displayName?: string;
      password?: string;
    }
  ): Promise<UserProfile | null> {
    const db = await ensureDbInitialized();
    const current = await this.getUserById(id);
    if (!current) return null;

    const role = data.role !== undefined ? data.role : current.role;
    const displayName = data.displayName !== undefined ? data.displayName.trim() : current.displayName;
    const now = new Date().toISOString();

    if (data.password && data.password.trim()) {
      await db.execute({
        sql: `UPDATE users SET role = ?, display_name = ?, password = ?, updated_at = ? WHERE id = ?`,
        args: [role, displayName, data.password.trim(), now, id],
      });
    } else {
      await db.execute({
        sql: `UPDATE users SET role = ?, display_name = ?, updated_at = ? WHERE id = ?`,
        args: [role, displayName, now, id],
      });
    }

    return this.getUserById(id);
  }

  static async deleteUser(id: string): Promise<boolean> {
    const db = await ensureDbInitialized();
    const user = await this.getUserById(id);
    if (!user) return false;

    // Protection: do not delete master admin leonorexyz
    if (user.username === "leonorexyz") {
      throw new Error("Akun master superadmin 'leonorexyz' tidak dapat dihapus.");
    }

    const res = await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });

    return res.rowsAffected > 0;
  }
}