"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchProjects, type Project } from "@/lib/projects";

export function MoreArticles() {
  const [articles, setArticles] = useState<Project[]>([]);

  useEffect(() => {
    async function loadArticles() {
      try {
        const projects = await fetchProjects();
        // Ambil 4 artikel pertama untuk ditampilkan di footer
        setArticles(projects.slice(0, 4));
      } catch (error) {
        console.error("Error loading articles:", error);
      }
    }
    loadArticles();
  }, []);

  return (
    <footer className="bg-[#F3F3F3] px-6 py-12 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-10 text-3xl font-semibold text-[#040404] sm:mb-12 sm:text-4xl">
          More Article
        </h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/portfolio/${article.id}`}
              className="group flex flex-col gap-5 transition-opacity hover:opacity-80"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F3F3F3]">
                {article.image || (article.images && article.images.length > 0) ? (
                  <img
                    src={article.image || (article.images && article.images[0]) || ""}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target && !target.dataset.failed) {
                        const retryCount = parseInt(target.dataset.retryCount || '0');
                        
                        if (retryCount < 2) {
                          target.dataset.retryCount = (retryCount + 1).toString();
                          setTimeout(() => {
                            const newSrc = target.src.split('?')[0] + `?retry=${Date.now()}`;
                            target.src = newSrc;
                          }, 1000 * (retryCount + 1));
                        } else {
                          target.dataset.failed = "true";
                          if (!target.dataset.logged) {
                            console.warn("Failed to load article image from R2 (SSL error possible):", target.src);
                            target.dataset.logged = "true";
                          }
                          // Keep image visible - don't hide
                        }
                      }
                    }}
                    onLoad={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.dataset.failed) {
                        delete target.dataset.failed;
                      }
                      if (target.dataset.retryCount) {
                        delete target.dataset.retryCount;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#040404]/30 text-sm">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 text-sm text-[#040404]/70">
                  <span
                    className="h-9 w-9 rounded-full border border-white/40 bg-cover bg-center shadow-md"
                    style={{ backgroundImage: `url(${article.avatar})` }}
                  />
                  <span className="font-semibold text-[#040404]">
                    {article.author}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xl font-semibold leading-tight text-[#040404] sm:text-2xl">
                    {article.title}
                  </h3>
                  <p className="text-sm leading-6 text-[#040404]/70 sm:text-base sm:leading-7">
                    {article.subtitle}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#040404]/70">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.99935 1.16797L8.45685 4.59964L12.1668 5.0113L9.24852 7.5438L10.0343 11.1805L6.99935 9.26047L3.96435 11.1805L4.75018 7.5438L1.83185 5.0113L5.54185 4.59964L6.99935 1.16797Z"
                        fill="#FBCB0A"
                        stroke="#FBCB0A"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{article.date.split(",")[0]}</span>
                  </div>
                  <button
                    type="button"
                    className="text-xl font-semibold leading-none text-[#040404]/50 transition-colors hover:text-[#040404]"
                    aria-label="More options"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    ⋯
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

