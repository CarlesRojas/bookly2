import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "@utils/trpc";
import Navigation from "@components/Navigation";

const Home: NextPage = () => {
    const { data, isLoading } = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <>
            <Head>
                <title>Bookly | Home</title>
                <meta name="description" content="View the books you are currently readning and want to read" />
            </Head>

            {JSON.stringify(data)}

            <Navigation />
        </>
    );
};

export default Home;
