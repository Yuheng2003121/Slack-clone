import { format } from 'date-fns';
import React from 'react'

interface Props {
  name: string;
  creationTime: number
}
export default function ChannelHero({name, creationTime}: Props) {
  return (
    // <div className='mt-[88px] mx-5 mb-4'>
    //   <p className='text-2xl font-bold flex items-center mb-2'>
    //     # {name}
    //   </p>
    //   <p className='text-slate-800 '>
    //     this channel was created on {format(new Date(creationTime), 'MMMM dd, yyyy')}. This is the very beginning of the <strong>{name}</strong> channel.
    //   </p>
    // </div>
    <div className="py-4 px-5 flex flex-col">
      <p className="text-2xl font-bold flex items-center mb-2"># {name}</p>
      <p className="text-slate-800 ">
        this channel was created on{" "}
        {format(new Date(creationTime), "MMMM dd, yyyy")}. This is the very
        beginning of the <strong>{name}</strong> channel.
      </p>
    </div>
  );
}
