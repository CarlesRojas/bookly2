import useAutoResetState from "@hooks/useAutoResetState";
import { NextPageWithAuth } from "@pages/_app";
import s from "@styles/pages/New.module.scss";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { RiAddLine, RiArrowLeftLine, RiExternalLinkLine, RiLoader4Fill } from "react-icons/ri";

const New: NextPageWithAuth = () => {
    const router = useRouter();
    const { mutate: addBook, isLoading, isSuccess, error: mutateError } = trpc.useMutation("book-add");

    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("-");
    const [showError, setShowError] = useAutoResetState(false, 3000);

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (!inputValue.includes("https://www.goodreads.com/book/show")) {
            setError("book URL is not valid");
            setShowError(true);
            return;
        }

        addBook({ goodReadsUrl: inputValue });
    };

    useEffect(() => {
        if (isSuccess) router.back();
    }, [isSuccess, router]);

    useEffect(() => {
        if (mutateError) {
            setError(mutateError?.message);
            setShowError(true);
        }
    }, [mutateError, setShowError]);

    const isWaiting = isLoading || isSuccess;

    return (
        <>
            <Head>
                <title>Bookly - New</title>
                <meta name="description" content="Add a new book to Bookly" />
            </Head>

            <div className={s.new}>
                <p>to add a book, search it here</p>

                <a
                    className={s.buttonText}
                    target="_blank"
                    href="https://www.goodreads.com/search/"
                    rel="noopener noreferrer"
                >
                    <RiExternalLinkLine />
                    <p>goodreads</p>
                </a>

                <p>and paste the URL here</p>

                <form onSubmit={onSubmit}>
                    <input
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        type="text"
                        autoComplete="new-password"
                        placeholder="https://www.goodreads.com/book/show/..."
                    />

                    <button className={`${s.button} ${isWaiting ? s.loading : ""}`}>
                        {isWaiting && <RiLoader4Fill className={s.load} />}

                        {!isWaiting && (
                            <>
                                <RiAddLine />
                                <p>add book</p>
                            </>
                        )}
                    </button>
                </form>

                <p className={`${s.error} ${showError ? s.visible : ""}`}>{error}</p>

                <div className={s.back} onClick={() => router.back()}>
                    <RiArrowLeftLine />
                    <p>back</p>
                </div>
            </div>
        </>
    );
};

New.auth = true;
export default New;
