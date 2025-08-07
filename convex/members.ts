import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

const populateUsers = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id);
};

export const getCurrentMember = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member) return null;

    return member;
  },
});

export const getMembersByWorkspaceId = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member) return null;

    const members = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    const users = [];
    for (const member of members) {
      const user = await populateUsers(ctx, member.userId);
      if (user) {
        users.push({
          ...member,
          user: user,
        });
      }
    }

    return users;
  },
});

export const getMemberById = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      return null;
    }
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!currentMember) return null;

    const user = await populateUsers(ctx, member.userId);
    if (!user) {
      return null;
    }

    return {
      ...member,
      user,
    };
  },
});

export const updateMember = mutation({
  args: {
    memberId: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new ConvexError("Member not found");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin")
      throw new ConvexError("Not Unauthorized");

    await ctx.db.patch(args.memberId, { role: args.role });

    return args.memberId;
  },
});

export const removeMember = mutation({
  args: {
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new ConvexError("Member not found");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember)
      throw new ConvexError("Not Unauthorized");

    if(member.role === "admin") throw new ConvexError("Cannot remove admin");

    const isSelf = member.userId === userId;
    if (currentMember.role !== "admin" && !isSelf){
      throw new ConvexError(
        "Only admins or the member themselves can remove members"
      );
    }

    //Remove related data
    const [messages, reactios, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.memberId))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.memberId))
        .collect(),
      ctx.db.query("conversations").filter(
        q => q.or(
          q.eq(q.field("memberOneId"), args.memberId),
          q.eq(q.field("memberTwoId"), args.memberId)
        )).collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactios) {
      await ctx.db.delete(reaction._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    //RODO: REMOVE member
    await ctx.db.delete(args.memberId);

    return args.memberId;
  },
});