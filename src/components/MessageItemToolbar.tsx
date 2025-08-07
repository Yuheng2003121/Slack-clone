import React from "react";
import { Button } from "./ui/button";
import { MessageSquareTextIcon, Pencil, Smile, Trash } from "lucide-react";
import Hint from "./Hint";
import EmojiPopover from "./EmojiPopover";

interface Props {
  isAuthor: boolean;
  updatePending: boolean;
  removePending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  hideThreadButton?: boolean;

}
export default function MessageItemToolbar({
  isAuthor,
  updatePending,
  removePending,
  handleEdit,
  handleThread,
  handleDelete,
  handleReaction,
  hideThreadButton,
}: Props) {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border border-white bg-white rounded-md ">
        <EmojiPopover
          hint="Add reaction"
          onEmojiSelect={(emoji) => handleReaction(emoji.native)}
        >
          <Button
            variant="ghost"
            size="icon"
            disabled={updatePending}
            className="hover:bg-gray-200"
          >
            <Smile className="size-4" />
          </Button>
        </EmojiPopover>

        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              variant="ghost"
              size="icon"
              disabled={updatePending}
              onClick={handleThread}
              className="hover:bg-gray-200"
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Edit message">
            <Button
              variant="ghost"
              size="icon"
              disabled={updatePending}
              onClick={handleEdit}
              className="hover:bg-gray-200"
            >
              <Pencil className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Delete message">
            <Button
              variant="ghost"
              size="icon"
              disabled={removePending}
              onClick={handleDelete}
              className="hover:bg-gray-200"
            >
              <Trash className="size-4" />
            </Button>
          </Hint>
        )}
      </div>
    </div>
  );
}
