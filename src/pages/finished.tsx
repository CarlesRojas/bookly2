import BooksSection from "@components/BooksSection";
import Loading from "@components/Loading";
import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { Author, Book, Read, Status } from "@prisma/client";
import s from "@styles/pages/Finished.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { RiArrowDownSLine, RiGridFill, RiMenuLine } from "react-icons/ri";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

export type FinishedBook = Book & { author: Author; reads: Read[]; statuses: Status[] };

type SortGroup = { [key: number | string]: FinishedBook[] };

enum SortBy {
    TITLE = "title",
    AUTHOR = "author",
    RATING = "rating",
    YEAR = "year",
}

interface Section {
    title: string | number | null;
    books: FinishedBook[];
    first?: boolean;
    isRating?: boolean;
}

const normalizeString = (value: string) => {
    const normalized = value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "");
    const articles = ["the ", "an ", "a "];
    for (const article of articles) if (normalized.startsWith(article)) return normalized.replace(article, "");
    return normalized;
};

const compareStrings = (a: string, b: string) => {
    const aNormalized = normalizeString(a);
    const bNormalized = normalizeString(b);

    return aNormalized.localeCompare(bNormalized, "en", { sensitivity: "base", ignorePunctuation: true });
};

const charIsLetter = (char: string) => /^[a-zA-Z]+$/.test(char);

const getOldestReadYear = (reads: Read[]) => {
    let oldestYear = Number.MAX_VALUE;
    reads.forEach((read) => read.year < oldestYear && (oldestYear = read.year));
    return oldestYear;
};

