"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useCurrentUser from '../api/useCurrentUser';
import { Loader, LogOut } from 'lucide-react';
import SignOutButton from './SignOutButton';

export default function UserButton() {
  const {data:user, isLoading} = useCurrentUser()
  if(isLoading) {
    return <Loader className='size-4 animate-spin text-muted-foreground'/>
  }
  if(user === null) {
    return null;
  }

  const {image, name, email} = user!;
  const avatarFallback = name?.charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-10 hover:opacity-75 transition">
          <AvatarImage alt={name} src={image} />
          <AvatarFallback className='bg-sky-500 text-white'>{avatarFallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" side="right">
        <SignOutButton>
          <DropdownMenuItem>
            <LogOut className="size-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </SignOutButton>


      </DropdownMenuContent>
    </DropdownMenu>
  );
}
