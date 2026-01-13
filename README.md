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
Atau download ZIP dari GitHub dan extract.

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
Atau download ZIP dari GitHub dan extract.

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

## 🎯 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔍 **Smart Search** | Cari payload dengan algoritma scoring relevance |
| 📋 **One-Click Copy** | Klik sekali untuk copy payload ke clipboard |
| ⭐ **Favorites** | Simpan payload yang sering dipakai |
| ➕ **Custom Payloads** | Tambahkan payload buatan sendiri |
| 🔄 **Auto-Sync** | Update otomatis dari GitHub repository |
| 🏷️ **Categories** | Payload terorganisir berdasarkan kategori |

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
