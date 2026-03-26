#!/bin/bash
# Restore script for Hardware Manager Database

# Đảm bảo chạy từ thư mục root của dự án
cd "$(dirname "$0")/.." || exit

echo "======================================"
echo "    HARDWARE MANAGER - DB RESTORE     "
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

# Lấy argument truyền vào (nếu có)
USER_SELECTED_FILE=$1

# Nếu người dùng không chỉ định file nào
if [ -z "$USER_SELECTED_FILE" ]; then
  # Đếm thư mục backups xem có bao nhiêu file .sql.gz
  shopt -s nullglob
  BACKUP_FILES=(backups/*.sql.gz)
  shopt -u nullglob
  
  FILE_COUNT=${#BACKUP_FILES[@]}

  if [ $FILE_COUNT -eq 0 ]; then
    echo "[Lỗi] Không tìm thấy file backup nào trong thư mục 'backups/'."
    exit 1
  elif [ $FILE_COUNT -eq 1 ]; then
    SELECTED_FILE="${BACKUP_FILES[0]}"
    echo "-> Tìm thấy duy nhất 1 file backup. Tiến hành khôi phục từ: $SELECTED_FILE"
  else
    echo "[Thông báo] Có nhiều file backup trong hệ thống:"
    for i in "${!BACKUP_FILES[@]}"; do
      echo "  $((i+1)). ${BACKUP_FILES[$i]}"
    done
    echo ""
    echo "[Yêu cầu] Vui lòng chỉ định một file cụ thể để khôi phục."
    echo "Cách dùng: ./scripts/restore.sh <đường_dẫn_tới_file_được_chọn>"
    echo "Ví dụ: ./scripts/restore.sh backups/db_backup_20240101_120000.sql.gz"
    exit 1
  fi
else
  SELECTED_FILE=$USER_SELECTED_FILE
fi

if [ ! -f "$SELECTED_FILE" ]; then
  echo "[Lỗi] Không tìm thấy file: $SELECTED_FILE"
  exit 1
fi

echo "-> Chọn file backup: $SELECTED_FILE"
echo "-> Đang giải nén file..."

EXTRACTED_FILE="${SELECTED_FILE%.gz}"
# Giải nén mà không làm mất file gốc .gz (dùng gunzip -c)
gunzip -c "$SELECTED_FILE" > "$EXTRACTED_FILE"

echo "-> Đang khôi phục dữ liệu vào Server... (quá trình này có thể mất vài phút)"
psql "$DATABASE_URL" -f "$EXTRACTED_FILE" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "-> Khôi phục cơ sở dữ liệu hoàn tất thành công!"
else
  echo "[Lỗi] Quá trình khôi phục gặp sự cố. Bạn vui lòng coi lại log."
fi

# Dọn dẹp file trung gian
echo "-> Dọn dẹp file tạm..."
rm -f "$EXTRACTED_FILE"
echo "-> XONG!"
