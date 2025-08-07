"use client";
import { useCurrentMember } from "@/feature/members/api/useCurrentMember";
import useGetWorkspace from "@/feature/workspaces/api/useGetWorkspace";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
  UserIcon,
} from "lucide-react";
import React from "react";
import WorkspaceHeader from "./WorkspaceHeader";
import SidebarItem from "./SidebarItem";
import useGetChannels from "@/feature/channels/api/useGetChannels";
import WorkspaceSection from "./WorkspaceSection";
import { useGetMembers } from "@/feature/members/api/useGetMembers";
import UserItem from "./UserItem";
import { useCreateChannelModal } from "@/feature/channels/store/useCreateChannelModal";
import useChannelId from "@/hooks/useChannelId";
import useMemberId from "@/hooks/useMemberId";

export default function WorkspaceSiderbar() {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const memberId = useMemberId();
  const { member, isLoading: memberLoading } = useCurrentMember(workspaceId);
  const { workspace, isLoading: workspaceLoading } = useGetWorkspace(workspaceId);
   
  const { channels, isLoading:channelsLoading } = useGetChannels(workspaceId);
  const { members, isLoading:membersLoading } = useGetMembers(workspaceId);

  const [_open, setOpen] = useCreateChannelModal();
  if (memberLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!member || !workspace) {
    return (
      <div className="flex flex-col gap-1 items-center justify-center h-full">
        <AlertTriangle className="size-6 text-white" />
        <p className="text-white text-sm">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5">
        <WorkspaceHeader
          workspace={workspace}
          isAdmin={member.role === "admin"}
        />
      </div>
      
      <div className="flex flex-col px-5 gap-2 mt-3">
        <SidebarItem label="Threads" icon={MessageSquareText} id="threads" />
        <SidebarItem label="Drafts & Sent" icon={SendHorizonal} id="drafts" />
      </div>

      <div className="px-5">
        <WorkspaceSection label="Channels" hint="New channel" onNew={member.role==='admin' ? () => setOpen(true): undefined}>
          {channels?.map((item) => {
            return (
              <SidebarItem
                key={item._id}
                label={item.name}
                icon={HashIcon}
                id={item._id}
                variant={channelId === item._id ? 'active' : 'default'}
              />
            );
          })}
        </WorkspaceSection>

        <WorkspaceSection label="Direct Messages" hint="New direct messages" onNew={() => {}}>
          {members?.map((item) => (
            <UserItem
              key={item._id}
              label={item.user.name}
              image={item.user.image}
              workspaceId={workspaceId}
              id={item._id}
              variant={item._id === memberId ? "active" : "default"}
            />
          ))}
        </WorkspaceSection>
      </div>
    </div>
  );
}
