import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export const useGetMember = (memberId: Id<"members">) => {
  const data = useQuery(api.members.getMemberById, { memberId });
  const isLoading = data === undefined;

  return { data, isLoading };
}