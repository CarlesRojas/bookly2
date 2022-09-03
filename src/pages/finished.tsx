import FinishedBook from "@components/FinishedBook";
import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { Author, Book, Read, Status } from "@prisma/client";
import s from "@styles/pages/Finished.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

export type FinishedBook = Book & { author: Author; reads: Read[]; statuses: Status[] };

interface SortedData {
    title: FinishedBook[];
    author: FinishedBook[];
    rating: { [key: number]: FinishedBook[] };
    year: { [key: number]: FinishedBook[] };
    years: number[];
    ratings: number[];
    calculated: boolean;
}

const DEFAULT_SORTED_DATA: SortedData = {
    title: [],
    author: [],
    rating: [],
    year: [],
    years: [],
    ratings: [],
    calculated: false,
};

const removeFirstArticle = (value: string) => {
    const articles = ["the ", "an ", "a "];
    for (const article of articles) if (value.startsWith(article)) return value.replace(article, "");
    return value;
};

const compareStrings = (a: string, b: string) => {
    const aNormalized = removeFirstArticle(a.toLowerCase());
    const bNormalized = removeFirstArticle(b.toLowerCase());

    return aNormalized.localeCompare(bNormalized, "en", { sensitivity: "base", ignorePunctuation: true });
};

enum SortBy {
    TITLE = "title",
    AUTHOR = "author",
    RATING = "rating",
    YEAR = "year",
}

interface Section {
    title?: string;
    books: FinishedBook[];
}

const Finished: NextPage = () => {
    const { data, isLoading, error } = trpc.useQuery(["user-get-finished"]);

    const sortedData = useRef(DEFAULT_SORTED_DATA);
    const [, setRecalculated] = useState(0);

    const getOldestReadYear = (reads: Read[]) => {
        let oldestYear = Number.MAX_VALUE;
        reads.forEach((read) => read.year < oldestYear && (oldestYear = read.year));
        return oldestYear;
    };

    useEffect(() => {
        if (isLoading || error || !data) return;
        const newSortedData = DEFAULT_SORTED_DATA;

        newSortedData.title = [...data].sort((a, b) => compareStrings(a.title, b.title));
        newSortedData.author = [...data].sort((a, b) => compareStrings(a.author.name, b.author.name));

        newSortedData.rating = {};
        data.forEach((book) => {
            const status = (book.statuses.length ? book.statuses[0] : null) ?? { rating: 0 };

            if (status.rating in newSortedData.rating) newSortedData.rating[status.rating]?.push(book);
            else newSortedData.rating[status.rating] = [book];
        });

        let minYear = Number.MAX_VALUE;
        let maxYear = Number.MIN_VALUE;

        newSortedData.year = {};
        data.forEach((book) => {
            const oldestReadYear = getOldestReadYear(book.reads);
            if (oldestReadYear in newSortedData.year) newSortedData.year[oldestReadYear]?.push(book);
            else newSortedData.year[oldestReadYear] = [book];

            if (oldestReadYear < minYear) minYear = oldestReadYear;
            if (oldestReadYear > maxYear) maxYear = oldestReadYear;
        });

        newSortedData.years = [];
        for (let i = maxYear; i >= minYear; i--) if (i in newSortedData.year) newSortedData.years.push(i);

        newSortedData.ratings = [];
        for (let i = 5; i >= 0; i--) if (i in newSortedData.rating) newSortedData.ratings.push(i);

        newSortedData.calculated = true;
        sortedData.current = newSortedData;
        setRecalculated((prev) => prev + 1);
    }, [data, isLoading, error]);

    const [sortedBy, setSortedBy] = useState(SortBy.TITLE);
    const [descending, setDescending] = useState(true);

    let booksToShow: Section[] = [];
    if (sortedBy === SortBy.TITLE && descending) booksToShow.push({ books: sortedData.current.title });
    else if (sortedBy === SortBy.TITLE && !descending)
        booksToShow.push({ books: [...sortedData.current.title].reverse() });
    else if (sortedBy === SortBy.AUTHOR && descending) booksToShow.push({ books: sortedData.current.author });
    else if (sortedBy === SortBy.AUTHOR && !descending)
        booksToShow.push({ books: [...sortedData.current.author].reverse() });
    else if (sortedBy === SortBy.RATING && descending)
        booksToShow = sortedData.current.ratings.map((rating) => ({ books: sortedData.current.rating[rating] ?? [] }));
    else if (sortedBy === SortBy.RATING && !descending)
        booksToShow = [...sortedData.current.ratings]
            .reverse()
            .map((rating) => ({ books: sortedData.current.rating[rating] ?? [] }));
    else if (sortedBy === SortBy.YEAR && descending)
        booksToShow = sortedData.current.years.map((year) => ({
            title: year.toString(),
            books: sortedData.current.year[year] ?? [],
        }));
    else if (sortedBy === SortBy.YEAR && !descending)
        booksToShow = [...sortedData.current.years]
            .reverse()
            .map((year) => ({ title: year.toString(), books: sortedData.current.year[year] ?? [] }));

    return (
        <>
            <Head>
                <title>Bookly - Finished</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <div className={s.finished}>
                <div className={`${s.sortGrid} ${s.absolute}`}>
                    <div className={s.border} />
                </div>

                <div className={s.sortGrid}>
                    <div />

                    {[SortBy.TITLE, SortBy.AUTHOR, SortBy.RATING, SortBy.YEAR].map((sortBy) => (
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
                    {booksToShow.map((section, i) => (
                        <div key={i} className={s.section}>
                            {section.title && <p className={s.sectionTitle}>{section.title}</p>}
                            <div className={s.books}>
                                {section.books.map((book) => (
                                    <FinishedBook key={book.goodReadsId} book={book} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Navigation />
        </>
    );
};

export default Finished;
