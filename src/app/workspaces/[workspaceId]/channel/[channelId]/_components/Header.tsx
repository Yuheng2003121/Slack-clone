import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import HeaderEditDialog from "./HeaderEditDialog";
import useRemoveChannel from "@/feature/channels/api/useRemoveChannel";
import useChannelId from "@/hooks/useChannelId";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useConfirm } from "@/hooks/useConfirm";
import { useRouter } from "next/navigation";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { useCurrentMember } from "@/feature/members/api/useCurrentMember";

interface Props {
  channelName: string;
}
export default function Header({ channelName }: Props) {
  const router = useRouter();
  const channelId = useChannelId();
  const worskpaceId = useWorkspaceId();
  const {member} = useCurrentMember(worskpaceId);
  const isAdmin = member?.role === "admin";

  const [confirm, ConfirmDialog] = useConfirm(
    "Delete Channel",
    "Are you sure you want to delete this channel? This action is irreversible."
  );
  const { mutate: removeChannel, pending: removeChannelPending } = useRemoveChannel();
    
  const handleRemoveChannel = async () => {
    const ok = await confirm();
    if(!ok) return; 

    removeChannel(
      { channelId },
      {
        onSuccess: () => {
          toast.success(`Channel deleated successfully`);
          router.replace(`/workspaces/${worskpaceId}`);
        },
        onError: (error) => {
          const errorMsg =
            error instanceof ConvexError ? error.data : 'Failed to delete channel';
          toast.error(errorMsg);
        },
      }
    );
  };

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden shrink-0">
      <ConfirmDialog />

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"ghost"}
            className="text-lg font-semibold h-full"
            size={"sm"}
          >
            <span className="truncate"># {channelName}</span>
            <FaChevronDown className="size-2.5 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-50 overflow-hidden">
          <DialogHeader className="px-4 py-4 border-b border-gray-200 bg-white min-w-0">
            <DialogTitle className="truncate"># {channelName}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-3 min-w-0">
            <div className="px-5 py-4 bg-white rounded-lg border-1 border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Channel name</p>
                {isAdmin && (
                  <HeaderEditDialog
                    channelName={channelName}
                    channelId={channelId}
                    isAdmin={isAdmin}
                  >
                    <span className="text-sky-600 cursor-pointer hover:underline">
                      Edit
                    </span>
                  </HeaderEditDialog>
                )}
              </div>
              <p className="text-sm truncate"># {channelName}</p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-4 bg-white rounded-lg cursor-pointer border-1 border-gray-100 hover:bg-gray-100 text-rose-600"
              disabled={removeChannelPending}
              onClick={handleRemoveChannel}
            >
              <TrashIcon className="size-4 " />
              <p className="text-sm font-semibold">Delete Channel</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
