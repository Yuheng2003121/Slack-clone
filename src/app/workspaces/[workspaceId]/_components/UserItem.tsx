import { Button } from '@/components/ui/button'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Id } from '../../../../../convex/_generated/dataModel'
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  id: Id<"members">;
  workspaceId: Id<"workspaces">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}

const sidebarItemVariants = cva(
  "flex items-center justify-start font-normal text-sm overflow-hidden ",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/70 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
export default function UserItem({ id, label, image, variant, workspaceId }: Props) {
  return (
    <Button
      variant={"transparent"}
      className={cn(sidebarItemVariants({ variant }), "mt-1")}
      size={"sm"}
      asChild
    >
      <Link href={`/workspaces/${workspaceId}/member/${id}`}>
        <Avatar className=" size-6 rounded-md mr-1">
          <AvatarImage src={image} alt={label} className="rounded-md" />
          <AvatarFallback className="bg-sky-500 text-white rounded-md text-xs">
            {label?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  );
}
