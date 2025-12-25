import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

interface TestimonialCardProps {
    quote: string
    author: string
    role: string
    rating: number
}

export function TestimonialCard({ quote, author, role, rating }: TestimonialCardProps) {
    return (
        <Card className="border-none shadow-md">
            <CardContent className="p-6">
                <div className="flex mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                        />
                    ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{quote}"</p>
                <div>
                    <p className="font-bold text-gray-900">{author}</p>
                    <p className="text-sm text-gray-500">{role}</p>
                </div>
            </CardContent>
        </Card>
    )
}
