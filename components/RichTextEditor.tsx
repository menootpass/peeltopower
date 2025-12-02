"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Konten...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Function to clean HTML by removing unwanted attributes
  const cleanHtml = useCallback((html: string): string => {
    if (!html || typeof html !== 'string') return '';
    
    // Use DOMParser to parse and clean HTML
    if (typeof window !== 'undefined' && window.DOMParser) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove all data-* attributes and other unwanted attributes
        const removeAttributes = (element: Element) => {
          // Get all attributes
          const attrs = Array.from(element.attributes);
          attrs.forEach(attr => {
            // Remove ALL data-* attributes (including data-path-to-node)
            if (attr.name.startsWith('data-')) {
              element.removeAttribute(attr.name);
            }
            // Remove style attributes that don't contain text-align
            else if (attr.name === 'style' && !attr.value.includes('text-align')) {
              element.removeAttribute(attr.name);
            }
          });
          
          // Recursively clean child elements
          Array.from(element.children).forEach(child => {
            removeAttributes(child);
          });
        };
        
        // Clean all elements in the document
        const walker = (node: Node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            removeAttributes(node as Element);
          }
          // Recursively process all child nodes
          Array.from(node.childNodes).forEach(child => walker(child));
        };
        
        // Start from body and clean all nodes
        walker(doc.body);
        
        return doc.body.innerHTML;
      } catch (e) {
        console.warn('Failed to clean HTML with DOMParser:', e);
      }
    }
    
    // Fallback: Use regex to remove data-* attributes (more aggressive)
    // This regex matches: data-anything="anything" or data-anything='anything'
    let cleaned = html.replace(/\s+data-[^=]*=(["'])[^"']*\1/gi, '');
    // Also handle unquoted attributes
    cleaned = cleaned.replace(/\s+data-[^=]*=[^\s>]*/gi, '');
    
    return cleaned;
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      // Clean the HTML before setting it
      const cleanedValue = cleanHtml(value);
      if (cleanedValue !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = cleanedValue;
      }
    }
  }, [value, cleanHtml]);

  const handleInput = () => {
    if (editorRef.current) {
      const rawHtml = editorRef.current.innerHTML;
      // Clean HTML before passing to onChange
      const cleanedHtml = cleanHtml(rawHtml);
      
      // Always update the editor with cleaned HTML to remove attributes
      // This ensures data-path-to-node and other unwanted attributes are removed
      if (cleanedHtml !== rawHtml) {
        // Save cursor position
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const cursorOffset = range?.startOffset || 0;
        const cursorNode = range?.startContainer;
        
        // Update with cleaned HTML
        editorRef.current.innerHTML = cleanedHtml;
        
        // Restore cursor position if possible
        if (range && cursorNode) {
          try {
            const newRange = document.createRange();
            const textNodes = getTextNodes(editorRef.current);
            if (textNodes.length > 0) {
              const targetNode = textNodes[0];
              const offset = Math.min(cursorOffset, targetNode.textContent?.length || 0);
              newRange.setStart(targetNode, offset);
              newRange.setEnd(targetNode, offset);
              selection?.removeAllRanges();
              selection?.addRange(newRange);
            }
          } catch (e) {
            // If cursor restoration fails, just focus the editor
            editorRef.current.focus();
          }
        }
      }
      
      // Pass cleaned HTML to onChange
      onChange(cleanedHtml);
    }
  };
  
  // Helper function to get all text nodes
  const getTextNodes = (node: Node): Text[] => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );
    let textNode;
    while ((textNode = walker.nextNode())) {
      textNodes.push(textNode as Text);
    }
    return textNodes;
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const ToolbarButton = ({
    onClick,
    children,
    title,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-3 py-2 rounded hover:bg-[#F3F3F3] transition-colors text-[#040404]"
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );

  return (
    <div className={`border border-[#040404]/20 rounded-xl overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-[#F3F3F3] border-b border-[#040404]/10 flex-wrap">
        <ToolbarButton onClick={() => execCommand("bold")} title="Bold (Ctrl+B)">
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("italic")} title="Italic (Ctrl+I)">
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("underline")} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </ToolbarButton>
        <div className="w-px h-6 bg-[#040404]/20 mx-1" />
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "h1")}
          title="Heading 1"
        >
          <span className="text-sm font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "h2")}
          title="Heading 2"
        >
          <span className="text-sm font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "h3")}
          title="Heading 3"
        >
          <span className="text-sm font-bold">H3</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "p")}
          title="Paragraph"
        >
          <span className="text-sm">P</span>
        </ToolbarButton>
        <div className="w-px h-6 bg-[#040404]/20 mx-1" />
        <ToolbarButton
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="2" cy="4" r="1" fill="currentColor"/>
            <circle cx="2" cy="8" r="1" fill="currentColor"/>
            <circle cx="2" cy="12" r="1" fill="currentColor"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <text x="2" y="6" fontSize="10" fill="currentColor">1.</text>
            <text x="2" y="10" fontSize="10" fill="currentColor">2.</text>
            <text x="2" y="14" fontSize="10" fill="currentColor">3.</text>
          </svg>
        </ToolbarButton>
        <div className="w-px h-6 bg-[#040404]/20 mx-1" />
        <ToolbarButton
          onClick={() => execCommand("justifyLeft")}
          title="Align Left"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("justifyCenter")}
          title="Align Center"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("justifyRight")}
          title="Align Right"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolbarButton>
        <div className="w-px h-6 bg-[#040404]/20 mx-1" />
        <ToolbarButton
          onClick={() => execCommand("removeFormat")}
          title="Remove Formatting"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`min-h-[12rem] p-4 text-base text-[#040404] outline-none leading-relaxed ${
            !value && !isFocused ? "text-[#040404]/30" : ""
          }`}
          style={{
            caretColor: "#040404",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />
        {!value && !isFocused && (
          <div
            className="absolute top-4 left-4 text-base text-[#040404]/30 pointer-events-none"
            onClick={() => editorRef.current?.focus()}
          >
            {placeholder}
          </div>
        )}
      </div>

      <style jsx global>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: rgba(4, 4, 4, 0.3);
          pointer-events: none;
        }
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
}

