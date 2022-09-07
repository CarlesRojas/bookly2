import { prisma } from "@server/db/client";
import * as trpc from "@trpc/server";
import axios from "axios";
import { load } from "cheerio";

const allTrim = (value: string) => value.replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");

const getText = (elem: any) => {
    if (elem.type === "text") return [elem.data.replace("\n", "")];
    if (elem.type === "tag") {
        if (elem.name === "a" || elem.name === "i") {
            return (elem.children as []).reduce(
                (prev, child): string[] => [...prev, ...getText(child as any)],
                [] as string[]
            );
        }

        if (elem.name === "br") return ["¿¿"];
    }

    return [];
};

export interface BookAuthorInfo {
    book: {
        goodReadsId: number;
        title: string;
        description: string;
        publishedAt: string;
        numPages: number;
        coverSrc: string;
    } | null;
    author:
        | number
        | null
        | {
              goodReadsId: number;
              name: string;
              description: string;
              photoSrc: string;
          };
}

const getBookAndAuthorInfo = async (goodReadsUrl: string) => {
    let bookData = null;
    try {
        const { data } = await axios.get(goodReadsUrl);
        bookData = data;
    } catch (error) {
        throw new trpc.TRPCError({ code: "NOT_FOUND", message: "book URL is not valid" });
    }
    let $ = load(bookData);

    const goodReadsId = parseInt($("input#book_id").first().attr("value") || "");
    if (isNaN(goodReadsId)) throw new trpc.TRPCError({ code: "NOT_FOUND", message: "book ID not found" });

    const bookExists = await prisma.book.findUnique({ where: { goodReadsId } });
    if (bookExists) return { book: null, author: null } as BookAuthorInfo;

    const title = allTrim($("#bookTitle").contents().first().text());

    let descriptionArray = $("#description > span")
        .get(1)
        ?.children.reduce((prev, child) => [...prev, ...getText(child as any)], [] as string[]);

    if (!descriptionArray || descriptionArray.length <= 0)
        descriptionArray = $("#description > span")
            .get(0)
            ?.children.reduce((prev, child) => [...prev, ...getText(child as any)], [] as string[]);

    const description = descriptionArray
        ? descriptionArray.join("").replaceAll("¿¿¿¿", "%%%").replaceAll("¿¿", "")
        : "";

    let publishedAt = allTrim(
        $("#details > div")
            .get(1)
            ?.children.map((child) => child.type === "text" && child.data)
            .join(" ") as string
    );
    publishedAt = allTrim(publishedAt.split(" by ")[0] ?? publishedAt);

    const numPages = parseInt(
        $("#details > div > span[itemprop=numberOfPages]")
            .contents()
            .first()
            .text()
            .replace(/[^0-9]/g, "")
    );

    const coverSrc = $("#coverImage").attr("src") || "";

    const authorUrl = $("#bookAuthors > span[itemprop=author] > div > a").attr("href");
    if (!authorUrl) throw new trpc.TRPCError({ code: "NOT_FOUND", message: "author not found" });

    const authorId = authorUrl.replace("https://www.goodreads.com/author/show/", "").match(/.+?(?=[^0-9])/g);
    if (!authorId || !authorId.length || !authorId[0] || isNaN(parseInt(authorId[0])))
        throw new trpc.TRPCError({ code: "NOT_FOUND", message: "author ID not found" });

    const goodReadsAuthorId = parseInt(authorId[0]);
    const authorExists = await prisma.author.findUnique({ where: { goodReadsId: goodReadsAuthorId } });
    if (authorExists)
        return {
            book: { goodReadsId, title, description, publishedAt, numPages, coverSrc },
            author: goodReadsAuthorId,
        } as BookAuthorInfo;

    let authorData = null;
    try {
        const { data } = await axios.get(authorUrl);
        authorData = data;
    } catch (error) {
        throw new trpc.TRPCError({ code: "NOT_FOUND", message: "author URL is not valid" });
    }
    $ = load(authorData);

    const name = allTrim($("h1.authorName > span[itemprop=name]").contents().first().text());

    let authorDescriptionArray = $("div.aboutAuthorInfo > span")
        .get(1)
        ?.children.reduce((prev, child) => [...prev, ...getText(child as any)], [] as string[]);

    if (!authorDescriptionArray || authorDescriptionArray.length <= 0)
        authorDescriptionArray = $("div.aboutAuthorInfo > span")
            .get(0)
            ?.children.reduce((prev, child) => [...prev, ...getText(child as any)], [] as string[]);

    const authorDescription = authorDescriptionArray
        ? authorDescriptionArray.join("").replaceAll("¿¿¿¿", "%%%").replaceAll("¿¿", "")
        : "";

    const photoSrc = $("img[itemprop=image]").attr("src") || "";

    const bookAuthorInfo: BookAuthorInfo = {
        book: { goodReadsId, title, description, publishedAt, numPages, coverSrc },
        author: { goodReadsId: goodReadsAuthorId, name, description: authorDescription, photoSrc },
    };

    return bookAuthorInfo;
};

export default getBookAndAuthorInfo;
