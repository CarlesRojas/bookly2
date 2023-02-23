import { prisma } from "@server/db/client";
import * as trpc from "@trpc/server";
import axios from "axios";
import { load } from "cheerio";

const allTrim = (value: string) => value.replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");

const getText = (elem: any) => {
    if (elem.type === "text") return [elem.data.replace("\n", "")];
    if (elem.type === "tag") {
        if (elem.name === "a" || elem.name === "i" || elem.name === "div") {
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

const getBookAndAuthorInfo = async (goodReadsUrl: string, update = true) => {
    let bookData = null;
    try {
        const { data } = await axios.get(goodReadsUrl);
        bookData = data;
    } catch (error) {
        throw new trpc.TRPCError({ code: "NOT_FOUND", message: "book URL is not valid" });
    }
    let $ = load(bookData);

    let goodReadsId = parseInt($("input#book_id").first().attr("value") || "");
    if (isNaN(goodReadsId)) {
        const urlParts = goodReadsUrl.split("/");
        const fullId = urlParts[urlParts.length - 1] ?? "";
        const idParts = fullId.split(".");
        goodReadsId = parseInt(idParts[0] ?? "");
        if (isNaN(goodReadsId)) throw new trpc.TRPCError({ code: "NOT_FOUND", message: "book ID not found" });
    }

    console.log(goodReadsId);

    const bookExists = await prisma.book.findUnique({ where: { goodReadsId } });
    if (bookExists && !update) return { book: null, author: null } as BookAuthorInfo;

    const title = allTrim($("[data-testid='bookTitle']").contents().first().text());

    console.log(title);
    const descriptionArray = $("[data-testid='description'] .Formatted")
        .get(0)
        ?.children.reduce((prev, child) => [...prev, ...getText(child as any)], [] as string[]);

    let description = descriptionArray ? descriptionArray.join("").replaceAll("¿¿¿¿", "%%%").replaceAll("¿¿", "") : "";
    if (description.startsWith("%%%")) description = description.substring(3);

    console.log(description);
    const publishedAt = allTrim(
        $("[data-testid='publicationInfo']").contents().first().text().replace("First published ", "")
    );

    console.log(publishedAt);
    const numPagesString = $("[data-testid='pagesFormat']").contents().first().text().split(" ")[0];
    let numPages = numPagesString ? parseInt(numPagesString.replace(/[^0-9]/g, "")) : 0;
    if (isNaN(numPages)) numPages = 0;

    console.log(numPages);
    const coverSrc = $(".BookCover__image img").first().attr("src") ?? "";

    console.log(coverSrc);
    const authorUrl = $(".ContributorLink").first().attr("href");
    if (!authorUrl) throw new trpc.TRPCError({ code: "NOT_FOUND", message: "author not found" });

    console.log(authorUrl);
    const authorId = authorUrl.replace("https://www.goodreads.com/author/show/", "").match(/.+?(?=[^0-9])/g);
    if (!authorId || !authorId.length || !authorId[0] || isNaN(parseInt(authorId[0])))
        throw new trpc.TRPCError({ code: "NOT_FOUND", message: "author ID not found" });
    const goodReadsAuthorId = parseInt(authorId[0]);

    console.log(goodReadsAuthorId);
    const authorExists = await prisma.author.findUnique({ where: { goodReadsId: goodReadsAuthorId } });
    if (authorExists && !update)
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
    console.log(name);

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
    console.log(authorDescription);

    const photoSrc = $("img[itemprop=image]").attr("src") || "";
    console.log(photoSrc);

    const bookAuthorInfo: BookAuthorInfo = {
        book: { goodReadsId, title, description, publishedAt, numPages, coverSrc },
        author: { goodReadsId: goodReadsAuthorId, name, description: authorDescription, photoSrc },
    };

    return bookAuthorInfo;
};

export default getBookAndAuthorInfo;
