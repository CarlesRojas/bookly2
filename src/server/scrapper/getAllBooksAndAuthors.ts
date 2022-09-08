import { prisma } from "@server/db/client";
import getBookAndAuthorInfo from "./getBookAndAuthorInfo";

const BOOK_URL = "https://www.goodreads.com/book/show/";

let consecutivePageFailures = 0;

const getAllBooksAndAuthors = async (goodReadsId = 1) => {
    console.log(goodReadsId);
    const bookExists = await prisma.book.findUnique({ where: { goodReadsId } });
    if (bookExists) {
        await getAllBooksAndAuthors(goodReadsId + 1);
        return;
    }

    try {
        const result = await getBookAndAuthorInfo(`${BOOK_URL}${goodReadsId}`);

        const { book, author } = result;
        const authorId = author && typeof author !== "number" ? author.goodReadsId : author;

        if (author && typeof author !== "number") {
            console.log(`Create author: ${author.name}`);
            console.log(book);
            console.log("");
            await prisma.author.upsert({
                where: { goodReadsId: author.goodReadsId },
                update: { ...author },
                create: { ...author },
            });
        }

        if (book && authorId) {
            console.log(`Create book: ${book.title}`);
            console.log(book);
            console.log("");
            await prisma.book.upsert({
                where: { goodReadsId: book.goodReadsId },
                update: { ...book, author: { connect: { goodReadsId: authorId } } },
                create: { ...book, author: { connect: { goodReadsId: authorId } } },
            });
        }

        consecutivePageFailures = 0;
    } catch (error) {
        console.log(error);
        console.log(`Consecutive failures: ${consecutivePageFailures}`);
        console.log("");
        consecutivePageFailures++;
        if (consecutivePageFailures > 50) return;
    }

    await getAllBooksAndAuthors(goodReadsId + 1);
};

export default getAllBooksAndAuthors;
