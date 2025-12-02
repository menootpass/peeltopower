"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { transformProject, type Project } from "@/lib/projects";
import { AdminSidebar } from "@/components/AdminSidebar";

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
  
  // Pass 2: Remove any remaining HTML-like patterns
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

interface EditDeletePopupProps {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface EditDeletePopupPropsWithUser extends EditDeletePopupProps {
  currentUsername?: string;
}

function EditDeletePopup({ project, onClose, onEdit, onDelete, currentUsername }: EditDeletePopupPropsWithUser) {
  const canEdit = !currentUsername || project.author === currentUsername;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 min-w-[280px]">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#040404] mb-4">
            Options
          </h3>
          <div className="flex flex-col gap-3">
            {canEdit ? (
              <>
                <button
                  onClick={onEdit}
                  className="text-left px-4 py-2 rounded-xl hover:bg-[#F3F3F3] text-[#040404] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="text-left px-4 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                >
                  Delete
                </button>
              </>
            ) : (
              <p className="text-sm text-[#040404]/70 px-4 py-2">
                Anda hanya dapat mengedit project yang Anda buat sendiri
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 rounded-xl bg-[#F3F3F3] text-[#040404] hover:bg-[#E0E0E0] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [authorPhotos, setAuthorPhotos] = useState<Record<string, string>>({});
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMyProjectsOnly, setShowMyProjectsOnly] = useState<boolean>(false);

  // Fetch current user profile
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/admin/users/profile", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user && data.user.username) {
            setCurrentUsername(data.user.username);
          }
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    }
    loadCurrentUser();
  }, []);

  // Fetch projects from API (admin route with auth)
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        // Load projects first (don't wait for profile photos)
        const response = await fetch("/api/admin/projects", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.projects && Array.isArray(data.projects)) {
            try {
              const transformedProjects = data.projects.map((project: any, index: number) => {
                try {
                  return transformProject(project, index + 1);
                } catch (transformError) {
                  console.error(`Error transforming project ${index + 1}:`, transformError, project);
                  // Return a minimal valid project object to prevent crash
                  return {
                    id: project.id || index + 1,
                    slug: project.slug || '',
                    author: project.penulis || '',
                    title: project.judul || 'Untitled',
                    subtitle: '',
                    date: project.tanggal || 'Unknown date',
                    description: '',
                    image: undefined,
                    images: [],
                    avatar: '/img/defaultProfile.png',
                    content: project.konten || '',
                  };
                }
              });
              
              // Set projects immediately for faster display
              setAllProjects(transformedProjects);
              setProjects(transformedProjects);
              setIsLoading(false); // Stop loading immediately
            } catch (transformError) {
              console.error("Error transforming projects:", transformError);
              console.error("Transform error details:", transformError instanceof Error ? transformError.message : String(transformError));
              setIsLoading(false);
              return;
            }

            // Fetch profile photos in background (non-blocking)
            // Use allProjects which was just set
            const uniqueAuthors: string[] = Array.from(new Set(allProjects.map((p: Project) => p.author)));
            
            // Fetch all photos in parallel with timeout
            const photoPromises = uniqueAuthors.map(async (author: string) => {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
                
                const photoResponse = await fetch(
                  `/api/admin/users/profile-photo-by-username?username=${encodeURIComponent(author)}`,
                  { 
                    cache: "no-store",
                    signal: controller.signal
                  }
                );
                clearTimeout(timeoutId);
                
                if (photoResponse.ok) {
                  const photoData = await photoResponse.json() as { profilePhoto?: string };
                  return { author, photo: photoData.profilePhoto || "" };
                }
              } catch (error) {
                // Silently fail - use default photo
              }
              return { author, photo: "" };
            });

            // Update photos when ready (non-blocking)
            Promise.all(photoPromises).then((photos) => {
              const photoMap: Record<string, string> = {};
              photos.forEach(({ author, photo }) => {
                photoMap[author] = photo;
              });
              setAuthorPhotos(photoMap);
            });
          }
        } else {
          console.error("Failed to fetch projects:", response.statusText);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Filter and search projects
  useEffect(() => {
    let filtered = [...allProjects];

    // Filter by current user's projects
    if (showMyProjectsOnly && currentUsername) {
      filtered = filtered.filter((project) => project.author === currentUsername);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((project) => {
        const titleMatch = project.title.toLowerCase().includes(query);
        const subtitleMatch = project.subtitle.toLowerCase().includes(query);
        const authorMatch = project.author.toLowerCase().includes(query);
        return titleMatch || subtitleMatch || authorMatch;
      });
    }

    setProjects(filtered);
  }, [allProjects, showMyProjectsOnly, currentUsername, searchQuery]);

  const handleEdit = (project: Project) => {
    // Check if current user is the owner
    if (currentUsername && project.author !== currentUsername) {
      alert("Anda hanya dapat mengedit project yang Anda buat sendiri");
      setShowPopup(false);
      setSelectedProject(null);
      return;
    }
    setSelectedProject(project);
    setShowPopup(false);
    // Navigate to edit page
    router.push(`/admin/edit/${project.id}`);
  };

  const handleDelete = async (projectId: number | string) => {
    if (confirm("Apakah Anda yakin ingin menghapus project ini? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        const response = await fetch(`/api/admin/projects?id=${projectId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Remove from local state
          setProjects((prev) => prev.filter((p) => p.id !== projectId));
          setShowPopup(false);
          setSelectedProject(null);
        } else {
          const result = await response.json();
          alert(result.error || "Gagal menghapus project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Terjadi kesalahan saat menghapus project");
      }
    }
  };

  const handleEllipsisClick = (project: Project) => {
    setSelectedProject(project);
    setShowPopup(true);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebar activeMenu="projects" />

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-white min-h-screen">
        <div className="p-8">
          {/* Header with Search, Filter, and Add New Button */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Search and Filter Row */}
            <div className="flex gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari project (judul, konten, atau penulis)..."
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-[#040404]/20 focus:outline-none focus:ring-2 focus:ring-[#040404] focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#040404]/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filter Toggle */}
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#040404]/20 cursor-pointer hover:bg-[#F3F3F3] transition-colors">
                <input
                  type="checkbox"
                  checked={showMyProjectsOnly}
                  onChange={(e) => setShowMyProjectsOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-[#040404]/20 text-[#040404] focus:ring-[#040404]"
                />
                <span className="text-sm font-medium text-[#040404]">
                  Project Saya Saja
                </span>
              </label>

              {/* Add New Button */}
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#040404] px-5 py-3 text-white font-semibold transition-transform hover:scale-[1.02] whitespace-nowrap"
              >
                Add New
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="#A1EE11"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* Results Count */}
            {!isLoading && (
              <p className="text-sm text-[#040404]/70">
                Menampilkan {projects.length} dari {allProjects.length} project
                {showMyProjectsOnly && currentUsername && ` (Filter: Project ${currentUsername})`}
              </p>
            )}
          </div>

          {/* Projects List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#040404]/70">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#040404]/70">No projects found. Create your first project!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => {
                // Prioritize: project.image -> project.images[0] -> no fallback (show placeholder)
                // JANGAN gunakan activities1.jpg sebagai fallback
                // Prioritize project.image, then project.images[0] - both come from database
                let displayImage: string | undefined = undefined;
                
                if (project.image && project.image.trim()) {
                  displayImage = project.image.trim();
                } else if (project.images && project.images.length > 0 && project.images[0] && project.images[0].trim()) {
                  displayImage = project.images[0].trim();
                }
                
                // Debug: Log project image from database
                if (process.env.NODE_ENV === 'development') {
                  console.log("Project:", project.title, "Image from DB:", project.image, "Images array from DB:", project.images, "Display Image:", displayImage);
                }
                return (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug || project.id}`}
                className="flex items-start gap-6 pb-6 border-b border-[#040404]/10 last:border-b-0 cursor-pointer hover:bg-[#F3F3F3]/50 transition-colors rounded-lg p-4 -m-4"
              >
                {/* Left Side - Author, Title, Subtitle, Date */}
                <div className="flex-1 flex flex-col gap-3">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <img
                      src={project.avatar || authorPhotos[project.author] || '/img/defaultProfile.png'}
                      alt={project.author}
                      className="h-9 w-9 rounded-full border border-white/40 object-cover shadow-md flex-shrink-0 bg-[#F3F3F3]"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target && target.src !== '/img/defaultProfile.png') {
                          console.warn("Failed to load profile photo:", target.src, "for author:", project.author);
                          target.src = '/img/defaultProfile.png';
                        }
                      }}
                      onLoad={() => {
                        if (process.env.NODE_ENV === 'development') {
                          console.log("Profile photo loaded successfully for", project.author, "from:", project.avatar);
                        }
                      }}
                    />
                    <span className="text-sm font-semibold text-[#040404]">
                      {project.author}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-[#040404]">
                    {project.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm text-[#040404]/70">
                    {cleanText(project.subtitle)}
                  </p>

                  {/* Date and Ellipsis */}
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
                      <span>{project.date}</span>
                    </div>
                    {currentUsername && project.author === currentUsername && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEllipsisClick(project);
                        }}
                        className="text-xl font-semibold text-[#040404]/50 hover:text-[#040404] transition-colors"
                        aria-label="More options"
                      >
                        ⋯
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side - Thumbnail Image */}
                <div className="relative h-32 w-48 overflow-hidden rounded-xl flex-shrink-0 bg-[#F3F3F3]">
                  {displayImage ? (
                    <img
                      src={displayImage.trim()}
                      alt={project.title || "Project image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target && !target.dataset.failed) {
                          const retryCount = parseInt(target.dataset.retryCount || '0');
                          
                          if (retryCount < 2) {
                            // Retry loading image (might be SSL error that can be bypassed)
                            target.dataset.retryCount = (retryCount + 1).toString();
                            setTimeout(() => {
                              const newSrc = target.src.split('?')[0] + `?retry=${Date.now()}`;
                              target.src = newSrc;
                            }, 1000 * (retryCount + 1));
                          } else {
                            target.dataset.failed = "true";
                            if (!target.dataset.logged) {
                              console.warn("Failed to load project image from R2 after retries (SSL error possible):", target.src);
                              console.warn("Image URL is valid but browser blocked due to SSL certificate error.");
                              console.warn("Solution: Use custom domain for R2 bucket or bypass SSL warning in browser.");
                              target.dataset.logged = "true";
                            }
                            // Don't hide - let browser show broken image or user can see the URL
                            // This way user knows there's an image but SSL is blocking it
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
                        console.log("Project image loaded successfully:", target.src);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#040404]/30 text-sm">
                      No Image
                    </div>
                  )}
                </div>
              </Link>
              );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit/Delete Popup */}
      {showPopup && selectedProject && (
        <EditDeletePopup
          project={selectedProject}
          currentUsername={currentUsername}
          onClose={() => {
            setShowPopup(false);
            setSelectedProject(null);
          }}
          onEdit={() => handleEdit(selectedProject)}
          onDelete={() => handleDelete(selectedProject.id)}
        />
      )}
    </div>
  );
}
