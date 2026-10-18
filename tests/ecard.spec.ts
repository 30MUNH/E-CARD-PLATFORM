import { test, expect, Page } from '@playwright/test';

const ECARD_PATH = '/ecd/game/8ae32098-4fc9-4787-9d79-557a03b08532';

function getValidPin(): string {
  if (process.env.REF_PIN) return process.env.REF_PIN;
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

async function unlockEcard(page: Page) {
  await page.goto(ECARD_PATH);
  const startBtn = page.locator('button:has-text("Bắt đầu")');
  await expect(startBtn).toBeVisible();
  await startBtn.click();

  await expect(page.locator('h2:has-text("Mở khóa kỷ niệm")')).toBeVisible();
  const pin = getValidPin();
  for (const digit of pin.split('')) {
    await page.locator(`button:text-is("${digit}")`).click();
  }
  await expect(page.locator('text=Ngọc Khánh').first()).toBeVisible();
  await expect(page.locator('text=Lê Hoàng Anh').first()).toBeVisible();
}

test.describe('Complete E-Card E2E, Interaction & Responsive Recipient Suite', () => {
  test('1. Authentication flow: Welcome screen, partial PIN + Xóa, wrong PIN toast + reset, and valid PIN unlock', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ECARD_PATH);

    const startBtn = page.locator('button:has-text("Bắt đầu")');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    await expect(page.locator('h2:has-text("Mở khóa kỷ niệm")')).toBeVisible();
    await expect(page.locator('text=Bất ngờ cho cậu nà 😜')).toBeVisible();

    const deleteBtn = page.locator('button:has-text("Xóa")');
    await expect(deleteBtn).toBeDisabled();
    await page.locator('button:text-is("1")').click();
    await page.locator('button:text-is("2")').click();
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();
    await deleteBtn.click();
    await expect(deleteBtn).toBeDisabled();

    // Wrong PIN ("0000") -> Toast error "Sai mã PIN" + automatic reset
    for (let i = 0; i < 4; i++) {
      await page.locator('button:text-is("0")').click();
    }
    await expect(page.locator('text=Sai mã PIN').first()).toBeVisible();
    await page.waitForTimeout(550);

    // Valid PIN unlock -> Homepage
    const pin = getValidPin();
    for (const digit of pin.split('')) {
      await page.locator(`button:text-is("${digit}")`).click();
    }
    await expect(page.locator('text=Ngọc Khánh').first()).toBeVisible();
    await expect(page.locator('text=Lê Hoàng Anh').first()).toBeVisible();
    await expect(page.locator('text=ngày').first()).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('2. Forward and Backward sequential navigation across all 5 main views + loop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    const nextBtn = page.locator('button img[src="/template/next.png"]').locator('..');
    const backBtn = page.locator('button img[src="/template/back.png"]').locator('..');

    await expect(nextBtn).toBeVisible();
    await expect(backBtn).toHaveCount(0);

    await nextBtn.click();
    await expect(page.locator('text=Chưa có sách PDF')).toBeVisible();
    await expect(backBtn).toBeVisible();

    await nextBtn.click();
    await expect(page.locator('text=Một Đời')).toBeVisible();
    await expect(page.locator('text=SONG HÀNH KÝ').first()).toBeVisible();

    await nextBtn.click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    await nextBtn.click();
    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();

    await backBtn.click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    await backBtn.click();
    await expect(page.locator('text=Một Đời')).toBeVisible();

    await backBtn.click();
    await expect(page.locator('text=Chưa có sách PDF')).toBeVisible();

    await backBtn.click();
    await expect(page.locator('text=Ngọc Khánh').first()).toBeVisible();

    await nextBtn.click(); // Album
    await nextBtn.click(); // Music
    await nextBtn.click(); // Letter
    await nextBtn.click(); // Game
    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();
    await nextBtn.click(); // Loop -> Homepage
    await expect(page.locator('text=Ngọc Khánh').first()).toBeVisible();
  });

  test('3. Branching interactions: Homepage shortcut cards and Sidebar navigation + Settings redirect', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    const backBtn = page.locator('button img[src="/template/back.png"]').locator('..');

    await page.locator('button img[alt="big"]').locator('..').click();
    await expect(page.locator('text=Chưa có sách PDF')).toBeVisible();
    await backBtn.click();

    await page.locator('button img[alt="music"]').locator('..').click();
    await expect(page.locator('text=Một Đời')).toBeVisible();
    await backBtn.click();
    await backBtn.click();

    await page.locator('button img[alt="letter"]').locator('..').click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    const sidebarBtn = page.locator('button img[alt="sidebar"]').locator('..');
    await sidebarBtn.click();
    await expect(page.locator('button:has-text("Trang chủ")')).toBeVisible();
    await expect(page.locator('button:has-text("Sách lật PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Voice")')).toBeVisible();
    await expect(page.locator('button:has-text("Lá thư")')).toBeVisible();
    await expect(page.locator('button:has-text("Game")')).toBeVisible();
    await expect(page.locator('button:has-text("Cài đặt")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Video")')).toHaveCount(0);
    await expect(page.locator('img[alt="Thẻ tình yêu"]')).toBeVisible();

    await page.locator('button:has-text("Game")').click();
    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();
  });

  test('4. Album slide shows the PDF flipbook empty state until a document is uploaded', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    await page.locator('button img[alt="big"]').locator('..').click();
    await expect(page.locator('[aria-label="Sách lật PDF"]')).toBeVisible();
    await expect(page.locator('text=Chưa có sách PDF')).toBeVisible();
  });

  test('5. Music player UI controls and Letter typewriter + SVG heart-clipped avatars', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    await page.locator('button img[alt="music"]').locator('..').click();
    await expect(page.locator('text=Một Đời')).toBeVisible();
    await expect(page.locator('text=Love you to the saturn and back')).toBeVisible();
    await expect(page.locator('img[alt="cover"]')).toBeVisible();
    await expect(page.locator('.bg-\\[\\#8c5261\\] button')).toHaveCount(3);

    const nextBtn = page.locator('button img[src="/template/next.png"]').locator('..');
    await nextBtn.click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    await page.waitForTimeout(1200);
    await expect(page.locator('text=Hôm nay là sinh nhật anh iuuu.')).toBeVisible();
    await expect(page.locator('text=I Love Youuuuuu')).toBeVisible({ timeout: 55000 });
  });

  test('6. Card Game instructions, 3-second bounceY shuffle animation, and random card draw', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    await page.locator('button img[alt="sidebar"]').locator('..').click();
    await page.locator('button:has-text("Game")').click();

    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();
    await page.locator('button:has-text("Bắt đầu")').click();

    const cardImg = page.locator('img[alt="card-game"]');
    await expect(cardImg).toBeVisible();
    await expect(cardImg).toHaveAttribute('src', '/template/game/main.png');

    await cardImg.click();
    await expect(cardImg).toHaveClass(/animate-bounce-y/);

    await page.waitForTimeout(3300);
    await expect(cardImg).not.toHaveClass(/animate-bounce-y/);
    const finalSrc = await cardImg.getAttribute('src');
    expect(finalSrc).toMatch(/^\/template\/game\/card_\d+\.png$/);
  });

  test('7. Responsive layout check across Desktop (1440x900), Tablet (768x1024), and Mobile (390x844) + Browser Refresh reset', async ({
    page,
  }) => {
    // Desktop (1440x900) renders genuine responsive layout without legacy phone bezel
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ECARD_PATH);
    await expect(page.locator('.bg-gray-800.rounded-\\[35px\\]')).toHaveCount(0);
    await expect(page.locator('button:has-text("Bắt đầu")')).toBeVisible();

    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(desktopOverflow).toBe(false);

    // Tablet (768x1024) renders responsive layout without horizontal overflow
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(ECARD_PATH);
    await expect(page.locator('button:has-text("Bắt đầu")')).toBeVisible();
    const tabletOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(tabletOverflow).toBe(false);

    // Mobile (390x844) renders fullscreen without overflow
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ECARD_PATH);
    await expect(page.locator('button:has-text("Bắt đầu")')).toBeVisible();
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(mobileOverflow).toBe(false);

    // Unlock and then refresh -> resets to Welcome screen
    await unlockEcard(page);
    await page.reload();
    await expect(page.locator('button:has-text("Bắt đầu")')).toBeVisible();
  });

  test('8. Desktop (1440x900) keyboard PIN entry, spinning avatars, pulsing heart, and split editorial layout', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ECARD_PATH);

    const startBtn = page.locator('button:has-text("Bắt đầu")');
    await startBtn.scrollIntoViewIfNeeded();
    await startBtn.click();

    await expect(page.locator('h2:has-text("Mở khóa kỷ niệm")')).toBeVisible();

    await page.keyboard.press('9');
    await page.keyboard.press('Backspace');

    const pin = getValidPin();
    for (const digit of pin.split('')) {
      await page.keyboard.press(digit);
    }

    await expect(page.locator('text=Ngọc Khánh').first()).toBeVisible();
    await expect(page.locator('img[alt="avatar-1"]')).toHaveClass(/animate-spin-slow/);
    await expect(page.locator('img[alt="avatar-2"]')).toHaveClass(/animate-spin-slow/);
  });

  test('9. Owner Sign-In / Sign-Up (/ecd/signin/:uuid) phone input validation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/ecd/signin/8ae32098-4fc9-4787-9d79-557a03b08532');

    const input = page.locator('input[placeholder="Nhập số điện thoại"]');
    const submitBtn = page.locator('button:has-text("Đăng nhập/Đăng ký")');

    await expect(submitBtn).toBeDisabled();

    await input.fill('1234567890');
    await expect(submitBtn).toBeDisabled();

    await input.fill('0912345678');
    await expect(submitBtn).toBeEnabled();
  });

  test('10. Zalo In-App Browser Detection Modal renders when User-Agent contains Zalo', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Zalo/24.01.01',
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:5180${ECARD_PATH}`);
    await expect(page.locator('text=Chuyển trình duyệt')).toBeVisible();
    await expect(
      page.locator('text=Để có trải nghiệm tốt nhất, vui lòng mở trang web này trong trình duyệt mặc định của bạn.')
    ).toBeVisible();
    await context.close();
  });

  test('11. Unlimited immediate PIN retries: 5 consecutive wrong PINs never lock out or disable keypad', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ECARD_PATH);
    await page.locator('button:has-text("Bắt đầu")').click();
    await expect(page.locator('h2:has-text("Mở khóa kỷ niệm")')).toBeVisible();

    const wrongAttempts = ['0000', '1111', '2222', '3333', '9999'];
    for (const attempt of wrongAttempts) {
      for (const d of attempt.split('')) {
        const digitBtn = page.locator(`button:text-is("${d}")`);
        await expect(digitBtn).toBeEnabled();
        await digitBtn.click();
      }
    }

    // Immediately enter valid PIN without waiting for any cooldown timer
    const pin = getValidPin();
    for (const digit of pin.split('')) {
      const digitBtn = page.locator(`button:text-is("${digit}")`);
      await expect(digitBtn).toBeEnabled();
      await digitBtn.click();
    }

    await expect(page.locator('text=Ngọc Khánh').first()).toBeVisible();
  });

  test('12. Tablet (768x1024) navigation and slide progress dots', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await unlockEcard(page);

    // Click progress dot for Album
    await page.locator('button[aria-label="Chuyển tới mục Sách lật PDF"]').click();
    await expect(page.locator('text=Chưa có sách PDF')).toBeVisible();

    // Click progress dot for Voice
    await page.locator('button[aria-label="Chuyển tới mục Voice"]').click();
    await expect(page.locator('text=Một Đời')).toBeVisible();
  });
});
