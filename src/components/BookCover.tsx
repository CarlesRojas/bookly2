import { RoutePaths } from "@constants/routes";
import { FinishedBook } from "@pages/finished";
import { BookWithAuthor } from "@pages/index";
import s from "@styles/components/BookCover.module.scss";
import { useRouter } from "next/router";

interface BookCoverProps {
    book: FinishedBook | BookWithAuthor;
}

const BookCover = (props: BookCoverProps) => {
    const router = useRouter();
    const { book } = props;
    const { coverSrc, goodReadsId } = book;

    return (
        <div className={s.finishedBook} onClick={() => router.push(`${RoutePaths.BOOK}/${goodReadsId}`)}>
            <div className={s.cover}>
                {coverSrc && <img src={coverSrc} alt={"Cover for the book"} />}
                {!coverSrc && <img src="/placeholderCover.png" alt={"cover for the book"} />}
            </div>
        </div>
    );
};

export default BookCover;
