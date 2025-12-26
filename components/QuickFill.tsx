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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface QuickFillProps {
    pastedMessage: string;
    setPastedMessage: (message: string) => void;
    onParse: (message?: string, image?: string | null) => Promise<void>;
    isParsing: boolean;
}

export function QuickFill({ pastedMessage, setPastedMessage, onParse, isParsing }: QuickFillProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleParse = async () => {
        await onParse(pastedMessage, selectedImage);
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
                            Quick Fill from Message/Image
                        </span>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh] flex flex-col fixed bottom-0 left-0 right-0">
                    <DrawerHeader className="text-left flex-none">
                        <DrawerTitle className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Auto-Fill Job Details
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 pt-0 flex-1 overflow-y-auto">
                        <Tabs defaultValue="text" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="text">Message Text</TabsTrigger>
                                <TabsTrigger value="image">Screenshot</TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="data-[state=active]:flex flex-col">
                                <Textarea
                                    placeholder="Paste job details here..."
                                    value={pastedMessage}
                                    onChange={(e) => setPastedMessage(e.target.value)}
                                    className="resize-none text-base min-h-[150px] overflow-y-auto"
                                    autoFocus
                                    suppressHydrationWarning
                                />
                            </TabsContent>

                            <TabsContent value="image" className="data-[state=active]:flex flex-col">
                                <div className="space-y-4">
                                    {!selectedImage ? (
                                        <div
                                            className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer h-[200px]"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="rounded-full bg-primary/10 p-4">
                                                <Sparkles className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium">Tap to upload</p>
                                                <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-md overflow-hidden border">
                                            <img src={selectedImage} alt="Preview" className="w-full object-contain bg-black/5 max-h-[40vh]" />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 shadow-sm"
                                                onClick={clearImage}
                                            >
                                                <Plus className="h-4 w-4 rotate-45" />
                                            </Button>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="p-4 pt-2 border-t mt-auto flex-none bg-background pb-8 md:pb-4">
                        <div className="space-y-3">
                            <Button
                                className="w-full h-11 text-base"
                                onClick={handleParse}
                                disabled={isParsing || (!pastedMessage && !selectedImage)}
                            >
                                {isParsing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                Process & Fill Form
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full h-11">Cancel</Button>
                            </DrawerClose>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Card className="border-none shadow-sm bg-muted/20">
            <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-base font-medium flex items-center justify-between gap-2 text-foreground/80">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Quick Fill</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="text">Message Text</TabsTrigger>
                        <TabsTrigger value="image">Screenshot</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-0">
                        <Textarea
                            placeholder="Paste job details here from text messages..."
                            value={pastedMessage}
                            onChange={(e) => setPastedMessage(e.target.value)}
                            rows={4}
                            className="resize-none min-h-[100px]"
                            suppressHydrationWarning
                        />
                    </TabsContent>

                    <TabsContent value="image" className="mt-0">
                        {!selectedImage ? (
                            <div
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-background hover:bg-muted/50 transition-colors cursor-pointer min-h-[100px]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Click to upload screenshot</p>
                                    <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-md overflow-hidden border bg-background group">
                                <img src={selectedImage} alt="Preview" className="w-full h-[150px] object-contain bg-black/5" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 shadow-sm"
                                        onClick={clearImage}
                                    >
                                        <Plus className="h-4 w-4 rotate-45" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                    </TabsContent>
                </Tabs>

                <div className="mt-4 flex justify-end">
                    <Button
                        size="default"
                        className="w-full"
                        onClick={() => onParse(pastedMessage, selectedImage)}
                        disabled={isParsing || (!pastedMessage && !selectedImage)}
                    >
                        {isParsing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Process & Fill Form
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
