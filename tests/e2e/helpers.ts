import { Page } from '@playwright/test'

export function uniqueEmail() {
  return `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.clarify`
}

export async function registerUser(page: Page, email: string) {
  await page.goto('/register')
  await page.getByPlaceholder('邮箱').fill(email)
  await page.getByRole('button', { name: '注册' }).click()
  await page.waitForURL('/login')
}

export async function loginUser(page: Page, email: string) {
  await page.goto('/login')
  await page.getByPlaceholder('邮箱').fill(email)
  await page.getByPlaceholder('密码（默认123456）').fill('123456')
  await page.getByRole('button', { name: '登 录' }).click()
  await page.waitForURL('/workspace')
}

export async function registerAndLogin(page: Page, email?: string) {
  const testEmail = email ?? uniqueEmail()
  await registerUser(page, testEmail)
  await loginUser(page, testEmail)
  return testEmail
}
