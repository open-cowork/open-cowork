"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Artifact, ArtifactType } from "@/lib/api-types";
import {
  FileText,
  Code,
  Image,
  FileJson,
  File,
  Presentation,
  FileCode,
  Layers,
  PanelRight,
  PanelRightClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileSidebar, FileNode } from "./file-sidebar";
import { DocumentViewer } from "./document-viewer";

interface ArtifactsPanelProps {
  artifacts?: Artifact[];
}

// Mock file data for testing with network URLs
const mockFiles: FileNode[] = [
  {
    id: "folder-1",
    name: "测试文件",
    type: "folder",
    path: "/test",
    children: [
      {
        id: "file-pdf-3",
        name: "arXiv 深度学习论文.pdf",
        type: "file",
        path: "/test/arxiv-2601-07708.pdf",
        url: "https://arxiv.org/pdf/2601.07708",
        mimeType: "application/pdf",
      },
      {
        id: "file-docx-1",
        name: "Word文档示例.docx",
        type: "file",
        path: "/test/sample.docx",
        url: "https://philfan-pic.oss-cn-beijing.aliyuncs.com/test/doc.docx",
        mimeType:
          "application/msword",
      },
      {
        id: "file-xlsx-1",
        name: "Excel表格示例.xlsx",
        type: "file",
        path: "/test/sample.xlsx",
        url: "philfan-pic.oss-cn-beijing.aliyuncs.com/test/xls.xlsx",
        mimeType:
          "application/vnd.ms-excel",
      },
      {
        id: "file-pptx-1",
        name: "PowerPoint演示文稿.ppt",
        type: "file",
        path: "/test/presentation.ppt",
        url: "philfan-pic.oss-cn-beijing.aliyuncs.com/test/ppt.pptx",
        mimeType: "application/vnd.ms-powerpoint",
      },
      {
        id: "file-image-1",
        name: "示例图片1.jpg",
        type: "file",
        path: "/test/image1.jpg",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        mimeType: "image/jpeg",
      },
      {
        id: "file-image-2",
        name: "示例图片2.png",
        type: "file",
        path: "/test/image2.png",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
        mimeType: "image/png",
      },
      {
        id: "file-image-3",
        name: "示例图片3.jpg",
        type: "file",
        path: "/test/image3.jpg",
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        mimeType: "image/jpeg",
      },
    ],
  },
];

export function ArtifactsPanel({ artifacts = [] }: ArtifactsPanelProps) {
  const [selectedFile, setSelectedFile] = React.useState<
    FileNode | undefined
  >();
  const [viewMode, setViewMode] = React.useState<"artifacts" | "document">(
    "artifacts",
  );
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const getArtifactConfig = (type: ArtifactType) => {
    switch (type) {
      case "text":
        return {
          icon: FileText,
          label: "文本",
          color: "text-foreground/80 bg-muted",
        };
      case "code_diff":
        return {
          icon: Code,
          label: "代码",
          color: "text-foreground/80 bg-muted",
        };
      case "image":
        return {
          icon: Image,
          label: "图片",
          color: "text-foreground/80 bg-muted",
        };
      case "ppt":
        return {
          icon: Presentation,
          label: "演示文稿",
          color: "text-foreground/80 bg-muted",
        };
      case "pdf":
        return {
          icon: File,
          label: "PDF",
          color: "text-foreground/80 bg-muted",
        };
      case "markdown":
        return {
          icon: FileCode,
          label: "Markdown",
          color: "text-foreground/80 bg-muted",
        };
      case "json":
        return {
          icon: FileJson,
          label: "JSON",
          color: "text-foreground/80 bg-muted",
        };
      default:
        return {
          icon: File,
          label: "文件",
          color: "text-muted-foreground bg-muted",
        };
    }
  };

  const renderArtifactContent = (artifact: Artifact) => {
    switch (artifact.type) {
      case "image":
        return (
          <div className="mt-3 rounded-lg overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artifact.url}
              alt={artifact.title}
              className="w-full h-auto"
            />
          </div>
        );

      case "code_diff":
        return (
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
            <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {artifact.content}
            </pre>
          </div>
        );

      case "text":
      case "markdown":
      case "json":
        return (
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
            <pre className="text-xs whitespace-pre-wrap break-words">
              {artifact.content}
            </pre>
          </div>
        );

      case "ppt":
      case "pdf":
        return (
          <div className="mt-3 p-4 rounded-lg border border-border bg-muted/30 text-center">
            <File className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">点击预览文件</p>
            {artifact.metadata?.size && (
              <p className="text-xs text-muted-foreground mt-1">
                {(artifact.metadata.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleFileSelect = React.useCallback((file: FileNode) => {
    setSelectedFile(file);
    setViewMode("document");
  }, []);

  // Document viewer mode with file sidebar
  if (viewMode === "document") {
    return (
      <div className="flex h-full">
        {/* Document Viewer */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
                <Layers className="size-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-foreground truncate">
                  {selectedFile?.name || "文档预览"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  工作区文件预览
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg hover:bg-muted"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "隐藏文件列表" : "显示文件列表"}
              >
                {isSidebarOpen ? (
                  <PanelRightClose className="size-4" />
                ) : (
                  <PanelRight className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex relative">
            <div className="flex-1 min-h-0">
              <DocumentViewer file={selectedFile} />
            </div>
            {/* File Sidebar - positioned on the right */}
            {isSidebarOpen && (
              <div className="relative z-10 animate-in slide-in-from-right duration-300 shadow-lg">
                <FileSidebar
                  files={mockFiles}
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  isOpen={isSidebarOpen}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Artifacts mode - show artifacts list with file sidebar
  if (artifacts.length === 0) {
    return (
      <div className="flex h-full">
        {/* Empty state */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
                <Layers className="size-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-foreground">
                  执行产物
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  AI 生成的各种产出（代码、文档、图片等）
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg hover:bg-muted"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "隐藏文件列表" : "显示文件列表"}
              >
                {isSidebarOpen ? (
                  <PanelRightClose className="size-4" />
                ) : (
                  <PanelRight className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex relative">
            <div className="flex items-center justify-center flex-1">
              <div className="text-center text-muted-foreground">
                <File className="size-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无产出</p>
                <p className="text-xs mt-1">AI 执行结果将在此处展示</p>
              </div>
            </div>
            {/* File Sidebar - positioned on the right */}
            {isSidebarOpen && (
              <div className="relative z-10 animate-in slide-in-from-right duration-300 shadow-lg">
                <FileSidebar
                  files={mockFiles}
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  isOpen={isSidebarOpen}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Artifacts List */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
              <Layers className="size-5 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-foreground">
                执行产物
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                AI 生成的各种产出（代码、文档、图片等）
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg hover:bg-muted"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "隐藏文件列表" : "显示文件列表"}
            >
              {isSidebarOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRight className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex relative">
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 py-4 space-y-4">
              {artifacts.map((artifact) => {
                const config = getArtifactConfig(artifact.type);
                const Icon = config.icon;

                return (
                  <div
                    key={artifact.id}
                    className="rounded-lg border border-border bg-card overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
                      <Icon className="size-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {artifact.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(artifact.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${config.color}`}
                        variant="outline"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <div className="p-3">{renderArtifactContent(artifact)}</div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* File Sidebar - positioned on the right, inside ScrollArea container */}
          {isSidebarOpen && (
            <div className="relative z-10 animate-in slide-in-from-right duration-300 shadow-lg">
              <FileSidebar
                files={mockFiles}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                isOpen={isSidebarOpen}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
