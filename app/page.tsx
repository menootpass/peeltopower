"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { fetchProjects, type Project } from "@/lib/projects";

const HERO_HEADING = "From Peel to Power";
const HERO_DESCRIPTION =
  "The Y Institute for Advanced Studies is dedicated to the in-depth exploration and synthesis of profound knowledge relevant to contemporary challenges. With a diverse team of researchers and state-of-the-art facilities, we strive to generate credible empirical data, robust theoretical analyses, and evidence-based solutions. Our areas of focus include [Mention 3-4 specific areas, e.g., socio-economic dynamics, sustainable biotechnology, and cybersecurity]. Visit our publications section to access our peer-reviewed research outcomes.";

// Helper function to ensure no HTML tags are visible
// This function aggressively removes ALL HTML tags and attributes
function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text;
  
  // Use DOM parser if available (browser environment) - this is the most reliable
  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${cleaned}</div>`, 'text/html');
      // Extract only text content, which automatically removes all HTML tags
      const div = doc.body.querySelector('div');
      cleaned = div ? (div.textContent || div.innerText || '') : '';
      
      // If we got clean text, clean up whitespace and return
      if (cleaned && !cleaned.includes('<') && !cleaned.includes('>')) {
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        return cleaned;
      }
    } catch (e) {
      // Fallback to regex if DOM parser fails
      console.warn('DOMParser failed, using regex fallback:', e);
    }
  }
  
  // Aggressive regex-based cleaning (works in both browser and server)
  // Multiple passes to ensure all tags are removed
  
  // Pass 1: Remove all HTML tags including attributes
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Remove any remaining HTML-like patterns
  cleaned = cleaned.replace(/&lt;[^&]*&gt;/g, '');
  cleaned = cleaned.replace(/&lt;\/?[^&]*&gt;/g, '');
  
  // Pass 3: Remove incomplete tags
  cleaned = cleaned.replace(/<[^>]*/g, '');
  cleaned = cleaned.replace(/[^<]*>/g, '');
  
  // Pass 4: Remove any remaining < or > characters
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
  
  // Final aggressive cleanup
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/[<>]/g, '');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from API
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        const fetchedProjects = await fetchProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 sm:px-10">
        <section className="relative mt-2 overflow-hidden rounded-[32px] bg-[#040404] shadow-xl sm:mt-6">
          <div className="absolute inset-0">
            <img
              src="/img/carousel.jpg"
              alt="Forest pathway bathed in warm sunlight"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                console.error("Failed to load carousel image:", target.src);
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,4,4,0.75)] via-[rgba(4,4,4,0.45)] to-[rgba(4,4,4,0.15)]" />
          <div className="relative z-10 flex min-h-[420px] flex-col justify-end gap-6 px-6 pb-12 pt-20 sm:min-h-[520px] sm:px-12 sm:pb-16 sm:pt-24 lg:min-h-[640px] lg:px-16 lg:pb-20 lg:pt-28">
            <a
              href="#"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#16C47F] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(22,196,127,0.35)] transition-transform hover:scale-[1.02]"
            >
              Read more our research
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6L8 11L13 6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl font-bold leading-tight drop-shadow-sm sm:text-4xl sm:leading-[1.2] lg:text-5xl">
                {HERO_HEADING}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/90 sm:text-base sm:leading-7">
                {HERO_DESCRIPTION}
              </p>
            </div>
          </div>
        </section>
        <section
          id="activities"
          className="scroll-mt-24"
        >
          <div className="mb-8 sm:mb-10">
            <h2 className="text-3xl font-semibold text-[#040404] sm:text-4xl">
              Our Activities
            </h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:gap-12">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-[#F3F3F3]">
              <img
                src="/img/activities1.jpg"
                alt="Children planting trees"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  console.error("Failed to load activities image:", target.src);
                }}
              />
            </div>
            <div className="flex flex-col gap-8">
              <div className="relative aspect-[5/3] overflow-hidden rounded-[24px] sm:aspect-[16/9] bg-[#F3F3F3]">
                <img
                  src="/img/activities2.jpg"
                  alt="Scenic countryside with a yellow van"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    console.error("Failed to load activities image:", target.src);
                  }}
                />
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-base leading-7 text-[#040404] sm:text-lg sm:leading-8">
                  <span className="text-lg font-semibold text-[#16C47F] sm:text-xl">Changing Our Lives</span> if we plants more trees for next generation.
                  This make the future more brighter.
                </p>
                <a
                  href="#"
                  className="inline-flex w-fit items-center gap-4 rounded-full bg-[#040404] px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] sm:px-7 sm:py-4 sm:text-lg"
                >
                  Follow Us
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A1EE11] sm:h-11 sm:w-11">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 12L12 6"
                        stroke="#040404"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6H12V12"
                        stroke="#040404"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="projects" className="scroll-mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[#040404] sm:text-4xl">
              See Our Projects &amp; Portofolio
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-[#040404]/80 sm:text-base sm:leading-7">
              Our mission at the V Discovery Lab is to{" "}
              <span className="font-semibold text-[#16C47F]">
                inspire and foster scientific
              </span>{" "}
              curiosity. We are a passionate community of researchers driven by the
              desire to answer fundamental questions that transform how we perceive
              the world.
            </p>
          </div>
          <div className="mt-12 space-y-12">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[#040404]/70">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[#040404]/70">No projects available yet.</p>
              </div>
            ) : (
              projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug || project.id}`}
                className={`block flex flex-col gap-6 border-b border-[#040404]/10 pb-10 transition-opacity hover:opacity-80 sm:flex-row sm:items-center sm:gap-10 ${
                  index === projects.length - 1 ? "border-b-0 pb-0" : ""
                }`}
              >
                <div className="flex flex-1 flex-col gap-5">
                  <div className="flex items-center gap-3 text-sm text-[#040404]/70">
                    <span
                      className="h-9 w-9 rounded-full border border-white/40 bg-cover bg-center shadow-md flex-shrink-0"
                      style={{ 
                        backgroundImage: `url(${project.avatar || '/img/activities2.jpg'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        const target = e.currentTarget as HTMLDivElement;
                        if (target) {
                          target.style.backgroundImage = 'url(/img/activities2.jpg)';
                        }
                      }}
                    />
                    <span className="font-semibold text-[#040404]">
                      {project.author}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-[#040404] sm:text-2xl leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-sm text-[#040404]/70 sm:text-base leading-relaxed line-clamp-4">
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
                      <span>{project.date}</span>
                    </div>
                    <button
                      type="button"
                      className="text-lg font-semibold text-[#040404]/50 transition-colors hover:text-[#040404]"
                      aria-label="More options"
                      onClick={(e) => e.preventDefault()}
                    >
                      ⋯
                    </button>
                  </div>
                </div>
                <div className="relative h-44 w-full overflow-hidden rounded-[20px] sm:h-40 sm:max-w-[240px] bg-[#F3F3F3]">
                  {project.image || (project.images && project.images.length > 0) ? (
                    <img
                      src={project.image || (project.images && project.images[0]) || ""}
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
                              console.warn("Failed to load project image from R2 (SSL error possible):", target.src);
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
              </Link>
              ))
            )}
          </div>
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-4 rounded-full bg-[#040404] px-6 py-3.5 text-base font-medium text-white shadow-md transition-transform hover:scale-[1.02] sm:px-8 sm:py-4 sm:text-lg"
            >
              Show More
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A1EE11] sm:h-12 sm:w-12">
                <ArrowUpRight size={18} weight="bold" color="#040404" />
              </span>
            </button>
          </div>
        </section>
        <section id="members" className="scroll-mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[#040404] sm:text-4xl">
              Our Members
            </h2>
          </div>
          <div className="mt-12 flex flex-col items-center justify-center gap-12 sm:flex-row sm:gap-8 lg:gap-12">
            {/* Dyah Kurniawati A. - Engineer */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-48 w-48 overflow-visible sm:h-56 sm:w-56">
                {/* Circular image container with clip-path to create cut-off effect */}
                <div
                  className="relative h-48 w-48 overflow-hidden rounded-full bg-white sm:h-56 sm:w-56"
                  style={{
                    clipPath: "circle(50% at 50% 50%)",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      // clipPath: "polygon(0% 0%, 100% 0%, 100% 82%, 0% 82%)",
                    }}
                  >
                    <img
                      src="/img/dyah2.png"
                      alt="Dyah Kurniawati A."
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        console.error("Failed to load member image:", target.src);
                      }}
                    />
                  </div>
                  {/* White overlay to create cut-off effect at bottom */}
                  {/* <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-white" /> */}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#16C47F]" />
                  <h3 className="text-lg font-semibold text-[#040404] sm:text-xl">
                    Dyah Kurniawati A.
                  </h3>
                </div>
                <p className="text-sm text-[#040404]/70 sm:text-base">
                  as a Engineer
                </p>
              </div>
            </div>

            {/* Wira Widyawidura - Captain */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-48 w-48 overflow-visible sm:h-56 sm:w-56">
                {/* Circular image container with clip-path to create cut-off effect */}
                <div
                  className="relative h-48 w-48 overflow-hidden rounded-full bg-white sm:h-56 sm:w-56"
                  style={{
                    clipPath: "circle(50% at 50% 50%)",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      // clipPath: "polygon(0% 12%, 100% 12%, 100% 100%, 0% 100%)",
                    }}
                  >
                    <img
                      src="/img/wira.png"
                      alt="Wira Widyawidura"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        console.error("Failed to load member image:", target.src);
                      }}
                    />
                  </div>
                  {/* White overlay to create cut-off effect at top */}
                  {/* <div className="absolute top-0 left-0 right-0 h-[12%] bg-white" /> */}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FBCB0A]" />
                  <h3 className="text-lg font-semibold text-[#040404] sm:text-xl">
                    Wira Widyawidura
                  </h3>
                </div>
                <p className="text-sm text-[#040404]/70 sm:text-base">
                  as a Captain
                </p>
              </div>
            </div>

            {/* Wipsar Sunu B. D. - Analyzer */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-48 w-48 overflow-visible sm:h-56 sm:w-56">
                {/* Circular image container with clip-path to create cut-off effect */}
                <div
                  className="relative h-48 w-48 overflow-hidden rounded-full bg-white sm:h-56 sm:w-56"
                  style={{
                    clipPath: "circle(50% at 50% 50%)",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      // clipPath: "polygon(6% 0%, 100% 0%, 100% 100%, 6% 100%)",
                    }}
                  >
                    <img
                      src="/img/brams.png"
                      alt="Wipsar Sunu B. D."
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        console.error("Failed to load member image:", target.src);
                      }}
                    />
                  </div>
                  {/* White overlay to create cut-off effect at left */}
                  {/* <div className="absolute top-0 bottom-0 left-0 w-[6%] bg-white" /> */}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#60A5FA]" />
                  <h3 className="text-lg font-semibold text-[#040404] sm:text-xl">
                    Wipsar Sunu B. D.
                  </h3>
                </div>
                <p className="text-sm text-[#040404]/70 sm:text-base">
                  as a Analyzer
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="mx-auto max-w-3xl text-sm leading-6 text-[#040404] sm:text-base sm:leading-7">
              We work together to reach our goals, that makes fuel from durian skin. That will change fuel industries and ecosystem, we found new alternative.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
