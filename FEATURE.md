# Hardware Manager - Feature Proposal & Roadmap

Tài liệu này tổng hợp các tính năng đề xuất bổ sung để hoàn thiện hệ thống Quản lý Thiết bị (Hardware Manager) đạt chuẩn **ITAM (IT Asset Management)** chuyên nghiệp.

---

## 🌟 Ưu tiên Cao (Cần thiết cho vận hành hàng ngày)

### 1. Hệ thống Yêu cầu (Helpdesk / Ticketing System)
*   **Mô tả:** Cho phép User bình thường đăng nhập vào hệ thống để tạo các Ticket (phiếu yêu cầu):
    *   Yêu cầu cấp phát máy móc, thiết bị mới.
    *   Báo hỏng thiết bị đang sử dụng.
    *   Yêu cầu cài đặt phần mềm/quyền truy cập.
*   **Giá trị:** Thao tác khép kín hoàn toàn. Admin duyệt Ticket xong sẽ link thẳng sang luồng Giao/nhận thiết bị (Assignment).

### 2. Quản lý Vật tư tiêu hao (Consumables)
*   **Mô tả:** Quản lý xuất/nhập/tồn các loại vật tư như: Mực in, Giấy in, Pin sạc...
*   **Điểm khác biệt:** Khác với Phụ kiện (chuột, phím) là mượn rồi phải trả, Vật tư tiêu hao là xuất đi thì mất đi. Cơ chế này sẽ trừ thẳng số lượng tồn kho chứ không có luồng thu hồi.

### 3. Cảnh báo Thông minh (Smart Notifications)
*   **Mô tả:** Bắn Alert tự động qua Email, Slack, Telegram gửi cho đội ngũ quản trị.
*   **Tình huống kích hoạt (Triggers):**
    *   Tên miền (Domain) hoặc Chứng chỉ SSL sắp hết hạn.
    *   Thiết bị đến lịch bảo trì định kỳ tiếp theo.
    *   Thiết bị sắp hoặc đã hết hạn bảo hành.

---

## 🚀 Ưu tiên Trung bình (Nâng tầm chuyên nghiệp)

### 4. Quản lý Địa chỉ IP & Mạng (IP Address Management - IPAM)
*   **Mô tả:** Quản lý kho dải IP (Subnets, VLANs) của hạ tầng.
*   **Giá trị:** Khi thêm mới Server, PC hay Switch, bạn có thể chọn và "khóa" 1 IP đang trống. Tránh tình trạng tranh chấp IP nội bộ và quản lý dễ dàng.

### 5. Mã vạch, QR Code & Label (Barcodes & QR Codes)
*   **Mô tả:** Mỗi tài sản/thiết bị tự động được sinh một mã QR Code định danh ngay trong CSDL.
*   **Sử dụng:** 
    *   Xuất file dán nhãn (Print Labels) hàng loạt để dán lên thiết bị.
    *   Dùng Webcam dế yêu hoặc máy đọc mã vạch quét mã QR -> mở nhanh Dashboard cập nhật trạng thái thiết bị đó.

### 6. Khấu hao Tài sản & Tài chính (Depreciation Financials)
*   **Mô tả:** Thêm thuật toán tính khấu hao (VD: Khấu hao tuyến tính 3 năm hay 5 năm).
*   **Giá trị:** Cực kỳ quan trọng để giám đốc/quản lý biết được giá trị sổ sách của một thiết bị sau N tháng sử dụng, từ đó quyết định Cấp mới - Thanh lý hợp lý.

---

## 💡 Ưu tiên Mở rộng (Kiểm soát toàn diện)

### 7. Tự động thu thập phần cứng (Agent Network Discovery)
*   **Mô tả:** Cài một chương trình (Daemon/Agent) rất nhẹ lên máy trạm Windows/Mac của nhân viên.
*   **Giá trị:** Agent định kỳ thu thập cấu hình thực tế (Dung lượng ổ cứng còn trống, dung lượng RAM, tên CPU, tài khoản OS đang login) và đẩy thông tin lên database. Loại bỏ thao tác nhập liệu cấu hình bằng tay.

### 8. Quản lý Hợp đồng (Contracts)
*   **Mô tả:** Quản lý các hợp đồng pháp lý: hợp đồng mua sỉ, thuê máy vi tính, hóa đơn internet viễn thông.
*   **Giá trị:** Liên kết 1 lô thiết bị vào một hợp đồng cụ thể để tiện đối soát tài chính khi cần.
