import { Button } from "@/components/ui/button";
import useWorkspaceId from "@/hooks/useWorkspaceId";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { IconType } from "react-icons/lib";

interface Props {
  label: string;
  icon: LucideIcon | IconType;
  id: string;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}

const sidebarItemVariants = cva(
  "flex items-center justify-start font-normal text-sm overflow-hidden ",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/60 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
export default function SidebarItem({ label, icon: Icon, id, variant }: Props) {
  const workspaceId = useWorkspaceId();
  return (
    <Button
      asChild
      variant={"transparent"}
      size={"sm"}
      className={cn(sidebarItemVariants({ variant: variant }), "mt-1")}
    >
      <Link href={`/workspaces/${workspaceId}/channel/${id}`}>
        <Icon className="size-5 shrink-0 mr-1" />
        <span className="text-sm truncate !w-full">
          {label}
        </span>
      </Link>
    </Button>
  );
}
