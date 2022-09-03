import { RoutePaths } from "@constants/routes";
import s from "@styles/components/Authorshelf.module.scss";
import { inferQueryOutput } from "@utils/trpc";
import { useRouter } from "next/router";
import { CSSProperties, useEffect, useRef } from "react";

type AuthorsType = inferQueryOutput<"author-search">;

interface AuthorshelfProps {
    authors: AuthorsType;
    shelfName: string;
    rowHeight: number;
    emptyMessage: string;
}

const REM_PX = 16;
const AUTHOR_NAME_HEIGHT = 2.75;
const SHELF_TITLE_HEIGHT_IN_REM = 2.5;
const PADDING_TOP_AND_BOTTOM = 0.5;

const Authorshelf = (props: AuthorshelfProps) => {
    const router = useRouter();
    const { authors, shelfName, rowHeight, emptyMessage } = props;

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

    const photoHeight =
        rowHeight - (AUTHOR_NAME_HEIGHT + SHELF_TITLE_HEIGHT_IN_REM + PADDING_TOP_AND_BOTTOM * 2) * REM_PX;

    const photoStyle = {
        height: `${photoHeight}px`,
        width: `${photoHeight * 0.65}px`,
        borderRadius: `${photoHeight * 0.025}px`,
    };

    const authorElems = authors.map((author) => {
        const { goodReadsId, name, photoSrc } = author;

        return (
            <div
                className={s.author}
                key={goodReadsId}
                style={{ width: photoStyle.width }}
                onClick={() => router.push(`${RoutePaths.AUTHOR}/${goodReadsId}`)}
            >
                <div className={s.cover} style={photoStyle}>
                    {photoSrc && (
                        <img
                            style={{ borderRadius: photoStyle.borderRadius }}
                            src={photoSrc}
                            alt={"Photo of the author"}
                        />
                    )}

                    {!photoSrc && (
                        <img
                            style={{ borderRadius: photoStyle.borderRadius }}
                            src="/placeholderPhoto.png"
                            alt={"photo of the author"}
                        />
                    )}
                </div>

                <div className={s.info} style={{ height: `${AUTHOR_NAME_HEIGHT}rem`, width: photoStyle.width }}>
                    <p className={s.name}>{name}</p>
                </div>
            </div>
        );
    });

    return (
        <div
            className={s.authorshelf}
            style={{ "--shelfTitleHeight": `${SHELF_TITLE_HEIGHT_IN_REM}rem` } as CSSProperties}
        >
            <p className={s.shelfName}>{shelfName}</p>

            {authors.length <= 0 && (
                <div className={s.noAuthors}>
                    <p>{emptyMessage}</p>
                </div>
            )}

            {authors.length > 0 && (
                <div className={s.container} ref={containerRef} style={{ padding: `${PADDING_TOP_AND_BOTTOM}rem 0` }}>
                    {authorElems}
                </div>
            )}
        </div>
    );
};

export default Authorshelf;
