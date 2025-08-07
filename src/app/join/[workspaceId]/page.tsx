"use client";
import { Button } from "@/components/ui/button";
import useGetWorkspaceInfo from "@/feature/workspaces/api/useGetWorkspaceInfo";
import useJoinWorkspace from "@/feature/workspaces/api/useJoinWorkspace";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { cn } from "@/lib/utils";
import { ConvexError } from "convex/values";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("joinCode");

  const [value, setValue] = useState(code || "");
  const workspaceId = useWorkspaceId();
  const { mutate, pending } = useJoinWorkspace();
  const { workspaceInfo, isLoading: isLoadingInfo } =
    useGetWorkspaceInfo(workspaceId);
  const router = useRouter();
  const isMember = useMemo(() => workspaceInfo?.isMember, [workspaceInfo?.isMember])

  const handleComplete = (value: string) => {
    mutate(
      {
        workspaceId,
        joinCode: value,
      },
      {
        onSuccess: () => {
          router.replace(`/workspaces/${workspaceId}`);
          toast.success("Workspace Joined");
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError ? error.data : error.message;
          toast.error(errorMessage);
        },
      }
    );
  };

  // useEffect(() => {
  //   if(isMember) {
  //     router.push(`/workspaces/${workspaceId}`);
  //     toast.success("You are already a member of this workspace");
  //   }
  // },[isMember, router, workspaceId])

  //首次渲染, 把code作为VerificationInput的值,直接提交
  useEffect(() => {
    if (isMember) {
      router.push(`/workspaces/${workspaceId}`);
      toast.success("You are already a member of this workspace");
    }

    if (value.length === 6 && !pending && !isMember) {
      handleComplete(value);
    }
  }, []);


  if (isLoadingInfo) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }
  if (!workspaceInfo) return null;

  return (
    <div className="h-full flex flex-col gap-8 items-center justify-center bg-white shadow-md">
      <Image src={"/vercel.svg"} width={60} height={60} alt="logo" />
      <div className="flex flex-col gap-4 max-w-md items-center">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-2xl font-bold">Join {workspaceInfo?.name}</h1>
          <p className="text-md text-muted-foreground">
            Enter the worksapce code to join
          </p>
        </div>
        <VerificationInput
          value={value || ""}
          onChange={(currentValue) => setValue(currentValue)}
          onComplete={handleComplete}
          classNames={{
            container: cn(
              "flex gap-2",
              pending && "opacity-50 cursor-not-allowed"
            ),
            character:
              "uppercase rounded-md border !border-gray-300 !text-lg text-gray-500 flex justify-center items-center",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
          autoFocus={true}
          length={6}
        />
      </div>
      <div className="flex gap-4">
        <Button size={"lg"} asChild>
          <Link href={`/`}>Go back to home</Link>
        </Button>
      </div>
    </div>
  );
}
