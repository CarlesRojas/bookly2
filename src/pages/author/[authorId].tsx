import Bookshelf from "@components/Bookshelf";
import Loading from "@components/Loading";
import { RoutePaths } from "@constants/routes";
import useResize from "@hooks/useResize";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { appRouter } from "@server/router";
import { createContextInner } from "@server/router/context";
import s from "@styles/pages/BookAuthor.module.scss";
import { createSSGHelpers } from "@trpc/react/ssg";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { RiArrowLeftLine, RiExternalLinkLine, RiHome5Line } from "react-icons/ri";
import superjson from "superjson";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };

    const ssg = createSSGHelpers({
        router: appRouter,
        ctx: await createContextInner({ session }),
        transformer: superjson,
    });

    const { query } = context;
    const { authorId } = query;
    const id = parseInt(authorId as string);
    await ssg.prefetchQuery("author-get", { authorId: id });

    return { props: { authorId: id, trpcState: ssg.dehydrate() } };
};

const Author = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const { authorId } = props;
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

export default Author;
