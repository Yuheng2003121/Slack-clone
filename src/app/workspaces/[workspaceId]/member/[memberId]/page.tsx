"use client"
import useAddOrGetConversation from '@/feature/conversations/api/useAddOrGetConversation';
import { useConversation } from '@/feature/conversations/store/useConversation';
import useMemberId from '@/hooks/useMemberId';
import useWorkspaceId from '@/hooks/useWorkspaceId'
import { ConvexError } from 'convex/values';
import { AlertTriangle, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Id } from '../../../../../../convex/_generated/dataModel';
import Conversation from './_components/Conversation';

export default function Page() {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  // const [conversationId, setConversationId] = useConversation();
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null | undefined>(null);

  const { mutate, pending } = useAddOrGetConversation();
  useEffect(() => {
    (async () => {
      const result = await mutate({ workspaceId, memberId }, {
        onError: (error) => {
          const errorMsg =
            error instanceof ConvexError
              ? error.data
              : "Failed to create conversation";
          toast.error(errorMsg);
        },
      });
      setConversationId(result?.conversation._id);
    })()
  }, [workspaceId, memberId, mutate, setConversationId]);

  if(pending) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  if(!conversationId) {
    <div className="h-full flex flex-col items-center justify-center">
      <AlertTriangle className="animate-spin size-6 text-muted-foreground" />
      <span className='text-muted-foreground text-sm'>Converstaion not found</span>
    </div>;
  }

  

  return (
    <Conversation id={conversationId!} />
  )
}
