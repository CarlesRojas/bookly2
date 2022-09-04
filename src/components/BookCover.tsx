import { RoutePaths } from "@constants/routes";
import { Event, useEvents } from "@context/events";
import { FinishedBook } from "@pages/finished";
import { BookWithAuthor } from "@pages/index";
import s from "@styles/components/BookCover.module.scss";
import { useRouter } from "next/router";

interface BookCoverProps {
    book: FinishedBook | BookWithAuthor;
    interactive?: boolean;
}

const BookCover = (props: BookCoverProps) => {
    const router = useRouter();
    const { emit } = useEvents();

    const { book, interactive } = props;
    const { coverSrc, goodReadsId, title, author } = book;

    const onBookClick = () => {
        emit(Event.REDIRECT_STARTED);
        router.push(`${RoutePaths.BOOK}/${goodReadsId}`);
    };

    return (
        <div className={`${s.bookCover} ${interactive ? s.interactive : ""}`} onClick={onBookClick}>
            <div className={s.cover}>
                {coverSrc && <img src={coverSrc} alt={"cover for the book"} />}
                {!coverSrc && <img className={s.placeholder} src="/placeholderCover.png" alt={"cover for the book"} />}

                <div className={`${s.info} ${coverSrc ? s.hidden : ""}`}>
                    <p className={s.title}>{title}</p>
                    <p className={s.author}>{author.name}</p>
                </div>
            </div>
        </div>
    );
};

export default BookCover;
