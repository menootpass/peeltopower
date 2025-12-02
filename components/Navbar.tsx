"use client";

import { useState } from "react";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Home", href: "/", isActive: true },
  { label: "Discover", href: "/#activities", isActive: false },
  { label: "Projects", href: "/#projects", isActive: false },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
      <div className="flex items-center gap-3">
        <Image
          src="/svg/unyLogo.svg"
          alt="Universitas Negeri Yogyakarta logo"
          width={56}
          height={56}
          priority
        />
      </div>
      <nav
        className={`${
          isMenuOpen
            ? "absolute left-0 right-0 top-full flex flex-col items-center gap-6 rounded-2xl bg-white px-6 py-6 shadow-lg sm:static sm:flex sm:h-auto sm:w-auto sm:flex-row sm:gap-10 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none"
            : "hidden sm:flex sm:items-center sm:gap-10"
        } text-base text-[#040404]`}
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`transition-colors hover:text-[#16C47F] ${
              item.isActive ? "font-semibold text-[#040404]" : "font-medium"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        {isMenuOpen && (
          <a
            href="/login"
            className="w-full rounded-full bg-[#A1EE11] px-5 py-2 text-center text-sm font-semibold text-[#040404] transition-colors hover:bg-[#16C47F] sm:hidden"
          >
            Login/Sign Up
          </a>
        )}
      </nav>
      <a
        href="/login"
        className="hidden rounded-full bg-[#A1EE11] px-5 py-2 text-sm font-semibold text-[#040404] transition-colors hover:bg-[#16C47F] sm:inline-flex sm:px-6 sm:py-2.5"
      >
        Login/Sign Up
      </a>
      <button
        type="button"
        aria-label="Toggle navigation"
        className="flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-full border border-[#16C47F]/30 bg-white text-[#040404] shadow-sm transition-colors hover:border-[#16C47F] sm:hidden"
        onClick={() => setIsMenuOpen((prev) => !prev)}
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
    </header>
  );
}

