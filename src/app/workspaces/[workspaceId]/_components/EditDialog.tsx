"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useUpdateWorkspace from "@/feature/workspaces/api/useUpdateWorksapce";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";
interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  setValue?: (value: string) => void;
  workspaceId?: Id<"workspaces">;
  children?: React.ReactNode;
}
export default function EditDialog({
  open,
  setOpen,
  children,
  value,
  setValue,
  workspaceId,
}: Props) {
  const { mutate: updateWorkspace, pending: updatePending } = useUpdateWorkspace();
    
  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateWorkspace(
      {
        workspaceId: workspaceId!,
        name: value!,
      },
      {
        onSuccess: () => {
          setValue!("");
          setOpen(false);
          toast.success("Workspace updated successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename this worksapce</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <Input
            value={value}
            onChange={(e) => setValue?.(e.target.value)}
            disabled={updatePending}
            placeholder="New workspace name"
            required={true}
            autoFocus={true}
            minLength={3}
            maxLength={80}
          />
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={updatePending}>
                Close
              </Button>
            </DialogClose>
            <Button disabled={updatePending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
