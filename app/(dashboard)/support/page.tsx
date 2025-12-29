"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, Bug, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const formSchema = z.object({
    subject: z.string().min(2, {
        message: "Subject must be at least 2 characters.",
    }),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }),
});

export default function SupportPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: "",
            message: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast.success("Message sent! We'll get back to you shortly.");
        form.reset();
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Support Center"
                subtitle="Find help, report issues, or contact our support team."
            />

            {/* Quick Actions Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contact Support</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Email Us</div>
                        <p className="text-xs text-muted-foreground">Get help via email within 24h</p>
                    </CardContent>
                </Card>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Chat Now</div>
                        <p className="text-xs text-muted-foreground">Available Mon-Fri, 9am-5pm</p>
                    </CardContent>
                </Card>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Report Bug</CardTitle>
                        <Bug className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Bug Report</div>
                        <p className="text-xs text-muted-foreground">Found an issue? Let us know.</p>
                    </CardContent>
                </Card>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Docs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Guides</div>
                        <p className="text-xs text-muted-foreground">Read our documentation</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* FAQ Section */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <CardDescription>
                            Quick answers to common questions about Rydeon Diary.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How do I add a new job?</AccordionTrigger>
                                <AccordionContent>
                                    Go to the 'Find Jobs' or 'My Jobs' page and click on the 'Add Job' button. Fill in the details including pickup, dropoff, and price.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>How is my net profit calculated?</AccordionTrigger>
                                <AccordionContent>
                                    Net profit is calculated by taking the job price and subtracting any operator fees or other costs associated with the job.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Can I export my job history?</AccordionTrigger>
                                <AccordionContent>
                                    Yes! Navigate to the 'My Jobs' page and look for the 'Export' button. You can download a report of your jobs for any date range.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>How do I change my vehicle details?</AccordionTrigger>
                                <AccordionContent>
                                    Go to Settings {'>'} Vehicle to update your vehicle information. This helps in tracking expenses accurately per vehicle.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5">
                                <AccordionTrigger>The app isn't loading correctly, what should I do?</AccordionTrigger>
                                <AccordionContent>
                                    Try refreshing the page. If the issue persists, clear your browser cache or contact support using the button above.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Contact Form Section */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Send us a Message</CardTitle>
                        <CardDescription>
                            We'll get back to you as soon as possible.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl>
                                                <Input placeholder="I need help with..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your issue in detail..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    Send Message
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 rounded-lg bg-muted p-4">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold">Need immediate help?</h4>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Check out our{" "}
                                <Link href="#" className="underline text-primary">
                                    Video Tutorials
                                </Link>{" "}
                                for step-by-step guides on using all features.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
