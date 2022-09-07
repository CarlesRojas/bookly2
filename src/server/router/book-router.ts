import { BookStatus } from "@prisma/client";
import { prisma } from "@server/db/client";
import getBookAndAuthorInfo from "@server/scrapper/getBookAndAuthorInfo";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const bookRouter = createProtectedRouter()
    .mutation("set-finished", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            await Promise.all([
                prisma.status.upsert({
                    where: { bookId_userId: { bookId, userId: ctx.session.user.id } },
                    update: { status: BookStatus.FINISHED, rating: 0 },
                    create: { status: BookStatus.FINISHED, bookId, userId: ctx.session.user.id },
                }),
                prisma.read.create({
                    data: {
                        bookId,
                        userId: ctx.session.user.id,
                        month: new Date().getMonth(),
                        year: new Date().getFullYear(),
                    },
                }),
            ]);
        },
    })
    .mutation("set-want-to-read", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            await Promise.all([
                prisma.status.upsert({
                    where: { bookId_userId: { bookId, userId: ctx.session.user.id } },
                    update: { status: BookStatus.WANT_TO_READ, rating: 0 },
                    create: { status: BookStatus.WANT_TO_READ, bookId, userId: ctx.session.user.id },
                }),
                prisma.read.deleteMany({ where: { bookId, userId: ctx.session.user.id } }),
            ]);
        },
    })
    .mutation("set-reading", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            await Promise.all([
                await prisma.status.upsert({
                    where: { bookId_userId: { bookId, userId: ctx.session.user.id } },
                    update: { status: BookStatus.READING, rating: 0 },
                    create: { status: BookStatus.READING, bookId, userId: ctx.session.user.id },
                }),
                prisma.read.deleteMany({ where: { bookId, userId: ctx.session.user.id } }),
            ]);
        },
    })
    .mutation("remove", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            await Promise.all([
                prisma.status.delete({ where: { bookId_userId: { bookId, userId: ctx.session.user.id } } }),
                prisma.read.deleteMany({ where: { bookId, userId: ctx.session.user.id } }),
            ]);
        },
    })
    .query("get", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            return await prisma.book.findUnique({
                where: { goodReadsId: bookId },
                include: {
                    reads: {
                        where: { userId: ctx.session.user.id },
                        orderBy: [{ year: "asc" }, { month: "asc" }],
                    },
                    statuses: { where: { userId: ctx.session.user.id } },
                    author: true,
                },
            });
        },
    })
    .query("search", {
        input: z.object({ query: z.string() }),
        async resolve({ input }) {
            const { query } = input;
            if (!query) return [];

            return await prisma.book.findMany({
                where: { title: { contains: query } },
                include: { author: true },
                take: 30,
            });
        },
    })
    .mutation("add", {
        input: z.object({ goodReadsUrl: z.string() }),
        async resolve({ input }) {
            const { goodReadsUrl } = input;

            const bookAuthorInfo = await getBookAndAuthorInfo(goodReadsUrl);

            const { book, author } = bookAuthorInfo;

            await prisma.author.upsert({
                where: { goodReadsId: author.goodReadsId },
                update: { ...author },
                create: { ...author },
            });

            await prisma.book.upsert({
                where: { goodReadsId: book.goodReadsId },
                update: { ...book, author: { connect: { goodReadsId: author.goodReadsId } } },
                create: { ...book, author: { connect: { goodReadsId: author.goodReadsId } } },
            });
        },
    })
    .mutation("add-reread", {
        input: z.object({ bookId: z.number(), month: z.number(), year: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId, month, year } = input;

            await prisma.read.create({
                data: {
                    bookId,
                    userId: ctx.session.user.id,
                    month,
                    year,
                },
            });
        },
    })
    .mutation("update-reread", {
        input: z.object({ readId: z.string(), month: z.number(), year: z.number() }),
        async resolve({ input }) {
            const { readId, month, year } = input;

            await prisma.read.update({
                where: { id: readId },
                data: { month, year },
            });
        },
    })
    .mutation("delete-reread", {
        input: z.object({ readId: z.string() }),
        async resolve({ input }) {
            const { readId } = input;

            await prisma.read.delete({
                where: { id: readId },
            });
        },
    })
    .mutation("set-rating", {
        input: z.object({ bookId: z.number(), rating: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId, rating } = input;

            if (rating < 0 || rating > 5)
                throw new trpc.TRPCError({ code: "BAD_REQUEST", message: "rating must be between 0 and 5" });

            await prisma.status.upsert({
                where: { bookId_userId: { bookId, userId: ctx.session.user.id } },
                update: { rating },
                create: { rating, status: BookStatus.FINISHED, bookId, userId: ctx.session.user.id },
            });
        },
    });
