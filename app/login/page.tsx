"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to admin panel
        router.push("/admin");
      } else {
        setError(result.error || "Login gagal");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat login");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-16 sm:px-10 sm:py-24">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-[#040404] sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-[#040404]/70 sm:text-base">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#040404]"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#040404]/20 bg-white px-4 py-3 text-base text-[#040404] transition-colors focus:border-[#16C47F] focus:outline-none focus:ring-2 focus:ring-[#16C47F]/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#040404]"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#040404]/20 bg-white px-4 py-3 text-base text-[#040404] transition-colors focus:border-[#16C47F] focus:outline-none focus:ring-2 focus:ring-[#16C47F]/20"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#040404]/20 text-[#16C47F] focus:ring-[#16C47F]"
                />
                <span className="text-sm text-[#040404]/70">
                  Remember me
                </span>
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-[#16C47F] transition-colors hover:text-[#16C47F]/80"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#040404] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#040404]/70">
              Don't have an account?{" "}
              <Link
                href="#"
                className="font-semibold text-[#16C47F] transition-colors hover:text-[#16C47F]/80"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


