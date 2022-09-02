import { RoutePaths } from "@constants/routes";
import { QUERY_COOKIE_NAME } from "@pages/search";
import s from "@styles/components/Navigation.module.scss";
import { useRouter } from "next/router";
import { CSSProperties, useRef } from "react";
import {
    RiBarChart2Fill,
    RiBarChart2Line,
    RiBook2Fill,
    RiBook2Line,
    RiCheckboxCircleFill,
    RiCheckboxCircleLine,
    RiSearchFill,
    RiSearchLine,
    RiSettingsFill,
    RiSettingsLine,
} from "react-icons/ri";

interface NavigationItem {
    label: string;
    route: RoutePaths;
    current: boolean;
    icon: JSX.Element;
    selectedIcon: JSX.Element;
}

const Navigation = () => {
    const router = useRouter();

    const navigationItems = useRef<NavigationItem[]>([
        {
            label: "home",
            route: RoutePaths.HOME,
            current: RoutePaths.HOME === router.pathname,
            icon: <RiBook2Line />,
            selectedIcon: <RiBook2Fill />,
        },
        {
            label: "finished",
            route: RoutePaths.FINISHED,
            current: RoutePaths.FINISHED === router.pathname,
            icon: <RiCheckboxCircleLine />,
            selectedIcon: <RiCheckboxCircleFill />,
        },
        {
            label: "search",
            route: RoutePaths.SEARCH,
            current: RoutePaths.SEARCH === router.pathname,
            icon: <RiSearchLine />,
            selectedIcon: <RiSearchFill />,
        },
        {
            label: "stats",
            route: RoutePaths.STATS,
            current: RoutePaths.STATS === router.pathname,
            icon: <RiBarChart2Line />,
            selectedIcon: <RiBarChart2Fill />,
        },
        {
            label: "settings",
            route: RoutePaths.SETTINGS,
            current: RoutePaths.SETTINGS === router.pathname,
            icon: <RiSettingsLine />,
            selectedIcon: <RiSettingsFill />,
        },
    ]);

    const onNavigationItemClick = (route: RoutePaths) => {
        window?.localStorage?.removeItem(QUERY_COOKIE_NAME);
        router.push(route);
    };

    return (
        <div className={s.navigation}>
            <div className={s.container} style={{ "--num-items": navigationItems.current.length } as CSSProperties}>
                {navigationItems.current.map(({ label, route, current, icon, selectedIcon }) => {
                    return (
                        <div
                            key={route}
                            className={`${s.item} ${current ? s.current : ""}`}
                            onClick={() => onNavigationItemClick(route)}
                        >
                            {current ? selectedIcon : icon}
                            <p>{label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;
