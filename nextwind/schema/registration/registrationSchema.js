// lib/schemas/registrationSchema.js
import { z } from "zod"

const phoneRegex = /^(\+?[\d\s\-().]{7,20})$/
const handleRegex = /^[a-zA-Z0-9_.\-]+$/

const GENDERS  = ["female", "male"]
const STATUSES = ["undergrad", "grad"]

const genderField  = (msg = "Please select a gender") =>
  z.string().min(1, msg).refine(v => GENDERS.includes(v),  { message: msg })

const statusField  = (msg = "Please select a student status") =>
  z.string().min(1, msg).refine(v => STATUSES.includes(v), { message: msg })

// ── Step 1 ──
export const step1Schema = z.object({
  teamName:  z.string().min(2, "Team name must be at least 2 characters").max(60, "Max 60 characters"),
  caseStudy: z.string().min(1, "Please select a case study"),
  project_desc:  z.string().min(20, "Please provide a brief description (min 20 characters)").max(500, "Max 500 characters"),
})

// ── Step 2 ──
export const step2Schema = z
  .object({
    lead_name:   z.string().min(2, "Full name is required"),
    lead_gender: genderField(),
    lead_email:  z.string().email("Enter a valid email address"),
    lead_phone:  z.string().regex(phoneRegex, "Enter a valid phone number"),
    lead_uni:    z.string().min(2, "University is required"),
    lead_status: statusField(),

    m2_name:   z.string().min(2, "Full name is required"),
    m2_gender: genderField(),
    m2_email:  z.string().email("Enter a valid email address"),
    m2_phone:  z.string().regex(phoneRegex, "Enter a valid phone number"),
    m2_uni:    z.string().min(2, "University is required"),
    m2_status: statusField(),

    m3_name:   z.string().min(2, "Full name is required"),
    m3_gender: genderField(),
    m3_email:  z.string().email("Enter a valid email address"),
    m3_phone:  z.string().regex(phoneRegex, "Enter a valid phone number"),
    m3_uni:    z.string().min(2, "University is required"),
    m3_status: statusField(),

    // Member 4 — fully optional
    m4_name:   z.string().optional(),
    m4_gender: z.string().optional(),
    m4_email:  z.string().optional(),
    m4_phone:  z.string().optional(),
    m4_uni:    z.string().optional(),
    m4_status: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const genders  = [data.lead_gender, data.m2_gender, data.m3_gender, data.m4_gender].filter(Boolean)
    const statuses = [data.lead_status, data.m2_status, data.m3_status, data.m4_status].filter(Boolean)
    const emails   = [data.lead_email,  data.m2_email,  data.m3_email,  data.m4_email ].filter(Boolean)

    if (!genders.includes("female")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one team member must identify as female",
        path: ["_female"],
      })
    }

    if (statuses.filter(s => s === "undergrad").length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 3 undergraduates required across the full team",
        path: ["_undergrad"],
      })
    }

    if (new Set(emails).size !== emails.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each team member must have a unique email address",
        path: ["_duplicate_email"],
      })
    }
  })

// ── Step 3 ──

export const step3Schema = z.object({
  instagram: z.string().min(1, "Instagram handle is required").regex(handleRegex, "No @ or URL prefix"),
  linkedin:  z.union([z.literal(""), z.string().regex(handleRegex, "No spaces or special characters")]).optional(),
  add_instagram_handle:  z.union([z.literal(""), z.string().regex(handleRegex, "No @ or URL prefix")]).optional(),

  ack_rules: z.literal(true, { errorMap: () => ({ message: "You must agree to the competition rules" }) }),
  ack_smc:   z.literal(true, { errorMap: () => ({ message: "You must agree to the SMC terms" }) }),
})

export const stepSchemas = { 1: step1Schema, 2: step2Schema, 3: step3Schema }

export function validateStep(step, data) {
  const schema = stepSchemas[step]
  if (!schema) return { success: false, errors: { _: "Invalid step" } }

  const result = schema.safeParse(data)
  if (result.success) return { success: true }

  const errors = {}
  result.error.issues.forEach(issue => {
    const key = issue.path.join("") || "_"
    if (!errors[key]) errors[key] = issue.message
  })

  return { success: false, errors }
}