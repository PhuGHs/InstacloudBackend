
# Giới thiệu ứng dụng

Ứng dụng mạng xã hội tích hợp Lucene là một nền tảng mạng xã hội đa nhiệm, hỗ trợ cộng đồng người dùng kết nối, chia sẻ thông tin và khám phá nội dung thông qua khả năng tìm kiếm nhanh chóng của Lucene.
    
**Các chức năng mà ứng dụng hỗ trợ**

- Đăng nhập / Đăng ký tài khoản
- Quên mật khẩu
- Thiết lập tài khoản
    - Chỉnh sửa cài đặt thông báo
    - Đổi mật khẩu
- Quản lý trang cá nhân
    - Xem danh sách các bài viết đã được lưu
    - Quản lý ảnh và video
    - Cập nhật thông tin cá nhân
    - Quản lý người theo dõi
- Quản lý bài viết
    - Tạo một bài viết mới
    - Chỉnh sửa bài viết
    - Lưu bài viết
    - Xoá bài viết
    - Chia sẻ bài viết
- Quản lý bình luận của bài viết
    - Bình luận một bài viết
    - Xoá và chỉnh sửa bình luận của mình
- Quản lý thông báo
    - Thêm thông báo
    - Đánh dấu thông báo đã được đọc
- Quản lý cuộc trò chuyện
    - Gửi tin nhắn (text, ảnh)
    - Gọi Audio
    - Gọi Video
    - Tìm kiếm cuộc trò chuyện
    - Xem danh sách các cuộc trò chuyện
- Quản lý ảnh và video cá nhân
- Tìm kiếm bài viết và người dùng



## Một số màn hình trong ứng dụng
- Màn hình chính của ứng dụng
![man-hinh-chinh](https://res.cloudinary.com/daszajz9a/image/upload/v1703568046/project/man-hinh-chinh_robynq.png)

- Màn hình cuộc trò chuyện
![man-hinh-cuoc-tro-chuyen](https://res.cloudinary.com/daszajz9a/image/upload/v1703568046/project/man-hinh-tin-nhan_afyyma.png)

- Màn hình trang cá nhân
![man-hinh-trang-ca-nhan](https://res.cloudinary.com/daszajz9a/image/upload/v1703568047/project/man-hinh-trang-ca-nhan_nwvbpu.png)

- Màn hình cài đặt
![man-hinh-cai-dat](https://res.cloudinary.com/daszajz9a/image/upload/v1703568046/project/man-hinh-cai-dat_wwbxbq.png)
## Hướng dẫn cài đặt
Đầu tiên, để chạy được ứng dụng, ta cần phải cài Node.js. Ta có thể tải ở đường link sau: https://nodejs.org/en/download/current

Sau khi cài đặt thành công, ta tiến hành cài đặt Redis ở đường link https://github.com/tporadowski/redis/releases và chọn Redis-x64-5.0.14.1.msi để cài đặt như hình bên dưới.

Tiếp theo, ta tiến hành tải mã nguồn của server và client về máy bằng cách dùng lệnh git clone:

`Git clone https://github.com/PhuGHs/InstacloudBackend.git`

`Git clone https://github.com/hungcqa23/social_media_pj1.git`

Ta vào từng thư mục chứa mã nguồn, chạy lệnh `npm install` để cài các phụ thuộc. Ngoài ra, ta cần cài file môi trường ở đường link sau [File cài đặt env](https://drive.google.com/file/d/1TPdHg83KjrE9brkX59MMk7r8BiunKcuD/view?usp=sharing)

Sau khi cài xong, ta cần đặt file vừa cài vào thư mục project như trong hình bên dưới

![anh minh hoa](https://res.cloudinary.com/daszajz9a/image/upload/v1703567323/anh_minh_hoa_project_mqnjc8.png)

Cuối cùng, ta sử dụng command line chạy lệnh `npm run dev` để chạy ứng dụng.

## Demo

Link video demo ứng dụng: https://youtu.be/65X2_xbM0Po
