import { FinishedBook } from "@pages/finished";
import { BookWithAuthor } from "@pages/index";
import s from "@styles/components/BooksSection.module.scss";
import { RiStarFill } from "react-icons/ri";
import BookCover from "./BookCover";

interface BooksSectionProps {
    title: string | number | null;
    books: (FinishedBook | BookWithAuthor)[];
    first?: boolean;
    isRating?: boolean;
}

const BooksSection = (props: BooksSectionProps) => {
    const { title, books, first, isRating } = props;

    return (
        <div className={s.section}>
            {!isRating && title !== null && <p className={`${s.sectionTitle} ${first ? s.first : ""}`}>{title}</p>}

            {isRating && title !== null && title === 0 && <p className={s.sectionTitle}>unrated</p>}
            {isRating && title !== null && (
                <div className={s.sectionTitle}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <RiStarFill key={i} className={`${s.star} ${i <= title ? s.active : ""}`} />
                    ))}
                </div>
            )}

            <div className={s.books}>
                {books.map((book) => (
                    <BookCover key={book.goodReadsId} book={book} interactive />
                ))}
            </div>
        </div>
    );
};

export default BooksSection;
