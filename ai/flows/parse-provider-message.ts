'use server';

import { ProcessedJob } from "@/types";
import OpenAI from "openai";

export async function parseProviderMessage({ messageContent, imageBase64 }: { messageContent: string; imageBase64?: string }) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const messages: any[] = [
            {
                role: "system",
                content: `You are an expert at parsing taxi/transfer booking messages and SCREENSHOTS into structured data. 
                
CRITICAL RULES:
- Extract ALL available information from the text message OR the provided image.
- If an image is provided, extract job details directly from the screenshot (e.g., date, time, price, passenger info, locations).
- Be flexible with date/time formats (DD.MM.YYYY, DD/MM/YYYY, "Tue, 23 Dec", etc.)
- Convert ALL dates to DD/MM/YYYY format (e.g., "23.12.2025" → "23/12/2025")
- Convert ALL times to 24-hour HH:mm format (e.g., "14:15 PM" → "14:15", "20:00h" → "20:00")
- Extract full addresses including airport names, street addresses, postcodes
- Extract international phone numbers with country codes as-is
- Parse passenger counts from "Persons:", "pax", or similar indicators, or icons in the image.
- If only a number is given for passengers, assume all are adults
- Extract flight/train numbers (e.g., FR 3919, FR983, SV112)
- Extract customer names even if they have special characters (ø, á, etc.)
- If a price is mentioned with currency symbol (£, €, $), extract the numeric value only
- Include any special instructions or notes in the notes field
- If the image contains multiple jobs, ONLY parse the one that seems most prominent or if it's a detail view, parse that single job.

FIELD EXTRACTION GUIDELINES:
- price: Extract numeric value only (e.g., "£107" → "107")
- bookingDate: Convert to DD/MM/YYYY (e.g., "23.12.2025" → "23/12/2025"). Look for labels like "Date", calendar icons, or explicit dates.
- bookingTime: Convert to HH:mm 24-hour. Look for labels like "Time", clock icons.
- pickup: Full address. Look for "From", "Pickup", green markers, or top address.
- dropoff: Full address. Look for "To", "Dropoff", red markers, or bottom address.
- customerName: Full name. Look for "Passenger", "Client", or names near profile icons.
- customerPhone: Include country code. Look for phone icons.
- flightNumber: Include airline code and number. Look for plane icons or codes like "BA123".
- passengers: Parse "Persons: 4" → {"adults": 4, "children": 0, "infants": 0}
- luggage: If not specified, return {"cabin": 0, "checked": 0}
- notes: Include meeting signs, special requests, or any other relevant info
- operator: Extract if mentioned (e.g., "Uber", "Airport Move ltd")

RETURN FORMAT:
Return ONLY a valid JSON object with these exact fields:
{
  "price": "string (numeric value only)",
  "bookingDate": "DD/MM/YYYY",
  "bookingTime": "HH:mm",
  "pickup": "string (full address)",
  "dropoff": "string (full address)",
  "operator": "string or null",
  "customerName": "string or null",
  "customerPhone": "string or null",
  "flightNumber": "string or null",
  "passengers": { "adults": number, "children": number, "infants": number },
  "luggage": { "cabin": number, "checked": number },
  "notes": "string or null"
}
`
            }
        ];

        const userContent: any[] = [{ type: "text", text: messageContent || "Please parse this job info." }];

        if (imageBase64) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: imageBase64,
                },
            });
        }

        messages.push({ role: "user", content: userContent });

        const completion = await openai.chat.completions.create({
            messages: messages as any,
            model: "gpt-4o-mini", // Supports vision
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
