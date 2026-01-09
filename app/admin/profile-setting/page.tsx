"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  profilePhoto: string;
}

export default function ProfileSettingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  // Message states
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/users/profile", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setProfile(data.user);
            setUsername(data.user.username || "");
            // Add timestamp to bypass cache
            const profilePhoto = data.user.profilePhoto || "";
            setPreviewUrl(profilePhoto ? `${profilePhoto}?t=${Date.now()}` : "");
          }
        } else {
          setMessage({ type: "error", text: "Gagal memuat profil" });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setMessage({ type: "error", text: "Terjadi kesalahan saat memuat profil" });
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setMessage({ type: "error", text: "File harus berupa gambar" });
      }
    }
  };

  // Handle username update
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage({ type: "error", text: "Username tidak boleh kosong" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/users/update-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "Username berhasil diupdate" });
        if (profile) {
          setProfile({ ...profile, username: username.trim() });
        }
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mengupdate username" });
      }
    } catch (error) {
      console.error("Error updating username:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengupdate username" });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Semua field password wajib diisi" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password baru dan konfirmasi password tidak cocok" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/users/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "Password berhasil diupdate" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mengupdate password" });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengupdate password" });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile photo update
  const handleUpdateProfilePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({ type: "error", text: "Pilih foto profil terlebih dahulu" });
      return;
    }

    if (!profile?.username) {
      setMessage({ type: "error", text: "Username tidak ditemukan" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("username", profile.username);

      const response = await fetch("/api/admin/users/profile-photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Profile photo upload successful, URL:", data.url);
        setMessage({ type: "success", text: "Foto profil berhasil diupdate" });
        setSelectedFile(null);
        if (data.url) {
          // Validate URL before using
          try {
            const urlObj = new URL(data.url);
            console.log("Valid URL received:", urlObj.href);
            
            // Force update preview URL with timestamp to bypass cache
            const urlWithTimestamp = `${data.url}?t=${Date.now()}`;
            setPreviewUrl(urlWithTimestamp);
            if (profile) {
              setProfile({ ...profile, profilePhoto: data.url });
            }
            
            // Also reload profile to get fresh data
            setTimeout(async () => {
              try {
                const reloadResponse = await fetch("/api/admin/users/profile", {
                  method: "GET",
                  cache: "no-store",
                });
                if (reloadResponse.ok) {
                  const reloadData = await reloadResponse.json();
                  if (reloadData.success && reloadData.user) {
                    console.log("Profile reloaded, profilePhoto:", reloadData.user.profilePhoto);
                    setProfile(reloadData.user);
                    if (reloadData.user.profilePhoto) {
                      setPreviewUrl(`${reloadData.user.profilePhoto}?t=${Date.now()}`);
                    }
                  }
                }
              } catch (error) {
                console.error("Error reloading profile:", error);
              }
            }, 500);
          } catch (urlError) {
            console.error("Invalid URL received from server:", data.url, urlError);
            setMessage({ type: "error", text: "URL foto profil tidak valid. Silakan coba lagi." });
          }
        } else {
          console.warn("No URL returned from upload response");
        }
      } else {
        console.error("Upload failed:", data.error);
        setMessage({ type: "error", text: data.error || "Gagal mengupdate foto profil" });
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengupdate foto profil" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <AdminSidebar activeMenu="profile-setting" />
        <main className="flex-1 md:ml-64 bg-white min-h-screen flex items-center justify-center">
          <p className="text-[#040404]/70">Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebar activeMenu="profile-setting" />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 bg-white min-h-screen">
        <div className="p-8 max-w-4xl">
          <h1 className="text-3xl font-semibold text-[#040404] mb-8">
            Profile Setting
          </h1>

          {/* Message */}
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

          {/* Profile Photo Section */}
          <div className="bg-white border border-[#040404]/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#040404] mb-4">
              Foto Profil
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={
                    previewUrl 
                      ? previewUrl 
                      : (profile?.profilePhoto 
                          ? `${profile.profilePhoto}?t=${Date.now()}` 
                          : '/img/defaultProfile.png')
                  }
                  alt="Profile photo"
                  className="h-24 w-24 rounded-full border-2 border-[#040404]/20 object-cover flex-shrink-0 bg-[#F3F3F3]"
                  loading="eager"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    const defaultSrc = '/img/defaultProfile.png';
                    // Check if already using default to prevent infinite loop
                    if (target && !target.src.includes('defaultProfile.png') && !target.dataset.failed) {
                      target.dataset.failed = 'true';
                      console.warn("Failed to load profile photo (SSL/CORS error), using default:", target.src);
                      // Remove query string and try default
                      target.src = defaultSrc;
                    } else if (target && target.src.includes('defaultProfile.png')) {
                      // Already using default, don't log again
                      target.dataset.failed = 'true';
                    }
                  }}
                  onLoad={(e) => {
                    // Image loaded successfully
                    const target = e.currentTarget as HTMLImageElement;
                    // Clear failed flag if image loads
                    if (target.dataset.failed) {
                      delete target.dataset.failed;
                    }
                    if (!target.src.includes('defaultProfile.png')) {
                      console.log("Profile photo loaded successfully:", target.src);
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#F3F3F3] text-[#040404] font-medium hover:bg-[#E0E0E0] transition-colors mb-2"
                >
                  Pilih Foto
                </button>
                <p className="text-sm text-[#040404]/70">
                  Format: JPG, PNG. Maksimal 5MB
                </p>
                {selectedFile && (
                  <button
                    onClick={handleUpdateProfilePhoto}
                    disabled={isSaving}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#040404] text-white font-semibold hover:bg-[#040404]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Foto"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Username Section */}
          <div className="bg-white border border-[#040404]/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#040404] mb-4">
              Username
            </h2>
            <form onSubmit={handleUpdateUsername}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-[#040404] mb-2"
                >
                  Username
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
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#040404] text-white font-semibold hover:bg-[#040404]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Menyimpan..." : "Simpan Username"}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-white border border-[#040404]/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#040404] mb-4">
              Password
            </h2>
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-[#040404] mb-2"
                >
                  Password Lama
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#040404]/20 focus:outline-none focus:ring-2 focus:ring-[#040404] focus:border-transparent"
                  placeholder="Masukkan password lama"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#040404] mb-2"
                >
                  Password Baru
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#040404]/20 focus:outline-none focus:ring-2 focus:ring-[#040404] focus:border-transparent"
                  placeholder="Masukkan password baru (min. 6 karakter)"
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#040404] mb-2"
                >
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#040404]/20 focus:outline-none focus:ring-2 focus:ring-[#040404] focus:border-transparent"
                  placeholder="Konfirmasi password baru"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#040404] text-white font-semibold hover:bg-[#040404]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Menyimpan..." : "Simpan Password"}
              </button>
            </form>
          </div>

          {/* Email (Read-only) */}
          {profile && (
            <div className="bg-white border border-[#040404]/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[#040404] mb-4">
                Email
              </h2>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#040404] mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-[#040404]/20 bg-[#F3F3F3] text-[#040404]/70 cursor-not-allowed"
                />
                <p className="text-sm text-[#040404]/70 mt-2">
                  Email tidak dapat diubah
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

