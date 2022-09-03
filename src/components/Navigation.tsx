import { RoutePaths } from "@constants/routes";
import { QUERY_COOKIE_NAME } from "@pages/search";
import s from "@styles/components/Navigation.module.scss";
import { useRouter } from "next/router";
import { CSSProperties, useRef, useState } from "react";
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
    icon: JSX.Element;
    selectedIcon: JSX.Element;
}

const Navigation = () => {
    const router = useRouter();

    const navigationItems = useRef<NavigationItem[]>([
        {
            label: "home",
            route: RoutePaths.HOME,
            icon: <RiBook2Line />,
            selectedIcon: <RiBook2Fill />,
        },
        {
            label: "finished",
            route: RoutePaths.FINISHED,
            icon: <RiCheckboxCircleLine />,
            selectedIcon: <RiCheckboxCircleFill />,
        },
        {
            label: "search",
            route: RoutePaths.SEARCH,
            icon: <RiSearchLine />,
            selectedIcon: <RiSearchFill />,
        },
        {
            label: "stats",
            route: RoutePaths.STATS,
            icon: <RiBarChart2Line />,
            selectedIcon: <RiBarChart2Fill />,
        },
        {
            label: "settings",
            route: RoutePaths.SETTINGS,
            icon: <RiSettingsLine />,
            selectedIcon: <RiSettingsFill />,
        },
    ]);

    const [currentPath, setCurrentPath] = useState(router.pathname);
    const changing = useRef(false);

    const onNavigationItemClick = (route: RoutePaths) => {
        if (changing.current) return;
        changing.current = true;
        setCurrentPath(route);

        window?.localStorage?.removeItem(QUERY_COOKIE_NAME);
        router.push(route);
    };

    return (
        <div className={s.navigation}>
            <div className={s.container} style={{ "--num-items": navigationItems.current.length } as CSSProperties}>
                {navigationItems.current.map(({ label, route, icon, selectedIcon }) => {
                    return (
                        <div
                            key={route}
                            className={`${s.item} ${route === currentPath ? s.current : ""}`}
                            onClick={() => onNavigationItemClick(route)}
                        >
                            {route === currentPath ? selectedIcon : icon}
                            <p>{label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;
