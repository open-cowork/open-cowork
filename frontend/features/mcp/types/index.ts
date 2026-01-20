export interface McpServer {
  id: number;
  name: string;
  display_name: string | null;
  scope: string;
  owner_user_id: string | null;
  server_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface McpServerCreateInput {
  name: string;
  server_config: Record<string, unknown>;
  display_name?: string | null;
  scope?: string | null;
}

export interface McpServerUpdateInput {
  name?: string | null;
  server_config?: Record<string, unknown> | null;
  display_name?: string | null;
  scope?: string | null;
}

export interface UserMcpInstall {
  id: number;
  user_id: string;
  server_id: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMcpInstallCreateInput {
  server_id: number;
  enabled?: boolean;
}

export interface UserMcpInstallUpdateInput {
  enabled?: boolean | null;
}