const Finished: NextPage = () => {
    const { data, isLoading, error } = trpc.useQuery(["user-get-finished"]);

    const [sortedData, setSortedData] = useState<Section[]>([]);
    const [sortedBy, setSortedBy] = useState(SortBy.YEAR); // TODO save in state context
    const [descending, setDescending] = useState(true); // TODO save in state context
    const [viewGrouped, setViewGrouped] = useState(true); // TODO save in state context

    const getBooksAlphabetically = useCallback(
        (desc: boolean, viewGrouped: boolean, field: "title" | "author") => {
            if (isLoading || error || !data) return null;

            const getString = (book: FinishedBook) => (field === "title" ? book.title : book.author.name);

            const sorted = [...data].sort((a, b) => compareStrings(getString(a), getString(b)));
            if (!desc) sorted.reverse();

            if (!viewGrouped) {
                const result: Section[] = [{ title: null, books: sorted, first: true }];
                setSortedData(result);
                return;
            }

            const grouped: SortGroup = {};
            sorted.forEach((book) => {
                const firstChar = normalizeString(getString(book)).charAt(0);
                if (!charIsLetter(firstChar))
                    "other" in grouped ? grouped["other"]?.push(book) : (grouped["other"] = [book]);
                else firstChar in grouped ? grouped[firstChar]?.push(book) : (grouped[firstChar] = [book]);
            });

            const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
            if (!desc) {
                alphabet.reverse();
                alphabet.unshift("other");
            } else alphabet.push("other");

            const result: Section[] = [];
            alphabet.forEach((letter) => {
                if (grouped[letter] && grouped[letter]?.length)
                    result.push({
                        title: letter.toUpperCase(),
                        books: grouped[letter] ?? [],
                        first: result.length <= 0,
                    });
            });

            setSortedData(result);
        },
        [data, error, isLoading]
    );

    const getBooksByYear = useCallback(
        (desc: boolean, viewGrouped: boolean) => {
            if (isLoading || error || !data) return null;

            const grouped: SortGroup = {};
            let minYear = Number.MAX_VALUE;
            let maxYear = Number.MIN_VALUE;

            data.forEach((book) => {
                const oldestReadYear = getOldestReadYear(book.reads);
                if (oldestReadYear in grouped) grouped[oldestReadYear]?.push(book);
                else grouped[oldestReadYear] = [book];

                if (oldestReadYear < minYear) minYear = oldestReadYear;
                if (oldestReadYear > maxYear) maxYear = oldestReadYear;
            });

            const years = [];
            for (let i = maxYear; i >= minYear; i--) if (i in grouped) years.push(i);

            if (!desc) years.reverse();

            if (!viewGrouped) {
                let sortedBooks: FinishedBook[] = [];
                years.forEach((year) => {
                    sortedBooks = [...sortedBooks, ...(grouped[year] ?? [])];
                });

                const result: Section[] = [{ title: null, books: sortedBooks, first: true }];
                setSortedData(result);
                return;
            }

            const result: Section[] = [];
            years.forEach((year) => {
                if (grouped[year] && grouped[year]?.length)
                    result.push({
                        title: year.toString(),
                        books: grouped[year] ?? [],
                        first: result.length <= 0,
                    });
            });

            setSortedData(result);
        },
        [data, error, isLoading]
    );

    const getBooksByRating = useCallback(
        (desc: boolean, viewGrouped: boolean) => {
            if (isLoading || error || !data) return null;

            const grouped: SortGroup = {};

            data.forEach((book) => {
                const status = (book.statuses.length ? book.statuses[0] : null) ?? { rating: 0 };

                if (status.rating in grouped) grouped[status.rating]?.push(book);
                else grouped[status.rating] = [book];
            });

            const ratings = [];
            for (let i = 5; i >= 0; i--) if (i in grouped) ratings.push(i);

            if (!desc) ratings.reverse();

            if (!viewGrouped) {
                let sortedBooks: FinishedBook[] = [];
                ratings.forEach((rating) => {
                    sortedBooks = [...sortedBooks, ...(grouped[rating] ?? [])];
                });

                const result: Section[] = [{ title: null, books: sortedBooks, first: true }];
                setSortedData(result);
                return;
            }

            const result: Section[] = [];
            ratings.forEach((rating) => {
                if (grouped[rating] && grouped[rating]?.length)
                    result.push({
                        title: rating,
                        books: grouped[rating] ?? [],
                        first: result.length <= 0,
                        isRating: true,
                    });
            });

            setSortedData(result);
        },
        [data, error, isLoading]
    );

    useEffect(() => {
        if (sortedBy === SortBy.TITLE) getBooksAlphabetically(descending, viewGrouped, "title");
        if (sortedBy === SortBy.AUTHOR) getBooksAlphabetically(descending, viewGrouped, "author");
        if (sortedBy === SortBy.YEAR) getBooksByYear(descending, viewGrouped);
        if (sortedBy === SortBy.RATING) getBooksByRating(descending, viewGrouped);
    }, [sortedBy, descending, viewGrouped, getBooksAlphabetically, getBooksByYear, getBooksByRating]);

    const isWaiting = isLoading || error || !data;
    return (
        <>
            <Head>
                <title>Bookly - Finished</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <div className={s.finished}>
                {isWaiting && <Loading />}

                {!isWaiting && (
                    <>
                        <div className={`${s.sortGrid} ${s.absolute}`}>
                            <div className={s.border} />
                        </div>

                        <div className={s.sortGrid}>
                            <div className={s.groups} onClick={() => setViewGrouped((prev) => !prev)}>
                                {viewGrouped ? <RiGridFill /> : <RiMenuLine />}
                            </div>

                            {[SortBy.YEAR, SortBy.TITLE, SortBy.AUTHOR, SortBy.RATING].map((sortBy) => (
                                <div
                                    key={sortBy}
                                    className={`${s.sort} ${sortedBy === sortBy ? s.current : ""}`}
                                    onClick={() => setSortedBy(sortBy)}
                                >
                                    {sortBy}
                                </div>
                            ))}

                            <div
                                className={`${s.direction} ${descending ? "" : s.asc}`}
                                onClick={() => setDescending((prev) => !prev)}
                            >
                                <RiArrowDownSLine />
                            </div>
                        </div>

                        <div className={s.content}>
                            {sortedData.map((section, i) => (
                                <BooksSection key={i} {...section} emptyMessage="" />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Navigation />
        </>
    );
};

export default Finished;
