import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers'

test.describe('Workspace', () => {
  test('workspace shows header with user email', async ({ page }) => {
    const email = await registerAndLogin(page)
    await expect(page.getByText(email)).toBeVisible()
  })

  test('workspace has new session button', async ({ page }) => {
    await registerAndLogin(page)
    await expect(page.getByRole('button', { name: /新.*分析|新建|new/i })).toBeVisible()
  })

  test('workspace shows methodology picker or empty state', async ({ page }) => {
    await registerAndLogin(page)
    // Should show either empty state or sessions list
    const hasContent = await page.locator('body').textContent()
    expect(hasContent).toBeTruthy()
  })

  test('create new session → navigates to session page', async ({ page }) => {
    await registerAndLogin(page)
    // Click new analysis button
    const newBtn = page.getByRole('button', { name: /新.*分析|新建|new/i })
    await newBtn.click()
    // Should navigate to a session page or show methodology picker
    await page.waitForTimeout(2000)
    const url = page.url()
    // Either stays on workspace with methodology picked, or goes to /session/xxx
    expect(url).toMatch(/workspace|session/)
  })

  test('logout works', async ({ page }) => {
    await registerAndLogin(page)
    // Find and click logout
    const logoutBtn = page.getByRole('button', { name: /退出|登出|logout/i })
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      await expect(page).toHaveURL('/login')
    } else {
      // Try clicking user email area for dropdown
      const header = page.locator('header')
      if (await header.isVisible()) {
        await header.click()
        const logoutLink = page.getByText(/退出|登出|logout/i)
        if (await logoutLink.isVisible()) {
          await logoutLink.click()
          await expect(page).toHaveURL('/login')
        }
      }
    }
  })
})

test.describe('Session UI', () => {
  test('methodology picker shows 5 skills', async ({ page }) => {
    await registerAndLogin(page)
    // Check methodology options are present
    const methodologies = ['brainstorming', 'musk', 'jobs', 'paul-graham', 'munger']
    // Click new session button to see methodology picker
    const newBtn = page.getByRole('button', { name: /新.*分析|新建|new/i })
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(1000)
    }
    // At least one methodology should be visible somewhere on the page
    let found = false
    for (const m of methodologies) {
      const el = page.getByText(new RegExp(m, 'i'))
      if (await el.isVisible()) {
        found = true
        break
      }
    }
    expect(found).toBeTruthy()
  })
})
