// import Editor from '@/components/Editor'
import useAddMessage from '@/feature/messages/api/useAddMessage';
import useGnerateUploadUrl from '@/feature/upload/api/useGenerateUploadUrl';
import useWorkspaceId from '@/hooks/useWorkspaceId';
import dynamic from 'next/dynamic'
import Quill from 'quill';
import React, { useRef, useState } from 'react'
import { toast } from 'sonner';
import { Id } from '../../../../../../../convex/_generated/dataModel';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface Props {
  placeHolder?: string;
  conversationId: Id<"conversations">;
}
export default function ChatInput({ placeHolder, conversationId }: Props) {
  const editorRef = useRef<Quill | null>(null);

  const { mutate: addMessage, pending: pendingAddMessage } = useAddMessage();
  const { mutate: generateUploadUrl, pending: pendingUploadUrl } =
    useGnerateUploadUrl();

  const workspaceId = useWorkspaceId();
  const [isPending, setPending] = useState(false);
  const [editorKey, setEditorKey] = useState(0); //用于重新渲染编辑器达到清空效果
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
        conversationId,
        workspaceId,
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

  return (
    <div className="px-5 mt-auto">
      <Editor
        key={editorKey}
        placeHolder={placeHolder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
}
