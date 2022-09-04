import Navigation from "@components/Navigation";
import { RoutePaths } from "@constants/routes";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import s from "@styles/pages/Settings.module.scss";
import { trpc } from "@utils/trpc";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { MouseEvent, useRef, useState } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (!session) return { redirect: { destination: RoutePaths.LOGIN, permanent: false } };
    return { props: {} };
};

const Settings: NextPage = () => {
    const session = useSession();

    const { mutate: deleteAccount, isLoading: deletingAccount } = trpc.useMutation("user-delete-account", {
        onSuccess: () => signOut(),
    });

    const [logoutBackgroundWidth, setLogoutBackgroundWidth] = useState(0);
    const [deleteBackgroundWidth, setDeleteBackgroundWidth] = useState(0);

    const logoutInterval = useRef<NodeJS.Timeout>();
    const deleteInterval = useRef<NodeJS.Timeout>();

    const logoutComplete = useRef(false);
    const deleteComplete = useRef(false);

    const [loggingOut, setLoggingOut] = useState(false);

    const onLogoutDown = () => {
        if (logoutComplete.current) return;
        clearInterval(logoutInterval.current);

        logoutInterval.current = setInterval(() => {
            setLogoutBackgroundWidth((prev) => {
                if (prev >= 100) {
                    clearInterval(logoutInterval.current);
                    logoutComplete.current = true;
                    setLoggingOut(true);
                    signOut();
                    return 100;
                }

                return prev + 1;
            });
        }, 10);
    };

    const onLogoutUp = () => {
        if (logoutComplete.current) return;
        clearInterval(logoutInterval.current);

        logoutInterval.current = setInterval(() => {
            setLogoutBackgroundWidth((prev) => {
                if (prev <= 0) {
                    clearInterval(logoutInterval.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 5);
    };

    const onDeleteDown = () => {
        if (deleteComplete.current) return;
        clearInterval(deleteInterval.current);

        deleteInterval.current = setInterval(() => {
            setDeleteBackgroundWidth((prev) => {
                if (prev >= 100) {
                    clearInterval(deleteInterval.current);
                    deleteComplete.current = true;
                    deleteAccount();
                    return 100;
                }

                return prev + 1;
            });
        }, 10);
    };

    const onDeleteUp = () => {
        if (deleteComplete.current) return;
        clearInterval(deleteInterval.current);

        deleteInterval.current = setInterval(() => {
            setDeleteBackgroundWidth((prev) => {
                if (prev <= 0) {
                    clearInterval(deleteInterval.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 5);
    };

    const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
    };

    const [userImageError, setUserImageError] = useState(false);

    let user = null;
    if (session.status === "authenticated" && session.data.user) {
        const { name, image, email } = session.data.user;

        user = (
            <div className={s.user}>
                {image && !userImageError && (
                    <div className={s.profilePicture}>
                        <img src={image} alt="user picture" onError={() => setUserImageError(true)} />
                    </div>
                )}

                {(!image || userImageError) && name && (
                    <div className={s.profilePicture}>
                        <p>{name.charAt(0)?.toUpperCase() ?? ""}</p>
                    </div>
                )}

                {name && <p className={s.name}>{name}</p>}
                {email && <p className={s.email}>{email}</p>}
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Bookly - Settings</title>
                <meta name="description" content="Settings for Bookly" />
            </Head>

            <div className={`${s.settings} ${deletingAccount || loggingOut ? s.disable : ""}`}>
                {user}

                <div
                    className={s.button}
                    onMouseDown={onLogoutDown}
                    onMouseUp={onLogoutUp}
                    onTouchStart={onLogoutDown}
                    onTouchEnd={onLogoutUp}
                    onContextMenu={onContextMenu}
                >
                    <div className={s.background} style={{ width: `${logoutBackgroundWidth}%` }}></div>
                    <p>{loggingOut ? "logging out" : "log out"}</p>
                </div>

                <div
                    className={s.button}
                    onMouseDown={onDeleteDown}
                    onMouseUp={onDeleteUp}
                    onTouchStart={onDeleteDown}
                    onTouchEnd={onDeleteUp}
                    onContextMenu={onContextMenu}
                >
                    <div className={s.background} style={{ width: `${deleteBackgroundWidth}%` }}></div>
                    <p>{deletingAccount ? "deleting account" : "delete account"}</p>
                </div>

                <p className={s.subtitle}>by deleting your account, you will lose all your data</p>
                <p className={s.subtitle}>hold the button to confirm</p>
            </div>

            <Navigation />
        </>
    );
};

export default Settings;
