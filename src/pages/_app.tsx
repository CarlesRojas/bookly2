// src/pages/_app.tsx
import { EventsProvider } from "@context/events";
import { ThemeProvider } from "@context/theme";
import type { AppRouter } from "@server/router";
import "@styles/globals.scss";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
// import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { useEffect } from "react";
import superjson from "superjson";

const MyApp: AppType = ({ Component, pageProps: { session, ...pageProps } }) => {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => navigator.serviceWorker.register("/sw.mjs"));
        }
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
                <EventsProvider>
                    <ThemeProvider>
                        <Component {...pageProps} />
                    </ThemeProvider>
                </EventsProvider>
            </SessionProvider>
        </>
    );
};

const getBaseUrl = () => {
    if (typeof window !== "undefined") return ""; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
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
                // loggerLink({
                //     enabled: (opts) =>
                //         process.env.NODE_ENV === "development" ||
                //         (opts.direction === "down" && opts.result instanceof Error),
                // }),
                httpBatchLink({ url }),
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
            transformer: superjson,
        };
    },
    /**
     * @link https://trpc.io/docs/ssr
     */
    ssr: false,
})(MyApp);
