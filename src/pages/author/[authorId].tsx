import Bookshelf from "@components/Bookshelf";
import Loading from "@components/Loading";
import { RoutePaths } from "@constants/routes";
import useResize from "@hooks/useResize";
import { NextPageWithAuth } from "@pages/_app";
import s from "@styles/pages/BookAuthor.module.scss";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { RiArrowLeftLine, RiExternalLinkLine, RiHome5Line } from "react-icons/ri";

const Author: NextPageWithAuth = () => {
    const router = useRouter();
    const authorId = parseInt(router.query.authorId as string);
    const { data, isLoading, error } = trpc.useQuery(["author-get", { authorId }]);

    const [rowHeight, setRowHeight] = useState(0);
    useResize(() => {
        setRowHeight(window.innerHeight * 0.4);
    }, true);

    let content = null;
    if (!data) {
        content = (
            <>
                {isLoading && <Loading />}

                {error && (
                    <div className={s.error}>
                        <p className={s.message}>there was an error fetching the book</p>

                        <div className={s.button} onClick={() => router.back()}>
                            <RiArrowLeftLine />
                            <p>go back</p>
                        </div>
                    </div>
                )}
            </>
        );
    } else {
        const { goodReadsId, name, description, photoSrc, books } = data;

        content = (
            <>
                <div className={s.cover}>
                    {photoSrc && <img src={photoSrc} alt={"photo of the author"} />}
                    {!photoSrc && (
                        <img className={s.placeholder} src="/placeholderPhoto.png" alt={"photo of the author"} />
                    )}
                </div>

                <p className={s.title}>{name || "unknown name"}</p>

                <p className={s.subtitle}></p>

                {description && (
                    <div className={s.description}>
                        {description.split("%%%").map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                )}

                <div className={s.rowContainer}>
                    <Bookshelf
                        books={books}
                        rowHeight={rowHeight}
                        shelfName="works"
                        emptyMessage="we have no works for this author"
                    />
                </div>

                <a
                    className={s.button}
                    target="_blank"
                    href={`https://www.goodreads.com/author/show/${goodReadsId}`}
                    rel="noopener noreferrer"
                >
                    <RiExternalLinkLine />
                    <p>view on goodreads</p>
                </a>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Bookly - Author</title>
                <meta name="description" content="Author details" />
            </Head>

            <div className={s.author}>{content}</div>

            <div className={s.nav}>
                <div className={s.buttons}>
                    <div className={s.container}>
                        <div className={s.navButton} onClick={() => router.push(RoutePaths.HOME)}>
                            <RiHome5Line />
                            <p>home</p>
                        </div>
                    </div>

                    <div className={s.container}>
                        <div className={s.navButton} onClick={() => router.back()}>
                            <RiArrowLeftLine />
                            <p>back</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

Author.auth = true;
export default Author;
