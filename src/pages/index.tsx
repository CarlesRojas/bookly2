import Bookshelf from "@components/Bookshelf";
import Loading from "@components/Loading";
import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/Home.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

const Home: NextPage = () => {
    const { data: readingData, isLoading: readingIsLoading } = trpc.useQuery(["user-get-reading"]);
    const { data: wantToReadData, isLoading: wantToReadIsLoading } = trpc.useQuery(["user-get-want-to-read"]);

    const isWaiting = readingIsLoading || wantToReadIsLoading;

    return (
        <>
            <Head>
                <title>Bookly - Home</title>
                <meta name="description" content="View the books you are currently readning and want to read" />
            </Head>

            {isWaiting && <Loading />}

            {!isWaiting && (
                <div className={s.home}>
                    <div className={s.gridContainer}>
                        {readingData && <Bookshelf shelfName="reading" books={readingData} />}
                    </div>

                    <div className={s.gridContainer}>
                        {wantToReadData && <Bookshelf shelfName="want to read" books={wantToReadData} />}
                    </div>
                </div>
            )}

            <Navigation />
        </>
    );
};

export default Home;
