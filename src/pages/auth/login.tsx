import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/auth/Login.module.scss";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { Provider } from "next-auth/providers";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { RiGoogleFill } from "react-icons/ri";

interface LoginProps {
    providers: Provider[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const providers = await getProviders();
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (session) return { redirect: { destination: RoutePaths.HOME, permanent: false } };
    return { props: { providers } };
};

const Login: NextPage<LoginProps> = (props) => {
    const { providers } = props;

    return (
        <div className={s.login}>
            <Head>
                <title>Bookly - Login</title>
                <meta name="description" content="View the books you are currently readning and want to read" />
            </Head>

            <div className={s.logo}>
                <Image src="/logo512.png" layout="fill" alt="bookly logo" priority />
            </div>
            <p className={s.name}>bookly</p>

            {providers &&
                Object.values(providers).map((provider) => (
                    <div className={s.button} key={provider.name} onClick={() => signIn(provider.id)}>
                        <RiGoogleFill />
                        <p>{`Sign in with ${provider.name}`}</p>
                    </div>
                ))}
        </div>
    );
};

export default Login;
