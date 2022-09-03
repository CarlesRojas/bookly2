import Navigation from "@components/Navigation";
import { NextPageWithAuth } from "@pages/_app";
import Head from "next/head";

const Stats: NextPageWithAuth = () => {
    return (
        <>
            <Head>
                <title>Bookly - Stats</title>
                <meta name="description" content="View stats about the books you've read" />
            </Head>

            <Navigation />
        </>
    );
};

Stats.auth = true;
export default Stats;
