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
  memberId: Id<"members">;
}

const useRemoveMember = () => {
  const mutation = useMutation(api.members.removeMember);
  const [pending, setPending] = useState(false);
  const mutate = useCallback(async (values: Values, options?: Options) => {
    try {
      setPending(true)
      const memberId = await mutation(values)
      options?.onSuccess?.();
      return {
        memberId,
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

export default useRemoveMember;