"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ResponsiveDatePickerProps {
    date?: Date;
    setDate: (date?: Date) => void;
    placeholder?: string;
}

export function ResponsiveDatePicker({ date, setDate, placeholder = "Pick a date" }: ResponsiveDatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal bg-background",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="sr-only">
                        <DrawerTitle>Select Date</DrawerTitle>
                    </div>
                    <div className="p-4 pb-8 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                                setDate(newDate)
                                setOpen(false)
                            }}
                            initialFocus
                        />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                        setDate(newDate)
                        setOpen(false)
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
