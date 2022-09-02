import Loading from "@components/Loading";
import Rating from "@components/Rating";
import Status from "@components/Status";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { BookStatus } from "@prisma/client";
import { appRouter } from "@server/router";
import { createContextInner } from "@server/router/context";
import s from "@styles/pages/BookAuthor.module.scss";
import { createSSGHelpers } from "@trpc/react/ssg";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
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
    const { bookId } = query;
    const id = parseInt(bookId as string);
    await ssg.prefetchQuery("book-get", { bookId: id });

    return { props: { bookId: id, trpcState: ssg.dehydrate() } };
};

const Book = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const { bookId } = props;
    const { data, isLoading, error } = trpc.useQuery(["book-get", { bookId }]);

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
        const { title, author, coverSrc, publishedAt, numPages, description, goodReadsId, statuses } = data;
        const { name, goodReadsId: authorGoodReadsId } = author;

        const status = statuses.length ? statuses[0] : null;
        const bookIsFinished = status && status.status === BookStatus.FINISHED;

        content = (
            <>
                <div className={s.cover}>
                    {coverSrc && <img src={coverSrc} alt={"cover for the book"} />}
                    {!coverSrc && (
                        <img className={s.placeholder} src="/placeholderCover.png" alt={"cover for the book"} />
                    )}
                </div>

                <div className={s.details}>
                    {publishedAt && <p>{publishedAt}</p>}
                    {numPages && <p>{`${numPages} pages`}</p>}
                </div>

                <p className={s.title}>{title || "untitled"}</p>

                <p className={s.subtitle} onClick={() => router.push(`${RoutePaths.AUTHOR}/${authorGoodReadsId}`)}>
                    {name || "unknown author"}
                </p>

                <Status bookId={goodReadsId} />

                {bookIsFinished && (
                    <div className={s.rating}>
                        <Rating bookId={goodReadsId} />
                    </div>
                )}

                {description && (
                    <div className={s.description}>
                        {description.split("%%%").map((paragraph, i) => paragraph && <p key={i}>{paragraph}</p>)}
                    </div>
                )}

                <a
                    className={s.button}
                    target="_blank"
                    href={`https://www.goodreads.com/book/show/${goodReadsId}`}
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
                <title>Bookly - Book</title>
                <meta name="description" content="Book details" />
            </Head>

            <div className={s.book}>{content}</div>

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

export default Book;
