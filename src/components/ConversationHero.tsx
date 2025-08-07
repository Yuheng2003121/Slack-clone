import { format } from 'date-fns';
import React from 'react'

interface Props {
  name?: string;
  image?: string;
}
export default function ConversationHero({ name, image }: Props) {
  console.log(name)
  return (
    <div className="py-4 px-5 flex flex-col">
      <p className="text-2xl font-bold"># {name}</p>
      <p className="text-slate-800 ">
        This conversation is bewtten You and <strong>{name}</strong>.
      </p>
    </div>
  );
}
