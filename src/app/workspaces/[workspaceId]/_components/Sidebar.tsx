import UserButton from '@/feature/auth/components/UserButton'
import React from 'react'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import SiderbarButton from './SiderbarButton';
import { BellIcon, Home, MessageSquare, MoreHorizontal } from 'lucide-react';

export default function Sidebar() {
  return (
    // w-[70px]
    <div className="flex-shrink-0 px-3 h-full bg-[#481349] flex flex-col gap-4 items-center pt-[9px] pb-4">
      <div>A</div>
      <WorkspaceSwitcher />
      <SiderbarButton icon={Home} label='Home' isActive/>
      <SiderbarButton icon={MessageSquare} label='DMs' />
      <SiderbarButton icon={BellIcon} label='Activity' />
      <SiderbarButton icon={MoreHorizontal} label='More'/>
      <div className="flex justify-center mt-auto">
        <UserButton />
      </div>
    </div>
  );
}
