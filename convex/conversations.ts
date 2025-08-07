import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrGet = mutation({
  args:{
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId) throw new ConvexError("Unauthorized");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      ).unique()
    const member = await ctx.db.get(args.memberId)
    if(!member || !currentMember) throw new ConvexError("Member not found");

    const existingConversation = await ctx.db.query("conversations")
    .filter(q => q.eq(q.field("workspaceId"), args.workspaceId))
    .filter(q => 
      q.or(
        q.and(
          q.eq(q.field("memberOneId"), currentMember._id),
          q.eq(q.field("memberTwoId"), member._id)
        ),
        q.and(
          q.eq(q.field("memberOneId"), member._id),
          q.eq(q.field("memberTwoId"), currentMember._id)
        )
      )
    ).unique();

    if(existingConversation) return existingConversation;

    const conversationId = await ctx.db.insert("conversations", { 
      memberOneId: currentMember._id,
      memberTwoId: member._id, 
      workspaceId: args.workspaceId,
    });

    const newConversation = await ctx.db.get(conversationId);
    if(!newConversation) throw new Error("Conversation not found");

    return newConversation;

  }
})