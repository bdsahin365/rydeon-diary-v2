import Image from "next/image"

export function HeroAnimation() {
    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full opacity-20 animate-pulse blur-3xl"></div>
            <div className="relative z-10 bg-white rounded-xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden border border-gray-100">
                <div className="space-y-4">
                    <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                    <div className="flex gap-4">
                        <div className="h-32 bg-blue-50 rounded flex-1 flex items-center justify-center">
                            <span className="text-blue-500 font-bold text-lg">$1,240</span>
                        </div>
                        <div className="h-32 bg-green-50 rounded flex-1 flex items-center justify-center">
                            <span className="text-green-500 font-bold text-lg">+24%</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
            {/* Floating element 1 */}
            <div className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-100 animate-bounce delay-100">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-bold text-gray-700">New Trip</span>
                </div>
            </div>
            {/* Floating element 2 */}
            <div className="absolute -bottom-8 -left-8 bg-white p-3 rounded-lg shadow-lg border border-gray-100 animate-bounce delay-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        $
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Earnings</span>
                        <span className="text-sm font-bold text-gray-700">$45.50</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
