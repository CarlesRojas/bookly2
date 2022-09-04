import AuthorsSection from "@components/AuthorsSection";
import BooksSection from "@components/BooksSection";
import Loading from "@components/Loading";
import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import useAutoResetState from "@hooks/useAutoResetState";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/Search.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";
import { RiAddLine, RiLoader4Fill, RiSearchLine } from "react-icons/ri";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

export const QUERY_COOKIE_NAME = "bookly2-query";

enum ResultsType {
    BOOK = "books",
    AUTHOR = "authors",
}

const Search: NextPage = () => {
    const router = useRouter();
    const [query, setQuery] = useState(""); // TODO save in state context
    const [resultsType, setResultsType] = useState(ResultsType.BOOK); // TODO save in state context

    const {
        data: booksData,
        isLoading: booksAreLoading,
        error: booksError,
    } = trpc.useQuery(["book-search", { query }]);
    const {
        data: authorsData,
        isLoading: authorsAreLoading,
        error: authorsError,
    } = trpc.useQuery(["author-search", { query }]);

    const [inputValue, setInputValue] = useState(query);
    const [error, setError] = useState("-");
    const [showError, setShowError] = useAutoResetState(false, 3000);
    const [hideResults, setHideResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (booksAreLoading || authorsAreLoading) return;

        inputRef.current?.blur();
        window?.localStorage?.setItem(QUERY_COOKIE_NAME, inputValue);
        setQuery(inputValue);
    };

    useEffect(() => {
        if (booksError) setError(booksError?.message);
        if (authorsError) setError(authorsError?.message);

        if (booksError || authorsError) setShowError(true);
    }, [booksError, authorsError, setShowError]);

    const isWaiting = booksAreLoading || authorsAreLoading;

    useEffect(() => {
        const queryValue = window?.localStorage?.getItem(QUERY_COOKIE_NAME) as string;

        if (!queryValue) return;

        setQuery(queryValue);
        setInputValue(queryValue);
    }, []);

    return (
        <>
            <Head>
                <title>Bookly - Search</title>
                <meta name="description" content="Search for a book or author" />
            </Head>

            <div className={s.search}>
                <div className={s.resultsTypeContainer}>
                    <div className={`${s.resultTypeGrid} ${s.absolute}`}>
                        <div className={s.border} />
                    </div>

                    <div className={s.resultTypeGrid}>
                        {[ResultsType.BOOK, ResultsType.AUTHOR].map((type) => (
                            <div
                                key={type}
                                className={`${s.resultType} ${resultsType === type ? s.current : ""}`}
                                onClick={() => setResultsType(type)}
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${s.results} ${hideResults ? s.hide : ""}`}>
                    {!query && (
                        <div className={s.noResults}>
                            <p>search a book or an author...</p>
                        </div>
                    )}
                    {query && isWaiting && <Loading />}

                    {query && !isWaiting && resultsType === ResultsType.BOOK && booksData && (
                        <BooksSection title={null} books={booksData} emptyMessage="no books match your query" />
                    )}

                    {query && !isWaiting && resultsType === ResultsType.AUTHOR && authorsData && (
                        <AuthorsSection title={null} authors={authorsData} emptyMessage="no authors match your query" />
                    )}
                </div>

                <div className={s.rowContainer}>
                    <div className={s.add} onClick={() => router.push(RoutePaths.NEW)}>
                        <RiAddLine />
                        <p>add book</p>
                    </div>

                    <form onSubmit={onSubmit}>
                        <input
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            type="text"
                            autoComplete="new-password"
                            placeholder="book or author..."
                            onFocus={() => setHideResults(true)}
                            onBlur={() => setHideResults(false)}
                            ref={inputRef}
                        />

                        <button className={`${s.button} ${isWaiting ? s.loading : ""}`}>
                            {isWaiting && <RiLoader4Fill className={s.load} />}
                            {!isWaiting && <RiSearchLine />}
                        </button>
                    </form>

                    <p className={`${s.error} ${showError ? s.visible : ""}`}>{error}</p>
                </div>
            </div>

            <Navigation />
        </>
    );
};

export default Search;
