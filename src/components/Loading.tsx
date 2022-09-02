import s from "@styles/components/Loading.module.scss";
import { RiLoader4Fill } from "react-icons/ri";

interface LoadingProps {
    small?: boolean;
}

const Loading = (props: LoadingProps) => {
    const { small } = props;

    return (
        <div className={s.loading}>
            <RiLoader4Fill className={small ? s.small : ""} />
        </div>
    );
};

export default Loading;
