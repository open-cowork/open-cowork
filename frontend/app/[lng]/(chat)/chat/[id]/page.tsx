import { ExecutionContainer } from "../../components/layout/execution-container";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const { id } = await params;
  return <ExecutionContainer sessionId={id} />;
}
