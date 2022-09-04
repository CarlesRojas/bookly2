import BooksSection from "@components/BooksSection";
import Loading from "@components/Loading";
import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { Author, Book } from "@prisma/client";
import s from "@styles/pages/Home.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

export type BookWithAuthor = Book & { author: Author };

interface Section {
    title: string;
    books: BookWithAuthor[];
    emptyMessage: string;
    first?: boolean;
}

const Home: NextPage = () => {
    const { data: readingData, isLoading: readingIsLoading } = trpc.useQuery(["user-get-reading"]);
    const { data: wantToReadData, isLoading: wantToReadIsLoading } = trpc.useQuery(["user-get-want-to-read"]);

    const [booksBySection, setBooksBySection] = useState<Section[]>([]);
    const isWaiting = readingIsLoading || wantToReadIsLoading;

    useEffect(() => {
        const newSections: Section[] = [
            {
                title: "reading",
                books: readingData ?? [],
                emptyMessage: "you're not reading any books right now",
                first: true,
            },
            { title: "want to read", books: wantToReadData ?? [], emptyMessage: "you have no pending books to read" },
        ];

        setBooksBySection(newSections);
    }, [readingData, wantToReadData]);

    return (
        <>
            <Head>
                <title>Bookly - Home</title>
                <meta name="description" content="View the books you are currently readning and want to read" />
            </Head>

            <div className={s.home}>
                {isWaiting && <Loading />}

                {!isWaiting && (
                    <div className={s.content}>
                        {booksBySection.map((section, i) => (
                            <BooksSection key={i} {...section} />
                        ))}
                    </div>
                )}
            </div>

            <Navigation />
        </>
    );
};

export default Home;
