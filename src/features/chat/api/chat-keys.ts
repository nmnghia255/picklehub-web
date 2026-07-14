export const chatQueryKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatQueryKeys.all, "conversations"] as const,
  conversation: (conversationId: string) =>
    [...chatQueryKeys.all, "conversation", conversationId] as const,
  messages: (conversationId: string, search: string | null) =>
    [...chatQueryKeys.all, "messages", conversationId, search ?? ""] as const,
}
