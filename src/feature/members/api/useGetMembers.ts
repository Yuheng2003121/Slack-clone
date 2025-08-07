import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export const useGetMembers = (workspaceId: Id<"workspaces">) => {
  const members = useQuery(api.members.getMembersByWorkspaceId, { workspaceId });
  const isLoading = members === undefined;

  return { members, isLoading };
}