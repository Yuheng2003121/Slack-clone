import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel";

interface Options {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface Values {
  workspaceId: Id<"workspaces">;
  memberId: Id<"members">;
}

const useAddOrGetConversation = () => {
  const mutation = useMutation(api.conversations.createOrGet);
  const [pending, setPending] = useState(false);
  const mutate = useCallback(async (values: Values, options?: Options) => {
    try {
      setPending(true)
      const conversation = await mutation(values)
      options?.onSuccess?.();
      return {
        conversation,
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

export default useAddOrGetConversation;