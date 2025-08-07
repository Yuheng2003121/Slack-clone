import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel";
import { ConvexError } from "convex/values";

interface Options {
  onSuccess?: (channelId: Id<"channels">) => void;
  onError?: (error: Error | ConvexError<never>) => void;
  onSettled?: () => void;
}

interface Values {
  name: string;
  channelId: Id<"channels">;
}

const useUpdateChannel = () => {
  const mutation = useMutation(api.channels.updateChannel);
  const [pending, setPending] = useState(false);
  const mutate = useCallback(async (values: Values, options?: Options) => {
    try {
      setPending(true)
      const channelId = await mutation(values)
      options?.onSuccess?.(channelId);
      return {
        channelId,
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

export default useUpdateChannel;