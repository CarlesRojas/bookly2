import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { Book, Read } from "@prisma/client";
import s from "@styles/pages/Stats.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

type ReadBook = Read & { book: Book };

interface StatsObject {
    totalNumBooksFinished: number;
    totalPagesRead: number;
    averagePagesPerYear: number;
    averageBooksPerYear: number;
    bookPagesByYear: { [key: number]: number };
    booksByYear: { [key: number]: number };
    maxPagesInAYear: number;
    maxBooksInAYear: number;
    years: number[];
}

const DEFAULT_STATS: StatsObject = {
    totalNumBooksFinished: 0,
    totalPagesRead: 0,
    averagePagesPerYear: 0,
    averageBooksPerYear: 0,
    bookPagesByYear: {},
    booksByYear: {},
    maxPagesInAYear: 0,
    maxBooksInAYear: 0,
    years: [],
};

const Stats: NextPage = () => {
    const { data, isLoading, error } = trpc.useQuery(["user-get-reads"]);

    const stats = useRef(DEFAULT_STATS);
    const [, setRecalculated] = useState(0);

    const [booksSelected, setBooksSelected] = useState(false);

    useEffect(() => {
        if (isLoading || error || !data) return;

        const newStats = DEFAULT_STATS;

        let minYear = Number.MAX_VALUE;
        let maxYear = Number.MIN_VALUE;

        const booksByYear: { [key: number]: (ReadBook & { book: Book })[] } = {};
        data.forEach((read) => {
            if (read.year in booksByYear) booksByYear[read.year]?.push(read);
            else booksByYear[read.year] = [read];

            if (read.year < minYear) minYear = read.year;
            if (read.year > maxYear) maxYear = read.year;
        });

        newStats.totalNumBooksFinished = data.length;
        newStats.totalPagesRead = data.reduce((count, { book }) => book.numPages + count, 0);
        newStats.averagePagesPerYear = Math.round(newStats.totalPagesRead / (maxYear - minYear + 1));
        newStats.averageBooksPerYear = newStats.totalNumBooksFinished / (maxYear - minYear + 1);

        for (const year in booksByYear) {
            if (Object.prototype.hasOwnProperty.call(booksByYear, year)) {
                newStats.bookPagesByYear[year] =
                    booksByYear[year]?.reduce((count, { book }) => book.numPages + count, 0) ?? 0;

                newStats.booksByYear[year] = booksByYear[year]?.length ?? 0;
            }
        }

        newStats.maxPagesInAYear = Math.max(...Object.values(newStats.bookPagesByYear));
        newStats.maxBooksInAYear = Math.max(...Object.values(newStats.booksByYear));

        newStats.years = [];
        for (let i = maxYear; i >= minYear; i--) newStats.years.push(i);

        stats.current = newStats;
        setRecalculated((prev) => prev + 1);
    }, [data, isLoading, error]);

    const {
        totalNumBooksFinished,
        totalPagesRead,
        averagePagesPerYear,
        averageBooksPerYear,
        bookPagesByYear,
        booksByYear,
        maxPagesInAYear,
        maxBooksInAYear,
        years,
    } = stats.current;

    return (
        <>
            <Head>
                <title>Bookly - Stats</title>
                <meta name="description" content="View stats about the books you've read" />
            </Head>

            <div className={s.stats}>
                <div className={s.grid}>
                    <div className={s.stat}>
                        <p className={s.value}>{totalNumBooksFinished}</p>
                        <p className={s.title}>total number of books read</p>
                    </div>

                    <div className={s.stat}>
                        <p className={s.value}>{totalPagesRead}</p>
                        <p className={s.title}>total number of pages read</p>
                    </div>

                    <div className={s.stat}>
                        <p className={s.value}>{averagePagesPerYear}</p>
                        <p className={s.title}>average pages read per year</p>
                    </div>

                    <div className={s.stat}>
                        <p className={s.value}>{parseFloat(averageBooksPerYear.toFixed(2))}</p>
                        <p className={s.title}>average books read per year</p>
                    </div>
                </div>

                {years.length > 0 && (
                    <div className={s.graph} style={{ gridTemplateColumns: `repeat(${years.length}, 2.5rem)` }}>
                        {years.map((year) => {
                            const value = (booksSelected ? booksByYear[year] : bookPagesByYear[year]) ?? 0;
                            const max = booksSelected ? maxBooksInAYear : maxPagesInAYear;
                            const percentage = max > 0 ? (value / max) * 100 : 0;
                            const unit = (booksSelected ? "book" : "page") + (value === 1 ? "" : "s");

                            return (
                                <div className={s.column} key={year}>
                                    <div className={s.barContainer}>
                                        <div className={s.bar} style={{ height: `${percentage}%` }}></div>
                                    </div>

                                    <p className={s.year}>{year}</p>
                                    <p className={s.value}>{value}</p>
                                    <p className={s.unit}>{unit}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {years.length > 0 && (
                    <div className={s.graphSwitch}>
                        <div
                            className={`${s.switch} ${booksSelected ? "" : s.active}`}
                            onClick={() => setBooksSelected(false)}
                        >
                            pages per year
                        </div>
                        <div
                            className={`${s.switch} ${booksSelected ? s.active : ""}`}
                            onClick={() => setBooksSelected(true)}
                        >
                            books per year
                        </div>
                    </div>
                )}
            </div>

            <Navigation />
        </>
    );
};

export default Stats;
