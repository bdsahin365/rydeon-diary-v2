"use server";

import dbConnect from "@/lib/mongodb";
import VehicleType from "@/models/VehicleType";
import Job from "@/models/Job";
import { auth } from "@/auth";

const STANDARD_VEHICLES = [
    "Saloon",
    "Estate",
    "MPV",
    "MPV 5",
    "MPV 6",
    "MPV 7",
    "MPV 8",
    "Exec",
];

export async function getVehicleTypes() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }
        const userId = session.user.id;

        await dbConnect();

        // 1. Fetch existing dynamic types
        let vehicleTypes = await VehicleType.find({ userId }).sort({ isDefault: -1, name: 1 }).lean();

        // 2. Check for legacy types used in Jobs that are NOT in VehicleType
        // This acts as an auto-migration script
        const usedVehiclesInJobs = await Job.distinct("vehicle", { userId });
        const existingNames = new Set(vehicleTypes.map((vt: any) => vt.name.toLowerCase()));

        // Also include standard vehicles in the "to be checked" list if they are not already in DB
        const standardSet = new Set(STANDARD_VEHICLES.map(v => v.toLowerCase()));

        const newTypesToAdd = new Set<string>();

        // Check legacy jobs
        usedVehiclesInJobs.forEach((v: any) => {
            if (v && typeof v === 'string' && v.trim() !== '' && !existingNames.has(v.toLowerCase())) {
                newTypesToAdd.add(v.trim());
            }
        });

        // Check standard vehicles (if we have no types at all, or just to ensure they are there)
        // The original logic only seeded if length === 0. 
        // Let's ensure standard vehicles are ALWAYS available (added to DB if missing).
        STANDARD_VEHICLES.forEach(v => {
            if (!existingNames.has(v.toLowerCase())) {
                newTypesToAdd.add(v);
            }
        });

        if (newTypesToAdd.size > 0) {
            const operations = Array.from(newTypesToAdd).map(name => ({
                updateOne: {
                    filter: { userId, name: { $regex: new RegExp(`^${name}$`, "i") } }, // Check existence case-insensitive
                    update: {
                        $setOnInsert: {
                            userId,
                            name,
                            isDefault: standardSet.has(name.toLowerCase())
                        }
                    },
                    upsert: true
                }
            }));

            if (operations.length > 0) {
                await VehicleType.bulkWrite(operations);
                // Refetch after update
                vehicleTypes = await VehicleType.find({ userId }).sort({ isDefault: -1, name: 1 }).lean();
            }
        }

        return { success: true, data: JSON.parse(JSON.stringify(vehicleTypes)) };
    } catch (error) {
        console.error("Failed to get vehicle types:", error);
        return { success: false, error: "Failed to fetch vehicle types" };
    }
}

export async function createVehicleType(name: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }
        const userId = session.user.id;

        if (!name || name.trim().length === 0) {
            return { success: false, error: "Invalid vehicle name" };
        }

        await dbConnect();

        // Check if it already exists (case-insensitive check could be good, but strict for now)
        const existing = await VehicleType.findOne({
            userId,
            name: { $regex: new RegExp(`^${name}$`, "i") },
        }).lean();

        if (existing) {
            return { success: true, data: JSON.parse(JSON.stringify(existing)) };
        }

        const newType = await VehicleType.create({
            userId,
            name: name.trim(),
            isDefault: false,
        });

        return { success: true, data: JSON.parse(JSON.stringify(newType)) };
    } catch (error) {
        console.error("Failed to create vehicle type:", error);
        return { success: false, error: "Failed to create vehicle type" };
    }
}
