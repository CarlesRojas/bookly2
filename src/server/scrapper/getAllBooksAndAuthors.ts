import { prisma } from "@server/db/client";
import axios from "axios";
import { load } from "cheerio";
import getBookAndAuthorInfo from "./getBookAndAuthorInfo";

const genresURL = "https://www.goodreads.com/genres/list?page=";
const genreURL = "https://www.goodreads.com/shelf/show/";
const bookUrl = "https://www.goodreads.com/book/show/";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getAllBooksAndAuthors = async (page = 1) => {
    let genresPage = null;
    try {
        const { data } = await axios.get(`${genresURL}${page}`, {
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
        genresPage = data;
    } catch (error) {
        return;
    }

    if (!genresPage) return;
    const $ = load(genresPage);

    const genresLinks = $("a.actionLinkLite");
    if (!genresLinks) return;

    for (let i = 0; i < genresLinks.length; i++) {
        const genre = genresLinks[i]?.attribs.href?.replace("/genres/", "");
        if (!genre) continue;

        await getGenreBooksAndAuthors(genre);
    }

    getAllBooksAndAuthors(page + 1);
};

const getGenreBooksAndAuthors = async (genre: string, page = 1) => {
    if (!alphabet.includes(genre.charAt(0))) return;

    console.log(genre, page);

    let genrePage = null;
    try {
        const route = `${genreURL}${genre}?page=${page}`;
        console.log(route);
        const { data } = await axios.get(route, {
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
        genrePage = data;
    } catch (error) {
        return;
    }

    if (!genrePage) return;
    const $ = load(genrePage);

    const bookLinks = $("a.bookTitle");
    if (!bookLinks) return;

    const promises = [];
    for (let i = 0; i < bookLinks.length; i++) {
        const bookId = bookLinks[i]?.attribs.href?.replace("/book/show/", "").match(/.+?(?=[^0-9])/g);
        if (!bookId || !bookId.length || !bookId[0] || isNaN(parseInt(bookId[0]))) continue;

        const goodReadsId = parseInt(bookId[0]);

        promises.push(getBookAndAuthor(goodReadsId));
    }

    await Promise.all(promises);

    getGenreBooksAndAuthors(genre, page + 1);
};

const getBookAndAuthor = async (goodReadsId: number) => {
    const bookExists = await prisma.book.findUnique({ where: { goodReadsId } });
    if (bookExists) return;

    try {
        const result = await getBookAndAuthorInfo(`${bookUrl}${goodReadsId}`);

        const { book, author } = result;
        const authorId = author && typeof author !== "number" ? author.goodReadsId : author;

        if (author && typeof author !== "number") {
            console.log(`Create author: ${author.name}`);
            await prisma.author.upsert({
                where: { goodReadsId: author.goodReadsId },
                update: { ...author },
                create: { ...author },
            });
        }

        if (book && authorId) {
            console.log(`Create book: ${book.title}`);
            await prisma.book.upsert({
                where: { goodReadsId: book.goodReadsId },
                update: { ...book, author: { connect: { goodReadsId: authorId } } },
                create: { ...book, author: { connect: { goodReadsId: authorId } } },
            });
        }
    } catch (error) {
        return;
    }
};

export default getAllBooksAndAuthors;
