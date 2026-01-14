"use client";

import * as React from "react";
import DocViewer, {
  DocViewerRenderers,
  type DocViewerProps,
} from "react-doc-viewer";
import { pdfjs } from "react-pdf";

// react-pdf 需要这些样式才能正确渲染文本层和注释层
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

export type { DocViewerProps } from "react-doc-viewer";

// 使用 unpkg CDN，版本必须与 pdfjs-dist 包版本一致
// pdfjs-dist 4.3.136 的 worker 文件
const workerSrc = `https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs`;

let workerConfigured = false;

/**
 * 立即配置 PDF.js worker（在模块加载时）
 * 必须在任何组件渲染之前完成配置
 */
function configurePDFWorkerImmediately() {
  if (workerConfigured || typeof window === "undefined") {
    return;
  }

  // 配置 worker
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  workerConfigured = true;

  // 抑制 TextLayer task cancelled 警告
  // 这是 PDF.js 在文档切换或组件卸载时的正常行为
  const shouldSuppressMessage = (args: unknown[]): boolean => {
    const message = args[0];
    // 检查字符串消息
    if (typeof message === "string") {
      return (
        message.includes("TextLayer task cancelled") ||
        message.includes("AbortException") ||
        message.includes("TextLayer") ||
        message.includes("task cancelled")
      );
    }
    // 检查对象消息（可能是 Error 对象）
    if (message && typeof message === "object") {
      const str = String(message);
      return (
        str.includes("TextLayer") ||
        str.includes("AbortException") ||
        str.includes("task cancelled")
      );
    }
    // 检查所有参数
    return args.some((arg) => {
      const str = String(arg);
      return (
        str.includes("TextLayer task cancelled") ||
        str.includes("AbortException: TextLayer")
      );
    });
  };

  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.warn = (...args: unknown[]) => {
    if (shouldSuppressMessage(args)) return;
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    if (shouldSuppressMessage(args)) return;
    originalConsoleError.apply(console, args);
  };
}

// 立即执行配置
configurePDFWorkerImmediately();

export function DocViewerClient(props: DocViewerProps) {
  // Worker 已经在模块加载时配置好，直接渲染即可
  return (
    <DocViewer
      {...props}
      pluginRenderers={props.pluginRenderers ?? DocViewerRenderers}
    />
  );
}

export default DocViewerClient;
