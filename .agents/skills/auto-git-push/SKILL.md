---
name: auto-git-push
description: Tự động kiểm tra, tạo commit và đẩy toàn bộ mã nguồn lên GitHub (origin main) sau khi hoàn thành mọi nhiệm vụ trong workspace.
---

# Quy trình tự động đẩy mã nguồn lên GitHub (Auto Git Push)

Quy trình này BẮT BUỘC thực hiện ở bước cuối cùng của MỖI lượt xử lý có thay đổi mã nguồn trước khi báo cáo kết quả cho người dùng.

## Các bước thực hiện:

1. **Kiểm tra biên dịch / Type check trước khi commit**:
   ```powershell
   npx tsc --noEmit
   ```
   Chỉ tiếp tục nếu mã thoát là `0` (không có lỗi).

2. **Kiểm tra các tệp đã thay đổi**:
   ```powershell
   git status -s
   ```
   Xác định đúng các file được sửa đổi/tạo mới trong phạm vi yêu cầu.

3. **Stage và tạo commit chuẩn Conventional Commits**:
   ```powershell
   git add <danh-sách-tệp-thay-đổi>
   git commit -m "<type>(<scope>): <mô-tả-ngắn-gọn>"
   ```
   Ví dụ:
   - `feat(games): add duck race and ufo abduction`
   - `fix(wheel): optimize canvas performance with offscreen disc`

4. **Đẩy mã nguồn lên kho lưu trữ từ xa GitHub**:
   ```powershell
   git push origin main
   ```

5. **Xác nhận kết quả**:
   - Kiểm tra output của `git push` để đảm bảo nhánh `main` trên GitHub đã được cập nhật (`[main] ... -> main`).
   - Báo cáo rõ ràng mã hash commit và trạng thái đẩy GitHub trong phản hồi cuối.
