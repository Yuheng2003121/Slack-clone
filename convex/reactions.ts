import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

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

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if(!message) throw new ConvexError("Message not found");

    const member = await getMember(ctx, message.workspaceId, userId)
    if(!member) throw new ConvexError("Unauthorized");

    const existingReactionsFromUser = await ctx.db
      .query("reactions")
      .withIndex("by_message_member_value", (q) =>
        q.eq("messageId", args.messageId)
        .eq("memberId", member._id)
        .eq("value", args.value)
      )
      .first();

    if(existingReactionsFromUser) {
      await ctx.db.delete(existingReactionsFromUser._id);
      return existingReactionsFromUser._id;
      
    } else {
      const newReactionId = await ctx.db.insert("reactions", {
        messageId: args.messageId,
        memberId: member._id,
        value: args.value,
        workspaceId: message.workspaceId
      });
      return newReactionId
    }

  }
})