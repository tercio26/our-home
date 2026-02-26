# 🏡 Tổ Ấm — Hướng dẫn Deploy lên Netlify

## Cấu trúc thư mục
```
to-am/
├── index.html                  ← App chính
├── netlify.toml                ← Cấu hình Netlify
├── README.md                   ← File này
└── netlify/
    └── functions/
        └── ai.js               ← Proxy ẩn API key
```

---

## 🚀 Deploy từng bước

### Bước 1 — Tạo tài khoản Netlify
Vào https://netlify.com → Sign up miễn phí

### Bước 2 — Deploy folder
- Vào https://app.netlify.com
- Kéo thả **toàn bộ folder `to-am`** vào ô "Deploy manually"
- Netlify sẽ tự build và cấp domain dạng `random-name.netlify.app`

### Bước 3 — Thêm API Key
- Vào **Site Settings → Environment Variables**
- Nhấn **Add variable**
- Key: `ANTHROPIC_API_KEY`
- Value: `sk-ant-xxxxx...` (lấy tại https://console.anthropic.com/settings/keys)
- Nhấn **Save**

### Bước 4 — Redeploy
- Vào **Deploys → Trigger deploy → Deploy site**
- Chờ ~30 giây là xong ✅

### Bước 5 (tuỳ chọn) — Đổi domain
- Vào **Domain settings → Add custom domain**
- Nhập domain cậu muốn (vd: `toamnhaminh.com`)

---

## 💡 Lưu ý
- API key **không bao giờ lộ** ra ngoài vì được giấu trong Environment Variable
- Netlify Functions miễn phí 125,000 lần gọi/tháng
- Mỗi lần sửa file, kéo thả lại folder là deploy lại
