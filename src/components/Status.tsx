import useClickOutsideRef from "@hooks/useClickOutsideRef";
import { BookStatus } from "@prisma/client";
import s from "@styles/components/Status.module.scss";
import { trpc } from "@utils/trpc";
import { useCallback, useEffect, useRef, useState } from "react";
import Loading from "./Loading";

export interface StatusProps {
    bookId: number;
}

enum Action {
    FINISHED = "finished",
    WANT_TO_READ = "want to read",
    READING = "reading",
    ADD_TO_LIBRARY = "add to library",
    REMOVE = "remove from library",
    LOADING = "loading",
}

const OPTIONS_FOR_ACTION: { [key in Action]: Action[] } = {
    [Action.FINISHED]: [Action.WANT_TO_READ, Action.READING, Action.REMOVE],
    [Action.WANT_TO_READ]: [Action.FINISHED, Action.READING, Action.REMOVE],
    [Action.READING]: [Action.FINISHED, Action.WANT_TO_READ, Action.REMOVE],
    [Action.ADD_TO_LIBRARY]: [Action.WANT_TO_READ, Action.READING, Action.FINISHED],
    [Action.REMOVE]: [],
    [Action.LOADING]: [Action.LOADING],
};

const getCurrentAction = (data: { status: BookStatus } | null | undefined): Action => {
    if (!data) return Action.ADD_TO_LIBRARY;
    const { status } = data;

    if (status === BookStatus.FINISHED) return Action.FINISHED;
    if (status === BookStatus.WANT_TO_READ) return Action.WANT_TO_READ;
    if (status === BookStatus.READING) return Action.READING;

    return Action.ADD_TO_LIBRARY;
};

const Status = (props: StatusProps) => {
    const { bookId } = props;
    const trpcContext = trpc.useContext();

    const { data, isLoading } = trpc.useQuery(["book-get-status", { bookId }]);
    const [currentAction, setCurrentAction] = useState(Action.LOADING);

    useEffect(() => {
        if (!isLoading) setCurrentAction(getCurrentAction(data));
    }, [isLoading, data]);

    const onMutationSuccess = () => {
        trpcContext.invalidateQueries(["book-get-status"]);
        trpcContext.invalidateQueries(["book-get-rating"]);
        trpcContext.invalidateQueries(["book-get"]);
    };

    const { mutate: setFinished } = trpc.useMutation("book-set-finished", { onSuccess: onMutationSuccess });
    const { mutate: setReading } = trpc.useMutation("book-set-reading", { onSuccess: onMutationSuccess });
    const { mutate: setWantToRead } = trpc.useMutation("book-set-want-to-read", { onSuccess: onMutationSuccess });
    const { mutate: remove } = trpc.useMutation("book-remove", { onSuccess: onMutationSuccess });

    const [expanded, setExpanded] = useState(false);

    const handleCurrentActionClicked = () => {
        if (expanded) return;

        setExpanded(true);
    };

    const handleClickOutside = useCallback(() => {
        setExpanded(false);
    }, []);

    const handleActionClicked = (action: Action) => {
        if (!expanded) return;

        switch (action) {
            case Action.FINISHED:
                setFinished({ bookId });
                setCurrentAction(Action.FINISHED);
                break;
            case Action.WANT_TO_READ:
                setWantToRead({ bookId });
                setCurrentAction(Action.WANT_TO_READ);
                break;
            case Action.READING:
                setReading({ bookId });
                setCurrentAction(Action.READING);
                break;
            case Action.REMOVE:
                remove({ bookId });
                setCurrentAction(Action.ADD_TO_LIBRARY);
                break;
            default:
                break;
        }

        setExpanded(false);
    };

    const statusRef = useRef<HTMLDivElement | null>(null);
    useClickOutsideRef(statusRef, handleClickOutside);

    return (
        <div
            className={`${s.status} ${expanded ? s.expanded : ""}`}
            onClick={handleCurrentActionClicked}
            ref={statusRef}
        >
            {currentAction === Action.LOADING && (
                <div className={s.loadingContainer}>
                    <Loading small />
                </div>
            )}

            {currentAction !== Action.LOADING && (
                <p className={s.option} onClick={handleClickOutside}>
                    {currentAction}
                </p>
            )}

            {OPTIONS_FOR_ACTION[currentAction].map((action) => (
                <p
                    className={`${s.newOption} ${expanded ? s.visible : ""}`}
                    onClick={() => handleActionClicked(action)}
                    key={action}
                >
                    {action}
                </p>
            ))}
        </div>
    );
};

export default Status;
