"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminSidebarProps {
  activeMenu?: "projects" | "profile-setting" | "new" | "add-admin";
}

export function AdminSidebar({ activeMenu = "projects" }: AdminSidebarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Burger Menu Button - Mobile Only */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 left-4 z-50 flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-full border border-[#16C47F]/30 bg-white text-[#040404] shadow-sm transition-colors hover:border-[#16C47F] md:hidden"
        aria-label="Toggle navigation"
      >
        <span
          className={`block h-[2px] w-6 bg-[#040404] transition-transform duration-200 ${
            isMenuOpen ? "translate-y-[6px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-[#040404] transition-opacity duration-200 ${
            isMenuOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-[#040404] transition-transform duration-200 ${
            isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Backdrop Overlay - Mobile Only */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[#040404] flex flex-col z-30 transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
      {/* Top Section - Admin Panel Title */}
      <div className="px-6 py-8">
        <h2 className="text-xl font-semibold text-white text-center">
          Admin Panel
        </h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => {
                router.push("/admin");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-r-xl transition-colors ${
                activeMenu === "projects"
                  ? "bg-white text-[#040404] font-medium"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Projects
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                router.push("/admin/profile-setting");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-r-xl transition-colors ${
                activeMenu === "profile-setting"
                  ? "bg-white text-[#040404] font-medium"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Profile Setting
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                router.push("/admin/add-admin");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-r-xl transition-colors ${
                activeMenu === "add-admin"
                  ? "bg-white text-[#040404] font-medium"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Tambah Admin
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#A1EE11] px-4 py-3 text-[#040404] font-semibold transition-transform hover:scale-[1.02]"
        >
          Logout
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="#040404"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </aside>
    </>
  );
}

