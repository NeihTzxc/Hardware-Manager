# Hướng Dẫn Sử Dụng - Hardware Manager

Chào mừng bạn đến với **Hardware Manager**, hệ thống phần mềm quản lý tài sản phần cứng và IT được thiết kế để theo dõi, quản trị vòng đời thiết bị, quản lý phần mềm/license và hỗ trợ giải quyết các yêu cầu nội bộ một cách nhanh chóng, minh bạch.

Tài liệu này mong muốn cung cấp chi tiết cách sử dụng các tính năng quan trọng trong phần mềm dành cho cả vai trò **Người dùng (User)** và **Quản trị viên (Admin)**.

---

## Mục Lục
1. [Khởi đầu và Tổng quan](#1-khởi-đầu-và-tổng-quan)
2. [Quản lý Tài sản (Thiết bị, Linh kiện, Phụ kiện)](#2-quản-lý-tài-sản-thiết-bị-linh-kiện-phụ-kiện)
3. [Quản lý Mượn / Trả (Assignment)](#3-quản-lý-mượn--trả-assignment)
4. [Tài sản Số (Phần mềm & Hạ tầng Web)](#4-tài-sản-số-phần-mềm--hạ-tầng-web)
5. [Hệ thống Hỗ trợ / Yêu cầu (Ticketing System)](#5-hệ-thống-hỗ-trợ--yêu-cầu-ticketing-system)
6. [Lịch sử Hoạt động & Cài đặt (Dành cho Admin)](#6-lịch-sử-hoạt-động--cài-đặt-dành-cho-admin)

---

## 1. Khởi đầu và Tổng quan

### Bảng điều khiển (Dashboard)
Khi mới đăng nhập thành công vào hệ thống, màn hình đầu tiên hiển thị là **Dashboard**:
- Hệ thống tóm tắt nhanh chi tiết tổng số thiết bị, số linh/phụ kiện có trong kho, số lượng đang được mượn/chuyển giao và danh sách các lỗi / yêu cầu đang cần được theo dõi.
- **Biểu đồ thống kê** (nếu có biểu đồ trực quan hóa dữ liệu) giúp có cái nhìn tổng quan về tình trạng tài nguyên kỹ thuật của toàn công ty.

### Menu định hướng (Sidebar)
Thanh công cụ bên trái (Sidebar) tích hợp đầy đủ tính năng:
- **Người dùng thường (User)**: Sẽ nhìn thấy những tài sản họ được bàn giao, cùng chức năng yêu cầu hỗ trợ.
- **Quản trị viên (Admin/Support)**: Mở khóa các modules điều chỉnh cấu hình toàn cầu (Settings), nhập file Excel, gán thiết bị theo lô và quyền duyệt/đóng luồng hỗ trợ (Tickets).

---

## 2. Quản lý Tài sản (Thiết bị, Linh kiện, Phụ kiện)

Hardware Manager phân tách tài sản ra ba danh mục cốt lõi:
- **Quản lý thiết bị**: Máy tính xách tay, Màn hình, Máy in, Máy chủ (Server), vv. (Các trang thiết bị có Serial định danh / giá trị lớn).
- **Linh kiện**: RAM, Ổ cứng, Card đồ hoạ,...(Các bộ phận sẽ được lắp đặt TRỰC TIẾP vào một Cỗ máy / Thiết bị cụ thể).
- **Phụ kiện**: Chuột, Bàn phím, Dây cáp,... (Các dụng cụ nhỏ có thể tracking theo định mức TỔNG SỐ LƯỢNG).

### 2.1. Quản lý Thiết bị (Devices)
- Phân mục này cho phép Admin **Thêm thiết bị** cấp phát mới (Gắn Serial, ấn định Model / Thương hiệu).
- Phím tắt **Quản lý Import**: Admin có thể tải template `.xlsx` -> điền danh sách trăm thiết bị và bấm upload thay vì phải thêm mới thủ công từng cái một.
- Trạng thái thiết bị tự động cập nhật:
  - **Available (Sẵn sàng)**: Đang rảnh trong kho.
  - **In Use (Đang sử dụng)**: Đã bàn giao cho nhân viên mượn.
  - **Maintenance (Bảo trì)** hoặc **Retired (Thanh lý)**.

### 2.2. Danh mục (Categories)
- Admin sẽ vào mục này để nhóm các loại tài sản theo "Loại phần cứng". (VD Tạo 1 danh mục "Laptop" chứa mọi loại thiết bị là MacBook hoặc Dell XPS).
  
---

## 3. Quản lý Mượn / Trả (Assignment)
Tiến trình ghi danh nhân sự với thiết bị:
- Khi một nhân viên mới (Onboarding) cần cấp phần cứng, Admin sử dụng chức năng **Quản lý mượn trả**. 
- Hệ thống hỗ trợ tích hợp in biên bản thoả thuận **Biểu mẫu In (Print Templates)**. 
- Tại mốc thời gian nhân viên trả thiết bị, Admin thực hiện lệnh thu hồi, sau đó xác nhận lại tình trạng (Đổi từ Tốt sang Hỏng hóc nếu có).

---

## 4. Tài sản Số (Phần mềm & Hạ tầng Web)
Không chỉ giới hạn trong mảng phần cứng vật lý, hệ thống hỗ trợ cả Tài sản cấu hình số:

### 4.1. Phần mềm & License (Software)
- Quản lý các mã License Code của phần mềm (Như bản quyền JetBrains, Adobe Creative Cloud, Office 365...).
- Tracking nhân viên nào đang giữ chỗ (Seats) đối với loại License đặc thù đó.
- Nhận cảnh báo kỳ đăng ký (Subscription) tiếp theo để có lịch gia hạn.

### 4.2. Hạ tầng Web (Domains & SSL)
- Bảng danh sách trực quan của tất cả Domain name và file Certificate SSL đang sở hữu.
- Trạng thái hiển thị bao gồm mốc hết hạn bảo mật SSL, phòng ngừa sự cố sập website.

---

## 5. Hệ thống Hỗ trợ / Yêu cầu (Ticketing System)
Tính năng then chốt giúp tự động hóa quy trình hỗ trợ nội bộ. 

### 5.1. Dành cho Người Dùng (User)
1. **Gửi yêu cầu**: Bấm vào tab "Hỗ trợ / Yêu cầu". Chọn **Tạo Yêu cầu**. Tại đây cung cấp mô tả vắn tắt, mức độ Khẩn cấp và tùy chọn *Đính kèm tag về tài sản đang bị sự cố*. (Ví dụ: Tag cái Laptop hiện tại và báo lỗi RAM xanh).
2. **Theo dõi trạng thái**: Kiểm tra Ticket đang ở trạng thái "**Mở - Open**" hay "**Đang xử lý - In Progress**".
3. **Thảo luận (Comment)**: Khi bộ phận IT cần hỏi thêm thông tin hoặc bạn muốn báo cáo tiến độ, hãy trực tiếp gửi thêm bình luận tại màn hình chi tiết. 

### 5.2. Dành cho Ban Support / Admin
1. **Phân loại**: Ngay khi tiếp nhận được Ticket, Admin có quyền xếp hạng, xác nhận thay đổi Trạng Thái (Thành Đã xử lý / Đã đóng).
2. **Trả lời và Tương tác nội bộ**: 
   - Admin có khả năng đối thoại song phương trực tiếp vào luồng Message của Ticket đó. 
   - Hỗ trợ công cụ "**Ghi chú nội bộ (Internal Note)**". Chỉ những người trong ban Support Administration mới có thể đọc được ghi chú mang tích đặc thù này phục vụ mục đích kiểm điểm lỗi ẩn hoặc logs kỹ thuật.

---

## 6. Lịch sử Hoạt động & Cài đặt (Dành cho Admin)

- **Lịch sử hoạt động (Audit Logs)**: Bảng ghi chép điện tử bất biến. Mọi thao tác Thêm, Sửa, Xóa hay mượn trả tài sản của mọi user (hoặc kể cả admin) sẽ được log lại theo khung thời gian nhằm mục đích Review và xử trí rủi ro. Không ai có thể gian lận việc xóa thiết bị.
- **Cấu hình Notification & Cài đặt hệ thống**: Tại đây, người chủ hệ thống sẽ thiết lập các hàm kết nối API gửi thông báo qua Slack, Email hoặc Tele. Cấu hình mật khẩu, phân quyền users thành các Roles khác nhau.

---

*Lưu ý: Tài liệu hướng dẫn sử dụng và nền tảng vẫn không ngừng được cập nhật. Nếu bạn gặp bất kỳ sự cố hay lỗi kỹ thuật nào trong quá trình thao tác với Hardware Manager, xin hãy cân nhắc tận dụng ngay tính năng "Ticket" để yêu cầu kĩ thuật viên xử lý sớm. Xin cảm ơn!*
