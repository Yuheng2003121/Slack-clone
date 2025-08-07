import React from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "../api/useGetMember";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ChevronDown,
  Loader,
  MailIcon,
  XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import useUpdateMember from "../api/useUpdateMember";
import useRemoveMember from "../api/useRemoveMember";
import { useCurrentMember } from "../api/useCurrentMember";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { removeMember } from "../../../../convex/members";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { redirect, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  memberId: Id<"members">;
  onCloseProfile: () => void;
}
export default function Profile({ memberId, onCloseProfile }: Props) {
  const worksapceId = useWorkspaceId();
  const router = useRouter();
  const { member: currentMember, isLoading: currentMemberLoading } =
    useCurrentMember(worksapceId);

  const { data: member, isLoading: memberLoading } = useGetMember(memberId);
  const avatarFallback = member?.user.name?.charAt(0).toUpperCase() || "?";
  const isSelf = currentMember?._id === memberId;
  const [confirmDelete, ConfirmDialogDelete] = useConfirm(
    "Delete Member",
    !isSelf
      ? "Are you sure you want to delete this member?"
      : "Are you sure you want to quit this workspace?"
  );

  const [confirmUpdate, ConfirmDialogUpdate] = useConfirm(
    "Update role",
    "Are you sure you want to update this member's role?"
  );

  const { mutate: updateMember, pending: updatePending } = useUpdateMember();
  const { mutate: deleteMember, pending: deletePending } = useRemoveMember();

  const onRemoveMember = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    await deleteMember(
      { memberId },
      {
        onSuccess: async () => {
          onCloseProfile();
          const msg = isSelf
            ? "You have left this workspace"
            : "Member deleted";
          toast.success(msg);
          if (isSelf) {
            // await router.replace("/");
            redirect("/");
          }
        },
        onError: (error) => {
          const errMsg =
            error instanceof ConvexError
              ? error.data
              : "Failed to delete member";
          toast.error(errMsg);
        },
      }
    );
  };

  const onRoleChange = async (role: "admin" | "member") => {
    const ok = await confirmUpdate();
    if (!ok) return;
    updateMember(
      { memberId, role },
      {
        onSuccess: () => {
          onCloseProfile();
          toast.success("Role updated");
        },
        onError: (error) => {
          const errMsg =
            error instanceof ConvexError ? error.data : "Failed to update role";
          toast.error(errMsg);
        },
      }
    );
  };

  if (memberLoading || currentMemberLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button
            className="cursor-pointer"
            variant={"ghost"}
            onClick={onCloseProfile}
            size={"icon"}
          >
            <XIcon className="size-5 stroke-[1/5]" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin size-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!member || !currentMember) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button
            className="cursor-pointer"
            variant={"ghost"}
            onClick={onCloseProfile}
            size={"icon"}
          >
            <XIcon className="size-5 stroke-[1/5]" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <AlertTriangle className="size-5 mr-1 text-red-500" />
          <p className="text-muted-foreground text-sm">Profile not found</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col">
      <ConfirmDialogDelete />
      <ConfirmDialogUpdate />
      <div className="flex justify-between items-center px-4 h-[49px] border-b">
        <p className="text-lg font-bold">Profile</p>
        <Button
          className="cursor-pointer"
          variant={"ghost"}
          onClick={onCloseProfile}
          size={"icon"}
        >
          <XIcon className="size-5 stroke-[1/5]" />
        </Button>
      </div>
      <div className="flex flex-col items-center p-4">
        <Avatar className="!rounded-md mr-1 max-w-[256px] max-h-[256px] size-full">
          <AvatarImage
            src={member.user.image}
            className="!rounded-md object-cover"
          />
          <AvatarFallback className="bg-sky-500 text-white !rounded-md text-6xl aspect-square">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col p-4">
        <p className="text-xl font-bold truncate">{member.user.name}</p>
        {currentMember?.role === "admin" && currentMember?._id !== memberId ? (
          <div className="flex items-center gap-2 mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 capitalize">
                  {member.role} <ChevronDown className="size-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={member.role}
                  onValueChange={(role) =>
                    onRoleChange(role as "admin" | "member")
                  }
                >
                  <DropdownMenuRadioItem value="admin">
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="member">
                    Member
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className="bg-red-500 text-white hover:bg-red-500/80 hover:text-white"
              onClick={onRemoveMember}
              disabled={deletePending}
            >
              Delete
            </Button>
          </div>
        ) : currentMember?._id === memberId && member.role === "member" ? (
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              className="bg-red-500 text-white hover:bg-red-500/80 hover:text-white"
              onClick={onRemoveMember}
              disabled={deletePending}
            >
              Quit
            </Button>
          </div>
        ) : null}
      </div>
      <Separator />
      <div className="flex flex-col p-4">
        <p className="text-sm font-bold mb-4">Contact Information</p>
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 items-center">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>
              <Link
                href={`mailto:${member.user.email}`}
                className="text-sm hover:underline text-[#1264a3]"
              >
                {member.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
