import useClickOutsideRef from "@hooks/useClickOutsideRef";
import useMutationLoading from "@hooks/useMutationLoading";
import { Read } from "@prisma/client";
import s from "@styles/components/Read.module.scss";
import { trpc } from "@utils/trpc";
import { useCallback, useRef, useState } from "react";
import { RiArrowLeftSFill, RiArrowRightSFill, RiCloseLine } from "react-icons/ri";
import Loading from "./Loading";

export interface ReadProps {
    read: Read;
    first: boolean;
}

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Read = (props: ReadProps) => {
    const { read, first } = props;
    const trpcContext = trpc.useContext();

    const onMutationSuccess = () => trpcContext.invalidateQueries(["book-get"]);
    const { mutate: deleteReread, isLoading: deleteIsLoading } = trpc.useMutation(["book-delete-reread"], {
        onSuccess: onMutationSuccess,
    });
    const { mutate: updateReread, isLoading: updateIsLoading } = trpc.useMutation(["book-update-reread"], {
        onSuccess: onMutationSuccess,
    });

    useMutationLoading(deleteIsLoading);
    useMutationLoading(updateIsLoading);

    const today = new Date();
    const currYear = today.getFullYear();

    const [month, setMonth] = useState(read.month);
    const [year, setYear] = useState(read.year);

    const [expanded, setExpanded] = useState(false);

    const handleExpandButton = () => {
        setExpanded((prev) => !prev);
    };

    const handleSaveButtonClicked = useCallback(() => {
        if (!expanded) return;

        setExpanded(false);

        updateReread({ readId: read.id, month, year });
    }, [expanded, month, read.id, updateReread, year]);

    const onDeleteReread = () => {
        deleteReread({ readId: read.id });
    };

    const handleClickOutside = useCallback(() => {
        setExpanded(false);
    }, []);

    const statusRef = useRef<HTMLDivElement>(null);
    useClickOutsideRef(statusRef, handleClickOutside);

    if (deleteIsLoading) return null;

    return (
        <div className={`${s.read} ${expanded ? s.expanded : ""}`} ref={statusRef}>
            <div className={s.main}>
                <div className={s.mainContainer} onClick={handleExpandButton}>
                    {updateIsLoading && <Loading small />}

                    {!updateIsLoading && (
                        <>
                            <p className={s.label}>{first ? "finished on" : "read again on"}</p>

                            <p className={s.date}>{`${read.month >= 0 && read.month <= 11 ? MONTHS[read.month] : ""} ${
                                read.year
                            }`}</p>
                        </>
                    )}
                </div>

                {!first && <RiCloseLine className={s.removeIcon} onClick={onDeleteReread} />}
            </div>

            <div className={`${s.selector} ${expanded ? s.visible : ""}`}>
                <div className={s.yearSelector}>
                    <RiArrowLeftSFill
                        className={`${s.icon} ${year <= 1 ? s.disabled : ""}`}
                        onClick={() => setYear((prev) => --prev)}
                    />

                    <p className={s.year}>{year}</p>

                    <RiArrowRightSFill
                        className={`${s.icon} ${year >= currYear ? s.disabled : ""}`}
                        onClick={() => setYear((prev) => ++prev)}
                    />
                </div>

                <div className={s.monthSelector}>
                    {MONTH_NAMES_SHORT.map((monthName, i) => (
                        <div
                            className={`${s.month} ${month === i ? s.selected : ""}`}
                            onClick={() => setMonth(i)}
                            key={monthName}
                        >
                            {monthName}
                        </div>
                    ))}
                </div>

                <div className={s.saveButton} onClick={handleSaveButtonClicked}>
                    save
                </div>
            </div>
        </div>
    );
};

export default Read;
