"use client";

import { useEffect } from "react";

export function ConsoleEasterEgg() {
    useEffect(() => {
        // Easter egg console message
        const shadow = "color: #666; font-weight: normal;";
        const main = "color: #3b82f6; font-weight: bold;";

        console.log(
            "%c████████╗ ██╗ ███╗   ███╗ ███████╗\n" +
            "%c╚══██╔══╝ ██║ ████╗ ████║ ██╔════╝\n" +
            "%c   ██║    ██║ ██╔████╔██║ █████╗  \n" +
            "%c   ██║    ██║ ██║╚██╔╝██║ ██╔══╝  \n" +
            "%c   ██║    ██║ ██║ ╚═╝ ██║ ███████╗\n" +
            "%c   ╚═╝    ╚═╝ ╚═╝     ╚═╝ ╚══════╝\n\n" +
            "%c███████╗ ██████╗ ██████╗ ██████╗ ███████╗\n" +
            "%c██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝\n" +
            "%c███████╗██║     ██║   ██║██████╔╝█████╗  \n" +
            "%c╚════██║██║     ██║   ██║██╔═══╝ ██╔══╝  \n" +
            "%c███████║╚██████╗╚██████╔╝██║     ███████╗\n" +
            "%c╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚══════╝",
            shadow, main, main, main, main, shadow,
            shadow, main, main, main, main, shadow
        );
    }, []);

    return null;
}
