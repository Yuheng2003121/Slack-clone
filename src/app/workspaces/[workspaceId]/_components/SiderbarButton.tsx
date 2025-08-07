import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react'
import React from 'react'
import { IconType } from 'react-icons/lib'
import { is } from 'zod/v4/locales';

interface Props {
 icon: LucideIcon | IconType;
 label: string;
 isActive?: boolean;   
}
export default function SiderbarButton({icon:Icon, label, isActive}: Props) {
  return (
    <div className="flex flex-col gap-1 items-center justify-center cursor-pointer group">
      <Button
        variant={"transparent"}
        className={cn(
          "size-9 p-2 group-hover:bg-accent/20",
          isActive && "bg-accent/20"
        )}
      >
        <Icon className="size-5 text-white group-hover:scale-110 transition-all" />
      </Button>
      <span className={cn("text-[11px] text-white group-hover:underline",
        isActive && "underline"
      )}>
        {label}
      </span>
    </div>
  );
}
