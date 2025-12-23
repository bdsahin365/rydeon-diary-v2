import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("Authorize called with:", credentials?.email);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    try {
                        console.log("Connecting to DB...");
                        await dbConnect();
                        console.log("Connected to DB. Finding user...");
                        const user = await User.findOne({ email }).select("+password");
                        console.log("User found:", user ? "Yes" : "No");

                        if (!user) return null;

                        console.log("Comparing password...");
                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        console.log("Password match:", passwordsMatch);

                        if (passwordsMatch) return user;
                    } catch (error) {
                        console.error("Authorize error:", error);
                        return null;
                    }
                }

                console.log("Invalid credentials or parsing failed");
                return null;
            },
        }),
    ],
});
