import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import React from 'react'

interface ThreadBarProps {
  image: string;
  count: number;
  timestamp: number;
  name: string;
  onClick?: () => void;
}
export default function ThreadBar({ image, timestamp, count, onClick, name }: ThreadBarProps) {
  if (!count || !timestamp) return null;
  const avatarFallback = name.charAt(0).toUpperCase();
  return (
    <button
      onClick={onClick}
      className="cursor-pointer p-1 rounded-md hover:bg-white border border-transparent hover:border-gray-100 flex items-center group/thread-bar transition max-w-[600px]"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className=" size-6 rounded-md mr-1">
          <AvatarImage src={image} className="rounded-md" />
          <AvatarFallback className="bg-sky-500 text-white rounded-md text-xs">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-sky-700 hover:underline font-bold truncate">
          {count} {count > 1 ? "replies" : "reply"}
        </span>
        <span className="text-xs text-muted-foreground group-hover/thread-bar:hidden block truncate">
          Last reply {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <span className="ml-5 text-xs text-muted-foreground group-hover/thread-bar:block hidden truncate">
          View Thread
        </span>
        <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0" />
      </div>
    </button>
  );
}
