export interface Project {
  id: number | string;
  slug?: string;
  author: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  image?: string; // Optional - only set if image exists in database
  images?: string[]; // Array of all images from database
  avatar: string;
  content?: string;
}

// Interface untuk data dari Apps Script
interface AppsScriptProject {
  id: string;
  slug?: string;
  judul: string;
  penulis: string;
  konten: string;
  gambar: string[];
  tanggal: string;
  profilePhoto?: string;
}

// Helper function to strip HTML tags and clean text
// This function aggressively removes ALL HTML tags and attributes
function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  let text = html;
  
  // Use DOM parser if available (browser environment) - this is the most reliable
  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${text}</div>`, 'text/html');
      // Extract only text content, which automatically removes all HTML tags
      const div = doc.body.querySelector('div');
      text = div ? (div.textContent || div.innerText || '') : '';
      
      // If we got clean text, return it
      if (text && !text.includes('<') && !text.includes('>')) {
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();
        return text;
      }
    } catch (e) {
      // Fallback to regex if DOM parser fails
      console.warn('DOMParser failed, using regex fallback:', e);
    }
  }
  
  // Aggressive regex-based cleaning (works in both browser and server)
  // Multiple passes to ensure all tags are removed
  
  // Pass 1: Remove all HTML tags including attributes
  // This regex matches: <tag>, </tag>, <tag attr="value">, <tag/>, <div>, <p>, etc.
  text = text.replace(/<[^>]+>/g, '');
  
  // Pass 2: Remove any remaining HTML-like patterns (encoded tags)
  text = text.replace(/&lt;[^&]*&gt;/g, '');
  text = text.replace(/&lt;\/?[^&]*&gt;/g, '');
  
  // Pass 3: Remove incomplete tags (opening or closing)
  text = text.replace(/<[^>]*/g, '');
  text = text.replace(/[^<]*>/g, '');
  
  // Pass 4: Remove any remaining < or > characters
  text = text.replace(/[<>]/g, '');
  
  // Decode HTML entities - do this AFTER removing tags
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=');
  
  // Decode numeric HTML entities (&#123; format)
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  // Decode hex HTML entities (&#x1F; format)
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Final aggressive cleanup: Remove any remaining HTML-like patterns
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/[<>]/g, '');
  
  // Clean up whitespace and format as readable paragraphs
  text = text
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/\n\s*\n/g, ' ') // Multiple newlines to single space
    .replace(/\t/g, ' ') // Tabs to spaces
    .trim();
  
  return text;
}

// Helper function to extract first few sentences
function extractFirstSentences(text: string, maxSentences: number = 2): string {
  if (!text) return '';
  
  // Split by sentence endings (. ! ?)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    // If no sentence endings found, return first 150 characters
    return text.substring(0, 150).trim() + (text.length > 150 ? '...' : '');
  }
  
  // Take first maxSentences sentences
  const selectedSentences = sentences.slice(0, maxSentences).join(' ').trim();
  
  // If the selected text is too long, truncate it
  if (selectedSentences.length > 200) {
    return selectedSentences.substring(0, 200).trim() + '...';
  }
  
  return selectedSentences;
}

// Helper function to extract first few paragraphs (multiple sentences)
function extractFirstParagraphs(text: string, maxLength: number = 400): string {
  if (!text) return '';
  
  // Split by sentence endings (. ! ?)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    // If no sentence endings found, return first maxLength characters
    return text.substring(0, maxLength).trim() + (text.length > maxLength ? '...' : '');
  }
  
  // Take sentences until we reach maxLength
  let result = '';
  for (const sentence of sentences) {
    if (result.length + sentence.length > maxLength) {
      break;
    }
    result += sentence + ' ';
  }
  
  // Trim and add ellipsis if there's more content
  result = result.trim();
  if (result.length < text.trim().length) {
    result += '...';
  }
  
  return result;
}

// Helper function to check if a string looks like a date
function looksLikeDate(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  
  const trimmed = str.trim();
  const datePatterns = [
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i,
    /GMT/i,
    /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
    /Waktu Indonesia/i,
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY or DD/MM/YYYY
    /\d{1,2}\/\d{1,2}\/\d{4}/, // Date pattern anywhere
    /(Mon|Tue|Wed|Thu|Fri|Sat|Sun).*GMT/i, // Day name followed by GMT
  ];
  
  return datePatterns.some(pattern => pattern.test(trimmed));
}

// Helper function to validate and sanitize image URL
function validateImageUrl(url: any): string {
  // If not a string, return default
  if (typeof url !== 'string') {
    return "/img/activities1.jpg";
  }
  
  // Trim whitespace
  url = url.trim();
  
  // If empty, return default
  if (!url) {
    return "/img/activities1.jpg";
  }
  
  // Check if it looks like a date string - silently reject (no warning)
  if (looksLikeDate(url)) {
    return "/img/activities1.jpg";
  }
  
  // If it's a relative path (starts with /), it's valid
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's an absolute URL, validate it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      // Try to construct URL to validate
      new URL(url);
      return url;
    } catch (e) {
      // Invalid URL, return default
      console.warn("Invalid image URL:", url);
      return "/img/activities1.jpg";
    }
  }
  
  // If it doesn't start with / or http, it might be a relative path
  // Add leading slash if missing
  if (!url.startsWith('/')) {
    return "/" + url;
  }
  
  return url;
}

// Transform data dari Apps Script ke format Project
export function transformProject(data: AppsScriptProject, index?: number): Project {
  try {
    // Validate input data
    if (!data) {
      console.error("transformProject: data is null or undefined");
      throw new Error("Invalid project data");
    }
    
    // Validate and sanitize gambar array
    let gambarArray: string[] = [];
    if (data.gambar) {
      if (Array.isArray(data.gambar)) {
        // Filter out invalid values, date strings, and validate each URL
        const filtered = data.gambar.filter((url: any) => {
          if (url == null || url === undefined || url === '') return false;
          if (typeof url === 'string' && looksLikeDate(url)) return false;
          return true;
        });
        
        // Validate each URL but keep original if validation fails (don't replace with default)
        gambarArray = filtered.map((url: any) => {
          if (typeof url === 'string') {
          const trimmed = url.trim();
          // If it's already a valid URL (http/https), use it directly
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            try {
              new URL(trimmed); // Validate URL format
              return trimmed;
            } catch (e) {
              console.warn("Invalid URL format:", trimmed);
              return null;
            }
          }
          // If it's a relative path, validate it
          if (trimmed.startsWith('/')) {
            return trimmed;
          }
          // Otherwise, try to validate
          const validated = validateImageUrl(trimmed);
          // Only use validated if it's not the default fallback
          return validated !== "/img/activities1.jpg" ? validated : null;
        }
        return null;
      }).filter((url): url is string => url !== null && url !== undefined);
      
      // If all images were invalid, use empty array
      if (gambarArray.length === 0) {
        gambarArray = [];
      }
    } else if (typeof data.gambar === 'string') {
      // Check if it's a date string first
      if (looksLikeDate(data.gambar)) {
        gambarArray = [];
      } else {
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(data.gambar);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((url: any) => {
              if (url == null || url === undefined || url === '') return false;
              if (typeof url === 'string' && looksLikeDate(url)) return false;
              return true;
            });
            
            gambarArray = filtered.map((url: any) => {
              if (typeof url === 'string') {
                const trimmed = url.trim();
                if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                  try {
                    new URL(trimmed);
                    return trimmed;
                  } catch (e) {
                    return null;
                  }
                }
                if (trimmed.startsWith('/')) {
                  return trimmed;
                }
                const validated = validateImageUrl(trimmed);
                return validated !== "/img/activities1.jpg" ? validated : null;
              }
              return null;
            }).filter((url): url is string => url !== null && url !== undefined);
          } else if (parsed && typeof parsed === 'string' && !looksLikeDate(parsed)) {
            const trimmed = parsed.trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
              try {
                new URL(trimmed);
                gambarArray = [trimmed];
              } catch (e) {
                gambarArray = [];
              }
            } else {
              const validated = validateImageUrl(trimmed);
              if (validated !== "/img/activities1.jpg") {
                gambarArray = [validated];
              }
            }
          }
        } catch (e) {
          // If not JSON and not a date, treat as single URL
          if (typeof data.gambar === 'string' && !looksLikeDate(data.gambar)) {
            const gambarStr = data.gambar as string;
            const trimmed = gambarStr.trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
              try {
                new URL(trimmed);
                gambarArray = [trimmed];
              } catch (e) {
                gambarArray = [];
              }
            } else {
              const validated = validateImageUrl(trimmed);
              if (validated !== "/img/activities1.jpg") {
                gambarArray = [validated];
              }
            }
          }
        }
      }
    }
  }
  
  // Debug logging
  if (data.gambar) {
    if (gambarArray.length === 0) {
      console.warn("No valid images found for project:", data.judul, "Original gambar:", data.gambar);
    } else {
      console.log("Project images loaded:", data.judul, "The main Images:", gambarArray);
    }
  }
  
  // Ambil gambar pertama sebagai image utama
  // JANGAN gunakan fallback ke default jika ada gambar dari database
  // Hanya gunakan default jika benar-benar tidak ada gambar
  const mainImage = gambarArray.length > 0 ? gambarArray[0] : null;
  
  // Debug: Log mainImage untuk memastikan sudah benar
  if (data.gambar && gambarArray.length === 0) {
    console.warn("Warning: gambar exists in database but no valid images found!", {
      judul: data.judul,
      originalGambar: data.gambar,
      gambarArray
    });
  }
  
  if (gambarArray.length > 0) {
    console.log("Project image from database:", data.judul, "mainImage:", mainImage);
  }
  
  // Gunakan profile photo dari user sebagai avatar, jika tidak ada gunakan gambar pertama atau default
  // Gunakan profile photo dari user sebagai avatar, jika tidak ada gunakan default
  const avatarImage = data.profilePhoto && data.profilePhoto.trim() 
    ? data.profilePhoto.trim() 
    : "/img/defaultProfile.png";
  
  // Debug: Log profile photo from database
  if (process.env.NODE_ENV === 'development') {
    console.log("Profile photo from DB for", data.penulis, ":", data.profilePhoto, "-> avatarImage:", avatarImage);
  }
  
  // Strip HTML untuk description dan subtitle
  // Use stripHtml which already does aggressive cleaning
  let textContent = stripHtml(data.konten || '');
  
  // Additional safety passes to ensure absolutely no HTML remains
  // Multiple aggressive passes - do this even if stripHtml already did it
  // This ensures server-side rendering also gets clean text
  
  // Pass 1: Remove all HTML tags (including nested, self-closing, with attributes)
  textContent = textContent.replace(/<[^>]+>/g, '');
  textContent = textContent.replace(/<[^>]*>/g, '');
  
  // Pass 2: Remove incomplete tags
  textContent = textContent.replace(/<[^>]*/g, '');
  textContent = textContent.replace(/[^<]*>/g, '');
  textContent = textContent.replace(/[<>]/g, '');
  
  // Pass 3: Remove HTML entities
  textContent = textContent
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Pass 4: Final cleanup - remove any remaining HTML-like patterns
  textContent = textContent.replace(/<[^>]+>/g, '');
  textContent = textContent.replace(/[<>]/g, '');
  
  // Clean up whitespace
  textContent = textContent.replace(/\s+/g, ' ').trim();
  
  // Ambil beberapa kalimat pertama sebagai subtitle (2-3 kalimat)
  let subtitle = extractFirstSentences(textContent, 3);
  
  // Final aggressive check: ensure subtitle has absolutely no HTML tags
  // Multiple passes on subtitle itself
  subtitle = subtitle.replace(/<[^>]+>/g, '');
  subtitle = subtitle.replace(/<[^>]*>/g, '');
  subtitle = subtitle.replace(/<[^>]*/g, '');
  subtitle = subtitle.replace(/[^<]*>/g, '');
  subtitle = subtitle.replace(/[<>]/g, '');
  subtitle = subtitle.replace(/&lt;/g, '').replace(/&gt;/g, '');
  subtitle = subtitle.replace(/\s+/g, ' ').trim();
  
  const finalSubtitle = subtitle;
  
  // Ambil beberapa paragraf pertama sebagai description (sekitar 500 karakter)
  const description = extractFirstParagraphs(textContent, 500);

  // Ensure tanggal is properly formatted
  let tanggal = "Unknown date";
  if (data.tanggal) {
    tanggal = data.tanggal.toString().trim();
    if (!tanggal) {
      tanggal = "Unknown date";
    }
  }

  // Ensure images array always contains valid images from database
  // JANGAN tambahkan default image ke array
  let finalImagesArray: string[] = gambarArray;
  
  // Debug: Log final images array
  if (data.gambar && finalImagesArray.length === 0) {
    console.warn("Final images array is empty for project:", data.judul, "Original gambar:", data.gambar);
  }

    return {
      id: parseInt(data.id) || index || 0,
      slug: data.slug || generateSlugFromTitle(data.judul || ""),
      author: data.penulis || "",
      title: data.judul || "",
      subtitle: finalSubtitle || subtitle, // Use final cleaned subtitle
      date: tanggal,
      description: description,
      image: mainImage || undefined, // Use undefined instead of default, let UI handle fallback
      images: finalImagesArray, // All images from database only
      avatar: avatarImage,
      content: data.konten || "", // Keep HTML content as-is for rendering
    };
  } catch (error) {
    console.error("Error in transformProject:", error, "Data:", data);
    // Return minimal valid project to prevent crash
    return {
      id: parseInt(data?.id) || index || 0,
      slug: data?.slug || '',
      author: data?.penulis || '',
      title: data?.judul || 'Untitled',
      subtitle: '',
      date: data?.tanggal || 'Unknown date',
      description: '',
      image: undefined,
      images: [],
      avatar: '/img/defaultProfile.png',
      content: data?.konten || '',
    };
  }
}

// Helper function to generate slug from title (client-side fallback)
function generateSlugFromTitle(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')   // Remove special characters except hyphens
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Remove leading hyphens
    .replace(/-+$/, '');         // Remove trailing hyphens
}

// Fetch projects from API
export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch("/api/projects", {
      method: "GET",
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      console.error("Failed to fetch projects:", response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data.projects && Array.isArray(data.projects)) {
      return data.projects.map((project: AppsScriptProject, index: number) => 
        transformProject(project, index + 1)
      );
    }

    return [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// Fetch single project by ID
export async function fetchProjectById(id: string | number): Promise<Project | null> {
  try {
    const response = await fetch(`/api/projects?id=${id}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch project:", response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return transformProject(data.data, parseInt(data.data.id));
    }

    return null;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    author: "Amanda",
    title: "Do Hard Things if You Want a Easy Life",
    subtitle: "The one skill that change everything",
    date: "Jun 14, Indonesia",
    description:
      "Our mission at the V Discovery Lab is to inspire and foster scientific curiosity. We are a passionate community of researchers driven by the desire to answer fundamental questions that transform how we perceive the world.",
    image: "/img/activities2.jpg",
    avatar: "/img/activities1.jpg",
    content: `Every emotional pain that you experience leaves behind a residue of pain that lives on in you. It merges with the pain from the past, which was already there, and becomes lodged in your mind and body. This, of course, includes the pain you suffered as a child, caused by the unconsciousness of the world into which you were born.

The accumulation of old and new emotional pain creates a "pain-body" in most people, an energy field that lives in the very cells of your body. The pain-body consists of trapped life-energy that has split off from your total energy field and has temporarily become autonomous through the unnatural process of mind identification. It has its own primitive intelligence, not unlike a cunning animal, and its aim is survival, just like every other entity in existence. And it can only survive if it gets you to unconsciously identify with it.

The pain-body wants more pain. It feeds on pain. Once the pain-body has taken you over, you want more pain. You become a victim or a perpetrator. You want to inflict pain, or you want to suffer pain, or both. There isn't really much difference between the two. You are not conscious of this, of course, and will vehemently claim that you don't want pain. But look closely and you will find that your thinking and behavior are designed to keep the pain going, for yourself and others. If you were truly conscious of it, the pattern would dissolve, for to want more pain is insanity, and nobody is consciously insane.`,
  },
  {
    id: 2,
    author: "Ary Fatah",
    title: "The AI Bubble Is About To Burst, But The Next Bubble Is Already Growing",
    subtitle: "Techbros are preparing their latest bandwagon.",
    date: "Sep 23, Indonesia",
    description:
      "Our mission at the V Discovery Lab is to inspire and foster scientific curiosity. We are a passionate community of researchers driven by the desire to answer fundamental questions that transform how we perceive the world.",
    image: "/img/activities1.jpg",
    avatar: "/img/activities2.jpg",
    content: `The AI hype cycle has reached its peak, and we're seeing the first signs of the bubble deflating. But as one bubble bursts, another is already inflating. Tech entrepreneurs and investors are always looking for the next big thing, and they've already identified their next target.

The pattern is familiar: overpromise, overhype, and then reality sets in. But the tech industry has learned to pivot quickly. Before the AI bubble fully bursts, they're already positioning the next revolutionary technology that will "change everything."

This cycle of hype and disappointment is not new, but it seems to be accelerating. The question is: will we learn from past mistakes, or will we continue to chase the next shiny object?`,
  },
  {
    id: 3,
    author: "Amanda",
    title: "Do Hard Things if You Want a Easy Life",
    subtitle: "The one skill that change everything",
    date: "Jun 14, Indonesia",
    description:
      "Our mission at the V Discovery Lab is to inspire and foster scientific curiosity. We are a passionate community of researchers driven by the desire to answer fundamental questions that transform how we perceive the world.",
    image: "/img/activities2.jpg",
    avatar: "/img/activities1.jpg",
    content: `The path of least resistance often leads to the most difficult outcomes. When we choose to do hard things now, we're investing in an easier future. This principle applies to every aspect of life: health, relationships, career, and personal growth.

The skill that changes everything is the ability to delay gratification and embrace discomfort. It's not about being a masochist, but about understanding that short-term pain leads to long-term gain.

When you develop this skill, you start to see challenges as opportunities. You begin to understand that the things that are hard now will make everything else easier later. This mindset shift is transformative.`,
  },
  {
    id: 4,
    author: "Ary Fatah",
    title: "The AI Bubble Is About To Burst, But The Next Bubble Is Already Growing",
    subtitle: "Techbros are preparing their latest bandwagon.",
    date: "Sep 23, Indonesia",
    description:
      "Our mission at the V Discovery Lab is to inspire and foster scientific curiosity. We are a passionate community of researchers driven by the desire to answer fundamental questions that transform how we perceive the world.",
    image: "/img/activities1.jpg",
    avatar: "/img/activities2.jpg",
    content: `As the AI investment frenzy shows signs of cooling, a new wave of excitement is building around quantum computing, biotechnology, and space technology. Each promises to be "the next big thing" that will revolutionize our world.

But history teaches us that most of these promises will fall short. The key is to separate genuine innovation from marketing hype. Real breakthroughs take time, and they don't always come from the most hyped technologies.

The challenge for investors, entrepreneurs, and consumers is to maintain a healthy skepticism while remaining open to genuine innovation. The next bubble might be different, but the pattern remains the same.`,
  },
];

export function getProjectById(id: number): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}





