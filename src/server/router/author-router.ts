import { prisma } from "@server/db/client";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const authorRouter = createProtectedRouter()
    .query("get", {
        input: z.object({ authorId: z.number() }),
        async resolve({ input }) {
            const { authorId } = input;

            return await prisma.author.findUnique({
                where: { goodReadsId: authorId },
                include: {
                    books: {
                        include: {
                            author: true,
                        },
                    },
                },
            });
        },
    })
    .query("search", {
        input: z.object({ query: z.string() }),
        async resolve({ input }) {
            const { query } = input;
            if (!query) return [];

            return await prisma.author.findMany({
                where: { name: { contains: query } },
            });
        },
    });
