"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#040404] px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-12 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          {/* Top-Left: Brand & Description */}
          <div className="flex flex-col gap-6 sm:max-w-md">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              DurGo.
            </h2>
            <p className="text-sm leading-7 text-white sm:text-base sm:leading-8">
              Transforming durian and fruit waste into sustainable bio-materials for inclusive communities and climate resilience.
            </p>
          </div>

          {/* Mid-Right: Navigation Links */}
          <div className="flex flex-col gap-8 sm:items-end">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:gap-x-12">
              <Link
                href="#"
                className="text-sm text-white underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-base"
              >
                Member
              </Link>
              <Link
                href="/#activities"
                className="text-sm text-white underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-base"
              >
                Activities
              </Link>
              <Link
                href="#"
                className="text-sm text-white underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-base"
              >
                Documentations
              </Link>
              <Link
                href="/#projects"
                className="text-sm text-white underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-base"
              >
                Projects
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom-Left: Copyright */}
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20">
          <p className="text-xs text-white sm:text-sm">
            2025 Copyright
          </p>
        </div>
      </div>
    </footer>
  );
}
