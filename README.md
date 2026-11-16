# 🚀 Qyro Labs ($QYRO) Daily Airdrop Automation Bot

Sistem otomasi lengkap untuk mengerjakan seluruh tugas airdrop **Qyro Labs** secara otomatis, termasuk login email OTP, daily loot drop, arena battle, misi social media, setup wallet SOL & EVM, serta scheduler 24 jam.

> 🏷 **Rewards**: $QYRO (Confirmed)  
> ➡️ **Official Website**: [https://qyrolabs.space](https://qyrolabs.space)  
> 📖 **Official Source**: [X / Twitter Announcement](https://x.com/QyroLabsofc/status/2120861950351437933)

---

## 🌟 Fitur Utama (Features)

1. **🔐 Email OTP Authentication (Supabase Web3 Auth)**
   - Login interaktif langsung dari terminal: bot mengirimkan kode OTP 6-digit ke email Anda.
   - Menyimpan session token ke `accounts.json` secara aman.
   - Auto-refresh token ketika access token kadaluarsa tanpa perlu login ulang.

2. **🎁 Claim Daily Loot Drop (300 – 1.000 XP)**
   - Membuka kotak loot drop harian otomatis setiap 24 jam.
   - Mendeteksi cooldown countdown jika kotak loot sedang recharging.

3. **⚔️ Daily Star Dogfight Arena (+1.000 XP)**
   - Simulasi pertarungan arena ruang angkasa (durasi 30+ detik, kill counter acak).
   - Otomatis klaim hadiah arena +1.000 XP harian.

4. **💼 Setup Profile (+1.000 XP)**
   - Menghubungkan alamat wallet **Solana (SOL)** & **Ethereum (EVM)** serta Display Name.
   - Mendukung input wallet sendiri atau auto-generate wallet baru yang valid jika Anda ingin multi-akun (sybil farming).

5. **🎯 Mission Deck Completer (+5.000 XP)**
   - ✅ Follow `@QyroLabsofc` (+1.000 XP)
   - ✅ Like & Repost Post 1 (+1.000 XP)
   - ✅ Like & Repost Post 2 (+1.000 XP)
   - ✅ Follow `@AxieInfinity` (+1.000 XP)
   - ✅ Follow `@PlayBigTime` (+1.000 XP)

6. **🎖️ Auto-Claim Pilot Badges**
   - Otomatis klaim badge tier seperti **Rookie Pilot Badge** (+1.000 XP) setelah mencapai batas XP.

7. **👥 Multi-Account & Proxy Support**
   - Mendukung banyak akun sekaligus dalam `accounts.json`.
   - Mendukung HTTP, HTTPS, dan SOCKS5 proxy per akun untuk farming aman.

8. **⏰ Daemon / Cron Mode (24 Jam Otomatis)**
   - Bot dapat dibiarkan berjalan di latar belakang (VPS / PC / laptop) dan otomatis mengklaim setiap 24 jam.

---

## 📁 Struktur Direktori

```
qyrolabs-daily/
├── accounts.example.json   # Contoh format data akun
├── accounts.json           # File penyimpanan akun & token Anda (terenkripsi secara lokal)
├── config.js               # Konfigurasi RPC hashes, timing, dan endpoints
├── index.js                # Entry point utama bot
├── package.json            # Dependencies dan CLI scripts
├── README.md               # Dokumentasi lengkap
└── src/
    ├── api/
    │   ├── auth.js         # Supabase Email OTP & Token Refresh service
    │   ├── client.js       # HTTP client dengan dukungan proxy & browser headers
    │   ├── qyro.js         # RPC client untuk TanStack Server Functions
    │   └── seroval.js      # Engine serializer & deserializer TanStack Start
    ├── services/
    │   ├── bot.js          # Workflow eksekusi tugas per akun
    │   └── scheduler.js    # Runner multi-akun & daemon scheduler
    └── utils/
        ├── helpers.js      # Random delay, timer formatter, gamer tag generator
        ├── logger.js       # Tampilan terminal berwarna (ANSI UI)
        └── wallet.js       # Validator & generator alamat EVM dan Solana
```

---

## ⚡ Panduan Instalasi & Penggunaan

### 1. Prasyarat
Pastikan sistem Anda sudah terinstal **Node.js versi 18 atau lebih baru** (Node.js 20 / 22 / 24 sangat disarankan).

Cek versi Node:
```bash
node -v
```

### 2. Instalasi Dependensi
Jalankan perintah berikut di direktori proyek:
```bash
npm install
```

---

## 🛠️ Cara Menjalankan Bot

### Langkah 1: Tambahkan Akun (Login Email OTP)
Jalankan wizard interaktif untuk login:
```bash
npm run login
```
Bot akan meminta:
1. **Email address**: Masukkan alamat email Anda.
2. Bot akan mengirim kode 6-digit ke email Anda.
3. **OTP Code**: Masukkan kode 6 digit dari email.
4. **Display Name**: Nama pilot di leaderboard (tekan Enter untuk default).
5. **EVM Wallet (`0x...`)**: Masukkan wallet EVM Anda (tekan Enter untuk auto-generate).
6. **Solana Wallet**: Masukkan wallet Solana Anda (tekan Enter untuk auto-generate).
7. **Twitter / X Username**: Masukkan handle X Anda tanpa `@`.
8. **Referral Code**: Masukkan kode referral (opsional, tekan Enter untuk lewati).
9. Bot akan langsung menjalankan semua misi untuk akun baru Anda!

---

### Langkah 2: Menjalankan Misi Sekali (One-Time Run)
Untuk menjalankan semua akun yang terdaftar di `accounts.json` sekali putaran:
```bash
npm start
# atau
npm run run
```

---

### Langkah 3: Menjalankan Mode Otomatis 24 Jam (Daemon / Loop)
Untuk membiarkan bot berjalan otomatis setiap 24 jam tanpa perlu disentuh lagi:
```bash
npm run cron
# atau untuk custom interval (misal setiap 12 jam):
node index.js cron 12
```

---

### Perintah Berguna Lainnya:
- **Melihat Daftar Akun & Wallet**:
  ```bash
  npm run list
  ```
- **Melihat Live Leaderboard Top Pilot**:
  ```bash
  npm run top
  ```
- **Melihat Menu Bantuan**:
  ```bash
  npm run help
  ```

---

## 🌐 Format Multi-Akun & Proxy (`accounts.json`)

Jika Anda ingin menambahkan akun secara manual atau menggunakan proxy untuk tiap akun, buat file `accounts.json` (bisa disalin dari `accounts.example.json`):

```json
[
  {
    "email": "pilot1@example.com",
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": 1731550000000,
    "displayName": "CyberPilot01",
    "ethereumAddress": "0x1234567890123456789012345678901234567890",
    "solanaAddress": "7xKXtg2CW87d97TXJSD89sdfjAuG1mJm4mYQih68VbCi",
    "twitterUsername": "cyberpilot01",
    "referralCode": "QYRO-XXXXXX",
    "proxy": "http://user:pass@ip:port"
  }
]
```

---

## 🔒 Catatan Keamanan
- File `accounts.json` telah dimasukkan ke dalam `.gitignore` sehingga tidak akan terunggah ke repositori publik.
- Token refresh ditangani langsung dengan endpoint Supabase resmi proyek Qyro Labs.
- Hadiah airdrop $QYRO akan didistribusikan ke alamat Solana dan EVM yang telah terdaftar di profil akun Anda.

---

## 🎓 Pembelajaran & Studi Arsitektur (Educational & Technical Insights)

Repositori ini dirancang sebagai studi kasus nyata mengenai teknik rekayasa balik (*reverse engineering*) dan otomatisasi aplikasi web modern berbasis Full-Stack SSR. Beberapa konsep teknik penting yang diimplementasikan dalam proyek ini:

### 1. Reverse Engineering TanStack Start & Seroval RPC
- **TanStack Start (Vinxi/Nitro)** menggunakan arsitektur *Server Functions* (`_serverFn/<hash>`).
- Berbeda dari REST API biasa yang menggunakan JSON murni, payload request dan response dikodekan menggunakan protokol **Seroval** (format serialisasi JavaScript yang mendukung tipe data kompleks, referensi siklis, `Set`, `Map`, dan `BigInt`).
- Engine pada `src/api/seroval.js` mendemonstrasikan implementasi parser standalone di lingkungan Node.js tanpa memerlukan dependensi browser window.

### 2. Siklus Autentikasi Supabase Web3 Auth
- Membedah integrasi login email tanpa kata sandi (*Passwordless Email OTP*) melalui Supabase Auth API (`/auth/v1/otp` dan `/auth/v1/verify`).
- Mengimplementasikan mekanisme **Silent Token Refresh** berbasis JWT `refresh_token` (`/auth/v1/token?grant_type=refresh_token`), menjaga sesi akun tetap aktif tanpa perlu intervensi OTP ulang dari pengguna.

### 3. Simulasi Kriptografi Alamat Web3
- Modul `src/utils/wallet.js` mendemonstrasikan pembuatan pasangan kunci (*keypair*) dan derivasi alamat kriptografi yang valid secara matematis:
  - **EVM (Ethereum/BSC/Polygon)**: Menggunakan kurva eliptis `secp256k1` dan fungsi hash `keccak256`.
  - **Solana**: Menggunakan kurva `Ed25519` dengan representasi Base58 encoding.

---

## ⚠️ Disclaimer (Penafian Hukum)

> Proyek ini dibuat **semata-mata untuk tujuan edukasi, riset keamanan perangkat lunak, dan studi teknis** mengenai protokol Web3, serialisasi Seroval, dan arsitektur RPC server modern.
>
> 1. **Bukan Nasihat Finansial:** Repositori ini tidak berafiliasi, disponsori, atau didukung secara resmi oleh Qyro Labs.
> 2. **Tanggung Jawab Pengguna:** Segala risiko penggunaan perangkat lunak ini—termasuk namun tidak terbatas pada penalti akun, diskualifikasi airdrop, atau pemblokiran IP—merupakan tanggung jawab penuh masing-masing pengguna.
> 3. **Penggunaan Bijak:** Penulis dan kontributor tidak bertanggung jawab atas penyalahgunaan atau kerugian yang timbul dari penggunaan repositori ini. Gunakan dengan bijak dan patuhi ketentuan layanan platform terkait.
