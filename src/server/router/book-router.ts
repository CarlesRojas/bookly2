import { BookStatus } from "@prisma/client";
import { prisma } from "@server/db/client";
import * as trpc from "@trpc/server";
import axios from "axios";
import { load } from "cheerio";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

const allTrim = (value: string) => value.replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");

export const bookRouter = createProtectedRouter()
    .mutation("set-finished", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            await Promise.all([
                prisma.status.upsert({
                    where: { bookId_userId: { bookId, userId: ctx.session.user.id } },
                    update: { status: BookStatus.FINISHED },
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

            await prisma.status.upsert({
                where: { bookId_userId: { bookId, userId: ctx.session.user.id } },
                update: { status: BookStatus.WANT_TO_READ },
                create: { status: BookStatus.WANT_TO_READ, bookId, userId: ctx.session.user.id },
            });
        },
    })
    .mutation("set-reading", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            await prisma.status.upsert({
                where: { bookId_userId: { bookId, userId: ctx.session.user.id } },
                update: { status: BookStatus.READING },
                create: { status: BookStatus.READING, bookId, userId: ctx.session.user.id },
            });
        },
    })
    .query("get", {
        input: z.object({ bookId: z.number() }),
        async resolve({ ctx, input }) {
            const { bookId } = input;

            return await prisma.book.findUnique({
                where: { goodReadsId: bookId },
                include: {
                    reads: { where: { userId: ctx.session.user.id } },
                    statuses: { where: { userId: ctx.session.user.id } },
                },
            });
        },
    })
    .query("search", {
        input: z.object({ query: z.string() }),
        async resolve({ input }) {
            const { query } = input;

            return await prisma.book.findMany({
                where: { title: { contains: query } },
            });
        },
    })
    .mutation("add", {
        input: z.object({ goodReadsUrl: z.string() }),
        async resolve({ input }) {
            const { goodReadsUrl } = input;

            let bookData = null;
            try {
                const { data } = await axios.get(goodReadsUrl);
                bookData = data;
            } catch (error) {
                throw new trpc.TRPCError({ code: "NOT_FOUND", message: "Book URL is not valid." });
            }
            let $ = load(bookData);

            const goodReadsId = parseInt($("input#book_id").first().attr("value") || "");
            if (isNaN(goodReadsId)) throw new trpc.TRPCError({ code: "NOT_FOUND", message: "Book ID not found." });

            const title = allTrim($("#bookTitle").contents().first().text());

            const descriptionArray: string[] = [];
            $("#description > span")
                .get(1)
                ?.children.forEach((child) => child.type === "text" && descriptionArray.push(child.data));
            if (!descriptionArray.length)
                $("#description > span")
                    .get(0)
                    ?.children.forEach((child) => child.type === "text" && descriptionArray.push(child.data));
            const description = descriptionArray.join("%%%");

            const publishedAt = allTrim(
                $("#details > div")
                    .get(1)
                    ?.children.map((child) => child.type === "text" && child.data)
                    .join(" ") as string
            );

            const numPages = parseInt(
                $("#details > div > span[itemprop=numberOfPages]")
                    .contents()
                    .first()
                    .text()
                    .replace(/[^0-9]/g, "")
            );

            const coverSrc = $("#coverImage").attr("src") || "";

            const authorUrl = $("#bookAuthors > span[itemprop=author] > div > a").attr("href");
            if (!authorUrl) throw new trpc.TRPCError({ code: "NOT_FOUND", message: "Author not found." });

            const authorId = authorUrl.replace("https://www.goodreads.com/author/show/", "").match(/.+?(?=[^0-9])/g);
            if (!authorId || !authorId.length || !authorId[0] || isNaN(parseInt(authorId[0])))
                throw new trpc.TRPCError({ code: "NOT_FOUND", message: "Author ID not found." });

            const goodReadsAuthorId = parseInt(authorId[0]);

            let authorData = null;
            try {
                const { data } = await axios.get(authorUrl);
                authorData = data;
            } catch (error) {
                throw new trpc.TRPCError({ code: "NOT_FOUND", message: "Author URL is not valid." });
            }
            $ = load(authorData);

            const name = allTrim($("h1.authorName > span[itemprop=name]").contents().first().text());

            const authorDescriptionArray: string[] = [];
            $("div.aboutAuthorInfo > span")
                .get(1)
                ?.children.forEach((child) => child.type === "text" && authorDescriptionArray.push(child.data));
            if (!authorDescriptionArray.length)
                $("div.aboutAuthorInfo > span")
                    .get(0)
                    ?.children.forEach((child) => child.type === "text" && authorDescriptionArray.push(child.data));
            const authorDescription = authorDescriptionArray.join("%%%");

            const photoSrc = $("img[itemprop=image]").attr("src") || "";

            const author = await prisma.author.upsert({
                where: { goodReadsId: goodReadsAuthorId },
                update: { goodReadsId: goodReadsAuthorId, name, description: authorDescription, photoSrc },
                create: { goodReadsId: goodReadsAuthorId, name, description: authorDescription, photoSrc },
            });

            await prisma.book.upsert({
                where: { goodReadsId: goodReadsId },
                update: {
                    goodReadsId,
                    title,
                    description,
                    publishedAt,
                    numPages,
                    coverSrc,
                    author: { connect: { goodReadsId: author.goodReadsId } },
                },
                create: {
                    goodReadsId,
                    title,
                    description,
                    publishedAt,
                    numPages,
                    coverSrc,
                    author: { connect: { goodReadsId: author.goodReadsId } },
                },
            });
        },
    })
    .mutation("create-reread", {
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
    });
