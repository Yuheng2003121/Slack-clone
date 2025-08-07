import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel";

interface Options {
  onSuccess?: (workspaceId: Id<"workspaces">) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void
}

interface Values {
  workspaceId: Id<"workspaces">
  name: string
}

const useUpdateWorkspace = () => {
  const mutation = useMutation(api.workspaces.updateWorkspaceById);
  const [pending, setPending] = useState(false);
  const mutate = useCallback(async (values: Values, options?: Options) => {
    try {
      setPending(true)
      const workspaceId = await mutation(values)
      options?.onSuccess?.(workspaceId);
      return {
        workspaceId,
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

export default useUpdateWorkspace;