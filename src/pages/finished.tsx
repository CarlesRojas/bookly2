import type { NextPage } from "next";
import Head from "next/head";
import Navigation from "@components/Navigation";

const Finished: NextPage = () => {
    return (
        <>
            <Head>
                <title>Bookly | Finished</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <Navigation />
        </>
    );
};

export default Finished;
