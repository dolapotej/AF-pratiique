import { test, expect } from '@playwright/test'
import { lessons } from '../../src/data/lessons.js'
import { english } from '../../src/data/english.js'

test('French stays default; English help only adds asides and is remembered', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('#english-toggle')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.english-note')).toHaveCount(0)
  await page.locator('#continue').click()
  await page.locator('#english-toggle').click()
  await expect(page.locator('#english-toggle')).toBeFocused()
  await expect(page.locator('#english-toggle')).toHaveText('English help: on')
  await expect(page.locator('.teaching-section').first()).toContainText(english.alphabet.sections[0])
  await expect(page.locator('.teaching-section').first()).toContainText(lessons[0].sections[0][1])
  await page.locator('#tab-write').click()
  await page.locator('#writing-answer').fill('Je suis Ada.')
  await page.locator('#english-toggle').click()
  await expect(page.locator('#writing-answer')).toHaveValue('Je suis Ada.')
  await expect(page.locator('.english-note')).toHaveCount(0)
  await page.locator('#english-toggle').click()
  await page.reload()
  await expect(page.locator('#english-toggle')).toHaveAttribute('aria-pressed', 'true')
})

test('every lesson has English support in each activity without overflow', async ({ page }) => {
  test.setTimeout(180000)
  await page.goto('/')
  await page.locator('#english-toggle').click()
  for (const lesson of lessons) {
    await page.locator('#nav-lessons').click()
    await page.locator(`#lesson-${lesson.id}`).click()
    await expect(page.locator('.teaching-section .english-note')).toHaveCount(lesson.sections.length)
    await expect(page.locator('.reading')).toContainText(english[lesson.id].reading)
    await page.locator('#tab-write').click()
    await expect(page.locator('#activity-panel')).toContainText(english[lesson.id].writing)
    if (lesson.task) await expect(page.locator('#activity-panel')).toContainText(english[lesson.id].task)
    await page.locator('#tab-quiz').click()
    await expect(page.locator('#activity-panel')).toContainText(english[lesson.id].exercises[0])
    await page.locator('#step-quiz').click()
    await expect(page.locator('#activity-panel')).toContainText(english[lesson.id].questions[0])
    await page.locator('#tab-cards').click()
    await page.locator('#flashcard').click()
    await expect(page.locator('#activity-panel .english-note').last()).toContainText(lesson.cards[0].exampleEn)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), lesson.id).toBe(true)
    await page.locator('#tab-learn').click()
  }
})
