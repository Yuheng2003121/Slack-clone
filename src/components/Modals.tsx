"use client"
import CreateChannelModal from '@/feature/channels/components/CreateChannelModal';
import CreateWorkspaceModal from '@/feature/workspaces/components/CreateWorkspaceModal'
import React, { useEffect, useState } from 'react'

export default function Modals() {
  // 避免 Hydration 错误
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <CreateWorkspaceModal />
      <CreateChannelModal/>
    </>
  );
}
