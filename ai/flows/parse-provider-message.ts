'use server';

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
                    content: `You are an expert at parsing taxi/transfer booking messages into structured data. 
                    
CRITICAL RULES:
- Extract ALL available information from the message
- Be flexible with date/time formats (DD.MM.YYYY, DD/MM/YYYY, "Tue, 23 Dec", etc.)
- Convert ALL dates to DD/MM/YYYY format (e.g., "23.12.2025" → "23/12/2025")
- Convert ALL times to 24-hour HH:mm format (e.g., "14:15 PM" → "14:15", "20:00h" → "20:00")
- Extract full addresses including airport names, street addresses, postcodes
- Extract international phone numbers with country codes as-is
- Parse passenger counts from "Persons:", "pax", or similar indicators
- If only a number is given for passengers, assume all are adults
- Extract flight/train numbers (e.g., FR 3919, FR983, SV112)
- Extract customer names even if they have special characters (ø, á, etc.)
- If a price is mentioned with currency symbol (£, €, $), extract the numeric value only
- Include any special instructions or notes in the notes field

FIELD EXTRACTION GUIDELINES:
- price: Extract numeric value only (e.g., "£107" → "107")
- bookingDate: Convert to DD/MM/YYYY (e.g., "23.12.2025" → "23/12/2025")
- bookingTime: Convert to HH:mm 24-hour (e.g., "14:15 PM" → "14:15", "06:00" → "06:00")
- pickup: Full address including airport terminal if mentioned
- dropoff: Full address including hotel name or postcode
- customerName: Full name with proper capitalization and special characters
- customerPhone: Include country code (e.g., "+44 1225 637333", "+39-3296677400")
- flightNumber: Include airline code and number (e.g., "FR 3919", "SV112")
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

EXAMPLE INPUTS AND OUTPUTS:

Input: "Tue, 23 Dec at 14:15 PM
From: Aeroporto di Londra-Stansted (STN), Bassingbourn Rd, Stansted CM24 1QW
To: 26-30 Craven Rd, London W2 3QB
Passenger: SEIDENARI
Phone: +44 1225 637333
Flight: FR 3919
Meeting with name sign
£107"

Output: {
  "price": "107",
  "bookingDate": "23/12/2024",
  "bookingTime": "14:15",
  "pickup": "Aeroporto di Londra-Stansted (STN), Bassingbourn Rd, Stansted CM24 1QW, Regno Unito",
  "dropoff": "26-30 Craven Rd, London W2 3QB",
  "operator": null,
  "customerName": "SEIDENARI",
  "customerPhone": "+44 1225 637333",
  "flightNumber": "FR 3919",
  "passengers": { "adults": 1, "children": 0, "infants": 0 },
  "luggage": { "cabin": 0, "checked": 0 },
  "notes": "Meeting with a name sign: SEIDENARI"
}

Input: "Date and time: 23.12.2025. 20:00h
Pickup: London Stansted Airport
Dropoff: Royal National Hotel 38 51 Bedford Way, London City Centre
Flight: FR983
Name: Arjan Korriku
Tel: +39-3296677400
Persons: 4
£107"

Output: {
  "price": "107",
  "bookingDate": "23/12/2025",
  "bookingTime": "20:00",
  "pickup": "London Stansted Airport",
  "dropoff": "Royal National Hotel 38 51 Bedford Way, London City Centre",
  "operator": null,
  "customerName": "Arjan Korriku",
  "customerPhone": "+39-3296677400",
  "flightNumber": "FR983",
  "passengers": { "adults": 4, "children": 0, "infants": 0 },
  "luggage": { "cabin": 0, "checked": 0 },
  "notes": null
}`
                },
                { role: "user", content: messageContent },
            ],
            model: "gpt-4o-mini",
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
