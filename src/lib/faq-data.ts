export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type FAQCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: FAQItem[];
};

export const faqData: FAQCategory[] = [
  {
    id: 'getting-started',
    title: 'Memulai',
    description: 'Panduan dasar untuk memulai menggunakan Etags',
    icon: 'rocket',
    items: [
      {
        id: 'what-is-etags',
        question: 'Apa itu Etags?',
        answer: `Etags adalah platform penandaan produk dan verifikasi keaslian berbasis blockchain.

• Brand dapat membuat tag unik untuk setiap produk
• Konsumen dapat memverifikasi melalui pemindaian QR code
• Setiap tag dicatat di blockchain sehingga tidak dapat dipalsukan`,
      },
      {
        id: 'how-it-works',
        question: 'Bagaimana cara kerja Etags?',
        answer: `Etags bekerja dalam 3 langkah sederhana:

• Brand membuat tag untuk produk dan melakukan stamping ke blockchain
• Tag dicetak sebagai QR code dan ditempelkan pada produk
• Konsumen memindai QR code untuk memverifikasi keaslian dan mengklaim kepemilikan`,
      },
      {
        id: 'who-can-use',
        question: 'Siapa yang dapat menggunakan Etags?',
        answer: `Etags dapat digunakan oleh:

• Brand/Produsen - untuk melindungi produk dari pemalsuan
• Distributor - untuk melacak distribusi produk
• Konsumen - untuk memverifikasi keaslian produk yang dibeli`,
      },
    ],
  },
  {
    id: 'for-brands',
    title: 'Panduan untuk Brand',
    description: 'Cara mengelola produk dan tag sebagai brand',
    icon: 'building',
    items: [
      {
        id: 'register-brand',
        question: 'Bagaimana cara mendaftarkan brand saya?',
        answer: `Untuk mendaftarkan brand:

• Hubungi admin Etags untuk pembuatan akun brand
• Setelah akun dibuat, login ke dashboard di /manage
• Lengkapi proses onboarding dengan mengisi informasi brand Anda
• Setelah selesai, Anda dapat mulai menambahkan produk dan membuat tag`,
      },
      {
        id: 'add-product',
        question: 'Bagaimana cara menambahkan produk?',
        answer: `Untuk menambahkan produk:

• Login ke dashboard dan pilih menu "Produk"
• Klik tombol "Tambah Produk"
• Isi informasi produk seperti nama, deskripsi, harga, dan upload gambar
• Klik "Simpan" untuk menyimpan produk`,
      },
      {
        id: 'create-tag',
        question: 'Bagaimana cara membuat tag untuk produk?',
        answer: `Untuk membuat tag:

• Pilih menu "Tag" di dashboard
• Klik "Tambah Tag"
• Pilih produk yang akan diberi tag
• Sistem akan generate kode unik untuk tag
• Simpan tag dan lakukan stamping ke blockchain`,
      },
      {
        id: 'stamp-tag',
        question: 'Apa itu stamping dan bagaimana caranya?',
        answer: `Stamping adalah proses mencatat tag ke blockchain sehingga tidak dapat dipalsukan.

Caranya:
• Buka detail tag yang ingin di-stamp
• Klik tombol "Stamp ke Blockchain"
• Tunggu proses stamping selesai (biasanya 10-30 detik)
• Setelah berhasil, tag akan memiliki hash transaksi sebagai bukti`,
      },
      {
        id: 'download-qr',
        question: 'Bagaimana cara download QR code tag?',
        answer: `Setelah tag dibuat:

• Buka halaman daftar tag atau detail tag
• Klik tombol download QR code
• QR code akan terdownload dalam format gambar
• Cetak dan tempelkan pada produk Anda`,
      },
      {
        id: 'tag-lifecycle',
        question: 'Apa saja status tag dan artinya?',
        answer: `Status tag dalam Etags:

• CREATED - Tag baru dibuat
• DISTRIBUTED - Tag sudah didistribusikan ke produk
• CLAIMED - Tag sudah diklaim oleh konsumen
• TRANSFERRED - Kepemilikan dipindahkan ke orang lain
• FLAGGED - Tag ditandai untuk investigasi
• REVOKED - Tag dicabut/dibatalkan`,
      },
      {
        id: 'revoke-tag',
        question: 'Bagaimana cara mencabut/revoke tag?',
        answer: `Untuk mencabut tag (misalnya jika produk ditarik):

• Buka detail tag yang ingin dicabut
• Klik tombol "Revoke Tag"
• Masukkan alasan pencabutan
• Konfirmasi pencabutan

Tag yang sudah dicabut tidak dapat digunakan lagi.`,
      },
      {
        id: 'handle-tickets',
        question: 'Bagaimana cara menangani support ticket dari konsumen?',
        answer: `Untuk menangani support ticket:

• Buka menu "Support Tickets" di dashboard
• Anda akan melihat daftar ticket dari konsumen yang memiliki produk brand Anda
• Klik ticket untuk melihat detail dan membalas
• Update status ticket sesuai progress penanganan`,
      },
    ],
  },
  {
    id: 'for-consumers',
    title: 'Panduan untuk Konsumen',
    description: 'Cara memverifikasi produk dan mengklaim kepemilikan',
    icon: 'user',
    items: [
      {
        id: 'scan-qr',
        question: 'Bagaimana cara scan QR code produk?',
        answer: `Untuk memindai QR code:

• Buka halaman scan di /scan atau langsung scan QR dengan kamera HP
• Arahkan kamera ke QR code pada produk
• Sistem akan otomatis membaca dan mengarahkan ke halaman verifikasi
• Anda akan melihat informasi produk dan status keasliannya`,
      },
      {
        id: 'verify-product',
        question: 'Bagaimana cara memverifikasi keaslian produk?',
        answer: `Setelah scan QR code, halaman verifikasi akan menampilkan:

• Informasi produk (nama, deskripsi, gambar)
• Informasi brand
• Status tag (asli/palsu/dicabut)
• Riwayat transaksi blockchain

Jika semua informasi valid dan sesuai, produk Anda asli.`,
      },
      {
        id: 'claim-ownership',
        question: 'Bagaimana cara mengklaim kepemilikan produk?',
        answer: `Untuk mengklaim kepemilikan:

• Scan QR code produk
• Di halaman verifikasi, klik tombol "Klaim Kepemilikan"
• Pilih apakah Anda pembeli pertama (first-hand) atau bukan
• Jika first-hand dan memiliki wallet Web3, Anda bisa mendapatkan NFT collectible gratis!`,
      },
      {
        id: 'get-nft',
        question: 'Bagaimana cara mendapatkan NFT collectible?',
        answer: `NFT collectible tersedia untuk pembeli pertama (first-hand):

• Klaim kepemilikan dan pilih "Ya, saya pembeli pertama"
• Jika browser Anda mendukung Web3 (ada MetaMask), tombol "Klaim NFT" akan muncul
• Hubungkan wallet Anda
• Sistem akan generate artwork unik dan mint NFT ke wallet Anda secara gratis!`,
      },
      {
        id: 'submit-ticket',
        question: 'Bagaimana cara mengajukan komplain/support ticket?',
        answer: `Untuk mengajukan komplain:

• Buka halaman /support
• Hubungkan wallet Web3 Anda (harus memiliki NFT dari produk)
• Pilih produk yang ingin dikomplain
• Pilih kategori masalah dan jelaskan keluhan Anda
• Brand atau admin akan merespon ticket Anda`,
      },
      {
        id: 'track-ticket',
        question: 'Bagaimana cara melacak status ticket saya?',
        answer: `Untuk melacak ticket:

• Buka halaman /support
• Hubungkan wallet yang sama saat submit ticket
• Anda akan melihat daftar ticket beserta statusnya

Status ticket:
• Open - Ticket baru dibuat
• In Progress - Sedang ditangani
• Resolved - Masalah selesai
• Closed - Ticket ditutup`,
      },
    ],
  },
  {
    id: 'blockchain',
    title: 'Blockchain & NFT',
    description: 'Informasi tentang teknologi blockchain dan NFT',
    icon: 'link',
    items: [
      {
        id: 'what-blockchain',
        question: 'Apa itu blockchain dan mengapa digunakan?',
        answer: `Blockchain adalah teknologi pencatatan data yang terdesentralisasi dan tidak dapat diubah.

Etags menggunakan blockchain untuk:
• Menjamin keaslian tag tidak dapat dipalsukan
• Mencatat riwayat tag secara permanen
• Memberikan transparansi kepada semua pihak`,
      },
      {
        id: 'which-blockchain',
        question: 'Blockchain apa yang digunakan Etags?',
        answer: `Etags menggunakan Base Sepolia, yaitu layer 2 blockchain dari Coinbase yang dibangun di atas Ethereum.

Keunggulan Base:
• Transaksi cepat
• Biaya rendah
• Keamanan setara Ethereum`,
      },
      {
        id: 'what-is-nft',
        question: 'Apa itu NFT collectible?',
        answer: `NFT (Non-Fungible Token) collectible adalah aset digital unik yang diberikan kepada pembeli pertama produk.

Keuntungan NFT:
• Memiliki artwork yang di-generate AI secara unik
• Menjadi bukti kepemilikan digital
• Dapat digunakan untuk akses support ticket
• Tersimpan permanen di blockchain`,
      },
      {
        id: 'need-crypto',
        question: 'Apakah saya perlu membeli cryptocurrency?',
        answer: `Tidak! Etags menggunakan sistem gasless/sponsored transaction.

Artinya:
• Anda tidak perlu membeli crypto untuk mint NFT
• Biaya gas ditanggung oleh sistem
• Anda hanya perlu wallet Web3 (seperti MetaMask) untuk menerima NFT`,
      },
      {
        id: 'setup-wallet',
        question: 'Bagaimana cara setup wallet Web3?',
        answer: `Untuk setup MetaMask:

• Install extension MetaMask di browser atau download app mobile
• Buat wallet baru dan simpan seed phrase dengan aman
• Saat diminta di Etags, klik "Connect Wallet"
• Approve koneksi dan switch ke jaringan Base Sepolia jika diminta`,
      },
      {
        id: 'view-nft',
        question: 'Dimana saya bisa melihat NFT saya?',
        answer: `Anda bisa melihat NFT di:

• Halaman /support setelah connect wallet
• OpenSea atau marketplace NFT lainnya (pilih jaringan Base)
• Langsung di MetaMask dengan menambahkan NFT secara manual menggunakan contract address`,
      },
    ],
  },
  {
    id: 'security',
    title: 'Keamanan',
    description: 'Informasi keamanan dan privasi',
    icon: 'shield',
    items: [
      {
        id: 'data-security',
        question: 'Bagaimana Etags menjaga keamanan data?',
        answer: `Keamanan data di Etags:

• Data sensitif dienkripsi
• Autentikasi menggunakan NextAuth dengan session yang aman
• CSRF protection untuk mencegah serangan
• Rate limiting untuk mencegah abuse
• Data blockchain tidak dapat diubah atau dihapus`,
      },
      {
        id: 'fake-detection',
        question: 'Bagaimana sistem mendeteksi produk palsu?',
        answer: `Etags menggunakan AI untuk deteksi fraud:

• Analisis pola scan yang mencurigakan
• Deteksi lokasi scan yang tidak wajar
• Pengecekan riwayat tag
• Jika terdeteksi mencurigakan, tag akan di-flag untuk investigasi`,
      },
      {
        id: 'wallet-safety',
        question: 'Apakah aman menghubungkan wallet?',
        answer: `Ya, menghubungkan wallet aman karena:

• Etags hanya meminta akses read untuk melihat NFT Anda
• Tidak ada akses untuk memindahkan aset Anda
• Anda selalu bisa disconnect wallet kapan saja
• Selalu pastikan URL yang benar sebelum connect wallet`,
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Solusi untuk masalah umum',
    icon: 'wrench',
    items: [
      {
        id: 'scan-not-working',
        question: 'QR code tidak bisa di-scan, apa yang harus dilakukan?',
        answer: `Jika QR code tidak terbaca:

• Pastikan pencahayaan cukup
• Bersihkan QR code dari kotoran
• Pastikan kamera fokus dengan benar
• Coba dengan jarak yang berbeda
• Jika QR rusak, hubungi brand untuk bantuan`,
      },
      {
        id: 'tag-invalid',
        question: 'Tag menunjukkan status invalid, apa artinya?',
        answer: `Tag invalid bisa berarti:

• Tag telah dicabut/revoke oleh brand
• Tag tidak pernah di-stamp ke blockchain
• Data tag tidak ditemukan

Jika Anda yakin produk asli, hubungi brand untuk klarifikasi.`,
      },
      {
        id: 'nft-not-received',
        question: 'NFT tidak muncul di wallet, bagaimana?',
        answer: `Jika NFT tidak muncul:

• Tunggu beberapa menit karena transaksi blockchain butuh waktu
• Pastikan Anda di jaringan Base Sepolia
• Cek transaction hash di block explorer
• Import NFT manual di MetaMask dengan contract address dan token ID`,
      },
      {
        id: 'wallet-connect-fail',
        question: 'Gagal menghubungkan wallet, apa solusinya?',
        answer: `Jika gagal connect wallet:

• Pastikan MetaMask ter-install dan unlocked
• Refresh halaman dan coba lagi
• Clear cache browser
• Pastikan tidak ada popup blocker
• Coba browser lain yang mendukung Web3`,
      },
      {
        id: 'contact-support',
        question: 'Bagaimana cara menghubungi support Etags?',
        answer: `Untuk bantuan lebih lanjut:

• Jika Anda pemilik NFT, gunakan fitur support ticket di /support
• Untuk brand, hubungi admin melalui dashboard
• Untuk pertanyaan umum, lihat dokumentasi di /docs`,
      },
    ],
  },
];

export function searchFAQ(query: string): FAQCategory[] {
  if (!query.trim()) {
    return faqData;
  }

  const lowerQuery = query.toLowerCase();

  return faqData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(lowerQuery) ||
          item.answer.toLowerCase().includes(lowerQuery)
      ),
    }))
    .filter((category) => category.items.length > 0);
}
