import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel";

interface Options {
  onSuccess?: (uploadUrl: string) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void
}


const useGnerateUploadUrl = () => {
  const mutation = useMutation(api.upload.generateUploadUrl);
  const [pending, setPending] = useState(false);
  const mutate = useCallback(async (_values?: unknown, options?: Options) => {
    try {
      setPending(true)
      const uploadUrl = await mutation()
      options?.onSuccess?.(uploadUrl);
      return uploadUrl;
        
        
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

export default useGnerateUploadUrl;