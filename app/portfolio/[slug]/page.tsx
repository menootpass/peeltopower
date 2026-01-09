"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MoreArticles } from "@/components/MoreArticles";
import { Footer } from "@/components/Footer";
import { fetchProjectBySlug, type Project } from "@/lib/projects";
import { getProxyImageUrl } from "@/lib/image-proxy";

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/admin/users/profile", {
          method: "GET",
          cache: "no-store",
        });
        if (response.ok) {
          setIsAdmin(true);
        }
      } catch (error) {
        // User is not admin, that's fine
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      try {
        const fetchedProject = await fetchProjectBySlug(slug);
        setProject(fetchedProject);
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [slug]);

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
            href={isAdmin ? "/admin" : "/#projects"}
            className="inline-flex items-center gap-2 rounded-full bg-[#040404] px-6 py-3 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            {isAdmin ? "Back to Admin Panel" : "Back to Projects"}
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
          href={isAdmin ? "/admin" : "/#projects"}
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
          {isAdmin ? "Back to Admin Panel" : "Back to Projects"}
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
                  <>
                    <img
                      src={getProxyImageUrl(project.images && project.images.length > 0 ? project.images[0] : (project.image || ""))}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target && !target.dataset.failed) {
                          // If using proxy and it fails, try original URL as fallback
                          const currentSrc = target.src;
                          if (currentSrc.includes('/api/image-proxy')) {
                            // Extract original URL from proxy URL
                            try {
                              const urlParams = new URLSearchParams(currentSrc.split('?')[1]);
                              const originalUrl = urlParams.get('url');
                              if (originalUrl) {
                                target.dataset.retryCount = "1";
                                target.src = originalUrl;
                                return;
                              }
                            } catch (e) {
                              // If extraction fails, show placeholder
                            }
                          }
                          // Final fallback: show placeholder
                          target.dataset.failed = "true";
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
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
                        // Hide placeholder if image loads successfully
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[#040404]/30 text-base bg-[#F3F3F3]" style={{ display: 'none' }}>
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 text-[#040404]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Image tidak dapat dimuat</span>
                      </div>
                    </div>
                  </>
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
                        src={getProxyImageUrl(imgUrl) || "/img/activities1.jpg"}
                        alt={`${project.title} - Image ${index + 2}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target && !target.dataset.failed) {
                            // If using proxy and it fails, try original URL as fallback
                            const currentSrc = target.src;
                            if (currentSrc.includes('/api/image-proxy')) {
                              try {
                                const urlParams = new URLSearchParams(currentSrc.split('?')[1]);
                                const originalUrl = urlParams.get('url');
                                if (originalUrl) {
                                  target.dataset.retryCount = "1";
                                  target.src = originalUrl;
                                  return;
                                }
                              } catch (e) {
                                // If extraction fails, show placeholder
                              }
                            }
                            target.dataset.failed = "true";
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.dataset.failed) {
                            delete target.dataset.failed;
                            target.style.display = '';
                          }
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'none';
                          }
                        }}
                      />
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[#040404]/30 text-sm bg-[#F3F3F3]" style={{ display: 'none' }}>
                        <div className="text-center px-2">
                          <svg className="w-12 h-12 mx-auto mb-1 text-[#040404]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Image</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Fallback to single image
            <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-[#F3F3F3]">
              {project.image ? (
                <>
                  <img
                    src={getProxyImageUrl(project.image)}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target && !target.dataset.failed) {
                        // If using proxy and it fails, try original URL as fallback
                        const currentSrc = target.src;
                        if (currentSrc.includes('/api/image-proxy')) {
                          try {
                            const urlParams = new URLSearchParams(currentSrc.split('?')[1]);
                            const originalUrl = urlParams.get('url');
                            if (originalUrl) {
                              target.dataset.retryCount = "1";
                              target.src = originalUrl;
                              return;
                            }
                          } catch (e) {
                            // If extraction fails, show placeholder
                          }
                        }
                        target.dataset.failed = "true";
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
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
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'none';
                      }
                    }}
                  />
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[#040404]/30 text-base bg-[#F3F3F3]" style={{ display: 'none' }}>
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 text-[#040404]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Image tidak dapat dimuat</span>
                    </div>
                  </div>
                </>
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

