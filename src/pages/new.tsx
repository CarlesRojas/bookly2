import { RoutePaths } from "@constants/routes";
import useAutoResetState from "@hooks/useAutoResetState";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/New.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { RiAddLine, RiArrowLeftLine, RiExternalLinkLine, RiLoader4Fill } from "react-icons/ri";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

const New: NextPage = () => {
    const router = useRouter();
    const { mutate: addBook, isLoading, isSuccess, error: mutateError } = trpc.useMutation(["book-add"]);

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
        <div className={s.new}>
            <Head>
                <title>Bookly - New</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <>
                <div className={s.content}>
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
                            onChange={(event) => {
                                setInputValue(event.target.value);
                            }}
                            type="text"
                            name="goodReadsUrl"
                            autoComplete="new-password"
                            placeholder="https://www.goodreads.com/book/show/..."
                        />

                        <button className={`${s.button} ${isWaiting ? s.disabled : ""}`}>
                            {isWaiting ? (
                                <RiLoader4Fill className={s.load} />
                            ) : (
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
        </div>
    );
};

export default New;
