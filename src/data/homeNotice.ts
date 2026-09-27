/**
 * 📢 BẢNG QUẢN LÝ THÔNG BÁO TRANG CHỦ (HOME NOTICE CONFIG)
 * 
 * ═════════════════════════════════════════════════════════════════════
 * 👉 HƯỚNG DẪN DÀNH CHO BẠN KHI MUỐN CẬP NHẬT THÔNG BÁO:
 * 1. isEnabled: Đặt là `true` để hiển thị, hoặc `false` nếu muốn tạm ẩn bảng thông báo.
 * 2. title: Tiêu đề của thông báo (VD: "Bản tin cập nhật Bot & Trạng thái").
 * 3. updatedDate: Ngày bạn sửa thông báo (VD: "26/09/2026").
 * 4. items: Danh sách từng dòng thông báo. Bạn có thể thêm/xóa/sửa các dòng bên dưới:
 *    - badge: Nhãn nổi bật (VD: 'Đang Fix', 'Khóa Link', 'Mới Ra Mắt', 'Lưu Ý', 'Bảo Trì')
 *    - badgeType: 'warning' (vàng cam), 'danger' (đỏ hồng), 'info' (xanh), 'pink' (hồng)
 *    - content: Nội dung chi tiết (ghi rõ char nào đang sửa, char nào mở khóa, prompt thay đổi gì...)
 * 5. footerNote: Ghi chú nhắn nhủ nhỏ ở chân bảng (tùy chọn).
 * ═════════════════════════════════════════════════════════════════════
 */

export interface NoticeItem {
  id: string;
  badge: string;
  badgeType: 'warning' | 'danger' | 'info' | 'pink';
  content: string;
}

export interface HomeNoticeConfig {
  isEnabled: boolean;
  title: string;
  updatedDate: string;
  items: NoticeItem[];
  footerNote?: string;
}

export const homeNoticeConfig: HomeNoticeConfig = {
  // Bật/tắt thông báo tại đây: true = hiện, false = ẩn
  isEnabled: true,

  // Tiêu đề bảng thông báo
  title: 'News update 𝜗ৎ',

  // Ngày cập nhật
  updatedDate: 'Cập nhật hôm nay',

  // Danh sách các thông báo cụ thể (nàng tự thêm/sửa/xóa các dòng ở đây nhé):
  items: [
    {
      id: 'notice-1',
      badge: 'Đang Fix Link',
      badgeType: 'warning',
      content: 'Một số char đang được cập nhật link và tinh chỉnh prompt xử lý xưng hô, nàng chờ xíu nhé.',
    },
    {
      id: 'notice-2',
      badge: 'Tạm Khóa Link',
      badgeType: 'danger',
      content: 'Chu Vãn Thanh & một số bot đang tạm khóa link để bổ sung thêm lorebook và kịch bản chi tiết.',
    },
    {
      id: 'notice-3',
      badge: 'Mới Cập Nhật',
      badgeType: 'pink',
      content: 'Đã hoàn thiện hệ thống Forum Tám Zai, bảo vệ tranh vẽ bản quyền cấm feed AI, và nâng cấp hiệu ứng tuyết rơi lấp lánh.',
    },
  ],

  // Dòng nhắn nhủ ở cuối (có thể để trống '' nếu không cần)
  footerNote: '♡ Nàng phát hiện lỗi hoặc cần yêu cầu thêm char có thể ghé mục Feedback hoặc Forum nha!',
};
