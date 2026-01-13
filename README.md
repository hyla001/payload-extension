# 🛡️ LUHUT BINSHAR - Payload Extension

> **Payload management extension untuk security testing.** Kumpulan payload siap pakai untuk pentester & bug hunter.

---

## 📦 Cara Install Extension

### 🌐 Google Chrome / Chromium / Brave / Edge

<details>
<summary><b>📖 Klik untuk lihat langkah-langkah (dengan gambar)</b></summary>

#### Langkah 1: Download Extension
```bash
git clone https://github.com/hyla001/payload-extension.git
```
Atau [**download ZIP dari GitHub**](https://github.com/hyla001/payload-extension/archive/refs/heads/main.zip) dan extract.

> 💡 **Note:** Kamu hanya perlu download repo ini saja! Payload akan otomatis di-sync dari [luhut-binshar](https://github.com/hyla001/luhut-binshar) repository.

#### Langkah 2: Buka Halaman Extensions
- Ketik di address bar: `chrome://extensions`
- Atau klik **Menu (⋮)** → **More Tools** → **Extensions**

#### Langkah 3: Aktifkan Developer Mode
- Cari toggle **"Developer mode"** di pojok kanan atas
- **Aktifkan** toggle tersebut (geser ke kanan)

#### Langkah 4: Load Extension
- Klik tombol **"Load unpacked"** yang muncul
- Pilih folder `payload-extension` yang sudah di-download
- Klik **Select Folder**

#### Langkah 5: Selesai! ✅
- Extension akan muncul di toolbar browser
- Klik icon extension untuk mulai menggunakan

</details>

---

### 🦊 Mozilla Firefox

<details>
<summary><b>📖 Klik untuk lihat langkah-langkah</b></summary>

#### Langkah 1: Download Extension
```bash
git clone https://github.com/hyla001/payload-extension.git
```
Atau [**download ZIP dari GitHub**](https://github.com/hyla001/payload-extension/archive/refs/heads/main.zip) dan extract.

> 💡 **Note:** Kamu hanya perlu download repo ini saja! Payload akan otomatis di-sync dari [luhut-binshar](https://github.com/hyla001/luhut-binshar) repository.

#### Langkah 2: Buka Halaman Debugging
- Ketik di address bar: `about:debugging#/runtime/this-firefox`

#### Langkah 3: Load Extension
- Klik tombol **"Load Temporary Add-on..."**
- Navigate ke folder `payload-extension`
- Pilih file **`manifest.json`**
- Klik **Open**

#### Langkah 4: Selesai! ✅
- Extension akan muncul di toolbar
- ⚠️ **Catatan:** Extension temporary akan hilang saat Firefox ditutup

</details>

---

## ⚡ Quick Start (TL;DR)

| Browser | Langkah Cepat |
|---------|---------------|
| **Chrome** | `chrome://extensions` → Enable Developer Mode → Load unpacked → Pilih folder |
| **Firefox** | `about:debugging` → Load Temporary Add-on → Pilih `manifest.json` |

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   📦 payload-extension          📂 luhut-binshar                │
│   (Download this!)              (Auto-synced)                   │
│   ─────────────────             ──────────────                  │
│   • Browser extension           • Payload database (JSON)       │
│   • User interface              • XSS, SQLi, SSRF, etc.        │
│   • Settings & favorites        • Updated regularly            │
│                                                                  │
│              ┌──────────────────────────────────┐               │
│   Extension ──│  Sync via GitHub Raw URL       │── Payloads    │
│              └──────────────────────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 💡 Apa yang Perlu Kamu Download?

| Repo | Perlu Download? | Keterangan |
|------|-----------------|------------|
| **payload-extension** | ✅ **YA** | Install ini di browser kamu |
| **luhut-binshar** | ❌ **TIDAK** | Auto-sync dari extension |

### 🔄 Update Flow

1. **Developer** update payload di `luhut-binshar`
2. **Developer** push ke GitHub
3. **User** klik **Sync** di extension
4. **User** dapat payload terbaru! ✨

> 💡 **Note:** Kamu tidak perlu download ulang extension untuk mendapatkan payload baru. Cukup klik Sync!

---

## 🎯 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔍 **Smart Search** | Cari payload dengan algoritma scoring relevance |
| 📋 **One-Click Copy** | Klik sekali untuk copy payload ke clipboard |
| ⭐ **Favorites** | Simpan payload yang sering dipakai |
| ➕ **Custom Payloads** | Tambahkan payload buatan sendiri |
| 🗑️ **Hide Payloads** | Sembunyikan payload yang tidak dibutuhkan |
| 🔄 **Auto-Sync** | Update otomatis dari GitHub repository |
| 🎨 **Theme Toggle** | Dark & Light mode |
| 📐 **Resize Popup** | Small, Medium, Large size options |
| ⚡ **Cache-First** | Instant load, background sync |

---

## 📚 Payload Categories

| Category | Jumlah | Kegunaan |
|----------|--------|----------|
| 💉 **XSS** | 25+ | Cross-Site Scripting |
| 🗄️ **SQLi** | 25+ | SQL Injection |
| 🌐 **SSRF** | 15+ | Server-Side Request Forgery |
| 📁 **LFI** | 13+ | Local File Inclusion |
| 📡 **RFI** | 8+ | Remote File Inclusion |
| 💻 **CMDi** | 16+ | Command Injection |
| 🔧 **SSTI** | 13+ | Server-Side Template Injection |
| ↪️ **Open Redirect** | 10+ | Open Redirect |
| 🔐 **CSRF** | 9+ | Cross-Site Request Forgery |
| 🔓 **2FA Bypass** | 20+ | Two-Factor Authentication Bypass |
| 🛡️ **WAF Bypass** | 25+ | Web Application Firewall Bypass |

---

## 🔧 Troubleshooting

<details>
<summary><b>❌ Extension tidak muncul di toolbar?</b></summary>

1. Klik icon **puzzle** (Extensions) di toolbar
2. Cari "LUHUT BINSHAR"
3. Klik icon **pin** untuk pin ke toolbar

</details>

<details>
<summary><b>❌ Error saat load extension?</b></summary>

1. Pastikan folder yang dipilih berisi file `manifest.json`
2. Cek apakah Developer Mode sudah aktif
3. Coba restart browser dan ulangi langkah-langkah

</details>

<details>
<summary><b>❌ Payload tidak muncul?</b></summary>

1. Cek koneksi internet
2. Klik tombol refresh/sync di extension
3. Pastikan GitHub repository accessible

</details>

---

## 📄 License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

> **For authorized security testing only.**
> 
> Extension ini dibuat untuk keperluan security testing yang sah. Penggunaan untuk aktivitas ilegal sepenuhnya menjadi tanggung jawab pengguna. Selalu dapatkan izin tertulis sebelum melakukan penetration testing.

---

## 🤝 Contributing

Pull requests are welcome! Untuk perubahan major, silakan buka issue dulu untuk diskusi.

## 📞 Contact

- GitHub: [@hyla001](https://github.com/hyla001)
