import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XIcon } from 'lucide-react';

interface Props {
  url: string;
}
export default function Thumbnail({url}: Props) {
  if(!url) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative max-w-[360px] overflow-hidden border rounded-lg my-2 cursor-zoom-in">
          <img
            src={url}
            alt="Message image"
            className="rounded-md object-cover size-full"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-0 bg-transparent p-0 ">
          <DialogTitle className='hidden'></DialogTitle>
          <img
            src={url}
            alt="Message image"
            className="rounded-md object-cover size-full"
          />
      </DialogContent>
    </Dialog>
  );
}
