import useDidMount from "@hooks/useDidMount";
import { getBaseUrl, NextPageWithAuth } from "@pages/_app";
import s from "@styles/pages/auth/Login.module.scss";
import { BuiltInProviderType } from "next-auth/providers";
import { ClientSafeProvider, getProviders, LiteralUnion, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { RiGoogleFill } from "react-icons/ri";

type ClienProvider = Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>;

const Login: NextPageWithAuth = () => {
    const [providers, setProviders] = useState<ClienProvider>();

    useDidMount(async () => {
        const providers = await getProviders();
        if (providers) setProviders(providers);
    });

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
                    <div
                        className={s.button}
                        key={provider.name}
                        onClick={() => signIn(provider.id, { callbackUrl: getBaseUrl() })}
                    >
                        <RiGoogleFill />
                        <p>{`Sign in with ${provider.name}`}</p>
                    </div>
                ))}
        </div>
    );
};

Login.auth = false;
export default Login;
