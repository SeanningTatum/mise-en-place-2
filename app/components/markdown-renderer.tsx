"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import mermaid from "mermaid";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";
import {
  IconCopy,
  IconCheck,
  IconInfoCircle,
  IconBulb,
  IconAlertTriangle,
  IconAlertCircle,
  IconFlame,
  IconLink,
} from "@tabler/icons-react";

// Initialize mermaid with comprehensive config for all diagram types
// Note: This is the default config, actual rendering uses config in MermaidBlock
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

// Admonition types configuration
const admonitionConfig = {
  note: {
    icon: IconInfoCircle,
    title: "Note",
    className: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-700 dark:text-blue-400",
  },
  tip: {
    icon: IconBulb,
    title: "Tip",
    className: "border-l-green-500 bg-green-50 dark:bg-green-950/30",
    iconClassName: "text-green-500",
    titleClassName: "text-green-700 dark:text-green-400",
  },
  info: {
    icon: IconInfoCircle,
    title: "Info",
    className: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-950/30",
    iconClassName: "text-cyan-500",
    titleClassName: "text-cyan-700 dark:text-cyan-400",
  },
  warning: {
    icon: IconAlertTriangle,
    title: "Warning",
    className: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
    iconClassName: "text-amber-500",
    titleClassName: "text-amber-700 dark:text-amber-400",
  },
  danger: {
    icon: IconAlertCircle,
    title: "Danger",
    className: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
    iconClassName: "text-red-500",
    titleClassName: "text-red-700 dark:text-red-400",
  },
  caution: {
    icon: IconFlame,
    title: "Caution",
    className: "border-l-orange-500 bg-orange-50 dark:bg-orange-950/30",
    iconClassName: "text-orange-500",
    titleClassName: "text-orange-700 dark:text-orange-400",
  },
} as const;

type AdmonitionType = keyof typeof admonitionConfig;

interface AdmonitionProps {
  type: AdmonitionType;
  title?: string;
  children: React.ReactNode;
}

function Admonition({ type, title, children }: AdmonitionProps) {
  const config = admonitionConfig[type] || admonitionConfig.note;
  const Icon = config.icon;
  const displayTitle = title || config.title;

  return (
    <div
      className={cn(
        "my-6 rounded-lg border-l-4 p-4",
        config.className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("size-5", config.iconClassName)} />
        <span className={cn("font-semibold text-sm uppercase tracking-wide", config.titleClassName)}>
          {displayTitle}
        </span>
      </div>
      <div className="text-sm text-foreground/80 [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

// Custom remark plugin to handle :::note, :::tip, etc. syntax
function remarkAdmonitions() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const type = node.name as string;
        if (type in admonitionConfig) {
          const data = node.data || (node.data = {});
          const title = node.attributes?.title || node.children?.[0]?.value?.match(/^\[([^\]]+)\]/)?.[1];
          
          data.hName = "admonition";
          data.hProperties = {
            type,
            title: title || "",
          };
        }
      }
    });
  };
}

interface MermaidBlockProps {
  code: string;
}

