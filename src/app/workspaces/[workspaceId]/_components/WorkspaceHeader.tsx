import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { ChevronDown, ListFilter, SquarePen } from "lucide-react";
import Hint from "@/components/Hint";
import PreferencesModal from "./PreferencesModal";
import InviteModal from "./InviteModal";

interface Props {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}
export default function WorkspaceHeader({ workspace, isAdmin }: Props) {
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [inviteOpen, seInviteOpen] = useState(false);
  return (
    <>
      <InviteModal
        open={inviteOpen}
        setOpen={seInviteOpen}
        name={workspace.name}
        joinCode={workspace.joinCode}
      />
      <PreferencesModal
        open={preferenceOpen}
        setOpen={setPreferenceOpen}
        initialValue={workspace.name}
      />
      <div className="flex items-center justify-between  h-[49px] gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex-1 overflow-hidden">
              <Button
                variant="transparent"
                className="font-semibold text-lg text-white max-w-full"
              >
                <span className="truncate ">
                  {workspace.name}
                </span>
                <ChevronDown className="size-4 ml-0.5 shrink-0" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-64 ">
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div className="shrink-0 size-9 flex justify-center items-center text-white rounded-md bg-[#616061] font-semibold text-xl">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col ml-1 ">
                <p className="font-bold truncate">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  Active workspace
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer py-2" onClick={() => seInviteOpen(true)}>
                  <span className="truncate">
                    Invite people to {workspace.name}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2"
                  onClick={() => setPreferenceOpen(true)}
                >
                  <span className="truncate">Preference</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1">
          <Hint label="Filter conversations" side="bottom">
            <Button variant={"transparent"} className="size-7">
              <ListFilter className="size-4 text-white" />
            </Button>
          </Hint>
          <Hint label="New message" side="bottom">
            <Button variant={"transparent"} className="size-7">
              <SquarePen className="size-4 text-white" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
}
