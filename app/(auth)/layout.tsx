import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    {children}
                </div>
            </div>
            <div className="hidden bg-muted lg:block relative overflow-hidden bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-zinc-900 opacity-90" />
                <div className="relative z-20 flex h-full flex-col justify-between p-10 text-white">
                    <div className="flex items-center text-lg font-medium">
                        <Image src="/rydeon-logo-2.svg" alt="RydeOn" width={30} height={30} className="mr-2 invert brightness-0" />
                        RydeOn
                    </div>

                    <div className="mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;RydeOn has completely transformed how I track my rideshare earnings. I know exactly which hours are most profitable now.&rdquo;
                            </p>
                            <footer className="text-sm">Sofia Davis</footer>
                        </blockquote>
                    </div>
                </div>

                {/* Decorative background element if needed, or just the gradient */}
                <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
            </div>
        </div>
    );
}
