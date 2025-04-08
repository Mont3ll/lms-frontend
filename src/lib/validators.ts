import * as z from "zod";

// --- Auth Schemas ---
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }).max(50),
    lastName: z.string().min(1, { message: "Last name is required" }).max(50),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    // tenantId: z.string().uuid().optional(), // Depending on flow
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    // Include token fields if needed
    // uid: z.string(),
    // token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// --- Profile Schema ---
export const userProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  // Profile sub-object (match backend serializer structure)
  profile: z
    .object({
      bio: z
        .string()
        .max(500, "Bio cannot exceed 500 characters")
        .optional()
        .nullable(),
      language: z.string().optional().nullable(),
      timezone: z.string().optional().nullable(),
      // preferences: z.record(z.any()).optional(), // Basic JSON validation
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    new_password2: z.string(),
  })
  .refine((data) => data.new_password === data.new_password2, {
    message: "New passwords don't match",
    path: ["new_password2"],
  });

// --- Course Schema ---
export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .max(5000, "Description too long")
    .optional()
    .nullable(),
  instructor_id: z
    .string()
    .uuid("Invalid instructor selected")
    .optional()
    .nullable(), // Assuming UUID for user ID
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  tags: z.array(z.string()).optional(), // Assuming tags are strings
  // Add category, thumbnail etc.
});

// --- Module Schema ---
export const moduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  order: z.number().int().min(0).optional(), // Order might be handled separately
});

// Add schemas for ContentItem, Assessment, Question, etc. as forms are built
