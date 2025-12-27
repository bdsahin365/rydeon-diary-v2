import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { FeatureCard } from "@/components/landing/feature-card"
import { TestimonialCard } from "@/components/landing/testimonial-card"
import { HeroAnimation } from "@/components/landing/hero-animation"
import { PricingSection } from "@/components/landing/pricing-section"
import { Calculator, MapPin, Plane, Users, BarChart, MessageSquare, CheckCircle, ArrowRight, Shield, Zap, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <Header />
            </div>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white pointer-events-none" />

                <div className="container px-4 mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 space-y-8">
                            <Badge variant="outline" className="px-4 py-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                                <span className="mr-2 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">NEW</span>
                                Trusted by 10,000+ drivers
                            </Badge>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                                Maximize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Earnings</span>
                            </h1>

                            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                                The all-in-one financial co-pilot for rideshare drivers. Calculate profits, manage airport pickups, and track every mile with precision.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/auth/signup">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto px-8 h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 rounded-full transition-all hover:scale-105"
                                    >
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/calculator">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto px-8 h-14 text-lg border-2 rounded-full hover:bg-gray-50 bg-white"
                                    >
                                        Try Calculator
                                    </Button>
                                </Link>
                            </div>

                            <div className="pt-8 grid grid-cols-2 gap-6 text-sm text-gray-600 font-medium">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    No credit card required
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Cancel anytime
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 relative">
                            <div className="relative z-10 animate-fade-in-up">
                                <HeroAnimation />
                            </div>
                            {/* Decorative blobs */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100 to-purple-100 opacity-50 blur-3xl rounded-full -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section (Optional, using placeholders) */}
            <section className="py-12 border-y border-gray-100 bg-gray-50/50">
                <div className="container px-4 mx-auto text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Powering drivers from</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder logos using text for now, could be replaced with SVG images */}
                        <span className="text-2xl font-bold font-sans text-gray-800">Uber</span>
                        <span className="text-2xl font-bold font-serif text-pink-600">Lyft</span>
                        <span className="text-2xl font-bold font-mono text-green-700">Bolt</span>
                        <span className="text-2xl font-bold font-sans text-blue-800">Ola</span>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-white relative">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">How RydeOn Works</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Three simple steps to optimize your earnings.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Calculator,
                                title: "Calculate Profits",
                                desc: "Input trip details and expenses to see your real earnings instantly.",
                                color: "text-blue-600",
                                bg: "bg-blue-50"
                            },
                            {
                                icon: Plane,
                                title: "Manage Pickups",
                                desc: "Track flights and schedule airport runs with precision.",
                                color: "text-purple-600",
                                bg: "bg-purple-50"
                            },
                            {
                                icon: BarChart,
                                title: "Track Progress",
                                desc: "Visualize your growth with beautiful, easy-to-read charts.",
                                color: "text-green-600",
                                bg: "bg-green-50"
                            }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className={`w-20 h-20 flex items-center justify-center rounded-3xl ${item.bg} ${item.color} mb-6 transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
                                    <item.icon className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{index + 1}. {item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-20">
                        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-1">Features</Badge>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900">Powerful Tools for Modern Drivers</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Everything you need to treat your driving like a business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Calculator className="h-8 w-8 text-current" />}
                            title="Profit Calculator"
                            description="Know your true profit after fuel and expenses. Stop guessing."
                            link="/calculator"
                        />

                        <FeatureCard
                            icon={<Plane className="h-8 w-8 text-current" />}
                            title="Airport Manager"
                            description="Real-time flight tracking and pickup scheduling tools."
                            link="/airport-pickup"
                        />

                        <FeatureCard
                            icon={<MapPin className="h-8 w-8 text-current" />}
                            title="Smart Routing"
                            description="Optimize your routes with integrated map data."
                            link="/calculator"
                        />

                        <FeatureCard
                            icon={<BarChart className="h-8 w-8 text-current" />}
                            title="Analytics Dashboard"
                            description="Visual insights into your daily, weekly, and monthly performance."
                            link="/trip-history"
                        />

                        <FeatureCard
                            icon={<MessageSquare className="h-8 w-8 text-current" />}
                            title="AI Assistant"
                            description="Generate professional messages for riders instantly."
                            link="/messages"
                        />

                        <FeatureCard
                            icon={<Users className="h-8 w-8 text-current" />}
                            title="Rider CRM"
                            description="Build relationships with your best customers."
                            link="/riders"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <PricingSection />

            {/* Testimonials Section */}
            <section className="py-24 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Loved by Drivers</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join the community of drivers who are earning smarter, not harder.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="RydeOn changed how I drive. I used to chase surges, now I chase profit. My take-home pay is up 30%."
                            author="Michael T."
                            role="Uber Black Driver"
                            rating={5}
                        />

                        <TestimonialCard
                            quote="The airport tools are incredible. I know exactly when to be there and have a message ready for my rider."
                            author="Sarah K."
                            role="Lyft & Uber Driver"
                            rating={5}
                        />

                        <TestimonialCard
                            quote="Finally, an app that treats me like a business owner. The analytics are exactly what I needed."
                            author="David M."
                            role="Private Fleet Owner"
                            rating={5}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container px-4 mx-auto">
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-blue-600 px-6 py-20 text-center sm:px-12 lg:px-20">
                        <div className="absolute inset-0 bg-blue-600 bg-[size:20px_20px] opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)' }}></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                                Ready to take control?
                            </h2>
                            <p className="mx-auto mt-6 max-w-lg text-xl text-blue-100">
                                Start your free 14-day trial today. No contracts, cancel anytime.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/auth/signup">
                                    <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-lg bg-white text-blue-600 hover:bg-gray-100 rounded-full font-bold">
                                        Get Started Now
                                    </Button>
                                </Link>
                                <Link href="/calculator">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full sm:w-auto px-8 h-14 text-lg bg-transparent text-white border-white hover:bg-white/10 rounded-full"
                                    >
                                        View Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 bg-white border-t border-gray-100">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2">
                            <Link href="/" className="mb-6 inline-block">
                                <Image src="/rydeon-logo.svg" alt="RydeOn" width={140} height={50} />
                            </Link>
                            <p className="text-gray-500 mb-6 max-w-sm">
                                empowering rideshare drivers with the tools they need to succeed in the gig economy.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <Globe className="h-5 w-5" />
                                </a>
                                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.683.566.15.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Product</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/calculator" className="text-gray-500 hover:text-blue-600">Calculator</Link></li>
                                <li><Link href="/airport-pickup" className="text-gray-500 hover:text-blue-600">Airport Manager</Link></li>
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Pricing</Link></li>
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Changelog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Company</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">About</Link></li>
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Careers</Link></li>
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Blog</Link></li>
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Contact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Privacy</Link></li>
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Terms</Link></li>
                                <li><Link href="#" className="text-gray-500 hover:text-blue-600">Security</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <p>© {new Date().getFullYear()} RydeOn Inc. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <span>Made with ❤️ for drivers</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
