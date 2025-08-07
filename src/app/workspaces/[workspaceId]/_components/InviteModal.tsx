import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { CopyIcon, RefreshCcw } from 'lucide-react';
import useWorkspaceId from '@/hooks/useWorkspaceId';
import { toast } from 'sonner';
import useUpdateWorkspaceJoinCode from '@/feature/workspaces/api/useUpdateWorksapceJoinCode';
import { useConfirm } from '@/hooks/useConfirm';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
}
export default function InviteModal({ open, setOpen, name:workspaceName, joinCode }: Props) {
  const workspaceId = useWorkspaceId();
  const {mutate:updateJoinCode, pending} = useUpdateWorkspaceJoinCode()
  const [confirm, ConfirmDialog] = useConfirm(
    "Are you Sure",
    "This will deactive the current join code and generate a new one."
  );

  const handleCopy = async () => {
    //生成邀请链接
    const inviteLink = `${window.location.origin}/join/${workspaceId}?joinCode=${joinCode}`;
    // const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  }

  const handleUpdate = async () => {
    const ok = await confirm();

    if(!ok) return;
    updateJoinCode({ workspaceId }, {
      onSuccess: () => {
        toast.success("Invite code updated")
      },
      onError: () => {
        toast.error("Failed to update invite code")
      }
    });
  }
  return (
    <>
      <ConfirmDialog/>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Invite people to workspace {workspaceName}
            </DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button variant={"ghost"} size={"sm"} onClick={handleCopy}>
              Copy link
              <CopyIcon className="size-4 ml-2" />
            </Button>
          </div>
          <div className="flex justify-between">
            <Button variant={"ghost"} disabled={pending} onClick={handleUpdate}>
              <span className="text-md">New Code</span>
              <RefreshCcw className="size-4 ml-1" />
            </Button>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
