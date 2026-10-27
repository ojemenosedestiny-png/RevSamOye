import { z } from "zod";

// Shared by the browser (step-by-step checks) and the API route (authoritative check).

export const COUNSELING_TYPES = ["Marriage", "Relationships", "Career/Purpose", "Spiritual", "Family", "Other"] as const;
export const COUNSELING_MODES = ["In person", "Phone", "Video"] as const;

const trimmed = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max, `Please keep this under ${max} characters`);

export const stepOneSchema = z.object({
  fullName: trimmed(2, 120, "Please enter your full name"),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  phoneCode: z.string().regex(/^\+\d{1,4}$/, "Choose a country code"),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()-]{6,20}$/, "Please enter a valid phone number"),
  country: trimmed(2, 80, "Please enter your country"),
  city: trimmed(2, 80, "Please enter your city"),
});

const today = () => new Date(new Date().toDateString());

export const stepTwoSchema = z.object({
  type: z.enum(COUNSELING_TYPES, { errorMap: () => ({ message: "Choose a counseling type" }) }),
  mode: z.enum(COUNSELING_MODES, { errorMap: () => ({ message: "Choose how you'd like to meet" }) }),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a preferred date")
    .refine((d) => new Date(`${d}T23:59:59`) >= today(), "Please choose a date in the future"),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a preferred time"),
  description: trimmed(10, 1500, "Please share a little about what you need (at least 10 characters)"),
});

export const stepThreeSchema = z.object({
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm you agree to the privacy notice" }) }),
});

export const counselingSchema = stepOneSchema
  .merge(stepTwoSchema)
  .merge(stepThreeSchema)
  .extend({
    website: z.string().max(0).optional(), // honeypot — must stay empty
    startedAt: z.number().optional(),
    turnstileToken: z.string().optional(),
  });

export type CounselingInput = z.infer<typeof counselingSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(200),
  website: z.string().max(0).optional(),
});

/** Flattens zod errors into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
