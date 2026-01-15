"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, MessageSquare } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ConversationHistoryProps {
  // Props reserved for future use
}

export function ConversationHistory({}: ConversationHistoryProps) {
  // TODO: Implement actual conversation history fetching
  // Mock data for demonstration
  const mockHistory = [
    {
      id: 1,
      title: "AI助手中...",
      time: "14:30",
      preview: "AI助手中，请帮我...",
    },
    {
      id: 2,
      title: "代码审查...",
      time: "昨天",
      preview: "好的，代码审查，...",
    },
  ];

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className="size-4 text-foreground" />
          <span>对话历史</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <ScrollArea className="h-[100px]">
          <div className="space-y-2 pr-2">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-center size-6 rounded bg-muted shrink-0 mt-0.5">
                  <MessageSquare className="size-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium truncate">{item.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
