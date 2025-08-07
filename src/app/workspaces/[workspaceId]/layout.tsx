"use client"
import React from "react";
import Toolbar from "./_components/Toolbar";
import Sidebar from "./_components/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkspaceSiderbar from "./_components/WorkspaceSiderbar";
import { usePanel } from "@/hooks/usePanel";
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import Thread from "@/feature/messages/components/Thread";
import Profile from "@/feature/members/components/Profile";
export default function Layout({ children }: { children: React.ReactNode }) {
  const { parentMessageId, profileMmeberID, onCloseProfile, onCloseMessage } =
    usePanel();
  const showPanel = !!parentMessageId || !!profileMmeberID; //查看当前url是否有?parentMessageId=...或者profileMmeberID=...
  console.log(profileMmeberID);
  return (
    <div className="h-full ">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="ca-workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#5E2C5F]"
          >
            <WorkspaceSiderbar />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel minSize={20}>{children}</ResizablePanel>

          {showPanel && (
            <>
              <ResizableHandle />
              <ResizablePanel minSize={20} defaultSize={29}>
                {parentMessageId ? (
                  <Thread
                    messageId={parentMessageId as Id<"messages">}
                    onCloseMessage={onCloseMessage}
                  />
                ) :  profileMmeberID ? (
                  <Profile
                    memberId={profileMmeberID as Id<"members">}
                    onCloseProfile={onCloseProfile}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader className="animate-spin size-5 text-muted-foreground" />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
