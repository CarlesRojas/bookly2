import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

const New: NextPage = () => {
    return (
        <>
            <Head>
                <title>Bookly - New</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <Navigation />
        </>
    );
};

export default New;
