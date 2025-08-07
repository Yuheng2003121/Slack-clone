import { GetMessagesReturnType } from "@/feature/messages/api/useGetMessages";
import React, { useState } from "react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import MessageItem from "./MessageItem";
import ChannelHero from "./ChannelHero";
import { Id } from "../../convex/_generated/dataModel";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { useCurrentMember } from "@/feature/members/api/useCurrentMember";
import { Loader } from "lucide-react";
import { useGetMessage } from "@/feature/messages/api/useGetMessage";

interface Props {
  variant?: "channel" | "thread" | "conversation";
  data: GetMessagesReturnType | undefined;
  loadmore?: () => void;
  isLoadingMore?: boolean;
  canLoadMore?: boolean;
  messageId: Id<"messages">;
}

const TIME_THRESHOLD = 5 ;
function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEEE, MMMM d");
}
export default function ThreadList({
  variant = "thread",
  data,
  loadmore,
  isLoadingMore,
  canLoadMore,
  messageId
}: Props) {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null)

  const workspaceId = useWorkspaceId()
  const {member:currentMember} = useCurrentMember(workspaceId)
  const { message, isLoading: messageLoadding } = useGetMessage({ messageId })!;
  
  const groupedMessages = data?.reduce(
    (acc, message) => {
      const date = new Date(message!._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].unshift(message);
      return acc;
    },
    {} as Record<string, typeof data>
  );

  return (
    <div className="flex flex-col overflow-y-auto messages-scrollbar">
      <div className="pb-4 flex flex-col-reverse overflow-y-auto messages-scrollbar">
        {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className="text-center my-2 relative">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray shadow-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {messages.map((message, index) => {
                const prevMessage = messages[index - 1];
                const isCompact =
                  prevMessage &&
                  prevMessage.user._id === message.user._id &&
                  differenceInMinutes(
                    new Date(message._creationTime),
                    new Date(prevMessage._creationTime)
                  ) < TIME_THRESHOLD;

                return (
                  <MessageItem
                    key={message._id}
                    id={message._id}
                    memberId={message?.memberId}
                    authorImage={message?.user?.image}
                    authorName={message?.user?.name}
                    isAuthor={currentMember?._id === message.member._id}
                    reactions={message?.reactions}
                    body={message?.body}
                    image={message?.image}
                    updatedAt={message?.updatedAt}
                    createdAt={message?._creationTime}
                    threadCount={message?.threadCount}
                    threadImage={message?.threadImage}
                    threadTimestamp={message?.threadTimestamp}
                    threadName={message?.threadName}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                    isCompact={isCompact}
                    hideThreadButton
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="shrink-0 flex flex-col justify-between pt-2">
          <MessageItem
            hideThreadButton
            memberId={message!.memberId}
            authorImage={message!.user.image}
            authorName={message!.user.name}
            isAuthor={message!.memberId === currentMember?._id}
            body={message!.body}
            image={message!.image}
            createdAt={message!._creationTime}
            updatedAt={message!.updatedAt}
            id={message!._id}
            reactions={message!.reactions}
            isEditing={editingId === message!._id}
            setEditingId={setEditingId}
          />

          {/* {!!data?.length && (
            <span className="text-sm font-bold px-5 mt-auto">replies:</span>
          )} */}
        </div>
      </div>

      {/* 无限滚动 */}
      <div
        className="h-1"
        ref={(el) => {
          // React 的 ref 回调，获取 DOM 元素
          if (el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                // 当元素进入视口且允许加载时触发
                if (entry.isIntersecting && canLoadMore && loadmore) {
                  loadmore(); // 加载更多数据的函数
                }
              },
              { threshold: 1.0 } //元素 ​​完全进入视口​​（100% 可见）时触发
            );
            observer.observe(el); // 开始监听这个 div
            return () => observer.disconnect(); // 组件卸载时取消监听
          }
        }}
      />
      {isLoadingMore && (
        <div className="text-center my-2 relative">
          <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
          <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray shadow-sm">
            <Loader className="szie-4 animate-spin text-muted-foreground" />
          </span>
        </div>
      )}
    </div>
  );
}
