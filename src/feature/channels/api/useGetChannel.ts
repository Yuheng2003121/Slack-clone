import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function useGetChannel(channelId: Id<"channels">) {
  const channel = useQuery(api.channels.getChannel, { channelId }); 
  const isLoading = channel === undefined;

  return { channel, isLoading };
}