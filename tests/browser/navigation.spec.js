import { test, expect } from '@playwright/test'

const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)

test('four views sit behind the sidebar and only one shows at a time', async ({ page }, info) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('#nav-today')).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('#page-title')).toHaveText('Bonjour.')
  await expect(page.locator('.lesson-row')).toHaveCount(0)
  await expect(page.locator('.stat')).toHaveCount(3)
  await expect(page.locator('.stat').first()).toContainText('0%')
  expect(await fits(page)).toBe(true)
  await page.screenshot({ path: info.outputPath('today.png'), fullPage: true })

  await page.locator('#choose-lesson').click()
  await expect(page.locator('#nav-lessons')).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('#page-title')).toBeFocused()
  await page.locator('#lesson-search').fill('ecrirezz')
  await expect(page.locator('#lesson-search-status')).toContainText('Aucune leçon trouvée')
  await page.locator('#lesson-search').fill('NOMBRES')
  await expect(page.locator('.lesson-row:visible')).toHaveCount(1)
  await expect(page.locator('#lesson-search-status')).toHaveText('1 leçon disponible.')
  expect(await fits(page)).toBe(true)
  await page.screenshot({ path: info.outputPath('lessons.png'), fullPage: true })

  await page.locator('#lesson-numbers').click()
  await expect(page.locator('#page-title')).toHaveText('Les nombres')
  await expect(page.locator('#page-title')).toBeFocused()
  await expect(page.locator('.breadcrumb')).toHaveText('Leçons / Les nombres')
  await expect(page.locator('.tabs button')).toHaveCount(4)
  await expect(page.locator('#tab-learn')).toHaveAttribute('aria-pressed', 'true')
  expect(await fits(page)).toBe(true)
  await page.screenshot({ path: info.outputPath('lesson.png'), fullPage: true })

  await page.locator('#tab-cards').click()
  await page.locator('#nav-today').click()
  await expect(page.locator('.next-step')).toContainText('Les nombres')
  await expect(page.locator('.next-step')).toContainText('Cartes ·')
  await page.locator('#continue').click()
  await expect(page.locator('#tab-cards')).toHaveAttribute('aria-pressed', 'true')

  await page.locator('#nav-carnet').click()
  await expect(page.locator('.carnet-row')).toHaveCount(16)
  expect(await fits(page)).toBe(true)
  await page.screenshot({ path: info.outputPath('carnet.png'), fullPage: true })
  expect(errors).toEqual([])
})
