import AuthorPhoto from "@components/AuthorPhoto";
import BooksSection from "@components/BooksSection";
import Loading from "@components/Loading";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/BookAuthor.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { RiArrowLeftLine, RiExternalLinkLine, RiHome5Line } from "react-icons/ri";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

// TODO when redirecting to this page -> show loading
const Author: NextPage = () => {
    const router = useRouter();
    const authorId = parseInt(router.query.authorId as string);
    const { data, isLoading, error } = trpc.useQuery(["author-get", { authorId }]);

    let content = null;
    if (!data || error || isLoading) {
        content = (
            <>
                {isLoading && <Loading />}

                {!isLoading && (!data || error) && (
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
        const { goodReadsId, name, description, books } = data;

        content = (
            <>
                <div className={s.coverContainer}>
                    <AuthorPhoto author={data} />
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

                <a
                    className={s.goodReadsButton}
                    target="_blank"
                    href={`https://www.goodreads.com/author/show/${goodReadsId}`}
                    rel="noopener noreferrer"
                >
                    <RiExternalLinkLine />
                    <p>view author on goodreads</p>
                </a>

                <BooksSection books={books} title="works" emptyMessage="we have no works for this author" first />

                <div className={s.margin} />
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

export default Author;
