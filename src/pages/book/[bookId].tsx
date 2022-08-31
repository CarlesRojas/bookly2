import Loading from "@components/Loading";
import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { appRouter } from "@server/router";
import { createContextInner } from "@server/router/context";
import s from "@styles/pages/Book.module.scss";
import { createSSGHelpers } from "@trpc/react/ssg";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { RiArrowLeftLine, RiExternalLinkLine } from "react-icons/ri";
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
        const { title, author, coverSrc, publishedAt, numPages, description, goodReadsId } = data;
        const { name, goodReadsId: authorGoodReadsId } = author;

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

                <p className={s.author} onClick={() => router.push(`${RoutePaths.AUTHOR}/${authorGoodReadsId}`)}>
                    {name || "unknown author"}
                </p>

                {description && (
                    <div className={s.description}>
                        {description.split("%%%").map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
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
                <meta name="description" content="View all the books you've read" />
            </Head>

            <div className={s.book}>{content}</div>

            <Navigation />
        </>
    );
};

export default Book;
