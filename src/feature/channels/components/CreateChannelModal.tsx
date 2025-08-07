import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateChannelModal } from '../store/useCreateChannelModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAddChannel from '../api/useAddChannel';
import useWorkspaceId from '@/hooks/useWorkspaceId';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ConvexError } from 'convex/values';

export default function CreateChannelModal() {
  const router = useRouter();
  const [open, setOpen] = useCreateChannelModal()
  const [name, setName] = useState('')
  const workspaceId = useWorkspaceId()

  const {mutate:createChannel, pending} = useAddChannel()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createChannel({name, workspaceId},{
      onSuccess:(channelId) => {
        handleClose()
        toast.success(`Channel created successfully`)
        router.push(`/workspaces/${workspaceId}/channel/${channelId}`);
      },
      onError:(error) => {
        const errorMsg = error instanceof ConvexError ? error.data : error.message;
        toast.error(errorMsg)
      }
    })
  }

  const handleClose = () => {
    setName('')
    setOpen(false)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '-').toLowerCase()
    setName(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={name}
            disabled={false}
            onChange={handleChange}
            required
            autoFocus
            minLength={3}
            placeholder="e.g plan-budget"
          />
          <div className="flex justify-end">
            <Button className="" disabled={false}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
