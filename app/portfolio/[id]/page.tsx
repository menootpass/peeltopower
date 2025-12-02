"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { Navbar } from "@/components/Navbar";
import { MoreArticles } from "@/components/MoreArticles";
import { Footer } from "@/components/Footer";
import { fetchProjectById, type Project } from "@/lib/projects";

// Helper function to ensure no HTML tags are visible
function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text;
  
  // Use DOM parser if available (browser environment)
  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${cleaned}</div>`, 'text/html');
      const div = doc.body.querySelector('div');
      cleaned = div ? (div.textContent || div.innerText || '') : '';
      
      if (cleaned && !cleaned.includes('<') && !cleaned.includes('>')) {
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        return cleaned;
      }
    } catch (e) {
      console.warn('DOMParser failed, using regex fallback:', e);
    }
  }
  
  // Aggressive regex-based cleaning
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  cleaned = cleaned.replace(/&lt;[^&]*&gt;/g, '');
  cleaned = cleaned.replace(/&lt;\/?[^&]*&gt;/g, '');
  cleaned = cleaned.replace(/<[^>]*/g, '');
  cleaned = cleaned.replace(/[^<]*>/g, '');
  cleaned = cleaned.replace(/[<>]/g, '');
  
  // Decode HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Final cleanup
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/[<>]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

export default function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      try {
        const fetchedProject = await fetchProjectById(id);
        setProject(fetchedProject);
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 py-24 sm:px-10">
          <p className="text-[#040404]/70">Loading project...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 py-24 sm:px-10">
          <h1 className="text-3xl font-semibold text-[#040404]">Project Not Found</h1>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 rounded-full bg-[#040404] px-6 py-3 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Back to Projects
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-6 sm:px-10 sm:pt-12">
        <Link
          href="/#projects"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#040404]/70 transition-colors hover:text-[#040404]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Projects
        </Link>

        <article className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-sm text-[#040404]/70">
              <span
                className="h-10 w-10 rounded-full border border-white/40 bg-cover bg-center shadow-md"
                style={{ backgroundImage: `url(${project.avatar})` }}
              />
              <span className="font-semibold text-[#040404]">
                {project.author}
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-[#040404] sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>
              <p className="text-lg text-[#040404]/70 sm:text-xl">
                {cleanText(project.subtitle)}
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#040404]/70">
              <div className="flex items-center gap-2">
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{project.date && project.date !== "Unknown date" ? project.date : "Unknown date"}</span>
              </div>
            </div>
          </div>

          {/* Display all project images */}
          {project.images && project.images.length > 0 ? (
            <div className="space-y-4">
              {/* Main image (first image) */}
              <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-[#F3F3F3]">
                {(project.images && project.images.length > 0) || project.image ? (
                  <img
                    src={project.images && project.images.length > 0 ? project.images[0] : (project.image || "")}
                    alt={project.title}
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
                            console.warn("Failed to load main image from R2 (SSL error possible):", target.src);
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
                  <div className="w-full h-full flex items-center justify-center text-[#040404]/30 text-lg">
                    No Image Available
                  </div>
                )}
              </div>
              
              {/* Additional images if available */}
              {project.images.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images.slice(1).map((imgUrl, index) => (
                    <div key={index} className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-[#F3F3F3]">
                      <img
                        src={imgUrl || "/img/activities1.jpg"}
                        alt={`${project.title} - Image ${index + 2}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target && !target.dataset.failed) {
                            target.dataset.failed = "true";
                            if (!target.dataset.logged) {
                              console.warn("Failed to load image, hiding:", target.src);
                              target.dataset.logged = "true";
                            }
                            target.style.display = 'none';
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.dataset.failed) {
                            delete target.dataset.failed;
                            target.style.display = '';
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Fallback to single image
            <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-[#F3F3F3]">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
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
                          console.warn("Failed to load image from R2 (SSL error possible):", target.src);
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
                <div className="w-full h-full flex items-center justify-center text-[#040404]/30 text-lg">
                  No Image Available
                </div>
              )}
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {project.content && (
              <div
                className="rich-content text-base leading-7 text-[#040404] sm:text-lg sm:leading-8"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            )}
          </div>
        </article>
      </main>
      <MoreArticles />
      <Footer />
    </div>
  );
}


