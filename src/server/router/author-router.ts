import { prisma } from "@server/db/client";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const authorRouter = createProtectedRouter()
    .query("get", {
        input: z.object({ authorId: z.string() }),
        async resolve({ input }) {
            const { authorId } = input;

            return await prisma.author.findUnique({
                where: { id: authorId },
            });
        },
    })
    .query("search", {
        input: z.object({ query: z.string() }),
        async resolve({ input }) {
            const { query } = input;

            return await prisma.author.findMany({
                where: { name: { contains: query } },
            });
        },
    });
