import { atom, useAtom } from "jotai"
import { Doc, Id } from "../../../../convex/_generated/dataModel"


const modalState = atom<Doc<"conversations"> | null | undefined>(null)

export const useConversation = () => useAtom(modalState)