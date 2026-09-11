import { test, expect } from '@playwright/test'
import { lessons } from '../../src/data/lessons.js'

test('clear card prompts, English examples and expanded decks work without overflow', async ({ page }, info) => {
  await page.goto('/')
  await page.locator('#mode-cards').click()
  await expect(page.locator('#flashcard strong')).toHaveText('A a')
  await expect(page.locator('.flashcard-wrap .english-note')).toHaveCount(0)
  await page.locator('#english-toggle').click()
  await page.locator('#flashcard').click()
  await expect(page.locator('#flashcard small')).toHaveText('A a')
  await expect(page.locator('.flashcard-wrap .english-note')).toContainText('ah')
  for (const lesson of lessons) {
    if (await page.locator('#catalogue').isHidden()) await page.locator('#catalogue-toggle').click()
    await page.locator(`[data-lesson="${lesson.id}"]`).click()
    await page.locator('#mode-cards').click()
    await page.locator('#flashcard').click()
    await expect(page.locator('.flashcard-wrap .english-note')).toContainText(lesson.cards[0].exampleEn)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.screenshot({ path: info.outputPath('cards.png'), fullPage: true })
})
