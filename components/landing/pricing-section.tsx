"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(false)

    const plans = [
        {
            name: "Starter",
            description: "Essential tools for part-time drivers.",
            price: isAnnual ? 0 : 0,
            period: isAnnual ? "/year" : "/month",
            features: [
                "Basic Trip Logging",
                "Daily Earnings Track",
                "Expense Tracking",
                "Community Support",
            ],
            cta: "Get Started Free",
            variant: "outline",
        },
        {
            name: "Pro",
            description: "Advanced features for serious earners.",
            price: isAnnual ? 89 : 9.99,
            period: isAnnual ? "/year" : "/month",
            features: [
                "Everything in Starter",
                "Airport Pickup Manager",
                "Advanced Analytics",
                "Profit Calculator",
                "Priority Support",
            ],
            cta: "Start Free Trial",
            variant: "default",
            popular: true,
        },
        {
            name: "Elite",
            description: "Maximum efficiency for power users.",
            price: isAnnual ? 179 : 19.99,
            period: isAnnual ? "/year" : "/month",
            features: [
                "Everything in Pro",
                "AI Message Templates",
                "Rider Database",
                "Tax Export Reports",
                "Multi-platform Sync",
                "1-on-1 Coaching Session",
            ],
            cta: "Get Elite",
            variant: "outline",
        },
    ]

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-purple-50/50 rounded-full blur-3xl" />
            </div>

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Choose the plan that fits your driving goals. Upgrade or downgrade at any time.
                    </p>

                    <div className="flex items-center justify-center space-x-4">
                        <span className={`text-sm font-medium ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isAnnual ? "bg-blue-600" : "bg-gray-200"
                                }`}
                        >
                            <span
                                className={`${isAnnual ? "translate-x-6" : "translate-x-1"
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${isAnnual ? "text-gray-900" : "text-gray-500"}`}>
                            Yearly <span className="text-green-500 font-bold ml-1">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative border-2 flex flex-col ${plan.popular
                                ? "border-blue-600 shadow-2xl scale-105 z-10"
                                : "border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-100 transition-all duration-300"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm uppercase tracking-wider">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="text-sm text-gray-500 mt-2">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">£{plan.price}</span>
                                    <span className="text-gray-400 ml-1">{plan.period}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                            <span className="text-sm text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Link href="/auth/signup" className="w-full">
                                    <Button
                                        className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                                        variant={plan.variant as "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"}
                                        size="lg"
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
