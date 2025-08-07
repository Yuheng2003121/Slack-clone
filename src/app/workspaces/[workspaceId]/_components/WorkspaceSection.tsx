import Hint from '@/components/Hint';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import React, { useState } from 'react'
import { FaCaretDown } from 'react-icons/fa';

interface Props {
  children: React.ReactNode;
  label: string;
  hint: string;
  onNew?: () => void;
}
export default function WorkspaceSection({ children, label, hint, onNew }: Props) {
  // const [on, toggle] = useToggle(false);
  const [open, setOpen] = useState(false);


  return (
    <div className="flex flex-col mt-3">
      <div className="flex items-center group gap-1">
        <Button
          variant={"transparent"}
          className="text-sm text-[#f9edffcc]  size-6"
          // onClick={toggle}
          onClick={() => setOpen(!open)}
        >
          <FaCaretDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              open ? "rotate-180" : ""
            )}
          />
        </Button>
        <div className="flex-1 overflow-hidden">
          <Button
            variant={"transparent"}
            className="px-1.5 text-sm text-[#f9edffcc] h-[28px] overflow-hidden max-w-full"
          >
            <span className="truncate">{label}</span>
          </Button>
        </div>
        {onNew && (
          <Hint label={hint} side="top" align="center">
            <Button
              onClick={onNew}
              variant={"transparent"}
              size={"icon"}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-sm text-[#f9edffcc] size-6 shrink-0"
            >
              <PlusIcon className="size-5" />
            </Button>
          </Hint>
        )}
      </div>
      {open && children}
    </div>
  );
}
