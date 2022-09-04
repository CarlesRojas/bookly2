import { RoutePaths } from "@constants/routes";
import { Author } from "@prisma/client";
import s from "@styles/components/AuthorPhoto.module.scss";
import { useRouter } from "next/router";

interface AuthorPhotoProps {
    author: Author;
    interactive?: boolean;
    showName?: boolean;
}

const AuthorPhoto = (props: AuthorPhotoProps) => {
    const router = useRouter();
    const { author, interactive, showName } = props;
    const { name, goodReadsId, photoSrc } = author;

    return (
        <div
            className={`${s.authorPhoto} ${interactive ? s.interactive : ""}`}
            onClick={() => router.push(`${RoutePaths.AUTHOR}/${goodReadsId}`)}
        >
            <div className={s.cover}>
                {photoSrc && <img src={photoSrc} alt={"photo of the author"} />}
                {!photoSrc && <img className={s.placeholder} src="/placeholderPhoto.png" alt={"photo of the author"} />}
            </div>

            {showName && (
                <div className={s.info}>
                    <p className={s.title}>{name || "unknown author"}</p>
                </div>
            )}
        </div>
    );
};

export default AuthorPhoto;
