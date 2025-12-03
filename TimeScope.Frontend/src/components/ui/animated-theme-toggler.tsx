"use client"

import { useCallback, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps
    extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number
}

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    ...props
}: AnimatedThemeTogglerProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { setTheme, resolvedTheme } = useTheme() as any
    const buttonRef = useRef<HTMLButtonElement>(null)

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return

        const isDark = resolvedTheme === "dark"
        const newTheme = isDark ? "light" : "dark"

        // Fallback for browsers that don't support startViewTransition
        if (!document.startViewTransition) {
            setTheme(newTheme)
            return
        }

        await document.startViewTransition(() => {
            flushSync(() => {
                setTheme(newTheme)
            })
        }).ready

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const maxRadius = Math.hypot(
            Math.max(left, window.innerWidth - left),
            Math.max(top, window.innerHeight - top)
        )

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        )
    }, [resolvedTheme, setTheme, duration])

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            className={cn(className)}
            {...props}
        >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
