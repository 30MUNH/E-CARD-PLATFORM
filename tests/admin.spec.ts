import { test, expect } from '@playwright/test';

test.describe('Admin E-Card Platform Dashboard, Editor & Live Preview Suite', () => {
  test('1. Dashboard Overview (/admin) renders stat cards, quick actions, and recent cards table', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');

    await expect(page.locator('h1:has-text("Tổng quan Hệ thống E-Card")')).toBeVisible();
    await expect(page.locator('text=Tổng số thiệp')).toBeVisible();
    await expect(page.locator('text=Đã xuất bản').first()).toBeVisible();
    await expect(page.locator('text=Bản nháp').first()).toBeVisible();
    await expect(page.locator('text=Đã lưu trữ').first()).toBeVisible();

    // Seeded demo cards appear in the recent cards table
    await expect(
      page.locator('text=Kỷ niệm Sinh nhật — Ngọc Khánh & Lê Hoàng Anh')
    ).toBeVisible();
    await expect(
      page.locator('text=Kỷ niệm 1 Năm Ngày Cưới — Minh Anh & Quốc Bảo')
    ).toBeVisible();
  });

  test('2. E-Card Management (/admin/cards) supports search and status filtering', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/cards');

    await expect(page.locator('h1:has-text("Quản lý Thiệp E-Card")')).toBeVisible();

    // Filter by Draft ("Bản nháp")
    await page.locator('button[role="tab"]:has-text("Bản nháp")').click();
    await expect(
      page.locator('text=Món quà Valentine — Thảo Nguyên & Gia Huy')
    ).toBeVisible();
    await expect(
      page.locator('text=Kỷ niệm Sinh nhật — Ngọc Khánh & Lê Hoàng Anh')
    ).toHaveCount(0);

    // Switch back to All ("Tất cả") and search
    await page.locator('button[role="tab"]:has-text("Tất cả")').click();
    const searchInput = page.locator('input[aria-label="Tìm kiếm thiệp"]');
    await searchInput.fill('Minh Anh');
    await expect(
      page.locator('text=Kỷ niệm 1 Năm Ngày Cưới — Minh Anh & Quốc Bảo')
    ).toBeVisible();
    await expect(
      page.locator('text=Món quà Valentine — Thảo Nguyên & Gia Huy')
    ).toHaveCount(0);
  });

  test('3. Multi-Section Card Editor (/admin/cards/new) edits all 6 sections and shows explicit integration-pending state on Publish', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/cards/new');

    // Section 1: Basic Info
    await page.locator('#ecard-title-input').fill('Thiệp Kỷ Niệm 500 Ngày Yêu');
    await page.locator('#ecard-sender-input').fill('Bảo Trâm');
    await page.locator('#ecard-recipient-input').fill('Minh Khôi');

    // Section 2: Media Upload & Ordering
    await page.locator('button[role="tab"]:has-text("2. Đa phương tiện")').click();
    await expect(page.locator('text=Album Ảnh Kỷ Niệm (3 ảnh)')).toBeVisible();
    const firstCaptionInput = page.locator('input[aria-label="Chú thích ảnh 1"]');
    await firstCaptionInput.fill('Khoảnh khắc Đà Lạt mộng mơ');

    // Section 3: Content & Letter
    await page.locator('button[role="tab"]:has-text("3. Nội dung & Thư")').click();
    await page.locator('button:has-text("Thêm đoạn thư")').click();
    await page
      .locator('textarea[aria-label="Đoạn thư 4"]')
      .fill('Cảm ơn anh vì 500 ngày tuyệt vời bên nhau!');

    // Section 4: Template & Page Ordering
    await page.locator('button[role="tab"]:has-text("4. Giao diện & Trang")').click();
    await expect(page.locator('text=Editorial Rose & Ivory')).toBeVisible();
    await page.locator('button:has-text("Editorial Rose & Ivory")').click();

    // Section 5: 4-Digit PIN Validation
    await page.locator('button[role="tab"]:has-text("5. Mã PIN 4 số")').click();
    await page.locator('#pin-input').fill('2468');
    await page.locator('#pin-confirm-input').fill('1357');
    await expect(page.locator('text=Mã PIN xác nhận chưa trùng khớp.')).toBeVisible();
    await page.locator('#pin-confirm-input').fill('2468');
    await expect(page.locator('text=✓ Mã PIN 4 số hợp lệ và đã khớp.')).toBeVisible();

    // Section 6: Publishing Controls -> Explicit Integration Pending Notice
    await page.locator('button[role="tab"]:has-text("6. Xuất bản")').click();
    await page.locator('button:has-text("Xuất Bản Thiệp (Publish)")').click();
    await expect(
      page.locator('text=Đã cập nhật trạng thái Demo — Chờ tích hợp Backend (OpenAI Codex)')
    ).toBeVisible();
  });

  test('4. Live Preview reuses EcardRenderer, switches viewports (Mobile/Tablet/Desktop), and preserves unsaved editor state on return', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/cards/new');

    // Enter unsaved custom values
    await page.locator('#ecard-title-input').fill('Thiệp Thử Nghiệm Live Preview');
    await page.locator('#ecard-sender-input').fill('Thanh Hà');
    await page.locator('#ecard-recipient-input').fill('Tuấn Kiệt');

    // Navigate to Live Preview without saving first
    await page.locator('button:has-text("Xem trước trực tiếp")').click();
    await expect(page).toHaveURL(/\/admin\/cards\/new\/preview/);

    // Verify EcardRenderer displays the unsaved couple names
    await expect(page.locator('text=Thanh Hà').first()).toBeVisible();
    await expect(page.locator('text=Tuấn Kiệt').first()).toBeVisible();

    // Switch between Desktop, Tablet, and Mobile preview frames
    await expect(page.getByTestId('preview-frame-desktop')).toBeVisible();
    await page.locator('button:has-text("Tablet")').click();
    await expect(page.getByTestId('preview-frame-tablet')).toBeVisible();
    await page.locator('button:has-text("Mobile")').click();
    await expect(page.getByTestId('preview-frame-mobile')).toBeVisible();

    // Return to Editor and confirm unsaved form state is preserved
    await page.locator('button:has-text("Quay lại chỉnh sửa")').click();
    await expect(page.locator('#ecard-title-input')).toHaveValue(
      'Thiệp Thử Nghiệm Live Preview'
    );
    await expect(page.locator('#ecard-sender-input')).toHaveValue('Thanh Hà');
    await expect(page.locator('#ecard-recipient-input')).toHaveValue('Tuấn Kiệt');
  });
});
