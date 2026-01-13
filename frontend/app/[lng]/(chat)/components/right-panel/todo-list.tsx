"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";
import { TodoItem } from "./todo-item";
import { useT } from "@/app/i18n/client";
import type { TodoItem as TodoItemType } from "../../model/execution-types";

interface TodoListProps {
  todos: TodoItemType[];
  progress?: number;
  currentStep?: string;
}

export function TodoList({ todos, progress = 0, currentStep }: TodoListProps) {
  const { t } = useT("translation");

  const completedCount = todos.filter(
    (todo) => todo.status === "completed",
  ).length;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="py-3 px-4 shrink-0">
        <div className="space-y-3">
          {/* Title with icon */}
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            <span className="flex-1">{t("todo.title")}</span>
            <span className="text-xs text-muted-foreground font-normal">
              {completedCount}/{todos.length}
            </span>
          </CardTitle>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">进度</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
            {currentStep && (
              <p className="text-xs text-muted-foreground truncate">
                {currentStep}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Todo items with scroll */}
      <CardContent className="px-4 pb-4 pt-0">
        <ScrollArea className="max-h-[250px]">
          <div className="space-y-2 pr-2">
            {todos.map((todo, index) => (
              <TodoItem key={index} todo={todo} index={index} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
