<?php
/*
====================================================
DASHBOARD — StudyFlow (PHP + MySQL Edition)
====================================================
Halaman ini membutuhkan login. Alur:
1. session_start() di awal
2. Cek $_SESSION['user_id'] → jika kosong redirect ke login.html
3. Semua data tugas diambil dari database via fetch API di script.js
4. Kalender & jadwal tetap menggunakan localStorage
====================================================
*/

require_once __DIR__ . '/includes/app.php';
start_secure_session();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$nama_user = e((string) ($_SESSION['nama'] ?? 'User'));

// Tanggal dalam Bahasa Indonesia
$hariID  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
$bulanID = ['','Januari','Februari','Maret','April','Mei','Juni',
            'Juli','Agustus','September','Oktober','November','Desember'];
$now = new DateTime();
$tanggalHero = $hariID[(int)$now->format('w')] . ', ' .
               $now->format('d') . ' ' .
               $bulanID[(int)$now->format('n')] . ' ' .
               $now->format('Y');
$jamSekarang = $now->format('H.i');
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StudyFlow - Dashboard Mahasiswa</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/home.css">
  <link rel="icon" type="image/png" href="assets/images/icon1.PNG">
</head>
<body data-nama="<?= $nama_user ?>">
  <div class="latar-ambient" aria-hidden="true"></div>
  <div class="wadah-aplikasi">

    <!-- ===== SIDEBAR ===== -->
    <aside class="menu-samping">
      <div class="identitas-aplikasi">
        <span class="ikon-aplikasi">SF</span>
        <div>
          <h2>StudyFlow</h2>
          <p>Student workspace</p>
        </div>
      </div>

      <nav class="daftar-menu" aria-label="Menu utama">
        <button class="tombol-menu aktif" type="button" data-halaman="dashboard">
          <span class="ikon-menu">⌂</span>
          <span>Dashboard</span>
        </button>
        <button class="tombol-menu" type="button" data-halaman="tugas">
          <span class="ikon-menu">□</span>
          <span>Tugas</span>
        </button>
        <button class="tombol-menu" type="button" data-halaman="kalender">
          <span class="ikon-menu">◷</span>
          <span>Kalender</span>
        </button>
        <button class="tombol-menu" type="button" data-halaman="pengaturan">
          <span class="ikon-menu">⚙</span>
          <span>Pengaturan</span>
        </button>
      </nav>

      <div class="sidebar-insight">
        <span class="label-mini">Hari ini</span>
        <strong id="ringkasanSidebar">0 tugas aktif</strong>
        <p>Atur ritme belajarmu tanpa bikin dashboard terasa penuh.</p>
      </div>

      <!-- Note: tombol Logout dipindah ke panel Pengaturan (profil) sesuai permintaan -->
    </aside>

    <!-- ===== KONTEN UTAMA ===== -->
    <main class="konten-utama">

      <!-- Header -->
      <header class="kepala-halaman">
        <div class="kepala-copy">
          <p class="teks-kecil">Catatan Tugas Mahasiswa</p>
          <h1 id="teksSapaan">Selamat datang kembali, <?= $nama_user ?> 👋</h1>
        </div>
        <div class="header-actions">
          <div class="tanggal-header">
            <span id="teksTanggalRealtime"><?= $tanggalHero ?></span>
            <small id="teksJamRealtime"><?= $jamSekarang ?></small>
          </div>
          <div id="fotoProfilHeader"
               class="foto-profil-header foto-profil-header--klikable"
               aria-label="Buka pengaturan profil"
               title="Pengaturan Profil"
               role="button"
               tabindex="0">
            <span id="inisialProfilHeader">R</span>
          </div>
        </div>
      </header>

      <!-- ========== DASHBOARD ========== -->
      <section id="dashboard" class="halaman halaman-aktif">

        <section class="hero-dashboard">
          <div class="hero-copy">
            <span class="pill-status">Workspace aktif</span>
            <h2 id="teksSapaanHero">Selamat datang kembali, <?= $nama_user ?> 👋</h2>
            <p id="teksTanggalHero"><?= $tanggalHero ?></p>
            <div class="hero-progress">
              <div class="progress-meta">
                <span>Progress tugas hari ini</span>
                <strong id="persenProgressHariIni">0%</strong>
              </div>
              <div class="progress-track" aria-label="Progress produktivitas">
                <span id="barProgressHariIni" class="progress-fill"></span>
              </div>
              <small id="teksProgressHariIni">Belum ada tugas selesai hari ini.</small>
            </div>
          </div>

          <div class="hero-panel">
            <span class="label-mini">Fokus hari ini</span>
            <strong id="angkaFokusHariIni">0</strong>
            <p>Tugas dengan deadline hari ini.</p>
          </div>
        </section>

        <!-- Aksi Cepat -->
        <section class="section-dashboard">
          <div class="section-heading">
            <div>
              <p class="teks-kecil">Aksi cepat</p>
              <h2>Mulai dari sini</h2>
            </div>
          </div>
          <div class="grid-aksi-cepat">
            <button class="kartu-aksi" type="button" data-quick-action="tambah-tugas">
              <span class="ikon-aksi">＋</span>
              <strong>Tambah Tugas</strong>
              <small>Catat deadline baru</small>
            </button>
            <button class="kartu-aksi" type="button" data-quick-action="tambah-jadwal">
              <span class="ikon-aksi">◷</span>
              <strong>Tambah Jadwal</strong>
              <small>Buat agenda kuliah</small>
            </button>
            <button class="kartu-aksi" type="button" data-quick-action="lihat-kalender">
              <span class="ikon-aksi">▦</span>
              <strong>Lihat Kalender</strong>
              <small>Cek ritme bulan ini</small>
            </button>
            <button class="kartu-aksi" type="button" data-quick-action="fokus-hari-ini">
              <span class="ikon-aksi">◎</span>
              <strong>Fokus Hari Ini</strong>
              <small>Kerjakan prioritas utama</small>
            </button>
          </div>
        </section>

        <!-- Statistik -->
        <section class="section-dashboard">
          <div class="section-heading">
            <div>
              <p class="teks-kecil">Statistik</p>
              <h2>Snapshot produktivitas</h2>
            </div>
          </div>
          <div class="grid-statistik">
            <article class="kartu-statistik warna-biru">
              <span class="ikon-statistik">□</span>
              <p>Total tugas</p>
              <h3 id="angkaTotalTugas">0</h3>
            </article>
            <article class="kartu-statistik warna-merah">
              <span class="ikon-statistik">!</span>
              <p>Deadline dekat</p>
              <h3 id="angkaDeadlineDekat">0</h3>
            </article>
            <article class="kartu-statistik warna-hijau">
              <span class="ikon-statistik">✓</span>
              <p>Tugas selesai</p>
              <h3 id="angkaTugasSelesai">0</h3>
            </article>
            <article class="kartu-statistik warna-ungu">
              <span class="ikon-statistik">↗</span>
              <p>Progress mingguan</p>
              <h3 id="angkaTugasBelumSelesai">0</h3>
            </article>
          </div>
        </section>

        <!-- Grid Utama Dashboard -->
        <section class="dashboard-grid-utama">
          <div class="kolom-dashboard">

            <section class="panel panel-tugas-dashboard">
              <div class="kepala-panel">
                <div>
                  <p class="teks-kecil">Tugas</p>
                  <h3>Deadline Hari Ini</h3>
                </div>
                <span class="badge-panel" id="jumlahTugasHariIni">0</span>
              </div>
              <div id="daftarTugasHariIni" class="daftar-ringkas"></div>
            </section>

            <section class="panel panel-tugas-dashboard">
              <div class="kepala-panel">
                <div>
                  <p class="teks-kecil">Berikutnya</p>
                  <h3>Deadline Besok</h3>
                </div>
                <span class="badge-panel" id="jumlahTugasBesok">0</span>
              </div>
              <div id="daftarTugasBesok" class="daftar-ringkas"></div>
            </section>

            <section class="panel panel-tugas-dashboard">
              <div class="kepala-panel">
                <div>
                  <p class="teks-kecil">Selesai</p>
                  <h3>Tugas Selesai</h3>
                </div>
                <span class="badge-panel" id="jumlahTugasSelesaiDashboard">0</span>
              </div>
              <div id="daftarTugasSelesaiDashboard" class="daftar-ringkas"></div>
            </section>

            <section class="panel panel-tugas-dashboard">
              <div class="kepala-panel">
                <div>
                  <p class="teks-kecil">Terbaru</p>
                  <h3>Tugas Terbaru</h3>
                </div>
              </div>
              <div id="daftarTugasTerbaru" class="daftar-ringkas"></div>
            </section>

          </div>

          <aside class="kolom-dashboard kolom-kanan">

            <section class="panel panel-kalender-preview">
              <div class="kepala-panel">
                <div>
                  <p class="teks-kecil">Kalender</p>
                  <h3>Preview bulan ini</h3>
                </div>
                <button class="tombol-kedua tombol-mini" type="button" data-quick-action="lihat-kalender">Buka</button>
              </div>
              <div class="mini-calendar">
                <div id="judulMiniKalender" class="judul-mini-kalender">Mei 2026</div>
                <div class="mini-calendar-days" aria-hidden="true">
                  <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                </div>
                <div id="isiMiniKalender" class="mini-calendar-grid"></div>
              </div>
            </section>

            <section class="panel">
              <div class="kepala-panel">
                <div>
                  <p class="teks-kecil">Reminder</p>
                  <h3>Deadline dekat</h3>
                </div>
              </div>
              <div id="daftarNotifikasiDeadline" class="daftar-ringkas"></div>
            </section>

          </aside>
        </section>
      </section>

      <!-- ========== TUGAS ========== -->
      <section id="tugas" class="halaman">
        <div class="judul-bagian">
          <div>
            <p class="teks-kecil">Kelola</p>
            <h2>Daftar Tugas</h2>
          </div>
        </div>

        <form id="formTambahTugas" class="form-tugas" novalidate>
          <div class="grup-form">
            <label for="inputNamaTugas">Nama tugas</label>
            <input type="text" id="inputNamaTugas" placeholder="Contoh: Laporan praktikum" autocomplete="off">
            <small id="pesanErrorNamaTugas" class="pesan-error"></small>
          </div>
          <div class="grup-form">
            <label for="pilihanMataKuliah">Mata kuliah</label>
            <select id="pilihanMataKuliah">
              <option value="">Pilih mata kuliah</option>
            </select>
            <small id="pesanErrorMataKuliah" class="pesan-error"></small>
          </div>
          <div class="grup-form">
            <label for="inputDeadlineTugas">Deadline</label>
            <input type="date" id="inputDeadlineTugas">
            <small id="pesanErrorDeadlineTugas" class="pesan-error"></small>
          </div>
          <div class="grup-form">
            <label for="pilihanPrioritasTugas">Prioritas</label>
            <select id="pilihanPrioritasTugas">
              <option value="rendah">Rendah</option>
              <option value="sedang" selected>Sedang</option>
              <option value="tinggi">Tinggi</option>
            </select>
          </div>
          <button class="tombol-utama" type="submit">Tambah Tugas</button>
        </form>

        <div class="alat-filter-tugas">
          <div class="search-wrapper">
            <span>⌕</span>
            <input type="search" id="inputPencarianTugas" placeholder="Cari tugas atau mata kuliah">
          </div>
          <select id="filterStatusTugas">
            <option value="semua">Semua tugas</option>
            <option value="belum">Belum selesai</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        <div id="daftarTugas" class="daftar-tugas"></div>
      </section>

      <!-- ========== KALENDER ========== -->
      <section id="kalender" class="halaman">
        <div class="judul-bagian">
          <div>
            <p class="teks-kecil">Agenda</p>
            <h2>Kalender Mahasiswa</h2>
          </div>
          <button id="tombolTambahJadwalCepat" class="tombol-utama" type="button">Tambah Jadwal</button>
        </div>

        <div class="layout-kalender">
          <section class="kartu-kalender">
            <div class="toolbar-kalender">
              <div>
                <p class="teks-kecil">Kalender Bulanan</p>
                <h3 id="teksBulanKalender">Mei 2026</h3>
              </div>
              <div class="aksi-kalender">
                <button id="tombolBulanSebelumnya" class="tombol-ikon" type="button" aria-label="Bulan sebelumnya">‹</button>
                <button id="tombolHariIni" class="tombol-kedua" type="button">Hari ini</button>
                <button id="tombolBulanBerikutnya" class="tombol-ikon" type="button" aria-label="Bulan berikutnya">›</button>
              </div>
            </div>

            <div class="filter-kalender">
              <label for="filterKategoriJadwal">Filter kategori</label>
              <select id="filterKategoriJadwal">
                <option value="semua">Semua kategori</option>
                <option value="kuliah">Kuliah</option>
                <option value="organisasi">Organisasi</option>
                <option value="ujian">Ujian</option>
                <option value="pribadi">Pribadi</option>
                <option value="deadline">Deadline tugas</option>
              </select>
            </div>

            <div class="kalender-scroll-wrapper">
              <div class="nama-hari-kalender" aria-hidden="true">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span>
                <span>Kam</span><span>Jum</span><span>Sab</span>
              </div>
              <div id="isiKalender" class="isi-kalender"></div>
            </div>
          </section>

          <aside class="sisi-agenda">
            <section class="panel">
              <h3>Agenda Hari Ini</h3>
              <div id="daftarAgendaHariIni" class="daftar-agenda"></div>
            </section>
            <section class="panel">
              <h3>Reminder Deadline</h3>
              <div id="daftarReminderDeadline" class="daftar-agenda"></div>
            </section>
          </aside>
        </div>
      </section>

      <!-- ========== PENGATURAN ========== -->
      <section id="pengaturan" class="halaman">
        <div class="judul-bagian">
          <div>
            <p class="teks-kecil">Preferensi</p>
            <h2>Pengaturan</h2>
          </div>
        </div>

        <div class="grid-pengaturan">

          <section class="panel">
            <h3>Profil</h3>
            <div class="pengaturan-profil">
              <div id="previewFotoProfil" class="preview-foto-profil" aria-label="Preview foto profil">
                <span id="inisialPreviewProfil">R</span>
              </div>
              <div class="aksi-profil">
                <input type="file" id="inputFotoProfil" accept="image/png, image/jpeg, image/jpg" hidden>
                <button id="tombolUploadFoto" class="tombol-kedua" type="button">Upload Foto</button>
                <button id="tombolHapusFoto" class="tombol-kecil tombol-hapus" type="button">Hapus Foto</button>
              </div>
            </div>
            <small id="pesanErrorFotoProfil" class="pesan-error-foto"></small>
            <label for="inputNamaPengguna">Nama kamu</label>
            <input type="text" id="inputNamaPengguna" placeholder="Masukkan nama kamu" autocomplete="off">
            <button id="tombolSimpanNama" class="tombol-utama" type="button">Simpan Nama</button>
            <hr style="margin:18px 0;border:none;border-top:1px solid var(--line);">
            <div>
              <h4>Ganti Password</h4>
              <div class="grup-form">
                <label for="pwLama">Password lama</label>
                <input type="password" id="pwLama" placeholder="Password lama" autocomplete="current-password">
                <small id="errPwLama" class="pesan-error"></small>
              </div>
              <div class="grup-form">
                <label for="pwBaru">Password baru</label>
                <input type="password" id="pwBaru" placeholder="Password baru" autocomplete="new-password">
                <small id="errPwBaru" class="pesan-error"></small>
              </div>
              <div class="grup-form">
                <label for="pwKonf">Konfirmasi password baru</label>
                <input type="password" id="pwKonf" placeholder="Konfirmasi password baru" autocomplete="new-password">
                <small id="errPwKonf" class="pesan-error"></small>
              </div>
              <button id="tombolGantiPassword" class="tombol-utama" type="button">Ganti Password</button>
            </div>
          </section>

          <section class="panel">
            <h3>Tampilan</h3>
            <label class="baris-switch" for="toggleModeGelap">
              <span>Aktifkan dark mode</span>
              <input type="checkbox" id="toggleModeGelap">
            </label>
          </section>

          <section class="panel">
            <h3>Notifikasi</h3>
            <label class="baris-switch" for="toggleNotifikasiDeadline">
              <span>Peringatan deadline dekat</span>
              <input type="checkbox" id="toggleNotifikasiDeadline">
            </label>
          </section>

          <section class="panel panel-mata-kuliah" id="panelMataKuliah">
            <h3>Mata Kuliah</h3>
            <p class="teks-kecil-panel">Tambahkan mata kuliah kamu. Daftar ini otomatis muncul di form tambah tugas.</p>
            <div class="form-tambah-mata-kuliah">
              <div class="grup-form">
                <label for="inputNamaMataKuliah">Nama mata kuliah</label>
                <input type="text" id="inputNamaMataKuliah"
                  placeholder="Contoh: Pemrograman Mobile"
                  autocomplete="off" maxlength="80">
                <small id="pesanErrorMataKuliahBaru" class="pesan-error"></small>
              </div>
              <button id="tombolTambahMataKuliah" class="tombol-utama" type="button">Tambah</button>
            </div>
            <div id="daftarMataKuliahPengaturan" class="daftar-mata-kuliah-pengaturan"></div>
          </section>

          <section class="panel panel-bahaya">
            <h3>Data</h3>
            <p>Hapus semua tugas yang tersimpan di database.</p>
            <button id="tombolResetData" class="tombol-bahaya" type="button">Hapus Semua Tugas</button>
          </section>

          <section class="panel" style="background-color: var(--bg-danger, #fee2e2);">
            <button id="tombolLogoutProfile" class="tombol-bahaya" type="button" style="width: 100%;">Logout</button>
          </section>

        </div>
      </section>
    </main>
  </div>

  <!-- ========== MODAL KONFIRMASI ========== -->
  <div id="modalKonfirmasi" class="lapisan-modal" aria-hidden="true">
    <div class="modal-konfirmasi" role="dialog" aria-modal="true"
         aria-labelledby="judulModalKonfirmasi" aria-describedby="pesanModalKonfirmasi">
      <div class="ikon-modal" aria-hidden="true">!</div>
      <div class="isi-modal">
        <p class="teks-kecil">Konfirmasi</p>
        <h2 id="judulModalKonfirmasi">Hapus semua tugas?</h2>
        <p id="pesanModalKonfirmasi">Data tugas yang sudah dihapus tidak dapat dikembalikan.</p>
      </div>
      <div class="aksi-modal">
        <button id="tombolBatalKonfirmasi" class="tombol-modal tombol-modal-kedua" type="button">Batal</button>
        <button id="tombolSetujuKonfirmasi" class="tombol-modal tombol-modal-bahaya" type="button">Hapus</button>
      </div>
    </div>
  </div>

  <!-- ========== MODAL JADWAL ========== -->
  <div id="modalJadwal" class="lapisan-modal" aria-hidden="true">
    <form id="formTambahJadwal" class="modal-jadwal" role="dialog"
          aria-modal="true" aria-labelledby="judulModalJadwal" novalidate>
      <div class="isi-modal">
        <p class="teks-kecil">Jadwal Baru</p>
        <h2 id="judulModalJadwal">Tambah Jadwal</h2>
        <p id="teksTanggalJadwalDipilih">Pilih tanggal pada kalender.</p>
      </div>
      <div class="grup-form">
        <label for="inputNamaJadwal">Nama kegiatan</label>
        <input type="text" id="inputNamaJadwal" placeholder="Contoh: Diskusi kelompok" autocomplete="off">
        <small id="pesanErrorNamaJadwal" class="pesan-error"></small>
      </div>
      <div class="baris-form">
        <div class="grup-form">
          <label for="inputTanggalJadwal">Tanggal</label>
          <input type="date" id="inputTanggalJadwal">
          <small id="pesanErrorTanggalJadwal" class="pesan-error"></small>
        </div>
        <div class="grup-form">
          <label for="inputJamJadwal">Jam</label>
          <input type="time" id="inputJamJadwal">
          <small id="pesanErrorJamJadwal" class="pesan-error"></small>
        </div>
      </div>
      <div class="grup-form">
        <label for="pilihanKategoriJadwal">Kategori</label>
        <select id="pilihanKategoriJadwal">
          <option value="kuliah">Kuliah</option>
          <option value="organisasi">Organisasi</option>
          <option value="ujian">Ujian</option>
          <option value="pribadi">Pribadi</option>
        </select>
      </div>
      <div class="aksi-modal">
        <button id="tombolBatalJadwal" class="tombol-modal tombol-modal-kedua" type="button">Batal</button>
        <button class="tombol-modal tombol-modal-utama" type="submit">Simpan Jadwal</button>
      </div>
    </form>
  </div>

  <!-- ========== MODAL DETAIL TANGGAL ========== -->
  <div id="modalDetailTanggal" class="lapisan-modal" aria-hidden="true">
    <div class="modal-detail-jadwal" role="dialog" aria-modal="true" aria-labelledby="judulModalDetail">
      <div class="kepala-modal-detail">
        <div>
          <p class="teks-kecil">Jadwal di Tanggal</p>
          <h2 id="judulModalDetail">15 Mei 2026</h2>
        </div>
        <button id="tombolTutupDetailTanggal" class="tombol-tutup-modal" type="button">×</button>
      </div>
      <div id="daftarJadwalDetailTanggal" class="daftar-jadwal-detail"></div>
      <button id="tombolTambahJadwalDariDetail" class="tombol-tambah-di-modal" type="button">
        Tambah jadwal di tanggal ini
      </button>
    </div>
  </div>

  <button id="tombolTambahCepatMobile" class="tombol-tambah-cepat" type="button" aria-label="Tambah tugas cepat">+</button>
  <div id="wadahToast" class="wadah-toast" aria-live="polite" aria-atomic="true"></div>

  <!-- Bottom nav mobile -->
  <nav class="bottom-navigation-mobile" aria-label="Navigasi mobile">
    <button class="tombol-nav-mobile aktif" type="button" data-halaman="dashboard">
      <span>⌂</span><small>Dashboard</small>
    </button>
    <button class="tombol-nav-mobile" type="button" data-halaman="tugas">
      <span>□</span><small>Tugas</small>
    </button>
    <button class="tombol-nav-mobile" type="button" data-halaman="kalender">
      <span>◷</span><small>Kalender</small>
    </button>
    <button class="tombol-nav-mobile" type="button" data-halaman="pengaturan">
      <span>⚙</span><small>Pengaturan</small>
    </button>
  </nav>

  <button id="tombolTambahMobile" class="tombol-tambah-mobile" type="button" aria-label="Tambah tugas">+</button>

  <script>
    /* ====================================================
       LOGOUT HANDLER — bind ke sidebar atau profile button jika ada
    ==================================================== */
    (function() {
      async function doLogout() {
        if (!confirm('Apakah kamu yakin ingin logout?')) return;
        try {
          const res  = await fetch('backend/logout.php', { method: 'POST', credentials: 'same-origin' });
          const data = await res.json();
          if (data.success) window.location.href = 'login.html';
          else alert(data.message || 'Gagal logout.');
        } catch (err) {
          console.error('Logout error:', err);
          alert('Gagal logout. Silakan coba lagi.');
        }
      }

      const tombolSidebar = document.getElementById('tombolLogout');
      const tombolProfile = document.getElementById('tombolLogoutProfile');
      if (tombolSidebar) tombolSidebar.addEventListener('click', doLogout);
      if (tombolProfile) tombolProfile.addEventListener('click', doLogout);
    })();

    /* ====================================================
       AUTO-BUKA HALAMAN PENGATURAN DARI HASH
    ==================================================== */
    window.addEventListener('load', function() {
      if (window.location.hash === '#pengaturan') {
        setTimeout(function() {
          if (typeof beralihHalaman === 'function') {
            beralihHalaman('pengaturan');
            history.replaceState(null, null, window.location.pathname);
          }
        }, 300);
      }
    });
  </script>
  <script src="assets/js/script.js"></script>
</body>
</html>
