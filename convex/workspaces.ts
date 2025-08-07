import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";


const generatedCode = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const updateJoinCode = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member || member.role !== "admin") throw new Error("Not authorized");
    
    const worksapce = await ctx.db.get(args.workspaceId)
    if(!worksapce) throw new Error("Workspace not found")
    
    let newJoinCode = generatedCode()
    while(newJoinCode === worksapce.joinCode) newJoinCode = generatedCode()
    await ctx.db.patch(args.workspaceId, { joinCode: newJoinCode })

    return args.workspaceId;
  }
})

export const getWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    //该user所在的所有workspaceId
    const workspaceIds = members.map((member) => member.workspaceId);

    //该user所在的所有workspaces
    const workspaces = [];
    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if (workspace) workspaces.push(workspace);
    }

    return workspaces;
  },
});

export const addWorkspace = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) throw new Error("Not authenticated");

    const joinCode = generatedCode();

    const worksSpaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      joinCode,
      userId,
    });

    await ctx.db.insert("members", {
      userId,
      workspaceId: worksSpaceId,
      role: "admin",
    });

    await ctx.db.insert("channels", {
      name: "general",
      workspaceId: worksSpaceId,
    })

    return worksSpaceId;
  },
});

// 必须登录者是该worksapce的member才会返回
export const getWorkspaceById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();
    if (!member) return null;


    const workspace = await ctx.db.get(args.id);
    return workspace;
  },
});

//登录者可以是任何人
export const getWorkspaceInfoById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    const workspace = await ctx.db.get(args.id);
    return {
      name: workspace?.name,
      isMember: !!member,
    };
  },
});



export const updateWorkspaceById = mutation({
  args: {workspaceId: v.id("workspaces"), name: v.string()},
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member || member.role !== 'admin') throw new Error("Not authorized");

    await ctx.db.patch(args.workspaceId, { name: args.name });
    return args.workspaceId;

  }
})

export const removeWorkspaceById = mutation({
  args: { workspaceId: v.id("workspaces")},
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member || member.role !== "admin") throw new Error("Not authorized");
    
    //删除该workspace
    await ctx.db.delete(args.workspaceId);
    
    //还要删除该workspace下的所有members
    const [members, channels, conversations, messages, reactions] = await Promise.all([
      ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect(),
      ctx.db.query("channels")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect(),
      ctx.db.query("conversations")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect(),
      ctx.db.query("messages")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect(),
      ctx.db.query("reactions")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect(),
    ])

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    return args.workspaceId;
  },
});

export const joinWorkspace = mutation({
  args: { joinCode: v.string(), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const worksapce = await ctx.db.get(args.workspaceId);
    if (!worksapce) throw new ConvexError("Workspace not found");

    if(worksapce.joinCode.toLowerCase() !== args.joinCode.toLowerCase()) throw new ConvexError("Invalid join code")
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_and_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if(member) throw new ConvexError("You are already a member of this workspace")

    await ctx.db.insert("members", { workspaceId: args.workspaceId, userId, role: "member" });
    return args.workspaceId;
  }
})
