"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label?: string;
    id?: string;
}

export function Switch({ checked, onCheckedChange, label, id }: SwitchProps) {
    return (
        <div className="flex items-center justify-between py-3">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer select-none flex-1">
                    {label}
                </label>
            )}
            <button
                type="button"
                id={id}
                role="switch"
                aria-checked={checked}
                onClick={() => onCheckedChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    checked ? "bg-brand" : "bg-gray-200"
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}
