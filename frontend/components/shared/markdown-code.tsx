"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SyntaxHighlighter,
  getPrismLanguage,
  oneDark,
  oneLight,
} from "@/lib/markdown/prism";

type MarkdownCodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const extractLanguage = (className?: string) => {
  if (!className) return undefined;
  const match = className.match(/language-([^\s]+)/);
  return match?.[1];
};

export const MarkdownCode = ({
  inline,
  className,
  children,
}: MarkdownCodeProps) => {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const rawCode = Array.isArray(children) ? children.join("") : children;
  const code = String(rawCode ?? "").replace(/\n$/, "");
  const language = getPrismLanguage(extractLanguage(className));
  const syntaxTheme = resolvedTheme === "dark" ? oneDark : oneLight;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("[MarkdownCode] Copy failed", error);
    }
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[0.85rem]">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4 overflow-hidden rounded-xl border bg-muted/40">
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onCopy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <div className="overflow-x-auto bg-background/80">
        <SyntaxHighlighter
          language={language}
          style={syntaxTheme}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.85rem",
            lineHeight: "1.6",
          }}
          codeTagProps={{
            style: {
              background: "transparent",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
