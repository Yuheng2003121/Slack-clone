import { atom, useAtom } from "jotai"

const modalState = atom(false)

export const useCreateWorkspacesModal = () => useAtom(modalState)