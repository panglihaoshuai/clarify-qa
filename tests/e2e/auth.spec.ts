import { test, expect } from '@playwright/test'
import { uniqueEmail, registerUser, loginUser } from './helpers'

test.describe('Auth flows', () => {
  test('register page loads with correct elements', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Clarify Q&A' })).toBeVisible()
    await expect(page.getByPlaceholder('邮箱')).toBeVisible()
    await expect(page.getByRole('button', { name: '注册' })).toBeVisible()
    await expect(page.getByText('初始密码为 123456')).toBeVisible()
  })

  test('login page loads with correct elements', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Clarify Q&A' })).toBeVisible()
    await expect(page.getByPlaceholder('邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('密码（默认123456）')).toBeVisible()
    await expect(page.getByRole('button', { name: '登 录' })).toBeVisible()
    await expect(page.getByText('注册新账号')).toBeVisible()
  })

  test('register with valid email → redirects to login', async ({ page }) => {
    const email = uniqueEmail()
    await registerUser(page, email)
    await expect(page).toHaveURL('/login')
  })

  test('register duplicate email shows error', async ({ page }) => {
    const email = uniqueEmail()
    await registerUser(page, email)
    // Try to register again with same email
    await page.goto('/register')
    await page.getByPlaceholder('邮箱').fill(email)
    await page.getByRole('button', { name: '注册' }).click()
    await expect(page.getByText(/已.*注册|邮箱.*存在|error|错误/i)).toBeVisible({ timeout: 5000 })
  })

  test('login with valid credentials → redirects to workspace', async ({ page }) => {
    const email = uniqueEmail()
    await registerUser(page, email)
    await loginUser(page, email)
    await expect(page).toHaveURL('/workspace')
  })

  test('login with wrong password shows error', async ({ page }) => {
    const email = uniqueEmail()
    await registerUser(page, email)
    await page.goto('/login')
    await page.getByPlaceholder('邮箱').fill(email)
    await page.getByPlaceholder('密码（默认123456）').fill('wrongpassword')
    await page.getByRole('button', { name: '登 录' }).click()
    await expect(page.getByText(/邮箱或密码错误|登录失败/)).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated access to workspace redirects to login', async ({ page }) => {
    await page.goto('/workspace')
    await expect(page).toHaveURL('/login')
  })
})
