"use client"
import React from 'react'
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";


export default function SignOutButton({children} : {children: React.ReactNode}) {
  const {signOut} = useAuthActions();
  return (
    <div onClick={signOut}>
      {children}
    </div>
  );
}
