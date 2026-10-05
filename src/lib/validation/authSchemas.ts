import { z } from "zod";

// Migrated from PasswordInput's previous hardcoded `required` attribute.
const requiredPassword = z.string().min(1, "كلمة المرور مطلوبة");

// New strength rule requested for signup — login keeps the old "required only" rule
// so existing passwords set before this change still work.
const strongPassword = z
  .string()
  .min(8, "يجب أن تتكون كلمة المرور من ٨ أحرف على الأقل")
  .regex(/[a-z]/, "يجب أن تتضمن كلمة المرور حرفاً إنجليزياً صغيراً")
  .regex(/[A-Z]/, "يجب أن تتضمن كلمة المرور حرفاً إنجليزياً كبيراً")
  .regex(/[0-9]/, "يجب أن تتضمن كلمة المرور رقماً");

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("أدخل بريداً إلكترونياً صحيحاً"),
  password: requiredPassword,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  // Migrated from signup page's previous `minLength={3}` attribute.
  username: z.string().min(3, "يجب أن يتكون اسم المستخدم من ٣ أحرف على الأقل"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("أدخل بريداً إلكترونياً صحيحاً"),
  password: strongPassword,
});

export type SignupFormValues = z.infer<typeof signupSchema>;
