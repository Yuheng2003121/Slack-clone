import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";


const BATCH_SIZE = 3;
interface Props {
  messageId: Id<"messages">;
}


export const useGetMessage = ({ messageId }: Props) => {
  const  message  = useQuery(api.messages.getMessageById, {
    messageId,
  });
  const isLoading = message === undefined;

  return {
    message,
    isLoading,
  };
};


