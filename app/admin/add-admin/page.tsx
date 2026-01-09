"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AddAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!email || !username || !password) {
      setMessage({ type: "error", text: "Semua field wajib diisi" });
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Format email tidak valid" });
      setIsSubmitting(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/users/add-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password: password,
          profilePhoto: "/img/defaultProfile.png", // Default profile photo
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "Admin berhasil ditambahkan!" });
        setEmail("");
        setUsername("");
        setPassword("");
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Gagal menambahkan admin" });
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat menambahkan admin" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar activeMenu="add-admin" />

      <main className="flex-1 md:ml-64 bg-white min-h-screen">
        <div className="p-8 max-w-2xl">
          <h1 className="text-3xl font-semibold text-[#040404] mb-8">
            Tambah Admin
          </h1>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#040404] mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#040404]/20 focus:outline-none focus:ring-2 focus:ring-[#040404] focus:border-transparent"
                placeholder="admin@example.com"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#040404] mb-2"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#040404]/20 focus:outline-none focus:ring-2 focus:ring-[#040404] focus:border-transparent"
                placeholder="Masukkan username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#040404] mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#040404]/20 focus:outline-none focus:ring-2 focus:ring-[#040404] focus:border-transparent"
                placeholder="Masukkan password (min. 6 karakter)"
                required
                minLength={6}
              />
              <p className="text-sm text-[#040404]/70 mt-2">
                Password minimal 6 karakter
              </p>
            </div>

            {/* Profile Photo Info */}
            <div className="bg-[#F3F3F3] rounded-xl p-4">
              <p className="text-sm text-[#040404]/70">
                <strong>Foto Profil:</strong> Akan menggunakan foto default (
                <code className="bg-white px-2 py-1 rounded">/img/defaultProfile.png</code>)
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="flex-1 rounded-xl border border-[#040404]/20 bg-white px-6 py-3 text-center text-base font-semibold text-[#040404] transition-colors hover:bg-[#F3F3F3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-[#040404] px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Menambahkan..." : "Tambah Admin"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

