import { z } from "zod";
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

// Numbers typed without a leading "+" country code (e.g. a plain 10-digit
// mobile number) are assumed to be Indian, since that's where every one of
// our communities is. A "+<code>" prefix overrides this for enquiries from
// elsewhere.
const DEFAULT_PHONE_COUNTRY: CountryCode = "IN";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .max(20, "Enter a valid phone number")
    .regex(/^\+?[0-9()\-\s]+$/, "Use digits and + ( ) - only")
    .refine(
      (value) => isValidPhoneNumber(value, DEFAULT_PHONE_COUNTRY),
      "Enter a valid phone number for its country",
    ),
  email: z.string().trim().email("Enter a valid email address"),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
