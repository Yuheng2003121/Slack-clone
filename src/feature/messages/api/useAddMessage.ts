import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel";

interface Options {
  onSuccess?: (messageId: Id<"messages">) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface Values {
  body: string;
  image?: Id<"_storage">;
  workspaceId: Id<"workspaces">;
  channelId?: Id<"channels">;
  parentMessageId?: Id<"messages">;
  conversationId?: Id<"conversations">;
  
}

const useAddMessage = () => {
  const mutation = useMutation(api.messages.addMessage);
  const [pending, setPending] = useState(false);
  const mutate = useCallback(async (values: Values, options?: Options) => {
    try {
      setPending(true)
      const messageId = await mutation(values)
      options?.onSuccess?.(messageId);
      return {
        messageId,
      };
    } catch (error) {
      options?.onError?.(error as Error)
    } finally {
      options?.onSettled?.()
      setPending(false);
    }
  }, [mutation]);

  return {
    mutate,
    pending,
  };
}

export default useAddMessage;