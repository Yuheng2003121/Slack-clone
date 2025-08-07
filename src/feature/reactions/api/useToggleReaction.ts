import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel";

interface Options {
  onSuccess?: (reactionId: Id<"reactions">) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface Values {
  messageId: Id<"messages">;
  value: string;
}

const useToggleReaction = () => {
  const mutation = useMutation(api.reactions.toggleReaction);
  const [pending, setPending] = useState(false);
  const mutate = useCallback(async (values: Values, options?: Options) => {
    try {
      setPending(true)
      const reactionId = await mutation(values)
      options?.onSuccess?.(reactionId);
      return {
        reactionId,
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

export default useToggleReaction;