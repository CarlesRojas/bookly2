import s from "@styles/components/Loading.module.scss";
import { RiLoader4Fill } from "react-icons/ri";

const Loading = () => {
    return (
        <div className={s.loading}>
            <RiLoader4Fill />
        </div>
    );
};

export default Loading;
