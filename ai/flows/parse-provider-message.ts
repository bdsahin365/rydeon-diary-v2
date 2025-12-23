import { ProcessedJob } from "@/types";
import OpenAI from "openai";

export async function parseProviderMessage({ messageContent }: { messageContent: string }) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that parses taxi job messages. 
                    Extract the following details: price, bookingDate, bookingTime, pickup, dropoff, operator, customerName, customerPhone, flightNumber, passengers, luggage, notes.
                    
                    Return the result as a JSON object.
                    Format dates as YYYY-MM-DD and times as HH:mm.
                    If a field is missing, return null or an empty string.
                    For passengers, return an object { adults: number, children: number, infants: number }.
                    For luggage, return an object { cabin: number, checked: number }.
                    
                    Example input: "Job for Uber. Pickup Heathrow T5, Dropoff SW1A 1AA. £50. Tom 07700900000. 15/10/2023 14:00. 2 pax, 1 bag."
                    Example output: {
                        "price": "50",
                        "bookingDate": "2023-10-15",
                        "bookingTime": "14:00",
                        "pickup": "Heathrow Terminal 5",
                        "dropoff": "SW1A 1AA",
                        "operator": "Uber",
                        "customerName": "Tom",
                        "customerPhone": "07700900000",
                        "passengers": { "adults": 2, "children": 0, "infants": 0 },
                        "luggage": { "cabin": 0, "checked": 1 }
                    }`
                },
                { role: "user", content: messageContent },
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("No content returned from OpenAI");
        }

        const parsed = JSON.parse(content);

        const mockJob: Partial<ProcessedJob> = {
            price: parsed.price || "0",
            bookingDate: parsed.bookingDate || new Date().toISOString(),
            bookingTime: parsed.bookingTime || "12:00",
            pickup: parsed.pickup || "",
            dropoff: parsed.dropoff || "",
            operator: parsed.operator || "",
            customerName: parsed.customerName || "",
            customerPhone: parsed.customerPhone || "",
            flightNumber: parsed.flightNumber || "",
            passengers: parsed.passengers || { adults: 1, children: 0, infants: 0 },
            luggage: parsed.luggage || { cabin: 0, checked: 0 },
            notes: parsed.notes || "",
        };

        return {
            jobs: [mockJob]
        };
    } catch (error) {
        console.error("Error parsing message with OpenAI:", error);
        // Fallback to basic regex or empty return
        return {
            jobs: []
        };
    }
}
