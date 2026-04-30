import { z } from "zod"


const STATUSES = ["undergrad", "grad"]


const statusField  = (msg = "Please select a status") =>
  z.string().min(1, msg).refine(v => STATUSES.includes(v), { message: msg })



export const step1Schema = z.object({
     contact_name:   z.string().min(2, "Full name is required"),
     contact_gender: genderField(),
     contact_email:  z.string().email("Enter a valid email address"),
     contact_phone:  z.string().regex(phoneRegex, "Enter a valid phone number"),
     contact_status: statusField(),
})