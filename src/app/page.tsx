"use client";
import SignOutButton from "@/feature/auth/components/SignOutButton";
import UserButton from "@/feature/auth/components/UserButton";
import { useCreateWorkspacesModal } from "@/feature/workspaces/store/useCreateWorkspacesModal";
import useGetWorkspaces from "@/feature/workspaces/api/useGetWorkspaces";
import { useEffect } from "react";
import CreateWorkspaceModal from "@/feature/workspaces/components/CreateWorkspaceModal";
import { useRouter } from "next/navigation";

export default function Home() {
  const [open, setOpen] = useCreateWorkspacesModal();
  const { workspaces, isLoading } = useGetWorkspaces();
  const workspaceId = workspaces?.[0]?._id;
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (workspaceId) {
      setOpen(false);
      router.replace(`/workspaces/${workspaceId}`);
    } else if (!open && !workspaceId) {
      setOpen(true);
    }
  }, [workspaceId, open, setOpen, router, isLoading]);


  return (
    <div className="h-full flex items-center justify-center">
      <UserButton />
    </div>
  );
}