function MermaidBlock({ code }: MermaidBlockProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const renderDiagram = async () => {
      try {
        // Generate a valid ID (mermaid doesn't like special characters)
        const safeId = `mermaid-${id.replace(/:/g, "-").replace(/\s/g, "").replace(/\//g, "-")}`;
        
        // Create a temporary container with explicit width for rendering
        const tempContainer = document.createElement("div");
        tempContainer.style.width = "1200px";
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "-9999px";
        document.body.appendChild(tempContainer);
        
        // Detect diagram type from code to apply specific settings
        const diagramType = code.trim().split('\n')[0].toLowerCase();
        const isJourney = diagramType.includes('journey');
        const isSequence = diagramType.includes('sequencediagram');
        const isFlowchart = diagramType.includes('flowchart') || diagramType.includes('graph');
        const isStateDiagram = diagramType.includes('statediagram');
        const isErDiagram = diagramType.includes('erdiagram');
        const isGantt = diagramType.includes('gantt');
        const isPie = diagramType.includes('pie');
        const isMindmap = diagramType.includes('mindmap');
        const isQuadrant = diagramType.includes('quadrantchart');
        
        // Re-initialize mermaid before each render with optimized settings
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "system-ui, -apple-system, sans-serif",
          // Global font size - smaller for better fit
          fontSize: 12,
          // Flowchart settings - smaller padding and wrapping
          flowchart: { 
            htmlLabels: true, 
            useMaxWidth: false,
            curve: "basis",
            diagramPadding: 8,
            nodeSpacing: 50,
            rankSpacing: 50,
            wrappingWidth: 150,
          },
          // Sequence diagram - larger width for better readability
          sequence: { 
            useMaxWidth: false,
            wrap: true,
            width: 150,
            height: 50,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
            mirrorActors: false,
            actorFontSize: 12,
            noteFontSize: 11,
            messageFontSize: 12,
          },
          // ER diagram - compact entities
          er: { 
            useMaxWidth: false,
            layoutDirection: "TB",
            minEntityWidth: 80,
            minEntityHeight: 50,
            entityPadding: 10,
            fontSize: 11,
          },
          // State diagram - smaller text
          state: { 
            useMaxWidth: false,
            titleTopMargin: 15,
            nodeSpacing: 30,
            rankSpacing: 30,
          },
          // Pie chart
          pie: { 
            useMaxWidth: false,
            textPosition: 0.75,
          },
          // Gantt chart - compact
          gantt: { 
            useMaxWidth: false,
            titleTopMargin: 15,
            barHeight: 20,
            barGap: 4,
            topPadding: 30,
            leftPadding: 60,
            gridLineStartPadding: 25,
            fontSize: 10,
            sectionFontSize: 11,
          },
          // Journey diagram - much more compact
          journey: { 
            useMaxWidth: false,
            diagramMarginX: 20,
            diagramMarginY: 10,
            leftMargin: 50,
            width: 150,
            height: 40,
            boxMargin: 5,
            boxTextMargin: 3,
            noteMargin: 5,
            messageMargin: 20,
            taskFontSize: 10,
            sectionFontSize: 11,
          },
          // Mindmap - compact
          mindmap: { 
            useMaxWidth: false,
            padding: 8,
            maxNodeWidth: 150,
          },
          // Quadrant chart - smaller overall
          quadrantChart: { 
            useMaxWidth: false,
            chartWidth: 400,
            chartHeight: 400,
            titleFontSize: 14,
            titlePadding: 8,
            quadrantPadding: 4,
            xAxisLabelPadding: 8,
            yAxisLabelPadding: 8,
            xAxisLabelFontSize: 11,
            yAxisLabelFontSize: 11,
            quadrantLabelFontSize: 11,
            quadrantTextTopPadding: 4,
            pointTextPadding: 4,
            pointLabelFontSize: 10,
            pointRadius: 4,
          },
        });
        
        const { svg: renderedSvg } = await mermaid.render(safeId, code.trim(), tempContainer);
        
        // Clean up temp container
        document.body.removeChild(tempContainer);
        
        // Post-process SVG to ensure proper sizing and responsiveness
        let processedSvg = renderedSvg;
        
        // Determine max-width based on diagram type
        let maxWidth = "100%";
        let minHeight = "auto";
        
        // Sequence diagrams need more width
        if (isSequence) {
          maxWidth = "100%";
          minHeight = "300px";
        }
        // Journey diagrams should be scaled down
        else if (isJourney) {
          maxWidth = "100%";
        }
        // ER diagrams need good width for multiple entities  
        else if (isErDiagram) {
          maxWidth = "100%";
          minHeight = "250px";
        }
        // Quadrant charts should be reasonably sized
        else if (isQuadrant) {
          maxWidth = "500px";
        }
        
        // Remove any existing style attributes and add responsive styles
        processedSvg = processedSvg.replace(
          /<svg([^>]*)>/,
          (match, attrs) => {
            // Extract existing viewBox if present
            const viewBoxMatch = attrs.match(/viewBox="([^"]*)"/);
            const viewBox = viewBoxMatch ? viewBoxMatch[0] : '';
            
            // Extract existing width/height to use in viewBox if needed
            const widthMatch = attrs.match(/width="(\d+(?:\.\d+)?)/);
            const heightMatch = attrs.match(/height="(\d+(?:\.\d+)?)/);
            
            // Create new SVG tag with responsive attributes
            let newAttrs = attrs
              .replace(/width="[^"]*"/g, '')
              .replace(/height="[^"]*"/g, '')
              .replace(/style="[^"]*"/g, '');
            
            // Add viewBox if not present and we have width/height
            if (!viewBoxMatch && widthMatch && heightMatch) {
              newAttrs += ` viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`;
            } else if (viewBoxMatch) {
              newAttrs += ` ${viewBox}`;
            }
            
            return `<svg${newAttrs} style="max-width: ${maxWidth}; min-height: ${minHeight}; height: auto; display: block;">`;
          }
        );
        
        // Scale down text in SVG for better fitting
        processedSvg = processedSvg.replace(
          /<style>([\s\S]*?)<\/style>/,
          (match, styleContent) => {
            // Add CSS to scale text and improve fitting
            const additionalStyles = `
              .node rect, .node circle, .node ellipse, .node polygon, .node path { 
                stroke-width: 1px !important; 
              }
              .label, .nodeLabel, .edgeLabel, .cluster-label {
                font-size: 11px !important;
              }
              .messageText, .actor {
                font-size: 11px !important;
              }
              text {
                font-family: system-ui, -apple-system, sans-serif !important;
              }
            `;
            return `<style>${styleContent}${additionalStyles}</style>`;
          }
        );
        
        setSvg(processedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    };

    renderDiagram();
  }, [code, id, isClient]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to render diagram: {error}</p>
        <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex justify-center items-center rounded-xl border bg-muted/30 p-6 min-h-[200px]">
        <div className="text-muted-foreground text-sm">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto rounded-xl border bg-muted/30 p-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  useEffect(() => {
    const highlight = async () => {
      try {
        const highlighted = await codeToHtml(code, {
          lang: language,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });
        setHtml(highlighted);
      } catch {
        // Fallback for unknown languages
        const fallback = await codeToHtml(code, {
          lang: "text",
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });
        setHtml(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    highlight();
  }, [code, language]);

  // Language display names
  const languageNames: Record<string, string> = {
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    tsx: "TSX",
    jsx: "JSX",
    py: "Python",
    python: "Python",
    rb: "Ruby",
    ruby: "Ruby",
    go: "Go",
    rust: "Rust",
    rs: "Rust",
    java: "Java",
    cpp: "C++",
    c: "C",
    cs: "C#",
    csharp: "C#",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    sass: "Sass",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",
    md: "Markdown",
    markdown: "Markdown",
    bash: "Bash",
    sh: "Shell",
    shell: "Shell",
    zsh: "Zsh",
    powershell: "PowerShell",
    dockerfile: "Dockerfile",
    docker: "Docker",
    graphql: "GraphQL",
    prisma: "Prisma",
    text: "Plain Text",
  };

  const displayLanguage = title || languageNames[language.toLowerCase()] || language.toUpperCase();

  if (isLoading) {
    return (
      <div className="my-6 rounded-xl border bg-[#f6f8fa] dark:bg-[#161b22] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground">{displayLanguage}</span>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono">{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="group my-6 rounded-xl border bg-[#f6f8fa] dark:bg-[#161b22] overflow-hidden shadow-sm">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">{displayLanguage}</span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-all",
            "opacity-0 group-hover:opacity-100 focus:opacity-100",
            copied
              ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <IconCheck className="size-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <IconCopy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <div
        className="overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:text-[13px] [&>pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// Heading with anchor link
interface HeadingProps {
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

function Heading({ level, children, className }: HeadingProps) {
  const text = children?.toString() || "";
  const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const baseStyles = "group relative scroll-mt-20";
  const levelStyles = {
    1: "text-[1.75rem] font-bold tracking-tight text-foreground border-b border-border pb-3 !mb-6 !mt-10 first:!mt-0",
    2: "text-xl font-semibold tracking-tight text-foreground !mb-4 !mt-10 first:!mt-0",
    3: "text-lg font-semibold tracking-tight text-foreground !mb-3 !mt-8 first:!mt-0",
    4: "text-base font-semibold text-foreground !mb-2 !mt-6 first:!mt-0",
  };

  return (
    <Tag id={id} className={cn(baseStyles, levelStyles[level], className)}>
      <a
        href={`#${id}`}
        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label={`Link to ${text}`}
      >
        <IconLink className="size-4" />
      </a>
      {children}
    </Tag>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  hideFirstH1?: boolean;
}

export function MarkdownRenderer({ content, className, hideFirstH1 = true }: MarkdownRendererProps) {
  // Preprocess content to remove the first H1 if requested
  const processedContent = hideFirstH1
    ? content.replace(/^#\s+[^\n]+\n?/, "")
    : content;
  
  return (
    <div
      className={cn(
        // Base typography
        "max-w-none",
        // Paragraphs
        "[&>p]:text-base [&>p]:leading-7 [&>p]:text-muted-foreground [&>p]:mb-5",
        // Links
        "[&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/30 hover:[&_a]:decoration-primary [&_a]:transition-colors",
        // Inline code
        "[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-[0.875em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-foreground/90",
        // Blockquotes
        "[&>blockquote]:my-6 [&>blockquote]:border-l-4 [&>blockquote]:border-muted-foreground/30 [&>blockquote]:bg-muted/30 [&>blockquote]:rounded-r-lg [&>blockquote]:py-3 [&>blockquote]:px-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground",
        // Horizontal rules
        "[&>hr]:my-8 [&>hr]:border-border",
        // Images
        "[&_img]:rounded-xl [&_img]:border [&_img]:my-6",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonitions]}
        components={{
          // Handle admonition elements
          // @ts-ignore - custom element
          admonition({ type, title, children }: any) {
            return (
              <Admonition type={type as AdmonitionType} title={title}>
                {children}
              </Admonition>
            );
          },
          // Custom code block handler for Mermaid and syntax highlighting
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match?.[1];
            const codeString = String(children).replace(/\n$/, "");

            // Render Mermaid diagrams
            if (language === "mermaid") {
              return <MermaidBlock code={codeString} />;
            }

            // Inline code (no language specified and no newlines)
            if (!language && !codeString.includes("\n")) {
              return (
                <code
                  className="rounded-md bg-muted px-1.5 py-0.5 text-[0.875em] font-mono text-foreground/90"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Code blocks with syntax highlighting
            if (language) {
              return <CodeBlock code={codeString} language={language} />;
            }

            // Fallback for code blocks without language
            return (
              <code className={cn(className, "block font-mono text-sm")} {...props}>
                {children}
              </code>
            );
          },
          // Ensure pre doesn't double-wrap custom blocks
          pre({ children, ...props }) {
            // Check if the child is a mermaid or code block (already rendered)
            const child = children as React.ReactElement;
            if (child?.type === MermaidBlock || child?.type === CodeBlock) {
              return <>{children}</>;
            }
            return (
              <pre className="my-6 rounded-xl border bg-muted/50 p-4 overflow-x-auto" {...props}>
                {children}
              </pre>
            );
          },
          // Custom table with proper styling
          table({ children, ...props }) {
            return (
              <div className="my-6 w-full overflow-x-auto rounded-xl border shadow-sm">
                <table className="w-full text-sm" {...props}>{children}</table>
              </div>
            );
          },
          thead({ children, ...props }) {
            return (
              <thead className="bg-muted/50 border-b text-left" {...props}>{children}</thead>
            );
          },
          th({ children, ...props }) {
            return (
              <th className="px-4 py-3 font-semibold text-foreground text-sm" {...props}>{children}</th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="px-4 py-3 border-t border-border/50 text-muted-foreground" {...props}>{children}</td>
            );
          },
          tr({ children, ...props }) {
            return (
              <tr className="hover:bg-muted/30 transition-colors" {...props}>{children}</tr>
            );
          },
          // Custom list components for better styling
          ul({ children, ...props }) {
            return (
              <ul className="my-5 ml-6 list-disc space-y-2 marker:text-muted-foreground/60" {...props}>{children}</ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="my-5 ml-6 list-decimal space-y-2 marker:text-muted-foreground/60" {...props}>{children}</ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="text-base leading-7 text-muted-foreground pl-1" {...props}>{children}</li>
            );
          },
          // Custom heading components with anchor links
          h1({ children }) {
            return <Heading level={1}>{children}</Heading>;
          },
          h2({ children }) {
            return <Heading level={2}>{children}</Heading>;
          },
          h3({ children }) {
            return <Heading level={3}>{children}</Heading>;
          },
          h4({ children }) {
            return <Heading level={4}>{children}</Heading>;
          },
          // Blockquote
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="my-6 border-l-4 border-muted-foreground/30 bg-muted/30 rounded-r-lg py-3 px-4 italic text-muted-foreground [&>p]:mb-0"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          // Paragraph
          p({ children, ...props }) {
            return (
              <p className="text-base leading-7 text-muted-foreground mb-5 [&:last-child]:mb-0" {...props}>
                {children}
              </p>
            );
          },
          // Strong/bold
          strong({ children, ...props }) {
            return (
              <strong className="font-semibold text-foreground" {...props}>
                {children}
              </strong>
            );
          },
          // Emphasis/italic
          em({ children, ...props }) {
            return (
              <em className="italic" {...props}>
                {children}
              </em>
            );
          },
          // Links
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                className="text-primary font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Horizontal rule
          hr({ ...props }) {
            return <hr className="my-8 border-border" {...props} />;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
