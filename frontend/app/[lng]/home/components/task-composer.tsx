"use client";

import * as React from "react";
import {
  ArrowUp,
  Mic,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

import { useT } from "@/app/i18n/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { CONNECTED_TOOLS } from "../model/constants";

export function TaskComposer({
  textareaRef,
  value,
  onChange,
  onSend,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  const { t } = useT("translation");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* 输入区域 */}
      <div className="px-4 pb-3 pt-4">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={t("hero.placeholder")}
          className="min-h-[60px] max-h-[40vh] w-full resize-none border-0 bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
          rows={2}
        />
      </div>

      {/* 底部工具栏 */}
      <div className="flex items-center justify-between px-3 pb-3">
        {/* 左侧操作按钮 */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl hover:bg-accent"
            title={t("hero.attachFile")}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl hover:bg-accent"
            title={t("hero.tools")}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl hover:bg-accent"
            title={t("hero.voiceInput")}
          >
            <Mic className="size-4" />
          </Button>
          <Button
            onClick={onSend}
            disabled={!value.trim()}
            size="icon"
            className="size-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
            title={t("hero.send")}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>

      {/* 工具连接栏 */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          <span>{t("hero.tools")}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {CONNECTED_TOOLS.slice(0, 6).map((tool) => (
            <div
              key={tool.id}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-sm transition-colors hover:bg-accent"
              title={tool.name}
            >
              {tool.icon}
            </div>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-full text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
