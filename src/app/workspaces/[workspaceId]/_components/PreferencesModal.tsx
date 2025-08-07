"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
// import useUpdateWorkspace from '@/feature/workspaces/api/useUpdateWorksapce';
import useRemoveWorkspace from "@/feature/workspaces/api/useRemoveWorkspace";
import EditDialog from "./EditDialog";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/useConfirm";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}
export default function PreferencesModal({
  open,
  setOpen,
  initialValue,
}: Props) {
  const [value, setValue] = useState(initialValue);
  // const {mutate: updateWorkspace, pending:updatePending} = useUpdateWorkspace();
  const workspaceId = useWorkspaceId();
  const { mutate: removeWorksapce, pending: removePending } =
    useRemoveWorkspace();

  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();
   const [deleteConfirm, DeleteDialog] = useConfirm(
     "Delete workspace",
     "Are you sure you want to delete this workspace?"
   );
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const confirmed = await deleteConfirm();
    if(!confirmed) return;
    removeWorksapce(
      {
        workspaceId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Workspace deleted successfully");
          router.replace("/");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  

  return (
    <>
      <DeleteDialog/>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-50 overflow-hidden px-4">
          <DialogHeader className="py-2 border-b bg-white">
            <DialogTitle>{initialValue}</DialogTitle>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-2 min-w-0">
            <div className="px-5 py-4 border-1 border-gray-200 rounded-md flex flex-col gap-1 ">
              <div className="flex justify-between">
                <span className="font-bold text-md">Workspace name</span>
                <EditDialog
                  open={editOpen}
                  setOpen={setEditOpen}
                  value={value}
                  setValue={setValue}
                  workspaceId={workspaceId}
                >
                  <span className="text-blue-500 cursor-pointer hover:text-blue-500/70 text-md">
                    Edit
                  </span>
                </EditDialog>
              </div>
              <p className="text-md truncate">
                {/* {value} */}
                {initialValue}
              </p>
            </div>

            <button
              disabled={removePending}
              onClick={handleDelete}
              className="mt-2 flex gap-2 items-center justify-center py-4 bg-white rounded-md border cursor-pointer hover:bg-gray-100 !text-rose-600"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delet workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
