import { INFINITE_QUERY_LIMIT } from "@/constants";
import { db } from "@/db";
import { SnippetValidation, UpdateSnippetValidation } from "@/lib/validations/snippet";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    // check if user exists in db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          picture: user.picture ? user.picture : null,
          name: user.given_name ? user.given_name : null,
        },
      });
    }

    return { success: true };
  }),
  createSnippet: privateProcedure
    .input(SnippetValidation)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dbUser = await db.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      const { code, language, name, visibility } =
        SnippetValidation.parse(input);

      const snippet = await db.snippet.create({
        data: {
          code,
          language,
          userId: userId,
          name,
          visibility,
        },
      });

      return { success: true, snippet };
    }),
  getUserSnippets: privateProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { id, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const snippets = await db.snippet.findMany({
        take: limit + 1, // get extra item for next cursor
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (snippets.length > limit) {
        const nextItem = snippets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        snippets,
        nextCursor,
      };
    }),
  getSnippet: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const snippet = await db.snippet.findFirst({
        where: {
          id: input.id,
        },
        include: {
          user: true,
        },
      });

      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" });

      return { success: true, snippet };
    }),
  deleteSnippet: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const snippet = await db.snippet.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" });

      await db.snippet.delete({
        where: {
          id: input.id,
        },
      });

      return snippet;
    }),
  saveSnippet: privateProcedure
    .input(z.object({ snippetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { snippetId } = input;

      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dbUser = await db.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

      const snippet = await db.snippet.findFirst({
        where: {
          id: snippetId,
        },
      });

      if (!snippet) throw new TRPCError({ code: "NOT_FOUND" });

      // if user owns snippet, they cant save it
      if (userId === snippet.userId) return { success: false };

      // check if this snippet is already saved
      const existingSavedSnippet = await db.savedSnippet.findFirst({
        where: {
          userId,
          snippetId,
        },
      });

      if (existingSavedSnippet) {
        await db.savedSnippet.delete({
          where: {
            id: existingSavedSnippet.id,
          },
        });

        return { success: true, existingSavedSnippet };
      } else {
        // store the save relationship in db
        const savedSnippet = await db.savedSnippet.create({
          data: {
            userId,
            snippetId,
          },
        });

        return { success: true, savedSnippet };
      }
    }),
  getSnippetSaveCount: privateProcedure
    .input(z.object({ snippetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db.savedSnippet.count({
        where: {
          snippetId: input.snippetId,
        },
      });
    }),
  isSnippetSaved: privateProcedure
    .input(z.object({ snippetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { snippetId } = input;
      const savedSnippet = await db.savedSnippet.findFirst({
        where: {
          userId,
          snippetId,
        },
      });

      return !!savedSnippet;
    }),
  getSavedSnippets: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const snippets = await db.savedSnippet.findMany({
        take: limit + 1,
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          snippet: {
            include: {
              user: true,
            },
          },
          user: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (snippets.length > limit) {
        const nextItem = snippets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        snippets,
        nextCursor,
      };
    }),
  getTrendingSnippets: publicProcedure.query(async () => {
    return await db.snippet.findMany({
      orderBy: [{ savedSnippets: { _count: "desc" } }, { createdAt: "desc" }],
      take: 4,
      where: {
        visibility: "public",
      },
      include: {
        user: true,
      },
    });
  }),
  getInfiniteSnippetFeed: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const snippets = await db.snippet.findMany({
        take: limit + 1, // get extra item for next cursor
        where: {
          NOT: {
            userId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (snippets.length > limit) {
        const nextItem = snippets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        snippets,
        nextCursor,
      };
    }),
  updateSnippet: privateProcedure
    .input(z.object({ id: z.string(), data: UpdateSnippetValidation }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { id, data } = input;

      const snippet = await db.snippet.findFirst({
        where: {
          id,
        },
      });

      if (!snippet || snippet?.userId !== userId)
        throw new TRPCError({ code: "FORBIDDEN" });

      const { code, name, visibility } =
      UpdateSnippetValidation.parse(data);

      const updatedSnippet = await db.snippet.update({
        where: {
          id,
        },
        data: {
          code,
          name,
          visibility,
        },
      });

      return { success: true, updatedSnippet };
    }),
});

export type AppRouter = typeof appRouter;
