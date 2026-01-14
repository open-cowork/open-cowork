"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { FileNode } from "./file-browser";
import { File, Download, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DocViewerProps as ReactDocViewerProps,
  IDocument,
} from "react-doc-viewer";

const DocViewer = dynamic<ReactDocViewerProps>(
  () => import("./doc-viewer-client").then((mod) => mod.DocViewerClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">加载文档查看器...</p>
        </div>
      </div>
    ),
  },
);

interface DocumentViewerProps {
  file?: FileNode;
}

/**
 * 用于隔离 react-doc-viewer 组件，防止 tw-animate-css 的动画影响
 * 这个样式会重置动画相关的 CSS 变量，确保图片正常显示
 */
const docViewerContainerStyle: React.CSSProperties = {
  height: "100%",
  // 重置 tw-animate-css 的动画变量，防止意外的动画效果
  // @ts-expect-error CSS custom properties
  "--tw-enter-opacity": "1",
  "--tw-exit-opacity": "1",
  "--tw-enter-scale": "1",
  "--tw-exit-scale": "1",
  "--tw-enter-rotate": "0",
  "--tw-exit-rotate": "0",
  "--tw-enter-translate-x": "0",
  "--tw-enter-translate-y": "0",
  "--tw-exit-translate-x": "0",
  "--tw-exit-translate-y": "0",
};

const SAMPLE_DOCUMENTS: IDocument[] = [
  {
    uri: "https://arxiv.org/pdf/2601.07708",
    fileName: "arXiv 深度学习论文.pdf",
    fileType: "pdf",
  },
  {
    uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "示例PDF文档.pdf",
    fileType: "pdf",
  },
  {
    uri: "https://calibre-ebook.com/downloads/demos/demo.docx",
    fileName: "Word文档示例.docx",
    fileType: "docx",
  },
  {
    uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    fileName: "示例图片.jpg",
    fileType: "jpg",
  },
];

// react-doc-viewer 实际支持的文件格式
const SUPPORTED_TYPE_TOKENS = new Set<string>([
  // MIME types
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/html",
  "text/htm",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/bmp",
  "image/tiff",
  // Extensions
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "bmp",
  "tiff",
  "htm",
  "html",
]);

const DOC_VIEWER_CONFIG = {
  header: {
    disableHeader: false,
    disableFileName: false,
    retainURLParams: false,
  },
} as const;

export const DocumentViewer = React.memo(function DocumentViewer({ file }: DocumentViewerProps) {
  // 提取稳定的原始值
  const fileUrl = file?.url;
  const fileName = file?.name;
  const fileMimeType = file?.mimeType;

  // 使用 useMemo 稳定化文档列表，避免不必要的重新渲染
  const { mimeType, extension } = React.useMemo(() => {
    if (!file) return { mimeType: "", extension: "" };
    return getFileMetadata(file);
  }, [fileUrl, fileName, fileMimeType]);

  const isSupported = React.useMemo(() => {
    if (!fileUrl) return false;
    return isSupportedFileType(mimeType, extension);
  }, [fileUrl, mimeType, extension]);

  // 使用 useMemo 稳定化文档数组，只有当文件真正改变时才更新
  const documents = React.useMemo<IDocument[]>(() => {
    if (!fileUrl || !isSupported) {
      return SAMPLE_DOCUMENTS;
    }
    return [
      {
        uri: fileUrl,
        fileName: fileName || "未命名文件",
        fileType: extension || mimeType,
      },
    ];
  }, [fileUrl, fileName, isSupported, extension, mimeType]);

  // 使用文件 URL 作为 key，只有切换文件时才重新挂载
  const viewerKey = fileUrl || "sample-docs";

  if (!file) {
    return (
      <div className="h-full w-full flex flex-col border border-dashed border-border/70 rounded-lg">
        <div className="px-6 py-8 text-center text-muted-foreground space-y-2">
          <File className="size-12 mx-auto opacity-50" />
          <p className="text-sm font-medium text-foreground">
            请从文件浏览器选择文件
          </p>
          <p className="text-xs">
            或者直接预览下方预置的示例（PDF / Word / Excel / 图片），验证渲染能力
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-[11px]">
            {SAMPLE_DOCUMENTS.map((doc, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {doc.fileName}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/90">
            <Sparkles className="size-3" />
            <span>示例由 react-doc-viewer 官方支持格式提供</span>
          </div>
        </div>
        <div className="flex-1 min-h-0 border-t border-border bg-background/60" style={docViewerContainerStyle}>
          <DocViewer
            key="sample-docs"
            documents={SAMPLE_DOCUMENTS}
            config={DOC_VIEWER_CONFIG}
            style={{ height: "100%" }}
          />
        </div>
      </div>
    );
  }

  if (!file.url) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <File className="size-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">文件无可用URL</p>
          <p className="text-xs mt-1">文件名: {file.name}</p>
        </div>
      </div>
    );
  }

  const extensionLabel = extension?.toUpperCase() || mimeType;

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground max-w-md px-6">
          <File className="size-16 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium mb-2">不支持的文件格式</p>
          <p className="text-sm mb-4">
            当前 react-doc-viewer 暂不支持 {extensionLabel} 文件的在线预览
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(file.url, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="size-4" />
              在新窗口打开
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement("a");
                link.href = file.url!;
                link.download = file.name;
                link.click();
              }}
              className="gap-2"
            >
              <Download className="size-4" />
              下载文件
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-0" style={docViewerContainerStyle}>
        <DocViewer
          key={viewerKey}
          documents={documents}
          config={DOC_VIEWER_CONFIG}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
});

// react-doc-viewer 支持的扩展名到 MIME 类型的映射
const EXTENSION_TO_MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  htm: "text/htm",
  html: "text/html",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  bmp: "image/bmp",
  tiff: "image/tiff",
};

function getFileMetadata(file: FileNode) {
  const extension = extractExtension(file.name || file.url || "");
  const fallbackMime =
    extension && EXTENSION_TO_MIME_MAP[extension]
      ? EXTENSION_TO_MIME_MAP[extension]
      : undefined;
  const mimeType = (file.mimeType || fallbackMime || "application/octet-stream").toLowerCase();
  return { mimeType, extension };
}

// 使用原始值计算文件元数据，避免依赖对象引用
function getFileMetadataFromValues(name?: string, url?: string, fileMimeType?: string) {
  const extension = extractExtension(name || url || "");
  const fallbackMime =
    extension && EXTENSION_TO_MIME_MAP[extension]
      ? EXTENSION_TO_MIME_MAP[extension]
      : undefined;
  const mimeType = (fileMimeType || fallbackMime || "application/octet-stream").toLowerCase();
  return { mimeType, extension };
}

function extractExtension(input: string): string {
  if (!input) return "";
  const sanitized = input.split(/[?#]/)[0];
  const segments = sanitized.split(".");
  if (segments.length < 2) return "";
  return segments.pop()!.toLowerCase();
}

function isSupportedFileType(mimeType: string, extension?: string) {
  if (SUPPORTED_TYPE_TOKENS.has(mimeType)) {
    return true;
  }
  if (extension && SUPPORTED_TYPE_TOKENS.has(extension)) {
    return true;
  }
  return false;
}
