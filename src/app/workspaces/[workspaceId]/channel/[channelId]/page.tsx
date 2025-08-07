"use client";
import useGetChannel from "@/feature/channels/api/useGetChannel";
import useChannelId from "@/hooks/useChannelId";
import { Loader, TriangleAlert } from "lucide-react";
import React from "react";
import Header from "./_components/Header";
import ChatInput from "./_components/ChatInput";
import { useGetMessages } from "@/feature/messages/api/useGetMessages";
import MessageList from "@/components/MessageList";

export default function ChannelPage() {
  const channelId = useChannelId();
  const { channel, isLoading: channelLoading } = useGetChannel(channelId);
  const {results: messages, status, loadMore} = useGetMessages({channelId: channelId})
  
  if (channelLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col justify-center items-center">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel not found</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <Header channelName={channel.name} />
      <MessageList
        channelName={channel.name} 
        channelCreationTime={channel._creationTime} 
        data={messages} 
        loadmore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeHolder={`Message #${channel.name}`}/>
    </div>
  );
}
