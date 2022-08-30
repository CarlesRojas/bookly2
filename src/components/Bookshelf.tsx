import s from "@styles/components/Bookshelf.module.scss";
import { inferQueryOutput } from "@utils/trpc";

type BooksType = inferQueryOutput<"book-search">;

interface BookshelfProps {
    books: BooksType;
    shelfName: string;
}

const Bookshelf = (props: BookshelfProps) => {
    const { books, shelfName } = props;

    const bookElems = books.map((book) => {
        const { goodReadsId, title, author } = book;
        const { name } = author;

        return (
            <div className={s.book} key={goodReadsId}>
                <div></div>
                <p className={s.title}>{title}</p>
                <p className={s.author}>{name}</p>
            </div>
        );
    });

    return (
        <div className={s.bookshelf}>
            <p className={s.shelfName}>{shelfName}</p>
            <div className={s.container}>{bookElems}</div>
        </div>
    );
};

export default Bookshelf;
