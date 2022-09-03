import Navigation from "@components/Navigation";
import { NextPageWithAuth } from "@pages/_app";
import Head from "next/head";

const Finished: NextPageWithAuth = () => {
    return (
        <>
            <Head>
                <title>Bookly - Finished</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <Navigation />
        </>
    );
};

Finished.auth = true;
export default Finished;
