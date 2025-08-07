"use client"
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import useWorkspaceId from '@/hooks/useWorkspaceId';
import useGetWorkspace from '@/feature/workspaces/api/useGetWorkspace';
import useGetWorkspaces from '@/feature/workspaces/api/useGetWorkspaces';
import { useCreateWorkspacesModal } from '@/feature/workspaces/store/useCreateWorkspacesModal';
import { Loader, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function WorkspaceSwitcher() {
  const id = useWorkspaceId()
  const router = useRouter()
  const [_open, setOpen] = useCreateWorkspacesModal()
  const {workspace, isLoading: workspaceLoading} = useGetWorkspace(id)
  const {workspaces, isLoading: workspacesLoading} = useGetWorkspaces()

  //不包含当前的workspace的所有其他workspaces
  const filteredWorkspaces = workspaces?.filter(workspace => workspace._id !== id)


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-9 bg-[#ABABAD] hover:bg-[#ABABAD]/80 text-slate-800 font-semibold text-xl">
          {workspaceLoading ? (
            <Loader className="size-5 animate-spin" />
          ) : (
            workspace?.name.charAt(0).toUpperCase()
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className='w-62'>
        <DropdownMenuItem
          className="cursor-pointer flex-col items-start gap-0 capitalize"
          onClick={() => router.push(`/workspaces/${id}`)}
        >
          {workspace?.name}
          <span className="text-xs text-muted-foreground">
            Active workspace
          </span>
        </DropdownMenuItem>

        {filteredWorkspaces?.map((workspace) => (
          <DropdownMenuItem
            key={workspace._id}
            className="cursor-pointer capitalize"
            onClick={() => router.push(`/workspaces/${workspace._id}`)}
          >
            <div className="shrink-0 size-8 bg-[#616061] flex justify-center items-center rounded-md text-white">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <span className='truncate'>{workspace.name}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="flex gap-2 items-center text-slate-800">
            <div className="size-8 bg-[#F2F2F2] flex justify-center items-center rounded-md">
              <Plus className="size-5" />
            </div>
            <span>Create a new workspace</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
