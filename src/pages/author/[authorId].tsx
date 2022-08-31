import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { appRouter } from "@server/router";
import { createContextInner } from "@server/router/context";
import s from "@styles/pages/Author.module.scss";
import { createSSGHelpers } from "@trpc/react/ssg";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import superjson from "superjson";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };

    const ssg = createSSGHelpers({
        router: appRouter,
        ctx: await createContextInner({ session }),
        transformer: superjson,
    });

    const { query } = context;
    const { authorId } = query;
    const id = parseInt(authorId as string);
    await ssg.prefetchQuery("author-get", { authorId: id });

    return { props: { authorId: id, trpcState: ssg.dehydrate() } };
};

const Author = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { authorId } = props;
    const { data, isLoading, error } = trpc.useQuery(["author-get", { authorId }]);

    console.log(data, isLoading, error);

    return (
        <>
            <Head>
                <title>Bookly - Author</title>
                <meta name="description" content="View all the books you've read" />
            </Head>

            <div className={s.book}></div>

            <Navigation />
        </>
    );
};

export default Author;
