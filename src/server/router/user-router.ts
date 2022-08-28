import { BookStatus } from "@prisma/client";
import { prisma } from "@server/db/client";
import { createProtectedRouter } from "./protected-router";

export const userRouter = createProtectedRouter()
    .query("get-reading", {
        async resolve({ ctx }) {
            return await prisma.status.findMany({
                where: { userId: ctx.session.user.id, status: BookStatus.READING },
                include: { book: true },
            });
        },
    })
    .query("get-want-to-read", {
        async resolve({ ctx }) {
            return await prisma.status.findMany({
                where: { userId: ctx.session.user.id, status: BookStatus.WANT_TO_READ },
                include: { book: true },
            });
        },
    })
    .query("get-finished", {
        async resolve({ ctx }) {
            return await prisma.status.findMany({
                where: { userId: ctx.session.user.id, status: BookStatus.FINISHED },
                include: { book: true },
            });
        },
    });
