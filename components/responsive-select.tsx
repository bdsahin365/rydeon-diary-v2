"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerTitle,
} from "@/components/ui/drawer"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
    value: string;
    label: string;
}

interface ResponsiveSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    label?: string; // Optional label for the Drawer header
}

export function ResponsiveSelect({
    value,
    onValueChange,
    options,
    placeholder = "Select...",
    label
}: ResponsiveSelectProps) {
    const [open, setOpen] = React.useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between font-normal bg-background min-h-[48px]"
                        aria-label={label || "Select option"}
                        aria-expanded={open}
                    >
                        <span className="truncate text-left">
                            {value ? options.find(opt => opt.value === value)?.label : <span className="text-muted-foreground">{placeholder}</span>}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="transition-transform duration-300 ease-in-out max-h-[90vh] flex flex-col fixed bottom-0 left-0 right-0">
                    <div className="p-4 pb-8 space-y-4 flex flex-col flex-1 overflow-y-auto">
                        <DrawerTitle className={cn("text-lg font-semibold text-center flex-none", !label && "sr-only")}>
                            {label || "Select Option"}
                        </DrawerTitle>
                        <div className="flex flex-col space-y-2 flex-1 overflow-y-auto" role="radiogroup" aria-label={label || "Options"}>
                            {options.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={value === option.value ? "default" : "ghost"}
                                    className={cn(
                                        "w-full justify-between h-12 min-h-[48px] text-base font-normal transition-all flex-shrink-0",
                                        value === option.value && "font-medium shadow-sm"
                                    )}
                                    onClick={() => {
                                        onValueChange(option.value)
                                        setOpen(false)
                                    }}
                                    role="radio"
                                    aria-checked={value === option.value}
                                    aria-label={option.label}
                                >
                                    {option.label}
                                    {value === option.value && <Check className="h-5 w-5" />}
                                </Button>
                            ))}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
