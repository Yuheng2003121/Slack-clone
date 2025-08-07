"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateWorkspacesModal } from "../store/useCreateWorkspacesModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAddWorkspace from "../api/useAddWorksapce";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateWorkspaceModal() {
  const [open, setOpen] = useCreateWorkspacesModal();
  const {mutate, pending} = useAddWorkspace();
  const [name, setName] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    if(!name) return toast.error("请输入工作空间名称");
      
    const workspaceId = await mutate(
      {
        name: name
      },
      {
        onSuccess: (id) => {
          toast.success(`Workspace${id} created successfully`);
          setName("");
          setOpen(false);
          router.push(`/workspaces/${id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );


  }

  // const handleOpenChange = (newOpen: boolean) => {
  //   if (!newOpen) {
  //     //clear form
  //   }
  //   setOpen(newOpen);
  // };

  return (
    <Dialog open={open} >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create A Workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            disabled={pending}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace Name e.g  'Work', 'Personal', 'Home'"
          />
          <div className="flex justify-end">
            <Button disabled={pending} >Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
