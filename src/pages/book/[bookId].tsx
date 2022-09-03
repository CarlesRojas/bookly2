import Loading from "@components/Loading";
import Rating from "@components/Rating";
import Read from "@components/Read";
import Status from "@components/Status";
import { RoutePaths } from "@constants/routes";
import { NextPageWithAuth } from "@pages/_app";
import { BookStatus } from "@prisma/client";
import s from "@styles/pages/BookAuthor.module.scss";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import { RiAddLine, RiArrowLeftLine, RiExternalLinkLine, RiHome5Line } from "react-icons/ri";

const Book: NextPageWithAuth = () => {
    const router = useRouter();
    const bookId = parseInt(router.query.bookId as string);
    const trpcContext = trpc.useContext();

    const { data, isLoading, error } = trpc.useQuery(["book-get", { bookId }]);

    const onMutationSuccess = () => trpcContext.invalidateQueries(["book-get"]);
    const { mutate: addReread } = trpc.useMutation(["book-add-reread"], { onSuccess: onMutationSuccess });

    const onAddReread = () => {
        const today = new Date();
        const currYear = today.getFullYear();
        const currMonth = today.getMonth();

        addReread({ bookId, month: currMonth, year: currYear });
    };

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
        const { title, author, coverSrc, publishedAt, numPages, description, goodReadsId, statuses, reads } = data;
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

                <Status bookId={goodReadsId} status={status?.status} />

                {bookIsFinished && (
                    <div className={s.rating}>
                        <Rating bookId={goodReadsId} rating={status.rating} />
                    </div>
                )}

                {reads && reads.length > 0 && (
                    <>
                        {reads.map((read, i) => (
                            <Read key={read.id} read={read} first={i === 0} />
                        ))}

                        <div className={s.addReread} onClick={onAddReread}>
                            <RiAddLine className={s.icon} />
                            <p>add reread</p>
                        </div>
                    </>
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

Book.auth = true;
export default Book;
