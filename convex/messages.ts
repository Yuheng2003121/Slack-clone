import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return await ctx.db
    .query("members")
    .withIndex("by_workspace_id_and_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();
};

const populateUser = async (ctx: QueryCtx, userId: Id<"users">) => {
  return await ctx.db.get(userId);
};
const populateMember = async (ctx: QueryCtx, memberId: Id<"members">) => {
  return await ctx.db.get(memberId);
};

const populateReactions = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  return await ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();
};

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const replies = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId)
    )
    .collect();
  if (replies.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name:''
    };
  }

  const lastReply = replies[replies.length - 1];
  const lastReplyMember = await populateMember(ctx, lastReply.memberId);
  if (!lastReplyMember) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastReplyUser = await populateUser(ctx, lastReplyMember.userId);
  return {
    count: replies.length,
    image: lastReplyUser?.image,
    timestamp: lastReply._creationTime,
    name: lastReplyUser?.name ,
  };
};

export const addMessage = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new ConvexError("Unauthorized");

    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member)
      throw new ConvexError("You are not a member of this workspace");

    let _conversationId = args.conversationId;

    //This is only possible if we are replying in a thread in 1:1 conversation
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new ConvexError("Parent message not found");
      _conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert("messages", {
      memberId: member._id,
      body: args.body,
      image: args.image,
      channelId: args.channelId,
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
      conversationId: _conversationId,
    });

    return messageId;
  },
});

export const getMessages = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    let _conversationId = args.conversationId;
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new ConvexError("Parent message not found");
      _conversationId = parentMessage?.conversationId;
    }

    //这里的messages是page对象, 里面的page属性才是messages数组
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const data = await Promise.all(
      messages.page.map(async (message) => {
        const member = await populateMember(ctx, message.memberId);
        const user = member ? await populateUser(ctx, member.userId) : null;
        if (!member || !user) return null;

        const reactions = await populateReactions(ctx, message._id);
        const thread = await populateThread(ctx, message._id);
        const image = message.image
          ? await ctx.storage.getUrl(message.image)
          : undefined;

        const reactionsWithCount = reactions.map((reaction) => ({
          ...reaction,
          count: reactions.filter((r) => r.value === reaction.value).length,
        }));

        //对 reactionsWithCount数组进行memberId合并成memberIds
        const reactionsWithMembers = reactionsWithCount.reduce(
          (acc, reaction) => {
            const existingReaction = acc.find(
              (r) => r.value === reaction.value
            );

            if (existingReaction) {
              existingReaction.memberIds = Array.from(
                new Set([...existingReaction.memberIds, reaction.memberId])
              );
            } else {
              acc.push({
                ...reaction,
                memberIds: [reaction.memberId],
              });
            }

            return acc;
          },
          [] as (Doc<"reactions"> & {
            count: number;
            memberIds: Id<"members">[];
          })[]
        );

        //去除memberId属性
        const reactionsWithoutMemberId = reactionsWithMembers.map(
          ({ memberId, ...rest }) => rest
        );

        return {
          ...message,
          image,
          member,
          user,
          reactions: reactionsWithoutMemberId,
          threadCount: thread.count,
          threadImage: thread.image,
          threadName: thread.name,
          threadTimestamp: thread.timestamp,
        };
      })
    );

    const page = data.filter((message) => message !== null);

    return {
      ...messages,
      page,
    };
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    body: v.string(),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if(!message) throw new ConvexError("Message not found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member.userId !== userId) throw new ConvexError("Unauthorized");

    await ctx.db.patch(args.messageId, {
      body: args.body,
      updatedAt: Date.now(),
    });
    return args.messageId;
  }
  
})

export const removeMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Message not found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member.userId !== userId)
      throw new ConvexError("Unauthorized");

    await ctx.db.delete(args.messageId);
    return args.messageId;
  },
});


export const getMessageById = query({
  args: {
    messageId: v.id("messages"),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    const currentMember = await getMember(ctx, message.workspaceId, userId);
    if (!currentMember) return null;//当前user不在worksapce中

    const member = await populateMember(ctx, message.memberId);
    if (!member) return null;

    const user = await populateUser(ctx, member.userId);
    if (!user) return null;

    const reactions = await populateReactions(ctx, message._id);
    const reactionsWithCount = reactions.map((reaction) => ({
      ...reaction,
      count: reactions.filter((r) => r.value === reaction.value).length,
    }));

    //对 reactionsWithCount数组进行memberId合并成memberIds,和根据value去重
    const reactionsWithMembers = reactionsWithCount.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);

        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          acc.push({
            ...reaction,
            memberIds: [reaction.memberId],
          });
        }

        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[]
    );

    //去除memberId属性
    const reactionsWithoutMemberId = reactionsWithMembers.map(
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image) //把convex的data的id转换为url
        : undefined,
      user,
      member,
      reactions: reactionsWithoutMemberId,
    }
  }

})
