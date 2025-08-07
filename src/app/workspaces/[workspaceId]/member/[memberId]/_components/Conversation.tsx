import React from "react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import useMemberId from "@/hooks/useMemberId";
import { useGetMember } from "@/feature/members/api/useGetMember";
import { useGetMessages } from "@/feature/messages/api/useGetMessages";
import { Loader } from "lucide-react";
import Header from "./Header";
import ChatInput from "./ChatInput";
import MessageList from "@/components/MessageList";
import { usePanel } from "@/hooks/usePanel";

interface Pros {
  id: Id<"conversations">;
}
export default function Conversation({ id: conversationId }: Pros) {
  const memberId = useMemberId();
  const { data: member, isLoading: memberLoading } = useGetMember(memberId);
  const { results, status, loadMore } = useGetMessages({ conversationId });
  const {onOpenProfile} = usePanel();

  if (memberLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => onOpenProfile(memberId)}
      />
      <MessageList
        data={results}
        variant="conversation"
        loadmore={loadMore}
        memberName={member?.user.name}
        memberImage={member?.user.image}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput
        placeHolder={`Message ${member?.user.name}`}
        conversationId={conversationId}
      />
    </div>
  );
}
