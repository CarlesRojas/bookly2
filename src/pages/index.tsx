import Bookshelf from "@components/Bookshelf";
import Loading from "@components/Loading";
import Navigation from "@components/Navigation";
import useResize from "@hooks/useResize";
import { NextPageWithAuth } from "@pages/_app";
import s from "@styles/pages/Home.module.scss";
import { trpc } from "@utils/trpc";
import Head from "next/head";
import { useRef, useState } from "react";

const Home: NextPageWithAuth = () => {
    const { data: readingData, isLoading: readingIsLoading } = trpc.useQuery(["user-get-reading"]);
    const { data: wantToReadData, isLoading: wantToReadIsLoading } = trpc.useQuery(["user-get-want-to-read"]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [rowHeight, setRowHeight] = useState(0);
    useResize(() => {
        if (!containerRef.current) return;

        const containerBox = containerRef.current.getBoundingClientRect();
        setRowHeight(containerBox.height / 2);
    }, true);

    const isWaiting = readingIsLoading || wantToReadIsLoading;

    return (
        <>
            <Head>
                <title>Bookly - Home</title>
                <meta name="description" content="View the books you are currently readning and want to read" />
            </Head>

            <div className={s.home} ref={containerRef}>
                {isWaiting && <Loading />}

                {!isWaiting && (
                    <>
                        <div className={s.gridContainer}>
                            {readingData && (
                                <Bookshelf
                                    shelfName="reading"
                                    books={readingData}
                                    emptyMessage="not reading anything yet"
                                    rowHeight={rowHeight}
                                />
                            )}
                        </div>

                        <div className={s.gridContainer}>
                            {wantToReadData && (
                                <Bookshelf
                                    shelfName="want to read"
                                    books={wantToReadData}
                                    emptyMessage="nothing on your pending list"
                                    rowHeight={rowHeight}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>

            <Navigation />
        </>
    );
};

Home.auth = true;
export default Home;
