"use client"
import useGetWorkspace from '@/feature/workspaces/api/useGetWorkspace';
import React, { useEffect, useMemo } from 'react'
import { Id } from '../../../../convex/_generated/dataModel';
import useWorkspaceId from '@/hooks/useWorkspaceId';
import { useCreateChannelModal } from '@/feature/channels/store/useCreateChannelModal';
import useGetChannels from '@/feature/channels/api/useGetChannels';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader } from 'lucide-react';
import { useCurrentMember } from '@/feature/members/api/useCurrentMember';

export default function Page({params}: {params: Promise<{workspaceId: Id<"workspaces">}>} ) {
  const router = useRouter()
  const workspaceId = useWorkspaceId()
  const [open, setOpen] = useCreateChannelModal();

  const { workspace, isLoading:isLoadingWorkspace } = useGetWorkspace(workspaceId);
  const {member, isLoading:isLoadingMember} = useCurrentMember(workspaceId)
  const {channels, isLoading: isLoadingChannels} = useGetChannels(workspaceId);

  const channelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => member?.role === "admin", [member]);


  useEffect(()=> {
    if(isLoadingChannels || isLoadingWorkspace || isLoadingMember || !member || !workspaceId) {
      return;
    }

    //直接跳转到第一个channel
    if(channelId) {
      router.push(`/workspaces/${workspaceId}/channel/${channelId}`)
    } 

    //Optional: 在没有channel时候强制admin创建
    // else if(!open && isAdmin) {
    //   setOpen(true);
    // }

  },[channelId, isLoadingChannels, isLoadingWorkspace, workspaceId, open, setOpen, router, member, isLoadingMember])

  if(isLoadingWorkspace || isLoadingChannels || isLoadingMember) {
    return (
      <div className='h-full flex-1 flex justify-center items-center'>
        <Loader className='size-6 animate-spin text-muted-foreground'/>
      </div>
    )
  }
  if(!workspace) {
    return (
      <div className='h-full flex-1 flex gap-2 justify-center items-center'>
        <AlertTriangle className='size-6 text-muted-foreground'/>
        <span className='text-sm text-muted-foreground'>Worksapce not found</span>
      </div>
    )
  }

  if(!member) {
    return (
      <div className='h-full flex-1 flex gap-2 justify-center items-center'>
        <AlertTriangle className='size-6 text-muted-foreground'/>
        <span className='text-sm text-muted-foreground'>You are not a member of this workspace</span>
      </div>
    )
  }

  //如果是member但不是admin且workspace没有channel不存在就会渲染这个
  return (
    <div className="h-full flex-1 flex gap-2 justify-center items-center">
      <AlertTriangle className="size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">No channel found</span>
    </div>
  );
}
