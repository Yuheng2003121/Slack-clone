import React from 'react'
import { Doc, Id } from '../../convex/_generated/dataModel'
import useWorkspaceId from '@/hooks/useWorkspaceId';
import { useCurrentMember } from '@/feature/members/api/useCurrentMember';
import { cn } from '@/lib/utils';
import Hint from './Hint';
import EmojiPopover from './EmojiPopover';
import { MdOutlineAddReaction } from 'react-icons/md';

interface Props {
  data: Array<Omit<Doc<"reactions">, "memberId"> & {count:number; memberIds: Id<"members">[]}>;
  onChange: (value: string) => void;
}
export default function Reactions({data, onChange}: Props) {
  const workspaceId = useWorkspaceId()
  const { member: currentMember } = useCurrentMember(workspaceId);

  if(data.length === 0 || !currentMember) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 my-1">
      {data.map((reaction) => (
        <Hint
          key={reaction._id}
          label={`${reaction.count} ${reaction.count > 1 ? "People" : "person"} reacted with ${reaction.value}`}
          side='top'
        >
          <button
            onClick={() => onChange(reaction.value)}
            className={cn(
              "px-2 rounded-full bg-slate-200/70  border border-transparent text-slate-800 flex items-center gap-1 cursor-pointer",
              reaction.memberIds.includes(currentMember._id) &&
                "bg-blue-100/70 border-blue-500 text-white"
            )}
          >
            {reaction.value}
            <span
              className={cn(
                "text-sm text-muted-foreground",
                reaction.memberIds.includes(currentMember._id) &&
                  "text-blue-500"
              )}
            >
              {reaction.count}
            </span>
          </button>
        </Hint>
      ))}

      <EmojiPopover
        hint="Add reaction"
        onEmojiSelect={(emoji) => onChange(emoji.native)}
      >
        <button
          className='cursor-pointer px-3 rounded-full  bg-slate-200/70 border border-transparent hover:border-slate-500 text-slate-800 '
        >
          <MdOutlineAddReaction className='size-5'/>
        </button>
      </EmojiPopover>
    </div>
  );
}
