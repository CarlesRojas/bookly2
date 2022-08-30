import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import useAutoResetState from "@hooks/useAutoResetState";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/Search.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { RiAddLine, RiLoader4Fill, RiSearchLine } from "react-icons/ri";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

const Search: NextPage = () => {
    const [query, setQuery] = useState("");

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

    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("-");
    const [showError, setShowError] = useAutoResetState(false, 3000);

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setQuery(inputValue);
    };

    useEffect(() => {
        if (booksError) setError(booksError?.message);
        if (authorsError) setError(authorsError?.message);

        if (booksError || authorsError) setShowError(true);
    }, [booksError, authorsError, setShowError]);

    const isWaiting = booksAreLoading || authorsAreLoading;

    return (
        <>
            <Head>
                <title>Bookly - Search</title>
                <meta name="description" content="View all the books you've read" />
            </Head>
            <div className={s.search}>
                <div className={s.gridContainer}></div>
                <div className={s.gridContainer}>{booksData && booksData.map((bookData) => {})}</div>
                <div className={s.gridContainer}>
                    <div className={s.add} onClick={() => console.log("add book")}>
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
