import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "./authSchemas";

describe("authSchemas validation", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "any-password",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("البريد الإلكتروني مطلوب");
      }
    });

    it("rejects invalid email format", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("أدخل بريداً إلكترونياً صحيحاً");
      }
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("كلمة المرور مطلوبة");
      }
    });
  });

  describe("signupSchema", () => {
    it("accepts valid username, email, and strong password", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects username shorter than 3 characters", () => {
      const result = signupSchema.safeParse({
        username: "ab",
        email: "user@example.com",
        password: "Password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "يجب أن يتكون اسم المستخدم من ٣ أحرف على الأقل"
        );
      }
    });

    it("rejects invalid email format", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "invalid-email",
        password: "Password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("أدخل بريداً إلكترونياً صحيحاً");
      }
    });

    it("rejects password shorter than 8 characters", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "Pass1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "يجب أن تتكون كلمة المرور من ٨ أحرف على الأقل"
          )
        ).toBe(true);
      }
    });

    it("rejects password missing lowercase letter", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "PASSWORD123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "يجب أن تتضمن كلمة المرور حرفاً إنجليزياً صغيراً"
          )
        ).toBe(true);
      }
    });

    it("rejects password missing uppercase letter", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "يجب أن تتضمن كلمة المرور حرفاً إنجليزياً كبيراً"
          )
        ).toBe(true);
      }
    });

    it("rejects password missing number", () => {
      const result = signupSchema.safeParse({
        username: "johndoe",
        email: "john@example.com",
        password: "PasswordNoNum",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) => i.message === "يجب أن تتضمن كلمة المرور رقماً"
          )
        ).toBe(true);
      }
    });
  });
});
