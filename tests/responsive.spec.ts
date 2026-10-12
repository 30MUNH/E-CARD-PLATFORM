import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results', 'responsive-screenshots');
const ECARD_PATH = '/ecd/game/8ae32098-4fc9-4787-9d79-557a03b08532';

function getValidPin(): string {
  for (let i = 0; i <= 9999; i++) {
    const s = String(i).padStart(4, '0');
    let h1 = 2166136261;
    let h2 = 5381;
    for (let j = 0; j < s.length; j++) {
      const c = s.charCodeAt(j);
      h1 ^= c;
      h1 = Math.imul(h1, 16777619) >>> 0;
      h2 = ((h2 << 5) + h2 + c) >>> 0;
    }
    if (h1 === 3162167318 && h2 === 2088294964) return s;
  }
  return '';
}

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

test.describe('Multi-Viewport Responsive Screenshot Verification (Mobile, Tablet, Desktop)', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  for (const vp of VIEWPORTS) {
    test(`Capture Recipient & Admin screenshots at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Recipient Welcome
      await page.goto(ECARD_PATH);
      await expect(page.locator('button:has-text("Bắt đầu")')).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `recipient-01-welcome-${vp.name}.png`),
      });

      // 2. Recipient PIN Screen
      await page.locator('button:has-text("Bắt đầu")').click();
      await expect(page.locator('h2:has-text("Mở khóa kỷ niệm")')).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `recipient-02-pin-${vp.name}.png`),
      });

      // Unlock
      const pin = getValidPin();
      for (const digit of pin.split('')) {
        await page.locator(`button:text-is("${digit}")`).click();
      }
      await expect(page.locator('text=Ngọc Khánh').first()).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `recipient-03-homepage-${vp.name}.png`),
      });

      // 4. Recipient Album
      const nextBtn = page.locator('button img[src="/template/next.png"]').locator('..');
      await nextBtn.click();
      await expect(page.locator('img[alt="group1-img0"]')).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `recipient-04-album-${vp.name}.png`),
      });

      // 5. Recipient Music
      await nextBtn.click();
      await expect(page.locator('text=Một Đời')).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `recipient-05-music-${vp.name}.png`),
      });

      // 6. Recipient Letter
      await nextBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `recipient-06-letter-${vp.name}.png`),
      });

      // 7. Admin Dashboard
      await page.goto('/admin');
      await expect(page.locator('h1:has-text("Tổng quan Hệ thống E-Card")')).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `admin-01-dashboard-${vp.name}.png`),
      });

      // 8. Admin Card Editor
      await page.goto('/admin/cards/new');
      await expect(page.locator('#ecard-title-input')).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `admin-02-editor-${vp.name}.png`),
      });

      // 9. Admin Live Preview
      await page.goto('/admin/preview');
      await expect(page.locator('button:has-text("Quay lại chỉnh sửa")')).toBeVisible();
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `admin-03-preview-${vp.name}.png`),
      });
    });
  }
});
