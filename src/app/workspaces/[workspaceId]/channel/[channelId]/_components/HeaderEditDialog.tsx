import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useUpdateChannel from "@/feature/channels/api/useUpdateChannel";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { Id } from "../../../../../../../convex/_generated/dataModel";
interface Props {
  children: React.ReactNode;
  channelName: string;
  channelId: Id<"channels">;
  isAdmin: boolean;
}
export default function HeaderEditDialog({
  children,
  channelName,
  channelId,
  isAdmin,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const { mutate: updateChannel, pending: pendingChannel } = useUpdateChannel();
  const [value, setValue] = useState(channelName);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleClose = () => {
    setValue(channelName);
    setEditOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if(!isAdmin) {
      toast.error("You are not an admin, you cannot edit this channel.");
      return;
    }
    if (open) {
      setEditOpen(true);
    } else {
      handleClose();
    }
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChannel(
      { channelId, name: value },
      {
        onSuccess: () => {
          handleClose();
          toast.success(`Channel updated successfully`);
        },
        onError: (error) => {
          const errorMsg =
            error instanceof ConvexError
              ? error.data
              : "Failed to update channel";
          toast.error(errorMsg);
        },
      }
    );
  };

  return (
    <Dialog open={editOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="py-4 border-b">
          <DialogTitle>Rename this Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate}>
          <Input
            disabled={pendingChannel}
            value={value}
            onChange={handleChange}
            required={true}
            autoFocus={true}
            minLength={3}
            placeholder="e.g 'general'"
          />
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant={"outline"} disabled={pendingChannel}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pendingChannel}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}