import Navigation from "@components/Navigation";
import { NextPageWithAuth } from "@pages/_app";
import { signOut } from "next-auth/react";
import Head from "next/head";

const Settings: NextPageWithAuth = () => {
    return (
        <>
            <Head>
                <title>Bookly - Settings</title>
                <meta name="description" content="Settings for Bookly" />
            </Head>

            <div onClick={() => signOut()}>Sign Out</div>

            <Navigation />
        </>
    );
};

Settings.auth = true;
export default Settings;
