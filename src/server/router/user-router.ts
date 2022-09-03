import { BookStatus } from "@prisma/client";
import { prisma } from "@server/db/client";
import { createProtectedRouter } from "./protected-router";

export const userRouter = createProtectedRouter()
    .query("get-reading", {
        async resolve({ ctx }) {
            return await prisma.book.findMany({
                where: { statuses: { some: { userId: ctx.session.user.id, status: BookStatus.READING } } },
                include: { author: true },
            });
        },
    })
    .query("get-want-to-read", {
        async resolve({ ctx }) {
            return await prisma.book.findMany({
                where: { statuses: { some: { userId: ctx.session.user.id, status: BookStatus.WANT_TO_READ } } },
                include: { author: true },
            });
        },
    })
    .query("get-finished", {
        async resolve({ ctx }) {
            return await prisma.book.findMany({
                where: { statuses: { some: { userId: ctx.session.user.id, status: BookStatus.FINISHED } } },
                include: {
                    reads: { where: { userId: ctx.session.user.id } },
                    statuses: { where: { userId: ctx.session.user.id } },
                },
            });
        },
    })
    .mutation("delete-account", {
        async resolve({ ctx }) {
            await prisma.user.delete({ where: { id: ctx.session.user.id } });
        },
    });
