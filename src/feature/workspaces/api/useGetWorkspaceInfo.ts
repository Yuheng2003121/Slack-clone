import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel";

const useGetWorkspaceInfo = (id: Id<"workspaces">) => {
  const workspaceInfo = useQuery(api.workspaces.getWorkspaceInfoById, {id});
  const isLoading = workspaceInfo === undefined;

  return { workspaceInfo, isLoading };
}

export default useGetWorkspaceInfo;