import { RoutePaths } from "@constants/routes";
import { useRouter } from "next/router";
import s from "@styles/components/Navigation.module.scss";

import { CSSProperties, useRef } from "react";
import Image from "next/image";

interface NavigationItem {
    label: string;
    icon: string;
    route: RoutePaths;
    current: boolean;
}

const Navigation = () => {
    const router = useRouter();

    const navigationItems = useRef<NavigationItem[]>([
        {
            label: "current",
            icon: "/icons/book.svg",
            route: RoutePaths.HOME,
            current: RoutePaths.HOME === router.pathname,
        },
        {
            label: "finished",
            icon: "/icons/book.svg",
            route: RoutePaths.FINISHED,
            current: RoutePaths.FINISHED === router.pathname,
        },
        {
            label: "search",
            icon: "/icons/search.svg",
            route: RoutePaths.SEARCH,
            current: RoutePaths.SEARCH === router.pathname,
        },
        {
            label: "stats",
            icon: "/icons/stats.svg",
            route: RoutePaths.STATS,
            current: RoutePaths.STATS === router.pathname,
        },
        {
            label: "settings",
            icon: "/icons/settings.svg",
            route: RoutePaths.SETTINGS,
            current: RoutePaths.SETTINGS === router.pathname,
        },
    ]);

    const onNavigationItemClick = (route: RoutePaths) => {
        router.push(route);
    };

    return (
        <div className={s.navigation}>
            <div className={s.container} style={{ "--num-items": navigationItems.current.length } as CSSProperties}>
                {navigationItems.current.map(({ label, icon, route, current }) => {
                    return (
                        <div
                            key={route}
                            className={`${s.item} ${current ? s.current : ""}`}
                            onClick={() => onNavigationItemClick(route)}
                        >
                            <div className={s.icon}>
                                <Image src={icon} alt={label} layout="fill" />
                            </div>

                            <p>{label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;
