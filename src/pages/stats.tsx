import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/Stats.module.scss";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

const Stats: NextPage = () => {
    return (
        <>
            <Head>
                <title>Bookly - Stats</title>
                <meta name="description" content="View stats about the books you've read" />
            </Head>

            <div className={s.stats}></div>

            <Navigation />
        </>
    );
};

export default Stats;
