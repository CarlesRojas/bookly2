import type { NextPage } from "next";
import Head from "next/head";
import Navigation from "@components/Navigation";

const Search: NextPage = () => {
    return (
        <>
            <Head>
                <title>Bookly | Search</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <Navigation />
        </>
    );
};

export default Search;
