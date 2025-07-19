import {z} from 'zod';

export const userValidation = z
    .string()
    .min(4,"Username must be at least 4 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const signUpSchema = z.object({
    username: userValidation,
    email: z.email({message: "Invalid email address"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters long"})
})