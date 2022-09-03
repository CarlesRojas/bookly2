import useResize from "@hooks/useResize";
import s from "@styles/components/Rating.module.scss";
import { trpc } from "@utils/trpc";
import { clamp } from "lodash";
import { MouseEvent as ReactMouseEvent, TouchEvent, useCallback, useEffect, useRef, useState } from "react";
import { RiStarFill } from "react-icons/ri";

export interface RatingProps {
    bookId: number;
    rating: number;
}

const HEIGHT = 3 * 16;

const Rating = (props: RatingProps) => {
    const { bookId, rating } = props;
    const trpcContext = trpc.useContext();

    const onMutationSuccess = () => trpcContext.invalidateQueries(["book-get"]);
    const { mutate: setRating } = trpc.useMutation("book-set-rating", {
        onSuccess: onMutationSuccess,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const containerBox = useRef<DOMRect | null>(null);

    const handleResize = () => {
        if (!containerRef.current) return;

        const box = containerRef.current.getBoundingClientRect();
        containerBox.current = box;
    };
    useResize(handleResize, true);

    const isRating = useRef(false);
    const [currRating, setCurrRating] = useState(rating);

    const calculateNewMouseRating = useCallback(
        (event: MouseEvent | ReactMouseEvent) => {
            if (!containerBox.current) return;
            const clientX = event.clientX;

            const x = Math.ceil(
                clamp(clientX - containerBox.current.left, 0, containerBox.current.width) /
                    containerBox.current.width /
                    0.2
            );

            if (Number.isNaN(x)) return;

            setCurrRating(x);
        },
        [setCurrRating]
    );

    const calculateNewTouchRating = useCallback(
        (event: TouchEvent) => {
            if (!containerBox.current) return;
            const touches = event.touches;

            const clientX = touches.item(0)?.clientX;

            const x = Math.ceil(
                clamp(clientX - containerBox.current.left, 0, containerBox.current.width) /
                    containerBox.current.width /
                    0.2
            );

            if (Number.isNaN(x)) return;

            setCurrRating(x);
        },
        [setCurrRating]
    );

    const handleMouseDown = useCallback(
        (event: ReactMouseEvent) => {
            handleResize();

            isRating.current = true;
            calculateNewMouseRating(event);
        },
        [calculateNewMouseRating]
    );

    const handleTouchStart = useCallback(
        (event: TouchEvent) => {
            handleResize();

            isRating.current = true;
            calculateNewTouchRating(event);
        },
        [calculateNewTouchRating]
    );

    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (isRating.current) calculateNewMouseRating(event);

            return true;
        },
        [calculateNewMouseRating]
    );

    const handleTouchMove = useCallback(
        (event: TouchEvent) => {
            if (isRating.current) calculateNewTouchRating(event);

            return true;
        },
        [calculateNewTouchRating]
    );

    const handleMouseUp = useCallback(() => {
        if (!isRating.current || Number.isNaN(currRating)) return;

        isRating.current = false;
        setRating({ bookId, rating: currRating });
    }, [currRating, setRating, bookId]);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.addEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const stars = [];
    for (let i = 0; i < 5; i++)
        stars.push(
            <RiStarFill
                key={i}
                className={`${s.star} ${i < currRating ? s.active : ""}`}
                style={{ height: `${HEIGHT}px`, width: `${HEIGHT}px` }}
            />
        );

    return (
        <div
            className={s.rating}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            ref={containerRef}
        >
            {stars}
        </div>
    );
};

export default Rating;
