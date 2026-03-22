#!/bin/bash
# Backup script for Hardware Manager Database

# Đảm bảo chạy từ thư mục root của dự án
cd "$(dirname "$0")/.." || exit

echo "======================================"
echo "    HARDWARE MANAGER - DB BACKUP      "
echo "======================================"

# Kiểm tra file .env
if [ ! -f .env ]; then
  echo "[Lỗi] Không tìm thấy file .env"
  exit 1
fi

# Đọc cấu hình PostgreSQL từ .env
POSTGRES_USER=$(grep '^POSTGRES_USER=' .env | sed "s/^POSTGRES_USER=//;s/^'//;s/'$//;s/^\"//;s/\"$//")
POSTGRES_PASSWORD=$(grep '^POSTGRES_PASSWORD=' .env | sed "s/^POSTGRES_PASSWORD=//;s/^'//;s/'$//;s/^\"//;s/\"$//")
POSTGRES_DB=$(grep '^POSTGRES_DB=' .env | sed "s/^POSTGRES_DB=//;s/^'//;s/'$//;s/^\"//;s/\"$//")
POSTGRES_PORT=$(grep '^POSTGRES_PORT=' .env | sed "s/^POSTGRES_PORT=//;s/^'//;s/'$//;s/^\"//;s/\"$//")
POSTGRES_HOST=$(grep '^POSTGRES_HOST=' .env | sed "s/^POSTGRES_HOST=//;s/^'//;s/'$//;s/^\"//;s/\"$//")

# Giá trị mặc định nếu thiếu host/port
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_HOST=${POSTGRES_HOST:-localhost}

if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
  echo "[Lỗi] Cần khai báo đầy đủ POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB trong file .env"
  exit 1
fi

# Dựng lại chuỗi kết nối an toàn không chứa scheme query params
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

# Tạo thư mục backups nếu chưa tồn tại
mkdir -p backups

# Tạo file backup với timestamp tiêu chuẩn
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/db_backup_${TIMESTAMP}.sql"

echo "-> Đang kết nối database và trích xuất dữ liệu..."
# Sử dụng pg_dump với --clean --if-exists để khi restore sẽ tự động drop table cũ
pg_dump --clean --if-exists "$DATABASE_URL" -F p > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "-> Đã xuất database ra file: $BACKUP_FILE"
  echo "-> Đang nén file..."
  gzip "$BACKUP_FILE"
  echo "-> Hoàn tất! File backup của bạn: ${BACKUP_FILE}.gz"
else
  echo "[Lỗi] Không thể dump database. Vui lòng kiểm tra lại cấu hình DB hoặc pg_dump đã cài đặt chưa."
  rm -f "$BACKUP_FILE"
  exit 1
fi
