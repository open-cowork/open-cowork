"use client";

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
