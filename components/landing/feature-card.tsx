import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface FeatureCardProps {
    icon: React.ReactNode
    title: string
    description: string
    link: string
}

export function FeatureCard({ icon, title, description, link }: FeatureCardProps) {
    return (
        <Card className="group relative border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 opacity-0 group-hover:opacity-10 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-opacity duration-500" />

            <CardContent className="p-8 flex flex-col items-start h-full relative z-10">
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-700 transition-colors">
                    {title}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed flex-grow">
                    {description}
                </p>
                <Link
                    href={link}
                    className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform"
                >
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    )
}
