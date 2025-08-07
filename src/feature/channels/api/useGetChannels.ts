import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function useGetChannels(workspaceId: Id<"workspaces">) {
  const channels = useQuery(api.channels.getChannels, { workspaceId }) 
  const isLoading = channels === undefined;

  return { channels, isLoading };
}