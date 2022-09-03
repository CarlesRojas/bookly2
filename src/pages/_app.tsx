// src/pages/_app.tsx
import Loading from "@components/Loading";
import { EventsProvider } from "@context/events";
import { ThemeProvider } from "@context/theme";
import type { AppRouter } from "@server/router";
import "@styles/globals.scss";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import type { NextComponentType, NextPage } from "next";
import { SessionProvider, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import superjson from "superjson";

interface AuthProps {
    children: any;
}

const Auth = ({ children }: AuthProps) => {
    const { status } = useSession({ required: true });
    if (status === "loading") return <Loading />;
    return children;
};

type AuthPageProps = AppProps & {
    Component: NextComponentType & { auth?: boolean };
};

export type NextPageWithAuth = NextPage & { auth?: boolean };

const MyApp = ({ Component, pageProps: { session, ...pageProps } }: AuthPageProps) => {
    useEffect(() => {
        if ("serviceWorker" in navigator)
            window.addEventListener("load", () => navigator.serviceWorker.register("/sw.mjs"));
    });

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
                />
                <title>Bookly</title>
            </Head>

            <SessionProvider session={session}>
                {Component.auth ? (
                    <Auth>
                        <EventsProvider>
                            <ThemeProvider>
                                <Component {...pageProps} />
                            </ThemeProvider>
                        </EventsProvider>
                    </Auth>
                ) : (
                    <Component {...pageProps} />
                )}
            </SessionProvider>
        </>
    );
};

export const getBaseUrl = () => {
    // browser should use relative url
    if (typeof window !== "undefined") return "";

    // SSR should use vercel url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

    // dev SSR should use localhost
    return `http://localhost:${process.env.PORT ?? 3000}`;
};

export default withTRPC<AppRouter>({
    config() {
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         */
        const url = `${getBaseUrl()}/api/trpc`;

        return {
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                httpBatchLink({ url, maxBatchSize: 10 }),
            ],
            /**
             * @link https://react-query.tanstack.com/reference/QueryClient
             */
            queryClientConfig: {
                defaultOptions: {
                    queries: {
                        refetchOnMount: true,
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: false,
                        refetchOnError: false,
                    },
                },
            },
            url,
            headers: { "x-ssr": "1" },
            transformer: superjson,
        };
    },
    /**
     * @link https://trpc.io/docs/ssr
     */
    ssr: true,
})(MyApp);
