import s from "@styles/components/Bookshelf.module.scss";
import { inferQueryOutput } from "@utils/trpc";
import { CSSProperties, useEffect, useRef } from "react";

type BooksType = inferQueryOutput<"book-search">;

interface BookshelfProps {
    books: BooksType;
    shelfName: string;
    rowHeight: number;
    emptyMessage: string;
}

const REM_PX = 16;
const TITLE_AND_AUTHOR_HEIGHT_IN_REM = 2.75;
const SHELF_TITLE_HEIGHT_IN_REM = 2.5;
const PADDING_TOP_AND_BOTTOM = 0.5;

const Bookshelf = (props: BookshelfProps) => {
    const { books, shelfName, rowHeight, emptyMessage } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    const scroll = (event: WheelEvent) => {
        event.preventDefault();
        if (containerRef.current) containerRef.current.scrollLeft += event.deltaY;
    };

    useEffect(() => {
        const containerRefAux = containerRef.current;
        if (containerRefAux) containerRefAux.addEventListener("wheel", scroll, { passive: false });

        return () => {
            if (containerRefAux) containerRefAux.removeEventListener("wheel", scroll);
        };
    }, []);

    const coverHeight =
        rowHeight - (TITLE_AND_AUTHOR_HEIGHT_IN_REM + SHELF_TITLE_HEIGHT_IN_REM + PADDING_TOP_AND_BOTTOM * 2) * REM_PX;

    const coverStyle = {
        height: `${coverHeight}px`,
        width: `${coverHeight * 0.65}px`,
        borderRadius: `${coverHeight * 0.025}px`,
    };

    const bookElems = books.map((book) => {
        const { goodReadsId, title, author, coverSrc } = book;
        const { name } = author;

        return (
            <div className={s.book} key={goodReadsId} style={{ width: coverStyle.width }}>
                <div className={s.cover} style={coverStyle}>
                    <img style={{ borderRadius: coverStyle.borderRadius }} src={coverSrc} alt={"Cover for the book"} />
                </div>

                <div
                    className={s.info}
                    style={{ height: `${TITLE_AND_AUTHOR_HEIGHT_IN_REM}rem`, width: coverStyle.width }}
                >
                    <p className={s.title}>{title}</p>
                    <p className={s.author}>{name}</p>
                </div>
            </div>
        );
    });

    return (
        <div
            className={s.bookshelf}
            style={{ "--shelfTitleHeight": `${SHELF_TITLE_HEIGHT_IN_REM}rem` } as CSSProperties}
        >
            <p className={s.shelfName}>{shelfName}</p>

            {books.length <= 0 && (
                <div className={s.noBooks}>
                    <p>{emptyMessage}</p>
                </div>
            )}

            {books.length > 0 && (
                <div className={s.container} ref={containerRef} style={{ padding: `${PADDING_TOP_AND_BOTTOM}rem 0` }}>
                    {bookElems}
                </div>
            )}
        </div>
    );
};

export default Bookshelf;
