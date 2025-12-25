"use client";

import * as React from "react";
import { MessageSquare, Plus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface QuickFillProps {
    pastedMessage: string;
    setPastedMessage: (message: string) => void;
    onParse: () => void;
    isParsing: boolean;
}

export function QuickFill({ pastedMessage, setPastedMessage, onParse, isParsing }: QuickFillProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [open, setOpen] = React.useState(false);

    const handleParse = () => {
        onParse();
        setOpen(false);
    };

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between border-dashed border-2 bg-muted/10 h-12"
                    >
                        <span className="flex items-center gap-2 text-muted-foreground font-medium">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Quick Fill from Message
                        </span>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Auto-Fill Job Details
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pt-0 space-y-4">
                        <Textarea
                            placeholder="Paste job details here (e.g. from WhatsApp/Email)..."
                            value={pastedMessage}
                            onChange={(e) => setPastedMessage(e.target.value)}
                            rows={8}
                            className="resize-none text-base min-h-[120px] max-h-[300px] overflow-y-auto"
                            autoFocus
                            suppressHydrationWarning
                        />
                        <Button
                            className="w-full"
                            onClick={handleParse}
                            disabled={isParsing || !pastedMessage}
                        >
                            {isParsing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Process & Fill Form
                        </Button>
                        <DrawerFooter className="pt-2 px-0">
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Card className="border-dashed border-2 shadow-none bg-muted/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" /> Quick Fill
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Textarea
                    placeholder="Paste job details here (e.g. from WhatsApp/Email)..."
                    value={pastedMessage}
                    onChange={(e) => setPastedMessage(e.target.value)}
                    rows={2}
                    className="resize-none text-sm min-h-[80px]"
                    suppressHydrationWarning
                />
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={onParse}
                    disabled={isParsing || !pastedMessage}
                    className="w-full sm:w-auto"
                >
                    {isParsing ? <Loader2 className="animate-spin mr-2 h-3 w-3" /> : <Sparkles className="mr-2 h-3 w-3" />}
                    Auto-Fill Form
                </Button>
            </CardContent>
        </Card>
    );
}
