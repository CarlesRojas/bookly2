import { FinishedBook } from "@pages/finished";
import { BookWithAuthor } from "@pages/index";
import s from "@styles/components/BooksSection.module.scss";
import BookCover from "./BookCover";

interface BooksSectionProps {
    title: string | number;
    books: (FinishedBook | BookWithAuthor)[];
    first?: boolean;
    isRating?: boolean;
}

const BooksSection = (props: BooksSectionProps) => {
    const { title, books, first } = props;

    return (
        <div className={s.section}>
            <p className={`${s.sectionTitle} ${first ? s.first : ""}`}>{title}</p>
            <div className={s.books}>
                {books.map((book) => (
                    <BookCover key={book.goodReadsId} book={book} />
                ))}
            </div>
        </div>
    );
};

export default BooksSection;
