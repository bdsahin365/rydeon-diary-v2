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
        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-start h-full">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">{icon}</div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{description}</p>
                <Link
                    href={link}
                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 hover:underline mt-auto"
                >
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    )
}
