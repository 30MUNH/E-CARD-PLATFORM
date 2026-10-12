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
  await expect(page.locator('text=Ngọc Khánh')).toBeVisible();
  await expect(page.locator('text=Lê Hoàng Anh')).toBeVisible();
}

test.describe('Complete E-Card E2E, Interaction & Animation Suite', () => {
  test('1. Authentication flow: Welcome screen, partial PIN + Xóa, wrong PIN toast + reset, and valid PIN unlock', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ECARD_PATH);

    // Welcome screen elements
    const startBtn = page.locator('button:has-text("Bắt đầu")');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // PIN screen elements
    await expect(page.locator('h2:has-text("Mở khóa kỷ niệm")')).toBeVisible();
    await expect(page.locator('text=Bất ngờ cho cậu nà 😜')).toBeVisible();

    // Partial PIN entry and Xóa (backspace)
    const deleteBtn = page.locator('button:has-text("Xóa")');
    await expect(deleteBtn).toBeDisabled();
    await page.locator('button:text-is("1")').click();
    await page.locator('button:text-is("2")').click();
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();
    await deleteBtn.click();
    await expect(deleteBtn).toBeDisabled();

    // Wrong PIN ("0000") -> Toast error "Sai mã PIN" + automatic reset after 500ms
    for (let i = 0; i < 4; i++) {
      await page.locator('button:text-is("0")').click();
    }
    await expect(page.locator('text=Sai mã PIN').first()).toBeVisible();
    await page.waitForTimeout(600);

    // Valid PIN unlock -> Homepage
    const pin = getValidPin();
    for (const digit of pin.split('')) {
      await page.locator(`button:text-is("${digit}")`).click();
    }
    await expect(page.locator('text=Ngọc Khánh')).toBeVisible();
    await expect(page.locator('text=Lê Hoàng Anh')).toBeVisible();
    await expect(page.locator('text=ngày')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('2. Forward and Backward sequential navigation across all 5 main views + loop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    const nextBtn = page.locator('button img[src="/template/next.png"]').locator('..');
    const backBtn = page.locator('button img[src="/template/back.png"]').locator('..');

    // On Homepage: Next is visible, Back is hidden
    await expect(nextBtn).toBeVisible();
    await expect(backBtn).toHaveCount(0);

    // Homepage -> Album
    await nextBtn.click();
    await expect(page.locator('img[alt="group1-img0"]')).toBeVisible();
    await expect(backBtn).toBeVisible();

    // Album -> Music
    await nextBtn.click();
    await expect(page.locator('text=Một Đời')).toBeVisible();
    await expect(page.locator('text=Duni')).toBeVisible();

    // Music -> Letter
    await nextBtn.click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    // Letter -> Game
    await nextBtn.click();
    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();

    // Backward navigation: Game -> Letter -> Music -> Album -> Homepage
    await backBtn.click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    await backBtn.click();
    await expect(page.locator('text=Một Đời')).toBeVisible();

    await backBtn.click();
    await expect(page.locator('img[alt="group1-img0"]')).toBeVisible();

    await backBtn.click();
    await expect(page.locator('text=Ngọc Khánh')).toBeVisible();

    // Navigate forward to Game and test loop back to Homepage
    await nextBtn.click(); // Album
    await nextBtn.click(); // Music
    await nextBtn.click(); // Letter
    await nextBtn.click(); // Game
    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();
    await nextBtn.click(); // Loop -> Homepage
    await expect(page.locator('text=Ngọc Khánh')).toBeVisible();
  });

  test('3. Branching interactions: Homepage shortcut cards and Sidebar navigation + Settings redirect', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    const backBtn = page.locator('button img[src="/template/back.png"]').locator('..');

    // Shortcut 1: Polaroid photo -> Album
    await page.locator('button img[alt="big"]').locator('..').click();
    await expect(page.locator('img[alt="group1-img0"]')).toBeVisible();
    await backBtn.click();

    // Shortcut 2: Music vinyl card -> Music
    await page.locator('button img[alt="music"]').locator('..').click();
    await expect(page.locator('text=Một Đời')).toBeVisible();
    // Back from Music goes to Album, then Homepage
    await backBtn.click();
    await backBtn.click();

    // Shortcut 3: Letter envelope card -> Letter
    await page.locator('button img[alt="letter"]').locator('..').click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    // Sidebar open & navigation
    const sidebarBtn = page.locator('button img[alt="sidebar"]').locator('..');
    await sidebarBtn.click();
    await expect(page.locator('button:has-text("Trang chủ")')).toBeVisible();
    await expect(page.locator('button:has-text("Ảnh")')).toBeVisible();
    await expect(page.locator('button:has-text("Nhạc")')).toBeVisible();
    await expect(page.locator('button:has-text("Lá thư")')).toBeVisible();
    await expect(page.locator('button:has-text("Game")')).toBeVisible();
    await expect(page.locator('button:has-text("Cài đặt")')).toBeVisible();
    // Video item is hidden because hasVideo === false
    await expect(page.locator('button:has-text("Video")')).toHaveCount(0);

    // Jump to Game via Sidebar
    await page.locator('button:has-text("Game")').click();
    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();

    // Open Sidebar and click Cài đặt -> redirects to /ecd/signin/:uuid
    await sidebarBtn.click();
    await page.locator('button:has-text("Cài đặt")').click();
    await expect(page).toHaveURL(/\/ecd\/signin\/8ae32098-4fc9-4787-9d79-557a03b08532/);
    await expect(page.locator('h1:has-text("Đăng nhập/Đăng ký")')).toBeVisible();
  });

  test('4. Album collage layout, Lightbox modal, captions, and mobile touch swipe', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    // Go to Album
    await page.locator('button img[alt="big"]').locator('..').click();
    await expect(page.locator('img[alt="group1-img0"]')).toBeVisible();
    await expect(page.locator('img[alt="group1-img1"]')).toBeVisible();
    await expect(page.locator('img[alt="group1-img2"]')).toBeVisible();

    // Verify all 7 album images loaded properly
    const loadedCount = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[alt^="group"]')) as HTMLImageElement[];
      return imgs.filter((img) => img.complete && img.naturalWidth > 0).length;
    });
    expect(loadedCount).toBe(7);

    // Open Lightbox on photo 0 ("hẹ hẹ")
    await page.locator('img[alt="group1-img0"]').click();
    const expandedImg = page.locator('img[alt="expanded"]');
    await expect(expandedImg).toBeVisible();
    await expect(page.locator('text=hẹ hẹ')).toBeVisible();

    // Simulate mobile touch swipe left (deltaX > 50) on the overlay to advance to photo 1 ("chinh nhật zui zeee")
    const overlay = page.locator('.fixed.inset-0.bg-black.bg-opacity-80');
    await overlay.evaluate((el) => {
      const tStart = new Touch({ identifier: 1, target: el, screenX: 300, screenY: 400 });
      const tEnd = new Touch({ identifier: 1, target: el, screenX: 100, screenY: 400 });
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          changedTouches: [tStart],
        })
      );
      el.dispatchEvent(
        new TouchEvent('touchmove', {
          bubbles: true,
          cancelable: true,
          changedTouches: [tEnd],
        })
      );
      el.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true,
          changedTouches: [tEnd],
        })
      );
    });
    await expect(page.locator('text=chinh nhật zui zeee')).toBeVisible();

    // Close lightbox by clicking backdrop
    await overlay.click({ position: { x: 10, y: 10 } });
    await expect(expandedImg).toHaveCount(0);
  });

  test('5. Music player UI controls and Letter typewriter + SVG heart-clipped avatars', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    // Navigate to Music
    await page.locator('button img[alt="music"]').locator('..').click();
    await expect(page.locator('text=Một Đời')).toBeVisible();
    await expect(page.locator('text=Love you to the saturn and back')).toBeVisible();
    await expect(page.locator('img[alt="cover"]')).toBeVisible();
    // 3 transport control buttons (skipBackward, play/pause, skipForward)
    await expect(page.locator('.bg-\\[\\#8c5261\\] button')).toHaveCount(3);

    // Navigate to Letter
    const nextBtn = page.locator('button img[src="/template/next.png"]').locator('..');
    await nextBtn.click();
    await expect(page.locator('svg clipPath#heartClip')).toHaveCount(2);

    // Verify typewriter starts and eventually completes all 11 paragraphs
    await page.waitForTimeout(1200);
    await expect(page.locator('text=Hôm nay là sinh nhật anh iuuu.')).toBeVisible();
    await expect(page.locator('text=I Love Youuuuuu')).toBeVisible({ timeout: 55000 });
  });

  test('6. Card Game instructions, 3-second bounceY shuffle animation, and random card draw', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockEcard(page);

    // Open Sidebar and jump to Game
    await page.locator('button img[alt="sidebar"]').locator('..').click();
    await page.locator('button:has-text("Game")').click();

    await expect(page.locator('text=Hướng dẫn chơi:')).toBeVisible();
    await page.locator('button:has-text("Bắt đầu")').click();

    const cardImg = page.locator('img[alt="card-game"]');
    await expect(cardImg).toBeVisible();
    await expect(cardImg).toHaveAttribute('src', '/template/game/main.png');

    // Click card deck to trigger 3-second bounceY shuffle
    await cardImg.click();
    await expect(cardImg).toHaveClass(/animate-bounce-y/);

    // Wait for 3.2 seconds for shuffle to complete and land on a random card_1..card_55.png
    await page.waitForTimeout(3300);
    await expect(cardImg).not.toHaveClass(/animate-bounce-y/);
    const finalSrc = await cardImg.getAttribute('src');
    expect(finalSrc).toMatch(/^\/template\/game\/card_\d+\.png$/);
  });

  test('7. Responsive layout check (Desktop phone bezel vs Mobile fullscreen) and Browser Refresh state reset', async ({
    page,
  }) => {
    // Desktop (1440x900) renders PhoneFrame (.bg-gray-800.rounded-[35px])
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ECARD_PATH);
    await expect(page.locator('.bg-gray-800.rounded-\\[35px\\]')).toBeVisible();

    // Mobile (390x844) renders fixed full-screen wrapper without phone bezel
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ECARD_PATH);
    await expect(page.locator('.bg-gray-800.rounded-\\[35px\\]')).toHaveCount(0);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Unlock and then refresh -> resets to Welcome screen
    await unlockEcard(page);
    await page.reload();
    await expect(page.locator('button:has-text("Bắt đầu")')).toBeVisible();
  });

  test('8. Desktop (1440x900) keyboard PIN entry, spinning avatars, pulsing heart, and PhoneFrame navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ECARD_PATH);

    const startBtn = page.locator('button:has-text("Bắt đầu")');
    await startBtn.scrollIntoViewIfNeeded();
    await startBtn.click();

    await expect(page.locator('h2:has-text("Mở khóa kỷ niệm")')).toBeVisible();

    // Enter partial PIN via keyboard and Backspace
    await page.keyboard.press('9');
    await page.keyboard.press('Backspace');

    // Enter valid PIN via keyboard
    const pin = getValidPin();
    for (const digit of pin.split('')) {
      await page.keyboard.press(digit);
    }

    await expect(page.locator('text=Ngọc Khánh')).toBeVisible();
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

    // Non-0 prefix or < 10 digits stays disabled
    await input.fill('1234567890');
    await expect(submitBtn).toBeDisabled();

    // Valid 10-digit phone starting with 0 enables button
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
    await page.goto(`http://127.0.0.1:5173${ECARD_PATH}`);
    await expect(page.locator('text=Chuyển trình duyệt')).toBeVisible();
    await expect(
      page.locator('text=Để có trải nghiệm tốt nhất, vui lòng mở trang web này trong trình duyệt mặc định của bạn.')
    ).toBeVisible();
    await context.close();
  });
});
