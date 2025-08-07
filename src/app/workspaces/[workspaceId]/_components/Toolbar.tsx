"use client";
import { Button } from "@/components/ui/button";
import useGetWorkspace from "@/feature/workspaces/api/useGetWorkspace";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { Info, Loader, SearchIcon } from "lucide-react";
import React, { useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import useGetChannels from "@/feature/channels/api/useGetChannels";
import { useGetMembers } from "@/feature/members/api/useGetMembers";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";



export default function Toolbar() {
  const id = useWorkspaceId();
  const { workspace, isLoading } = useGetWorkspace(id);
  const { channels, isLoading: channelsLoading } = useGetChannels(id);
  const {members, isLoading: membersLoading} = useGetMembers(id);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onChannelClick = (channelId: Id<"channels">) => {
    setOpen(false);
    router.push(`/workspaces/${id}/channel/${channelId}`)
  }
  const onMemberClick = (memberId: Id<"members">) => {
    setOpen(false);
    router.push(`/workspaces/${id}/member/${memberId}`)
  }

  

  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-2">
      <div className="flex-1"></div>
      <div className="min-w-[280px] max-w-[642px] grow-[2] shrink">
        <Button
          size={"sm"}
          className="bg-accent/25 hover:bg-accent/25 w-full h-7 px-2 flex !justify-start"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="size-4 mr-1" />
          <span className="text-xs text-white">
            {isLoading ? (
              <Loader className="size-4 animate-spin text-white" />
            ) : (
              `Search ${workspace?.name}`
            )}
          </span>
        </Button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Channels">
              {channels?.map((channel) => (
                <CommandItem key={channel._id} onSelect={() => onChannelClick(channel._id)}>
                    {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Members">
              {members?.map((member) => (
                <CommandItem key={member._id} onSelect={() => onMemberClick(member._id)}>
                  {member.user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <div className="flex-1 flex items-center justify-end">
        <Button variant={"transparent"} size={"icon"}>
          <Info className="size-5 text-white" />
        </Button>
      </div>
    </nav>
  );
}
