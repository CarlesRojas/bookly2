import AuthorPhoto from "@components/AuthorPhoto";
import { Author } from "@prisma/client";
import s from "@styles/components/AuthorsSection.module.scss";

interface AuthorsSectionProps {
    title: string | number | null;
    authors: Author[];
    emptyMessage: string;
    first?: boolean;
}

const AuthorsSection = (props: AuthorsSectionProps) => {
    const { title, authors, first, emptyMessage } = props;

    return (
        <div className={s.section}>
            {title !== null && <p className={`${s.sectionTitle} ${first ? s.first : ""}`}>{title}</p>}

            <div className={s.authors}>
                {authors.length <= 0 && <p className={s.emptyMessage}>{emptyMessage}</p>}
                {authors.map((author) => (
                    <AuthorPhoto key={author.goodReadsId} author={author} interactive showName />
                ))}
            </div>
        </div>
    );
};

export default AuthorsSection;
