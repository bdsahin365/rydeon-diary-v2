"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query" // We might need to create this hook if it doesn't exist, checking next.
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface ResponsiveSheetProps {
    children: React.ReactNode
    trigger: React.ReactNode
    title: string
    description?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ResponsiveSheet({
    children,
    trigger,
    title,
    description,
    open,
    onOpenChange
}: ResponsiveSheetProps) {
    const [isDesktop, setIsDesktop] = React.useState(false)

    React.useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.matchMedia("(min-width: 768px)").matches)
        checkDesktop()
        window.addEventListener('resize', checkDesktop)
        return () => window.removeEventListener('resize', checkDesktop)
    }, [])

    if (isDesktop) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetTrigger asChild>
                    {trigger}
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{title}</SheetTitle>
                        {description && <SheetDescription>{description}</SheetDescription>}
                    </SheetHeader>
                    <div className="px-4 pb-6">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                {trigger}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && <DrawerDescription>{description}</DrawerDescription>}
                </DrawerHeader>
                <div className="px-4 pb-4 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
