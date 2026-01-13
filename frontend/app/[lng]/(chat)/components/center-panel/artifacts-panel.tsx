"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Artifact, ArtifactType } from "../../model/execution-types";
import {
  FileText,
  Code,
  Image,
  FileJson,
  File,
  Presentation,
  FileCode,
  Layers,
} from "lucide-react";

interface ArtifactsPanelProps {
  artifacts?: Artifact[];
}

export function ArtifactsPanel({ artifacts = [] }: ArtifactsPanelProps) {
  const getArtifactConfig = (type: ArtifactType) => {
    switch (type) {
      case "text":
        return {
          icon: FileText,
          label: "文本",
          color: "text-blue-600 dark:text-blue-400 bg-blue-600/10",
        };
      case "code_diff":
        return {
          icon: Code,
          label: "代码",
          color: "text-orange-600 dark:text-orange-400 bg-orange-600/10",
        };
      case "image":
        return {
          icon: Image,
          label: "图片",
          color: "text-green-600 dark:text-green-400 bg-green-600/10",
        };
      case "ppt":
        return {
          icon: Presentation,
          label: "演示文稿",
          color: "text-red-600 dark:text-red-400 bg-red-600/10",
        };
      case "pdf":
        return {
          icon: File,
          label: "PDF",
          color: "text-red-600 dark:text-red-400 bg-red-600/10",
        };
      case "markdown":
        return {
          icon: FileCode,
          label: "Markdown",
          color: "text-purple-600 dark:text-purple-400 bg-purple-600/10",
        };
      case "json":
        return {
          icon: FileJson,
          label: "JSON",
          color: "text-yellow-600 dark:text-yellow-400 bg-yellow-600/10",
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

  if (artifacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <File className="size-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">暂无产出</p>
          <p className="text-xs mt-1">AI 执行结果将在此处展示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card shrink-0 min-h-[85px] flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
            <Layers className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground">
              执行产物
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              AI 生成的各种产出（代码、文档、图片等）
            </p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {artifacts.length}
          </Badge>
        </div>
      </div>

      {/* Artifacts list */}
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
                {/* Artifact header */}
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

                {/* Artifact content */}
                <div className="p-3">{renderArtifactContent(artifact)}</div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
