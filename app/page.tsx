import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { FeatureCard } from "@/components/landing/feature-card"
import { TestimonialCard } from "@/components/landing/testimonial-card"
import { HeroAnimation } from "@/components/landing/hero-animation"
import { Calculator, MapPin, Plane, Users, BarChart, MessageSquare, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 blur-3xl"></div>
                    <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-3xl"></div>
                </div>

                <div className="container px-4 mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <div className="w-full lg:w-1/2 lg:pr-8">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-6">
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                                Trusted by 10,000+ drivers
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Maximize Your Rideshare Earnings with RydeOn
                            </h1>

                            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
                                The all-in-one platform for rideshare drivers to calculate profits, manage airport pickups, and track
                                earnings.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/auth/signup">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-[#00a0e9] hover:bg-[#0090d4] shadow-lg shadow-blue-500/20"
                                    >
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link href="/calculator">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                        Try Calculator
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-6">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                    <span className="text-gray-700">No credit card required</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                    <span className="text-gray-700">Free 14-day trial</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 relative">
                            <HeroAnimation />
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How RydeOn Works</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Three simple steps to optimize your earnings and improve your rideshare driving experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                                <Calculator className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">1. Calculate Your Profits</h3>
                            <p className="text-gray-600">
                                Input your trip details and expenses to see your actual earnings after costs.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                                <Plane className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">2. Manage Airport Pickups</h3>
                            <p className="text-gray-600">
                                Track flights, communicate with passengers, and optimize your airport runs.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                                <BarChart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">3. Track Your Progress</h3>
                            <p className="text-gray-600">
                                Analyze your earnings history and identify your most profitable times and areas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 md:py-24 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Powerful Tools for Rideshare Drivers</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Everything you need to optimize your earnings and provide exceptional service to your riders.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <FeatureCard
                            icon={<Calculator className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
                            title="Profit Calculator"
                            description="Calculate your actual earnings after expenses, fuel costs, and platform fees."
                            link="/calculator"
                        />

                        <FeatureCard
                            icon={<Plane className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
                            title="Airport Pickup Manager"
                            description="Streamline airport pickups with flight tracking, messaging templates, and fare estimation."
                            link="/airport-pickup"
                        />

                        <FeatureCard
                            icon={<MapPin className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
                            title="Distance Calculator"
                            description="Accurately calculate trip distances and estimate travel times using Google Maps."
                            link="/calculator"
                        />

                        <FeatureCard
                            icon={<BarChart className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
                            title="Trip History & Analytics"
                            description="Track your earnings over time and identify your most profitable routes and times."
                            link="/trip-history"
                        />

                        <FeatureCard
                            icon={<MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
                            title="AI Message Templates"
                            description="Generate professional rider communications with our AI-powered message templates."
                            link="/messages"
                        />

                        <FeatureCard
                            icon={<Users className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />}
                            title="Rider Database"
                            description="Manage your regular customers and provide personalized service to increase tips and ratings."
                            link="/riders"
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">What Drivers Are Saying</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Join thousands of drivers who are optimizing their earnings with RydeOn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <TestimonialCard
                            quote="RydeOn's profit calculator helped me realize I was losing money on short trips. I've adjusted my strategy and now earn 30% more."
                            author="Michael T."
                            role="Full-time Uber Driver"
                            rating={5}
                        />

                        <TestimonialCard
                            quote="The airport pickup manager is a game-changer. I can track flights, communicate with riders, and provide a premium service that gets me better tips."
                            author="Sarah K."
                            role="Part-time Lyft Driver"
                            rating={5}
                        />

                        <TestimonialCard
                            quote="I love being able to see my earnings history and identify which days and areas are most profitable. It's like having a business consultant in my pocket."
                            author="David M."
                            role="Multi-platform Driver"
                            rating={4.5}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="container px-4 mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Ready to Maximize Your Earnings?</h2>
                    <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
                        Join RydeOn today and get access to all our tools and features. No credit card required to start.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/auth/signup">
                            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
                                Sign Up Free
                            </Button>
                        </Link>
                        <Link href="/calculator">
                            <Button
                                size="lg"
                                variant="outline"
                                className="px-8 py-6 text-lg bg-transparent border-white text-white hover:bg-white/10"
                            >
                                Try Calculator
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 md:py-16 bg-gray-900 text-white">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        <div>
                            <div className="mb-4">
                                <Image src="/rydeon-logo-2.svg" alt="RydeOn" width={140} height={50} />
                            </div>
                            <p className="text-gray-400 mb-4">
                                The all-in-one platform for rideshare drivers to maximize earnings and improve service.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Features</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/calculator" className="text-gray-400 hover:text-white">
                                        Profit Calculator
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/airport-pickup" className="text-gray-400 hover:text-white">
                                        Airport Pickup
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/trip-history" className="text-gray-400 hover:text-white">
                                        Trip History
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/messages" className="text-gray-400 hover:text-white">
                                        Message Templates
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        Community
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        Feedback
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white">
                                        System Status
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400">© {new Date().getFullYear()} RydeOn. All rights reserved.</p>
                        <div className="mt-4 md:mt-0">
                            <ul className="flex space-x-6">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-sm">
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-sm">
                                        Terms
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white text-sm">
                                        Cookies
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
