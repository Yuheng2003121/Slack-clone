import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import HeaderEditDialog from "../../../channel/[channelId]/_components/HeaderEditDialog";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@/components/ui/avatar";

interface Props {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}
export default function Header({ memberName, memberImage, onClick }: Props) {
  const avatarFallback = memberName?.charAt(0).toUpperCase();


  return (
    <div className="bg-white  h-[49px] flex items-center px-4 overflow-hidden shrink-0">
      <Button
        variant={"ghost"}
        className="text-lg font-semibold px-2 overflow-hidden"
        size="sm"
        onClick={onClick}
      >
        <Avatar className=" size-6 rounded-md mr-1">
          <AvatarImage
            src={memberImage}
            alt={memberName}
            className="rounded-md"
          />
          <AvatarFallback className="bg-sky-500 text-white rounded-md text-xs">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="truncate">{memberName}</span>
        <FaChevronDown className="size-2.5 ml-2"/>
      </Button>
    </div>
  );
}
