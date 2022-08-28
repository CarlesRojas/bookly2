import { RoutePaths } from "@constants/routes";
import { useRouter } from "next/router";
import SVG from "react-inlinesvg";
import s from "@styles/components/Navigation.module.scss";

import HomeIcon from "@icons/book.svg";
import SearchIcon from "@icons/search.svg";
import StatsIcon from "@icons/stats.svg";
import SettingsIcon from "@icons/settings.svg";
import { CSSProperties, useRef } from "react";

interface NavigationItem {
    label: string;
    icon: any;
    route: RoutePaths;
    current: boolean;
}

const Navigation = () => {
    const router = useRouter();

    const navigationItems = useRef<NavigationItem[]>([
        {
            label: "current",
            icon: HomeIcon,
            route: RoutePaths.HOME,
            current: RoutePaths.HOME === router.pathname,
        },
        {
            label: "finished",
            icon: HomeIcon,
            route: RoutePaths.FINISHED,
            current: RoutePaths.FINISHED === router.pathname,
        },
        {
            label: "search",
            icon: SearchIcon,
            route: RoutePaths.SEARCH,
            current: RoutePaths.SEARCH === router.pathname,
        },
        {
            label: "stats",
            icon: StatsIcon,
            route: RoutePaths.STATS,
            current: RoutePaths.STATS === router.pathname,
        },
        {
            label: "settings",
            icon: SettingsIcon,
            route: RoutePaths.SETTINGS,
            current: RoutePaths.SETTINGS === router.pathname,
        },
    ]);

    const onNavigationItemClick = (route: RoutePaths) => {
        router.push(route);
    };

    return (
        <div className={s.navigation} style={{ "--num-items": navigationItems.current.length } as CSSProperties}>
            {navigationItems.current.map(({ label, icon, route, current }) => {
                return (
                    <div
                        key={route}
                        className={`${s.item} ${current ? s.current : ""}`}
                        onClick={() => onNavigationItemClick(route)}
                    >
                        <SVG src={icon} />
                        <p>{label}</p>
                    </div>
                );
            })}
        </div>
    );
};
export default Navigation;
