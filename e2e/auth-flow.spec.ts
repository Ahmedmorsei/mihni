import { test, expect } from "@playwright/test";
import { seededTestUser, uniqueTestUser } from "./helpers";

test.describe("Auth flow", () => {
  test("a visitor can sign up and sees the confirmation screen", async ({
    page,
  }) => {
    const user = uniqueTestUser();

    await page.goto("/signup");

    await page.getByPlaceholder("اختر اسم مستخدم").fill(user.username);
    await page.getByPlaceholder("you@example.com").fill(user.email);
    await page.getByPlaceholder("أنشئ كلمة مرور قوية").fill(user.password);

    await page.getByRole("button", { name: "إنشاء حساب" }).click();

    // Signup always requires email confirmation before a session exists,
    // so the reachable end state here is the "check your email" screen.
    await expect(page.getByRole("status")).toContainText(
      "تحقق من بريدك الإلكتروني لتأكيد حسابك."
    );
  });

  test("a confirmed user can log in, reach the dashboard, and log out", async ({
    page,
  }) => {
    const user = seededTestUser();
    test.skip(
      !user,
      "Set PLAYWRIGHT_TEST_USER_EMAIL and PLAYWRIGHT_TEST_USER_PASSWORD to a confirmed Supabase user to run this test."
    );

    await page.goto("/login");

    await page.getByPlaceholder("you@example.com").fill(user!.email);
    await page.getByPlaceholder("أدخل كلمة المرور").fill(user!.password);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible();

    // Logout is only rendered in the navbar once a session exists.
    await page.getByRole("button", { name: "تسجيل الخروج" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
  });

  test("visiting the dashboard while logged out redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
