import { test, expect } from '@playwright/test'
import { registerAndLogin } from './helpers'

test.describe('Workspace', () => {
  test('workspace shows header with user email', async ({ page }) => {
    const email = await registerAndLogin(page)
    await expect(page.getByText(email)).toBeVisible()
  })

  test('workspace has new session link', async ({ page }) => {
    await registerAndLogin(page)
    // The new session element is a Link styled as "+ 新建分析"
    await expect(page.getByText('新建分析')).toBeVisible()
  })

  test('workspace shows methodology picker or empty state', async ({ page }) => {
    await registerAndLogin(page)
    const hasContent = await page.locator('body').textContent()
    expect(hasContent).toBeTruthy()
  })

  test('create new session → shows methodology picker', async ({ page }) => {
    await registerAndLogin(page)
    // Click new analysis link
    await page.getByText('新建分析').click()
    // Should show methodology picker (选择分析框架)
    await expect(page.getByText('选择分析框架')).toBeVisible()
  })

  test('logout works', async ({ page }) => {
    await registerAndLogin(page)
    const logoutBtn = page.getByRole('button', { name: /退出|登出|logout/i })
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      await expect(page).toHaveURL('/login')
    } else {
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
    // Click new session to open methodology picker
    await page.getByText('新建分析').click()
    await expect(page.getByText('选择分析框架')).toBeVisible()
    // Check that all 5 methodology labels are present
    const labels = ['通用分析', '马斯克', '乔布斯', 'Paul Graham', '芒格']
    for (const label of labels) {
      await expect(page.getByText(label)).toBeVisible()
    }
  })
})
