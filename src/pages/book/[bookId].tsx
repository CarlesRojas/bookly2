import BookCover from "@components/BookCover";
import Loading from "@components/Loading";
import Rating from "@components/Rating";
import Read from "@components/Read";
import Status from "@components/Status";
import { RoutePaths } from "@constants/routes";
import { Event, useEvents } from "@context/events";
import useRedirectLoading from "@hooks/useRedirectLoading";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { BookStatus, Read as ReadType } from "@prisma/client";
import s from "@styles/pages/BookAuthor.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { RiAddLine, RiArrowLeftLine, RiExternalLinkLine, RiHome5Line } from "react-icons/ri";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

const Book: NextPage = () => {
    const router = useRouter();
    const { emit } = useEvents();

    const isRedirecting = useRedirectLoading();

    const trpcContext = trpc.useContext();

    const bookId = parseInt(router.query.bookId as string);
    const { data, isLoading, error } = trpc.useQuery(["book-get", { bookId }]);

    const onMutationSuccess = () => trpcContext.invalidateQueries(["book-get"]);

    const { mutate: addReread, isLoading: addRereadLoading } = trpc.useMutation(["book-add-reread"], {
        onSuccess: onMutationSuccess,
    });
    const { mutate: setFinished, isLoading: setFinishedLoading } = trpc.useMutation("book-set-finished", {
        onSuccess: onMutationSuccess,
    });
    const { mutate: setReading, isLoading: setReadingLoading } = trpc.useMutation("book-set-reading", {
        onSuccess: onMutationSuccess,
    });
    const { mutate: setWantToRead, isLoading: setWantToReadLoading } = trpc.useMutation("book-set-want-to-read", {
        onSuccess: onMutationSuccess,
    });
    const { mutate: remove, isLoading: removeLoading } = trpc.useMutation("book-remove", {
        onSuccess: onMutationSuccess,
    });

    const onAddReread = () => {
        const today = new Date();
        const currYear = today.getFullYear();
        const currMonth = today.getMonth();

        addReread({ bookId, month: currMonth, year: currYear });
    };

    const onBackClick = () => {
        emit(Event.REDIRECT_STARTED);
        router.back();
    };

    const onHomeClick = () => {
        emit(Event.REDIRECT_STARTED);
        router.push(RoutePaths.HOME);
    };

    const isWaiting = isLoading || isRedirecting;

    let content = null;
    if (!data || error || isWaiting) {
        content = (
            <>
                {isWaiting && <Loading />}

                {!isWaiting && (!data || error) && (
                    <div className={s.error}>
                        <p className={s.message}>there was an error fetching the book</p>

                        <div className={s.button} onClick={onBackClick}>
                            <RiArrowLeftLine />
                            <p>go back</p>
                        </div>
                    </div>
                )}
            </>
        );
    } else {
        const { title, author, publishedAt, numPages, description, goodReadsId, statuses, reads } = data;
        const { name, goodReadsId: authorGoodReadsId, photoSrc } = author;

        const onAuthorClick = () => {
            emit(Event.REDIRECT_STARTED);
            router.push(`${RoutePaths.AUTHOR}/${authorGoodReadsId}`);
        };

        const today = new Date();
        const currYear = today.getFullYear();
        const currMonth = today.getMonth();

        const status = statuses.length ? statuses[0] : null;
        const bookIsFinished = (status && status.status === BookStatus.FINISHED) || setFinishedLoading;
        const defaultRead: ReadType = {
            id: "fake",
            bookId: -1,
            userId: "fake",
            month: currMonth,
            year: currYear,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const isLoadingRemoveRead = setReadingLoading || setWantToReadLoading || removeLoading;

        content = (
            <>
                <div className={s.coverContainer}>
                    <BookCover book={data} />
                </div>

                <div className={s.details}>
                    {publishedAt && <p>{publishedAt}</p>}
                    {numPages && <p>{`${numPages} pages`}</p>}
                </div>

                <p className={s.title}>{title || "untitled"}</p>

                <p className={s.subtitle} onClick={onAuthorClick}>
                    {name || "unknown author"}
                </p>

                <Status
                    bookId={goodReadsId}
                    status={status?.status}
                    remove={remove}
                    setFinished={setFinished}
                    setReading={setReading}
                    setWantToRead={setWantToRead}
                />

                {bookIsFinished && !isLoadingRemoveRead && (
                    <div className={s.rating}>
                        <Rating bookId={goodReadsId} rating={status?.rating ?? 0} />
                    </div>
                )}

                {bookIsFinished && !isLoadingRemoveRead && (
                    <>
                        {setFinishedLoading && <Read read={defaultRead} first={true} disabled />}

                        {reads.map((read, i) => (
                            <Read key={read.id} read={read} first={i === 0} />
                        ))}

                        <div
                            className={`${s.addReread} ${addRereadLoading || setFinishedLoading ? s.disabled : ""}`}
                            onClick={onAddReread}
                        >
                            {addRereadLoading && <Loading />}
                            {!addRereadLoading && (
                                <>
                                    <RiAddLine className={s.icon} />
                                    <p>add reread</p>
                                </>
                            )}
                        </div>
                    </>
                )}

                {description && (
                    <div className={s.description}>
                        {description.split("%%%").map((paragraph, i) => paragraph && <p key={i}>{paragraph}</p>)}
                    </div>
                )}

                <a
                    className={s.goodReadsButton}
                    target="_blank"
                    href={`https://www.goodreads.com/book/show/${goodReadsId}`}
                    rel="noopener noreferrer"
                >
                    <RiExternalLinkLine />
                    <p>view book on goodreads</p>
                </a>

                {author && (
                    <div className={s.authorPreview} onClick={onAuthorClick}>
                        {photoSrc && <img src={photoSrc} alt={"photo of the author"} />}
                        {!photoSrc && (
                            <img className={s.placeholder} src="/placeholderPhoto.png" alt={"photo of the author"} />
                        )}
                        <p>{name || "unknown author"}</p>
                    </div>
                )}
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
                        <div className={s.navButton} onClick={onHomeClick}>
                            <RiHome5Line />
                            <p>home</p>
                        </div>
                    </div>

                    <div className={s.container}>
                        <div className={s.navButton} onClick={onBackClick}>
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
