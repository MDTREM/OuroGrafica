import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "outline" | "ghost" | "link" | "gold";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        // Base styles
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[800px] hover:before:w-[800px]"

        // Variant styles
        const variants = {
            default: "bg-[#15cb98] text-white border border-[#15cb98] before:bg-[#10a379]",
            outline: "border border-border bg-transparent text-foreground hover:text-foreground before:bg-gray-50",
            ghost: "text-foreground before:bg-gray-100",
            link: "text-[#15cb98] hover:text-[#10a379] underline underline-offset-4 before:hidden",
            gold: "bg-yellow-500 text-black font-semibold border border-yellow-500 before:bg-yellow-600"
        }

        // Size styles
        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-xl px-3 text-xs",
            lg: "h-10 rounded-xl px-8",
            icon: "h-9 w-9",
        }

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            >
                <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
                    {children}
                </span>
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button }
