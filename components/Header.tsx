"use client";

import { Search, Bell, Plus, Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/UserMenu";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 lg:px-6 shrink-0">
            <div className="flex items-center">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden mr-2" suppressHydrationWarning>
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-4 pt-10" aria-describedby={undefined} id="mobile-sidebar">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>

                <Link href="/" className="font-bold text-lg flex items-center">
                    <Image src="/rydeon-logo.svg" alt="RydeOn" width={120} height={40} className="mr-2 hidden sm:block" />
                </Link>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
                {pathname !== "/" ? (
                    <>
                        <Button asChild className="hidden sm:flex">
                            <Link href="/add-job">
                                <Plus className="mr-2 h-4 w-4" /> Add Job
                            </Link>
                        </Button>
                        <Button asChild size="icon" className="sm:hidden rounded-full">
                            <Link href="/add-job">
                                <Plus className="h-4 w-4" />
                            </Link>
                        </Button>

                        <div className="relative hidden md:block w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-8 bg-muted border-none" />
                        </div>
                    </>
                ) : null}

                <ModeToggle />

                {pathname !== "/" ? (
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                            5
                        </span>
                    </Button>
                ) : null}

                {session?.user ? (
                    <UserMenu user={session.user} />
                ) : (
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
