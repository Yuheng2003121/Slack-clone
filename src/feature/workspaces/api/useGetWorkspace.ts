import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel";

const useGetWorkspace = (id: Id<"workspaces">) => {
  const workspace = useQuery(api.workspaces.getWorkspaceById, {id});
  const isLoading = workspace === undefined;

  return { workspace, isLoading };
}

export default useGetWorkspace;