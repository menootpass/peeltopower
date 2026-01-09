"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RichTextEditor } from "@/components/RichTextEditor";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function NewProjectPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState("");
  const [writer, setWriter] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load user profile to get username
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const response = await fetch("/api/admin/users/profile", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user && data.user.username) {
            setWriter(data.user.username);
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }
    loadUserProfile();
  }, []);

  // Update writerRef when writer state changes
  useEffect(() => {
    if (writer && writerRef.current && !writerRef.current.textContent) {
      writerRef.current.textContent = writer;
    }
  }, [writer]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const newImages = [...images, ...imageFiles];
      setImages(newImages);
      
      // Create previews for new images
      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const newImages = [...images, ...imageFiles];
      setImages(newImages);
      
      // Create previews for new images
      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to R2
  const uploadImagesToR2 = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("folder", "projects/images");

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
      } else {
          throw new Error(`Failed to upload image: ${image.name}`);
        }
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle contenteditable changes
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.textContent = title;
    }
  }, []);

  const handleContentChange = (ref: React.RefObject<HTMLDivElement | null>, setter: (value: string) => void) => {
    if (ref.current) {
      setter(ref.current.textContent || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Strip HTML tags for validation
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!title.trim() || !writer.trim() || !textContent) {
      setMessage({ type: "error", text: "Title, Writer, dan Konten wajib diisi" });
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Upload images to R2 first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setMessage({ type: "success", text: "Mengupload gambar..." });
        imageUrls = await uploadImagesToR2();
        setUploadedImageUrls(imageUrls);
      }

      // Step 2: Save project to Apps Script
      setMessage({ type: "success", text: "Menyimpan project..." });
      
      const projectData = {
        judul: title.trim(),
        penulis: writer.trim(),
        konten: content, // HTML content from rich text editor
        gambar: imageUrls, // Array of image URLs
      };

      console.log("Saving project:", {
        ...projectData,
        konten: content.substring(0, 50) + "...", // Log only first 50 chars
      });

      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      console.log("Save project response:", result);

      if (response.ok) {
        setMessage({ type: "success", text: "Project berhasil disimpan!" });
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Gagal menyimpan project" });
        console.error("Error saving project:", result);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat menyimpan project" });
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebar activeMenu="projects" />

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-white min-h-screen">
        <div className="p-12 max-w-4xl">
          {message && (
            <div
              className={`mb-6 rounded-xl px-4 py-3 ${
                message.type === "success"
                  ? "bg-[#16C47F]/10 text-[#16C47F]"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div className="relative">
              <div
                ref={titleRef}
                contentEditable
                onInput={() => handleContentChange(titleRef, setTitle)}
                onBlur={() => handleContentChange(titleRef, setTitle)}
                onFocus={() => {
                  if (titleRef.current && !title) {
                    titleRef.current.textContent = "";
                  }
                }}
                className={`text-4xl font-bold text-[#040404] outline-none min-h-[3rem] ${
                  !title ? "text-[#040404]/30" : ""
                }`}
                style={{
                  caretColor: "#040404",
                }}
                suppressContentEditableWarning={true}
              />
              {!title && (
                <div
                  className="absolute top-0 left-0 text-4xl font-bold text-[#040404]/30 pointer-events-none"
                  onClick={() => titleRef.current?.focus()}
                >
                  Title
                </div>
              )}
            </div>

            {/* Writer */}
            <div className="relative">
              <p className="text-sm text-[#040404]/70 mb-2">Writer : {writer}</p>
              <div
                ref={writerRef}
                contentEditable
                onInput={() => handleContentChange(writerRef, setWriter)}
                onBlur={() => handleContentChange(writerRef, setWriter)}
                onFocus={() => {
                  if (writerRef.current && !writer) {
                    writerRef.current.textContent = "";
                  }
                }}
                className={`text-lg text-[#040404] outline-none min-h-[1.5rem] ${
                  !writer ? "text-[#040404]/30" : ""
                }`}
                style={{
                  caretColor: "#040404",
                }}
                suppressContentEditableWarning={true}
              />
              {!writer && (
                <div
                  className="absolute top-0 left-0 text-lg text-[#040404]/30 pointer-events-none"
                  onClick={() => writerRef.current?.focus()}
                >
                  Writer
                </div>
              )}
            </div>

            {/* Rich Text Editor for Content */}
            <div>
              <p className="text-sm text-[#040404]/70 mb-2">Konten</p>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Tulis konten project di sini... (Bold, Italic, List, dll)"
                className="min-h-[16rem]"
              />
            </div>

            {/* Images Upload - Drag and Drop (Multiple) */}
            <div>
              <p className="text-sm text-[#040404]/70 mb-2">Gambar Project (only 1 image)</p>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : imagePreviews.length > 0
                    ? "border-[#040404]/20"
                    : "border-[#040404]/20 hover:border-[#040404]/40"
                }`}
              >
                {imagePreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#F3F3F3]">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                console.error("Failed to load preview image:", target.src);
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 justify-center">
                      <label className="px-4 py-2 rounded-lg bg-[#040404] text-white hover:bg-[#040404]/90 cursor-pointer transition-colors">
                        Tambah Gambar
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileInput}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <svg
                        className="mx-auto h-12 w-12 text-[#040404]/40"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-[#040404] font-medium">
                            Drag and drop gambar, atau klik untuk memilih (bisa multiple)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileInput}
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/admin"
                className="flex-1 rounded-xl border border-[#040404]/20 bg-white px-6 py-3 text-center text-base font-semibold text-[#040404] transition-colors hover:bg-[#F3F3F3]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 rounded-xl bg-[#040404] px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading
                  ? "Mengupload gambar..."
                  : isSubmitting
                  ? "Menyimpan..."
                  : "Publish"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
