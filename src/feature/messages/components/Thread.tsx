import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/useGetMessage";
import MessageItem from "@/components/MessageItem";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { useCurrentMember } from "@/feature/members/api/useCurrentMember";
import Quill from "quill";
import useAddMessage from "../api/useAddMessage";
import useGnerateUploadUrl from "@/feature/upload/api/useGenerateUploadUrl";
import useChannelId from "@/hooks/useChannelId";
import { toast } from "sonner";
import { useGetMessages } from "../api/useGetMessages";
import ThreadList from "@/components/ThreadList";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

interface Props {
  messageId: Id<"messages">;
  onCloseMessage?: () => void;
}
export default function Thread({ messageId, onCloseMessage }: Props) {
  const workspaceId = useWorkspaceId();
  const { member: currentMember } = useCurrentMember(workspaceId);
  const channelId = useChannelId()

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const [isPending, setPending] = useState(false);
  const [editorKey, setEditorKey] = useState(0); //用于重新渲染编辑器达到清空效果
  const editorRef = useRef<Quill | null>(null);

  const { message, isLoading: messageLoadding } = useGetMessage({ messageId });
  const {results: messages, status, loadMore} = useGetMessages({ channelId, parentMessageId: messageId })
  // const isLoadingMore= status === "LoadingMore";
  // const canLoadMore = status === "CanLoadMore";

  const { mutate: addMessage, pending: pendingAddMessage } = useAddMessage();
  const { mutate: generateUploadUrl, pending: pendingUploadUrl } =
    useGnerateUploadUrl();
  const handleSubmit = async ({
      body,
      image,
    }: {
      body: string;
      image: File | null;
    }) => {
      try {
        setPending(true);
        editorRef?.current?.enable(false);
        const addMessageValues = {
          channelId: channelId, 
          workspaceId,
          parentMessageId: messageId,
          body,
          image: undefined,
        };
  
        //如果editor上传图片
        if (image) {
          const uploadUrl = await generateUploadUrl(
            {},
            {
              onError: () => {
                toast.error("Failed to generate upload url");
              },
            }
          );
  
          if (!uploadUrl) {
            throw new Error("Failed to generate upload url");
          }
  
          //上传图片到convex分配的url, 并获得对应的File的id (对应的type是Id<"_storage">)
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "Content-Type": image.type,
            },
            body: image,
          });
  
          if (!response.ok) {
            throw new Error("Failed to upload image");
          }
  
          const { storageId } = await response.json();
          addMessageValues.image = storageId;
        }
  
        await addMessage(addMessageValues);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Fail to send message";
        toast.error(errorMsg);
      } finally {
        setPending(false);
        editorRef?.current?.enable(true);
      }
  
      //重新渲染表单组件, 以实现提交消息后清空编辑器内容的效果
      setEditorKey((prev) => prev + 1);
    };



  if (messageLoadding || status === 'LoadingFirstPage') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button
            className="cursor-pointer"
            variant={"ghost"}
            onClick={onCloseMessage}
            size={"icon"}
          >
            <XIcon className="size-5 stroke-[1/5]" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin size-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button
            className="cursor-pointer"
            variant={"ghost"}
            onClick={onCloseMessage}
            size={"icon"}
          >
            <XIcon className="size-5 stroke-[1/5]" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <AlertTriangle className="size-5 mr-1 text-red-500" />
          <p className="text-muted-foreground text-sm">Message not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col ">
      <div className="flex shrink-0 justify-between items-center px-4 h-[49px] border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button
          className="cursor-pointer"
          variant={"ghost"}
          onClick={onCloseMessage}
          size={"icon"}
        >
          <XIcon className="size-5 stroke-[1/5]" />
        </Button>
      </div>

        {/* <MessageItem
          hideThreadButton
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          isAuthor={message.memberId === currentMember?._id}
          body={message.body}
          image={message.image}
          createdAt={message._creationTime}
          updatedAt={message.updatedAt}
          id={message._id}
          reactions={message.reactions}
          isEditing={editingId === message._id}
          setEditingId={setEditingId}
        /> */}
      <ThreadList
        data={messages}
        messageId={messageId}
        loadmore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />

      <div className="px-4 mt-auto shrink-0">
        <Editor
          key={editorKey}
          onSubmit={handleSubmit}
          disabled={pendingAddMessage}
          innerRef={editorRef}
          placeHolder="Reply..."
        />
      </div>
    </div>
  );
}
