import { format, isToday, isYesterday } from "date-fns";
import { Doc, Id } from "../../convex/_generated/dataModel";
// import Renderer from "./Renderer";
import dynamic from "next/dynamic";
import Hint from "./Hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Thumbnail from "./Thumbnail";
import MessageItemToolbar from "./MessageItemToolbar";
import useUpdateMessage from "@/feature/messages/api/useUpdateMessage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import useRemoveMessage from "@/feature/messages/api/useRemoveMessage";
import { useConfirm } from "@/hooks/useConfirm";
import useToggleReaction from "@/feature/reactions/api/useToggleReaction";
import Reactions from "./Reactions";
import { usePanel } from "@/hooks/usePanel";
import ThreadBar from "./ThreadBar";
const Renderer = dynamic(() => import("./Renderer"), { ssr: false });
const Editor = dynamic(() => import("./Editor"), { ssr: false });

interface MessageItemProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: string;
  image?: string | null;
  updatedAt?: Doc<"messages">["_creationTime"];
  createdAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  threadName?: string;
}

function formatFullTime(date: Date) {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
}

export default function MessageItem({
  id,
  memberId,
  authorImage,
  isAuthor,
  authorName,
  reactions,
  body,
  image,
  updatedAt,
  createdAt,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
  isEditing,
  setEditingId,
  isCompact,
  hideThreadButton,
}: MessageItemProps) {
  const { parentMessageId, onOpenMessage, onCloseMessage, onOpenProfile } = usePanel();

  const { mutate: updateMessage, pending: updateMessagePending } =
    useUpdateMessage();
  const { mutate: removeMessage, pending: removeMessagePending } =
    useRemoveMessage();
  const [confirm, ConfirmDialog] = useConfirm(
     "Delete Message",
     "Are you sure you want to delete this message? This action is irreversible."
   );

  const {mutate: toggleReaction, pending: toggleReactionPending} = useToggleReaction();
  const handleUpdateMessage = async ({body}: { body:string}) => {
    await updateMessage(
      { messageId: id, body },
      {
        onSuccess: () => {
          toast.success("Message updated");
          setEditingId(null);
        },
        onError: () => {
          toast.error("Failed to update message");
        },
      }
    );
  };

  const handleRemoveMessage = async () => {
   
    const ok = await confirm();
    if (!ok) return;

    await removeMessage(
      { messageId: id },
      {
        onSuccess: () => {
          toast.success("Message removed");
          //TODO: Close the thread if opened
          if(parentMessageId === id) {
            onCloseMessage();
          }

        },
        onError: () => {
          toast.error("Failed to remove message");
        },
      }
    );

  }

  const handleToggleReaction = async (value: string) => {
    toggleReaction({ messageId: id, value }, {
      onError: () => {
        toast.error("Failed to toggle reaction");
      },
    })
  }


  if (isCompact) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 py-2 px-5 hover:bg-gray-100/80 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          removeMessagePending &&
            "transform transition-all scale-y-0 origin-bottom duration-400"
        )}
      >
        <ConfirmDialog />
        <div className="flex">
          <Hint label={formatFullTime(new Date(createdAt!))} side="top">
            <button className="flex text-xs text-muted-foreground opacity-0 w-[60px] group-hover:opacity-100 text-center hover:underline">
              {format(new Date(createdAt!), "h:mm a")}
            </button>
          </Hint>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Editor
                onSubmit={handleUpdateMessage}
                disabled={updateMessagePending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            ) : (
              <div className="flex flex-col">
                <Renderer value={body!} />
                <Thumbnail url={image!} />
                {updatedAt && (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                )}
              </div>
            )}
            {/* 表情列表 */}
            <Reactions data={reactions} onChange={handleToggleReaction} />
            <ThreadBar
              count={threadCount!}
              image={threadImage!}
              name={threadName!}
              timestamp={threadTimestamp!}
              onClick={() => onOpenMessage(id)}
            />
          </div>
        </div>

        {!isEditing && (
          <MessageItemToolbar
            isAuthor={isAuthor}
            handleReaction={handleToggleReaction}
            updatePending={updateMessagePending}
            removePending={removeMessagePending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleRemoveMessage}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 py-2 px-5 hover:bg-gray-100/80 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
        removeMessagePending &&
          "transform transition-all scale-y-0 origin-bottom duration-400"
      )}
    >
      <ConfirmDialog />
      <div className="flex">
        <button
          className="flex w-[60px] shrink-0"
          onClick={() => onOpenProfile(memberId)}
        >
          <Avatar className=" size-10 !rounded-md mr-1">
            <AvatarImage
              src={authorImage}
              className="!rounded-md object-cover"
            />
            <AvatarFallback className="bg-sky-500 text-white !rounded-md text-sm">
              {authorName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className=" flex-1 min-w-0">
          {isEditing ? (
            // <div className="flex-1">
            <Editor
              onSubmit={handleUpdateMessage}
              disabled={updateMessagePending}
              defaultValue={JSON.parse(body)}
              onCancel={() => setEditingId(null)}
              variant="update"
            />
          ) : (
            // </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex gap-2 text-sm">
                <button
                  className="font-bold text-primary hover:underline"
                  onClick={() => onOpenProfile(memberId)}
                >
                  {authorName}
                </button>
                <button className="text-xs text-muted-foreground hover:underline cursor-pointer">
                  {format(new Date(createdAt!), "h:mm a")}
                </button>
              </div>
              <Renderer value={body!} />
              <Thumbnail url={image!} />
              {updatedAt && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
          )}
          {/* 表情列表 */}
          <Reactions data={reactions} onChange={handleToggleReaction} />
          <ThreadBar
            count={threadCount!}
            image={threadImage!}
            name={threadName!}
            timestamp={threadTimestamp!}
            onClick={() => onOpenMessage(id)}
          />
        </div>
      </div>

      {!isEditing && (
        <MessageItemToolbar
          isAuthor={isAuthor}
          handleReaction={handleToggleReaction}
          updatePending={updateMessagePending}
          removePending={removeMessagePending}
          handleEdit={() => {
            setEditingId(id);
          }}
          handleThread={() => onOpenMessage(id)}
          handleDelete={handleRemoveMessage}
          hideThreadButton={hideThreadButton}
        />
      )}
    </div>
  );
}
