/*
====================================================
MODIFIKASI SCRIPT UNTUK DATABASE
====================================================
File ini adalah modifikasi dari script.js yang dioptimalkan
untuk menggunakan backend PHP + MySQL database.

Perbedaan dari script.js:
1. Data tidak lagi disimpan di localStorage
2. Semua data diambil dari database melalui fetch API
3. Saat tambah/hapus/update todo, langsung ke database

File ini MENGGANTI script.js di dashboard.php
====================================================
*/

/*
================================
PENGATURAN NAMA DATA LOCAL STORAGE
================================
Hanya untuk preferensi UI — bukan data user:
- modeGelap, notifikasiDeadline, fotoProfil → masih localStorage (OK, per device)
- daftarMataKuliah → SEKARANG di database per user_id (DIPERBAIKI)
- jadwal → SEKARANG di database per user_id (DIPERBAIKI)
- tugas → sudah di database
*/
const namaPenyimpananLocalStorage = {
  tugas: "studentTodoTasks", // DEPRECATED
  jadwal: "studentCalendarEvents", // DEPRECATED - sekarang pakai database
  fotoProfil: "studentProfilePhoto",
  namaPengguna: "studentTodoName",
  modeGelap: "studentTodoDarkMode",
  notifikasiDeadline: "studentTodoNotification",
  daftarMataKuliah: "studentTodoCourseList" // DEPRECATED - sekarang pakai database
};

const aturanFotoProfil = {
  ukuranMaksimal: 2 * 1024 * 1024,
  lebarMaksimal: 480,
  tinggiMaksimal: 480,
  tipeFileYangDiizinkan: ["image/jpeg", "image/jpg", "image/png"]
};

const daftarKategoriJadwal = {
  kuliah: { nama: "Kuliah", warna: "#4285f4" },
  organisasi: { nama: "Organisasi", warna: "#34a853" },
  ujian: { nama: "Ujian", warna: "#fbbc04" },
  pribadi: { nama: "Pribadi", warna: "#a142f4" },
  deadline: { nama: "Deadline", warna: "#ea4335" }
};

const daftarMataKuliahDefault = [
  "Analisis dan Perancangan Sistem",
  "Grafika Komputer",
  "Interaksi Manusia dan Komputer",
  "Jaringan Komputer",
  "Pendidikan Agama Islam",
  "Pemrograman Web",
  "Praktikum Jaringan Komputer",
  "Praktikum PBO",
  "Sistem Rekayasa Berkelanjutan",
  "Statistika Untuk Komputasi"
];

/*
================================
DATA UTAMA APLIKASI
================================
Sekarang daftarSemuaTugas diambil dari database, bukan dari localStorage
*/
const dataAplikasi = {
  daftarSemuaTugas: [], // Di-populate dari database saat halaman load
  daftarSemuaJadwal: [], // Di-populate dari database (DIPERBAIKI - bukan localStorage)

  daftarMataKuliah: null, // Di-populate dari database per user (DIPERBAIKI - bukan localStorage)

  kataKunciPencarianTugas: "",
  filterStatusTugas: "semua",
  filterKategoriJadwal: "semua",
  halamanYangSedangDibuka: "dashboard",
  bulanKalenderYangDibuka: new Date(),
  tanggalJadwalYangDipilih: ubahTanggalMenjadiKode(new Date()),
  notifikasiDeadlineAktif: ambilDataDariLocalStorage(namaPenyimpananLocalStorage.notifikasiDeadline, true),
  modeGelapAktif: ambilDataDariLocalStorage(namaPenyimpananLocalStorage.modeGelap, false)
};

// Ambil semua element HTML
const elemenHalaman = {
  body: document.body,
  semuaTombolMenu: document.querySelectorAll(".tombol-menu"),
  semuaHalaman: document.querySelectorAll(".halaman"),
  semuaTombolNavMobile: document.querySelectorAll(".tombol-nav-mobile"),

  teksSapaan: document.getElementById("teksSapaan"),
  teksSapaanHero: document.getElementById("teksSapaanHero"),
  fotoProfilHeader: document.getElementById("fotoProfilHeader"),
  inisialProfilHeader: document.getElementById("inisialProfilHeader"),
  previewFotoProfil: document.getElementById("previewFotoProfil"),
  inisialPreviewProfil: document.getElementById("inisialPreviewProfil"),
  inputFotoProfil: document.getElementById("inputFotoProfil"),
  tombolUploadFoto: document.getElementById("tombolUploadFoto"),
  tombolHapusFoto: document.getElementById("tombolHapusFoto"),
  pesanErrorFotoProfil: document.getElementById("pesanErrorFotoProfil"),

  angkaTotalTugas: document.getElementById("angkaTotalTugas"),
  angkaTugasBelumSelesai: document.getElementById("angkaTugasBelumSelesai"),
  angkaTugasSelesai: document.getElementById("angkaTugasSelesai"),
  angkaDeadlineDekat: document.getElementById("angkaDeadlineDekat"),
  daftarNotifikasiDeadline: document.getElementById("daftarNotifikasiDeadline"),
  daftarTugasTerbaru: document.getElementById("daftarTugasTerbaru"),
  teksTanggalRealtime: document.getElementById("teksTanggalRealtime"),
  teksJamRealtime: document.getElementById("teksJamRealtime"),
  teksTanggalHero: document.getElementById("teksTanggalHero"),
  persenProgressHariIni: document.getElementById("persenProgressHariIni"),
  barProgressHariIni: document.getElementById("barProgressHariIni"),
  teksProgressHariIni: document.getElementById("teksProgressHariIni"),
  angkaFokusHariIni: document.getElementById("angkaFokusHariIni"),
  ringkasanSidebar: document.getElementById("ringkasanSidebar"),
  jumlahTugasHariIni: document.getElementById("jumlahTugasHariIni"),
  jumlahTugasBesok: document.getElementById("jumlahTugasBesok"),
  jumlahTugasSelesaiDashboard: document.getElementById("jumlahTugasSelesaiDashboard"),
  daftarTugasHariIni: document.getElementById("daftarTugasHariIni"),
  daftarTugasBesok: document.getElementById("daftarTugasBesok"),
  daftarTugasSelesaiDashboard: document.getElementById("daftarTugasSelesaiDashboard"),
  judulMiniKalender: document.getElementById("judulMiniKalender"),
  isiMiniKalender: document.getElementById("isiMiniKalender"),
  semuaTombolAksiCepat: document.querySelectorAll("[data-quick-action]"),

  formTambahTugas: document.getElementById("formTambahTugas"),
  inputNamaTugas: document.getElementById("inputNamaTugas"),
  pilihanMataKuliah: document.getElementById("pilihanMataKuliah"),
  inputDeadlineTugas: document.getElementById("inputDeadlineTugas"),
  pilihanPrioritasTugas: document.getElementById("pilihanPrioritasTugas"),
  pesanErrorNamaTugas: document.getElementById("pesanErrorNamaTugas"),
  pesanErrorMataKuliah: document.getElementById("pesanErrorMataKuliah"),
  pesanErrorDeadlineTugas: document.getElementById("pesanErrorDeadlineTugas"),
  inputPencarianTugas: document.getElementById("inputPencarianTugas"),
  filterStatusTugas: document.getElementById("filterStatusTugas"),
  daftarTugas: document.getElementById("daftarTugas"),

  teksBulanKalender: document.getElementById("teksBulanKalender"),
  tombolBulanSebelumnya: document.getElementById("tombolBulanSebelumnya"),
  tombolBulanBerikutnya: document.getElementById("tombolBulanBerikutnya"),
  tombolHariIni: document.getElementById("tombolHariIni"),
  tombolTambahJadwalCepat: document.getElementById("tombolTambahJadwalCepat"),
  filterKategoriJadwal: document.getElementById("filterKategoriJadwal"),
  isiKalender: document.getElementById("isiKalender"),
  daftarAgendaHariIni: document.getElementById("daftarAgendaHariIni"),
  daftarReminderDeadline: document.getElementById("daftarReminderDeadline"),

  inputNamaPengguna: document.getElementById("inputNamaPengguna"),
  tombolSimpanNama: document.getElementById("tombolSimpanNama"),
  toggleModeGelap: document.getElementById("toggleModeGelap"),
  toggleNotifikasiDeadline: document.getElementById("toggleNotifikasiDeadline"),
  tombolResetData: document.getElementById("tombolResetData"),

  inputNamaMataKuliah: document.getElementById("inputNamaMataKuliah"),
  inputWarnaMataKuliah: document.getElementById("inputWarnaMataKuliah"),
  pilihanIconMataKuliah: document.getElementById("pilihanIconMataKuliah"),
  tombolTambahMataKuliah: document.getElementById("tombolTambahMataKuliah"),
  pesanErrorMataKuliahBaru: document.getElementById("pesanErrorMataKuliahBaru"),
  daftarMataKuliahPengaturan: document.getElementById("daftarMataKuliahPengaturan"),

  modalKonfirmasi: document.getElementById("modalKonfirmasi"),
  judulModalKonfirmasi: document.getElementById("judulModalKonfirmasi"),
  pesanModalKonfirmasi: document.getElementById("pesanModalKonfirmasi"),
  tombolBatalKonfirmasi: document.getElementById("tombolBatalKonfirmasi"),
  tombolSetujuKonfirmasi: document.getElementById("tombolSetujuKonfirmasi"),

  modalJadwal: document.getElementById("modalJadwal"),
  formTambahJadwal: document.getElementById("formTambahJadwal"),
  teksTanggalJadwalDipilih: document.getElementById("teksTanggalJadwalDipilih"),
  inputNamaJadwal: document.getElementById("inputNamaJadwal"),
  inputTanggalJadwal: document.getElementById("inputTanggalJadwal"),
  inputJamJadwal: document.getElementById("inputJamJadwal"),
  pilihanKategoriJadwal: document.getElementById("pilihanKategoriJadwal"),
  pesanErrorNamaJadwal: document.getElementById("pesanErrorNamaJadwal"),
  pesanErrorTanggalJadwal: document.getElementById("pesanErrorTanggalJadwal"),
  pesanErrorJamJadwal: document.getElementById("pesanErrorJamJadwal"),
  tombolBatalJadwal: document.getElementById("tombolBatalJadwal"),

  tombolTambahCepatMobile: document.getElementById("tombolTambahCepatMobile"),
  wadahToast: document.getElementById("wadahToast")
};

let fungsiJawabanModalKonfirmasi = null;
const BATAS_RENDER_TUGAS = 80;
let idDebouncePencarianTugas = null;
let cacheRenderKalender = "";

/*
================================
FUNGSI BANTUAN LOCAL STORAGE
================================
*/
function ambilDataDariLocalStorage(namaData, nilaiDefault) {
  const dataTersimpan = localStorage.getItem(namaData);

  if (dataTersimpan === null) {
    return nilaiDefault;
  }

  try {
    return JSON.parse(dataTersimpan);
  } catch (error) {
    return dataTersimpan;
  }
}

function simpanDataKeLocalStorage(namaData, isiData) {
  localStorage.setItem(namaData, JSON.stringify(isiData));
}

async function simpanProfilKeDatabase(payload) {
  const response = await fetch('backend/update_profile.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (data.redirect) { window.location.href = 'login.html'; return null; }
  if (!data.success) throw new Error(data.message);
  return data.profile;
}

/*
================================
FUNGSI BANTUAN DATABASE (FETCH API)
================================
Fungsi-fungsi ini menggantikan simpan/ambil localStorage
untuk data yang user-specific (todos yang disimpan di database)
*/

// Ambil semua todo dari database
// PENTING: credentials: 'same-origin' wajib ada agar cookie session PHP ikut terkirim
async function ambilTugasDariDatabase() {
  try {
    const response = await fetch('backend/ambil_todo.php', {
      method: 'GET',
      credentials: 'same-origin' // Kirim cookie session bersama request
    });
    const data = await response.json();

    // Jika session habis, arahkan ke login
    if (data.redirect) {
      window.location.href = 'login.html';
      return false;
    }

    if (data.success) {
      // Transformasi format database ke format aplikasi
      // Database: { id, nama_tugas, mata_kuliah, deadline, sudah_selesai, dibuat_pada }
      // Aplikasi: { id, namaTugas, mataKuliah, deadline, sudahSelesai, dibuatPada }
      dataAplikasi.daftarSemuaTugas = data.todos.map(todo => ({
        id: todo.id.toString(),          // Simpan sebagai string agar konsisten
        namaTugas: todo.nama_tugas,
        mataKuliah: todo.mata_kuliah,
        deadline: todo.deadline,
        prioritas: todo.prioritas || "sedang",
        sudahSelesai: parseInt(todo.sudah_selesai) === 1,
        dibuatPada: todo.dibuat_pada
      }));

      return true;
    } else {
      console.error('Gagal ambil data:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error fetch ambil_todo:', error);
    return false;
  }
}

// Tambah todo ke database
async function tambahTugaKeDatabase(namaTugas, mataKuliah, deadline, prioritas = "sedang") {
  try {
    const response = await fetch('backend/tambah_todo.php', {
      method: 'POST',
      credentials: 'same-origin', // Kirim cookie session bersama request
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nama_tugas: namaTugas,
        mata_kuliah: mataKuliah,
        deadline: deadline,
        prioritas: prioritas
      })
    });

    const data = await response.json();

    // Jika session habis, arahkan ke login
    if (data.redirect) {
      window.location.href = 'login.html';
      return null;
    }

    if (data.success) {
      // Transform format database ke format aplikasi
      const todoBaru = {
        id: data.todo.id.toString(),       // String agar konsisten dengan filter/pencarian
        namaTugas: data.todo.nama_tugas,
        mataKuliah: data.todo.mata_kuliah,
        deadline: data.todo.deadline,
        prioritas: data.todo.prioritas || "sedang",
        sudahSelesai: parseInt(data.todo.sudah_selesai) === 1,
        dibuatPada: data.todo.dibuat_pada
      };

      dataAplikasi.daftarSemuaTugas.unshift(todoBaru);
      return todoBaru;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error tambah todo:', error);
    throw error;
  }
}

async function editTugaDiDatabase(idTugas, namaTugas, mataKuliah, deadline, prioritas) {
  try {
    const response = await fetch('backend/update_todo.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(idTugas),
        nama_tugas: namaTugas,
        mata_kuliah: mataKuliah,
        deadline: deadline,
        prioritas: prioritas
      })
    });

    const data = await response.json();
    if (data.redirect) {
      window.location.href = 'login.html';
      return null;
    }

    if (!data.success) throw new Error(data.message);

    const tugasUpdate = {
      id: data.todo.id.toString(),
      namaTugas: data.todo.nama_tugas,
      mataKuliah: data.todo.mata_kuliah,
      deadline: data.todo.deadline,
      prioritas: data.todo.prioritas || "sedang",
      sudahSelesai: parseInt(data.todo.sudah_selesai) === 1,
      dibuatPada: data.todo.dibuat_pada
    };

    dataAplikasi.daftarSemuaTugas = dataAplikasi.daftarSemuaTugas.map(t =>
      t.id === tugasUpdate.id ? tugasUpdate : t
    );

    return tugasUpdate;
  } catch (error) {
    console.error('Error edit todo:', error);
    throw error;
  }
}

// Hapus todo dari database
async function hapusTugaDariDatabase(idTugas) {
  try {
    const response = await fetch('backend/hapus_todo.php', {
      method: 'POST',
      credentials: 'same-origin', // Kirim cookie session bersama request
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: parseInt(idTugas) })
    });

    const data = await response.json();

    // Jika session habis, arahkan ke login
    if (data.redirect) {
      window.location.href = 'login.html';
      return false;
    }

    if (data.success) {
      // Hapus dari dataAplikasi — bandingkan sebagai string (id disimpan sebagai string)
      dataAplikasi.daftarSemuaTugas = dataAplikasi.daftarSemuaTugas.filter(
        tugas => tugas.id !== idTugas.toString()
      );
      return true;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error hapus todo:', error);
    throw error;
  }
}

// Update status todo di database (toggle selesai ↔ belum selesai)
async function ubahStatusSelesaiTugaDiDatabase(idTugas) {
  try {
    // Cari todo saat ini di dataAplikasi — id disimpan sebagai string
    const tugas = dataAplikasi.daftarSemuaTugas.find(t => t.id === idTugas.toString());
    if (!tugas) return false;

    const statusBaru = tugas.sudahSelesai ? 0 : 1; // Toggle: selesai jadi belum, atau sebaliknya

    const response = await fetch('backend/update_todo.php', {
      method: 'POST',
      credentials: 'same-origin', // Kirim cookie session bersama request
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: parseInt(idTugas),
        sudah_selesai: statusBaru
      })
    });

    const data = await response.json();

    // Jika session habis, arahkan ke login
    if (data.redirect) {
      window.location.href = 'login.html';
      return false;
    }

    if (data.success) {
      // Update di dataAplikasi — bandingkan sebagai string
      dataAplikasi.daftarSemuaTugas = dataAplikasi.daftarSemuaTugas.map(t => {
        if (t.id === idTugas.toString()) {
          return { ...t, sudahSelesai: statusBaru === 1 };
        }
        return t;
      });
      return true;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error update todo:', error);
    throw error;
  }
}

// [DIPERBAIKI] Jadwal sekarang disimpan ke database, fungsi ini tidak dipakai lagi
function simpanDaftarJadwal() {
  // No-op: jadwal disimpan langsung via fetch ke tambah_jadwal.php
}

/* ================================================
   FUNGSI DATABASE: JADWAL
================================================ */
async function ambilJadwalDariDatabase() {
  try {
    const resp = await fetch('backend/ambil_jadwal.php', {
      method: 'GET',
      credentials: 'same-origin'
    });
    const data = await resp.json();
    if (data.redirect) { window.location.href = 'login.html'; return false; }
    if (data.success) {
      dataAplikasi.daftarSemuaJadwal = data.jadwal.map(j => ({
        id: j.id.toString(),
        judul: j.judul,
        tanggal: j.tanggal,
        jam: j.jam,
        kategori: j.kategori
      }));
      return true;
    }
    console.error('[DEBUG] Gagal ambil jadwal:', data.message);
    return false;
  } catch (err) {
    console.error('[DEBUG] Error fetch ambil_jadwal:', err);
    return false;
  }
}

async function tambahJadwalKeDatabase(judul, tanggal, jam, kategori) {
  try {
    const resp = await fetch('backend/tambah_jadwal.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judul, tanggal, jam, kategori })
    });
    const data = await resp.json();
    if (data.redirect) { window.location.href = 'login.html'; return null; }
    if (data.success) {
      const jadwalBaru = {
        id: data.jadwal.id.toString(),
        judul: data.jadwal.judul,
        tanggal: data.jadwal.tanggal,
        jam: data.jadwal.jam,
        kategori: data.jadwal.kategori
      };
      dataAplikasi.daftarSemuaJadwal.push(jadwalBaru);
      return jadwalBaru;
    }
    throw new Error(data.message);
  } catch (err) {
    console.error('[DEBUG] Error tambah jadwal:', err);
    throw err;
  }
}

async function hapusJadwalDariDatabase(idJadwal) {
  try {
    const resp = await fetch('backend/hapus_jadwal.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: parseInt(idJadwal) })
    });
    const data = await resp.json();
    if (data.redirect) { window.location.href = 'login.html'; return false; }
    if (data.success) {
      dataAplikasi.daftarSemuaJadwal = dataAplikasi.daftarSemuaJadwal.filter(j => j.id !== idJadwal.toString());
      return true;
    }
    throw new Error(data.message);
  } catch (err) {
    console.error('[DEBUG] Error hapus jadwal:', err);
    throw err;
  }
}

/* ================================================
   FUNGSI DATABASE: MATA KULIAH
================================================ */
async function ambilMataKuliahDariDatabase() {
  try {
    const resp = await fetch('backend/ambil_mata_kuliah.php', {
      method: 'GET',
      credentials: 'same-origin'
    });
    const data = await resp.json();
    if (data.redirect) { window.location.href = 'login.html'; return false; }
    if (data.success) {
      // Simpan sebagai array objek {id, nama}
      dataAplikasi.daftarMataKuliah = data.mata_kuliah;
      return true;
    }
    console.error('[DEBUG] Gagal ambil mata kuliah:', data.message);
    return false;
  } catch (err) {
    console.error('[DEBUG] Error fetch ambil_mata_kuliah:', err);
    return false;
  }
}

async function tambahMataKuliahKeDatabase(nama, color = "#4f46e5", icon = "book") {
  try {
    const resp = await fetch('backend/tambah_mata_kuliah.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, color, icon })
    });
    const data = await resp.json();
    if (data.redirect) { window.location.href = 'login.html'; return null; }
    if (data.success) {
      if (!dataAplikasi.daftarMataKuliah) dataAplikasi.daftarMataKuliah = [];
      // Hindari duplikat di array lokal
      const sudahAda = dataAplikasi.daftarMataKuliah.find(mk => mk.id === data.mata_kuliah.id.toString());
      if (!sudahAda) {
        dataAplikasi.daftarMataKuliah.push({
          id: data.mata_kuliah.id.toString(),
          nama: data.mata_kuliah.nama,
          color: data.mata_kuliah.color || color,
          icon: data.mata_kuliah.icon || icon
        });
      }
      return data.mata_kuliah;
    }
    throw new Error(data.message);
  } catch (err) {
    console.error('[DEBUG] Error tambah mata kuliah:', err);
    throw err;
  }
}

async function updateMataKuliahKeDatabase(id, nama, color = "#4f46e5", icon = "book") {
  try {
    const resp = await fetch('backend/update_mata_kuliah.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: parseInt(id), nama, color, icon })
    });
    const data = await resp.json();
    if (data.redirect) { window.location.href = 'login.html'; return null; }
    if (data.success) {
      dataAplikasi.daftarMataKuliah = (dataAplikasi.daftarMataKuliah || []).map(mk =>
        mk.id.toString() === id.toString()
          ? {
              id: data.mata_kuliah.id.toString(),
              nama: data.mata_kuliah.nama,
              color: data.mata_kuliah.color,
              icon: data.mata_kuliah.icon
            }
          : mk
      );
      return data.mata_kuliah;
    }
    throw new Error(data.message);
  } catch (err) {
    console.error('Error update mata kuliah:', err);
    throw err;
  }
}

async function hapusMataKuliahDariDatabase(mkId) {
  try {
    const resp = await fetch('backend/hapus_mata_kuliah.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: parseInt(mkId) })
    });
    const data = await resp.json();
    if (data.redirect) { window.location.href = 'login.html'; return false; }
    if (data.success) {
      dataAplikasi.daftarMataKuliah = dataAplikasi.daftarMataKuliah.filter(mk => mk.id.toString() !== mkId.toString());
      return true;
    }
    throw new Error(data.message);
  } catch (err) {
    console.error('[DEBUG] Error hapus mata kuliah:', err);
    throw err;
  }
}

/*
================================
FUNGSI BANTUAN TANGGAL
================================
*/
function ubahTanggalMenjadiKode(tanggal) {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

function ubahKodeMenjadiTanggal(kodeTanggal) {
  const bagianTanggal = kodeTanggal.split("-");
  const tahun = Number(bagianTanggal[0]);
  const bulan = Number(bagianTanggal[1]);
  const hari = Number(bagianTanggal[2]);

  return new Date(tahun, bulan - 1, hari);
}

function cekApakahTanggalSama(tanggalPertama, tanggalKedua) {
  return ubahTanggalMenjadiKode(tanggalPertama) === ubahTanggalMenjadiKode(tanggalKedua);
}

function formatTanggalIndonesia(kodeTanggal) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(ubahKodeMenjadiTanggal(kodeTanggal));
}

function hitungSisaHari(kodeTanggalDeadline) {
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const tanggalDeadline = ubahKodeMenjadiTanggal(kodeTanggalDeadline);
  tanggalDeadline.setHours(0, 0, 0, 0);

  const selisihWaktu = tanggalDeadline - hariIni;
  return Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));
}

function buatTeksSisaDeadline(kodeTanggalDeadline) {
  const sisaHari = hitungSisaHari(kodeTanggalDeadline);

  if (sisaHari < 0) {
    return "Terlewat";
  }

  if (sisaHari === 0) {
    return "Hari ini";
  }

  if (sisaHari === 1) {
    return "Besok";
  }

  return `${sisaHari} hari lagi`;
}

function formatTanggalPanjangIndonesia(tanggal) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(tanggal);
}

function tampilkanTanggalRealtime() {
  const sekarang = new Date();
  const teksTanggal = formatTanggalPanjangIndonesia(sekarang);
  const teksJam = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(sekarang);

  if (elemenHalaman.teksTanggalRealtime) {
    elemenHalaman.teksTanggalRealtime.textContent = teksTanggal;
  }

  if (elemenHalaman.teksJamRealtime) {
    elemenHalaman.teksJamRealtime.textContent = teksJam;
  }

  if (elemenHalaman.teksTanggalHero) {
    elemenHalaman.teksTanggalHero.textContent = teksTanggal;
  }
}

/*
================================
FUNGSI BANTUAN KEAMANAN TEKS
================================
*/
function amankanTeksUntukHtml(teks) {
  return String(teks)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buatTampilanKosong(pesan) {
  return `<div class="kotak-kosong">${pesan}</div>`;
}

function tampilkanToast(pesan) {
  const toastBaru = document.createElement("div");

  toastBaru.className = "toast";
  toastBaru.textContent = pesan;
  elemenHalaman.wadahToast.appendChild(toastBaru);

  setTimeout(function () {
    toastBaru.classList.add("toast-keluar");
  }, 2400);

  setTimeout(function () {
    toastBaru.remove();
  }, 2800);
}

/*
================================
FUNGSI DATA TUGAS (dari script.js original)
================================
Tetap digunakan untuk business logic, tapi penyimpanan
sudah dihubungkan ke database.
*/
function buatDataTugas(namaTugas, mataKuliah, deadline) {
  return {
    id: Date.now().toString(),
    namaTugas: namaTugas,
    mataKuliah: mataKuliah,
    deadline: deadline,
    sudahSelesai: false,
    dibuatPada: new Date().toISOString()
  };
}

function ambilTugasYangDeadlineDekat() {
  return dataAplikasi.daftarSemuaTugas.filter(function (tugas) {
    const sisaHari = hitungSisaHari(tugas.deadline);
    return !tugas.sudahSelesai && sisaHari >= 0 && sisaHari <= 2;
  });
}

function ambilTugasSesuaiFilter() {
  const kataKunci = dataAplikasi.kataKunciPencarianTugas.toLowerCase();

  return dataAplikasi.daftarSemuaTugas.filter(function (tugas) {
    const cocokDenganKataKunci =
      tugas.namaTugas.toLowerCase().includes(kataKunci) ||
      tugas.mataKuliah.toLowerCase().includes(kataKunci);

    const cocokDenganStatus =
      dataAplikasi.filterStatusTugas === "semua" ||
      (dataAplikasi.filterStatusTugas === "selesai" && tugas.sudahSelesai) ||
      (dataAplikasi.filterStatusTugas === "belum" && !tugas.sudahSelesai);

    return cocokDenganKataKunci && cocokDenganStatus;
  });
}

/*
================================
RENDER HALAMAN
================================
Menggunakan data dari dataAplikasi.daftarSemuaTugas
yang sekarang diambil dari database.
*/
function render() {
  renderTampilan();
  renderHalamanAktif();
}

function renderTampilan() {
  // Ambil nama dari session PHP; localStorage lama hanya fallback migrasi.
  const namaDariPHP       = document.body.dataset.nama || '';
  const namaDariStorage   = ambilDataDariLocalStorage(namaPenyimpananLocalStorage.namaPengguna, '');
  const namaPengguna      = namaDariPHP || namaDariStorage || 'User';
  const inisialPengguna   = namaPengguna.charAt(0).toUpperCase();

  // Hanya update teksSapaan jika belum diisi PHP (cegah overwrite saat re-render)
  if (elemenHalaman.teksSapaan) {
    elemenHalaman.teksSapaan.textContent = `Selamat datang kembali, ${namaPengguna} 👋`;
  }
  if (elemenHalaman.teksSapaanHero) {
    elemenHalaman.teksSapaanHero.textContent = `Selamat datang kembali, ${namaPengguna} 👋`;
  }
  if (elemenHalaman.inisialProfilHeader)  elemenHalaman.inisialProfilHeader.textContent  = inisialPengguna;
  if (elemenHalaman.inisialPreviewProfil) elemenHalaman.inisialPreviewProfil.textContent = inisialPengguna;
  if (elemenHalaman.inputNamaPengguna)    elemenHalaman.inputNamaPengguna.value           = namaPengguna;

  tampilkanTanggalRealtime();
  perbaruhiTampilan();
}

function renderHalamanAktif() {
  const halamanAktif = dataAplikasi.halamanYangSedangDibuka;

  if (halamanAktif === "dashboard") {
    renderDashboard();
  } else if (halamanAktif === "tugas") {
    renderHalamanTugas();
  } else if (halamanAktif === "kalender") {
    renderKalender();
  }
}

function renderDashboard() {
  const daftarTugasHariIni = dataAplikasi.daftarSemuaTugas.filter(tugas => {
    const sisaHari = hitungSisaHari(tugas.deadline);
    return !tugas.sudahSelesai && sisaHari === 0;
  });

  const daftarTugasBesok = dataAplikasi.daftarSemuaTugas.filter(tugas => {
    const sisaHari = hitungSisaHari(tugas.deadline);
    return !tugas.sudahSelesai && sisaHari === 1;
  });

  const daftarTugasSelesai = dataAplikasi.daftarSemuaTugas.filter(tugas => tugas.sudahSelesai);

  const daftarTugasTerbaru = dataAplikasi.daftarSemuaTugas.slice(0, 5);

  elemenHalaman.jumlahTugasHariIni.textContent = daftarTugasHariIni.length;
  elemenHalaman.jumlahTugasBesok.textContent = daftarTugasBesok.length;
  elemenHalaman.jumlahTugasSelesaiDashboard.textContent = daftarTugasSelesai.length;

  elemenHalaman.daftarTugasHariIni.innerHTML = daftarTugasHariIni.length
    ? daftarTugasHariIni.map(buatHtmlItemTugasRingkas).join("")
    : buatTampilanKosong("Tidak ada tugas hari ini");

  elemenHalaman.daftarTugasBesok.innerHTML = daftarTugasBesok.length
    ? daftarTugasBesok.map(buatHtmlItemTugasRingkas).join("")
    : buatTampilanKosong("Tidak ada tugas besok");

  elemenHalaman.daftarTugasSelesaiDashboard.innerHTML = daftarTugasSelesai.length
    ? daftarTugasSelesai.map(buatHtmlItemTugasRingkas).join("")
    : buatTampilanKosong("Belum ada tugas selesai");

  elemenHalaman.daftarTugasTerbaru.innerHTML = daftarTugasTerbaru.length
    ? daftarTugasTerbaru.map(buatHtmlItemTugasRingkas).join("")
    : buatTampilanKosong("Tambahkan tugas pertamamu");

  perbaruhiStatistikDashboard();
  perbaruhiRingkasanSidebar();
}

function renderHalamanTugas() {
  const tugasYangDifilter = ambilTugasSesuaiFilter();

  elemenHalaman.daftarTugas.innerHTML = tugasYangDifilter.length
    ? tugasYangDifilter.slice(0, BATAS_RENDER_TUGAS).map(buatHtmlItemTugas).join("")
    : buatTampilanKosong("Tidak ada tugas yang sesuai filter");
}

function renderKalender() {
  const bulan = dataAplikasi.bulanKalenderYangDibuka;
  const namaKalender = bulan.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  elemenHalaman.teksBulanKalender.textContent = namaKalender;

  const daftarItem = ambilSemuaItemKalender();
  const petaItem = buatPetaItemKalenderBerdasarkanTanggal();
  urutkanPetaItemKalender(petaItem);

  elemenHalaman.isiKalender.innerHTML = buatHtmlKalender(bulan, petaItem);

  renderAgendaHariIni(petaItem);
  renderReminderDeadline();
}

function perbaruhiStatistikDashboard() {
  const totalTugas = dataAplikasi.daftarSemuaTugas.length;
  const tugasSelesai = dataAplikasi.daftarSemuaTugas.filter(t => t.sudahSelesai).length;
  const tugasBelumSelesai = totalTugas - tugasSelesai;
  const deadlineDekat = ambilTugasYangDeadlineDekat().length;

  elemenHalaman.angkaTotalTugas.textContent = totalTugas;
  elemenHalaman.angkaTugasSelesai.textContent = tugasSelesai;
  elemenHalaman.angkaTugasBelumSelesai.textContent = tugasBelumSelesai;
  elemenHalaman.angkaDeadlineDekat.textContent = deadlineDekat;

  const persenProgress = totalTugas === 0 ? 0 : Math.round((tugasSelesai / totalTugas) * 100);
  elemenHalaman.persenProgressHariIni.textContent = persenProgress + "%";
  elemenHalaman.barProgressHariIni.style.width = persenProgress + "%";

  const tugasHariIni = dataAplikasi.daftarSemuaTugas.filter(t => {
    const sisaHari = hitungSisaHari(t.deadline);
    return !t.sudahSelesai && sisaHari === 0;
  }).length;

  elemenHalaman.angkaFokusHariIni.textContent = tugasHariIni;

  if (tugasSelesai > 0) {
    elemenHalaman.teksProgressHariIni.textContent = `${tugasSelesai} tugas selesai dari ${totalTugas}.`;
  } else {
    elemenHalaman.teksProgressHariIni.textContent = "Belum ada tugas selesai hari ini.";
  }
}

function perbaruhiRingkasanSidebar() {
  const tugasAktif = dataAplikasi.daftarSemuaTugas.filter(t => !t.sudahSelesai).length;
  elemenHalaman.ringkasanSidebar.textContent = `${tugasAktif} tugas aktif`;
}

/*
================================
EVENT LISTENERS & INISIALISASI
================================
*/

// Form tambah tugas
elemenHalaman.formTambahTugas.addEventListener("submit", async function (e) {
  e.preventDefault();

  const namaTugas = elemenHalaman.inputNamaTugas.value.trim();
  const mataKuliah = elemenHalaman.pilihanMataKuliah.value;
  const deadline = elemenHalaman.inputDeadlineTugas.value;
  const prioritas = elemenHalaman.pilihanPrioritasTugas ? elemenHalaman.pilihanPrioritasTugas.value : "sedang";

  // Validasi
  let formValid = true;
  elemenHalaman.pesanErrorNamaTugas.textContent = "";
  elemenHalaman.pesanErrorMataKuliah.textContent = "";
  elemenHalaman.pesanErrorDeadlineTugas.textContent = "";

  if (namaTugas.length < 3) {
    elemenHalaman.pesanErrorNamaTugas.textContent = "Nama tugas minimal 3 karakter.";
    formValid = false;
  }

  if (!mataKuliah) {
    elemenHalaman.pesanErrorMataKuliah.textContent = "Pilih mata kuliah terlebih dahulu.";
    formValid = false;
  }

  if (!deadline) {
    elemenHalaman.pesanErrorDeadlineTugas.textContent = "Pilih tanggal deadline.";
    formValid = false;
  } else if (hitungSisaHari(deadline) < 0) {
    elemenHalaman.pesanErrorDeadlineTugas.textContent = "Deadline tidak boleh tanggal yang sudah lewat.";
    formValid = false;
  }

  if (!formValid) return;

  // Tambah ke database
  try {
    await tambahTugaKeDatabase(namaTugas, mataKuliah, deadline, prioritas);
    tampilkanToast("Tugas berhasil ditambahkan");

    // Reset form
    elemenHalaman.formTambahTugas.reset();

    // Re-render
    render();
  } catch (error) {
    tampilkanToast("Gagal menambahkan tugas: " + error.message);
  }
});

// Event untuk ubah status tugas
document.addEventListener("click", async function (e) {
  if (e.target.matches(".checkbox-tugas")) {
    const idTugas = e.target.dataset.id;
    try {
      await ubahStatusSelesaiTugaDiDatabase(idTugas);
      render();
    } catch (error) {
      tampilkanToast("Gagal mengupdate tugas");
    }
  }

  if (e.target.matches(".tombol-hapus-tugas")) {
    const idTugas = e.target.dataset.id;
    if (!confirm("Yakin ingin menghapus tugas ini?")) return;

    try {
      await hapusTugaDariDatabase(idTugas);
      tampilkanToast("Tugas berhasil dihapus");
      render();
    } catch (error) {
      tampilkanToast("Gagal menghapus tugas");
    }
  }

  if (e.target.matches(".tombol-edit-tugas")) {
    const idTugas = e.target.dataset.id;
    const tugas = dataAplikasi.daftarSemuaTugas.find(t => t.id === idTugas);
    if (!tugas) return;

    const namaBaru = prompt("Edit nama tugas", tugas.namaTugas);
    if (namaBaru === null) return;

    const deadlineBaru = prompt("Edit deadline (YYYY-MM-DD)", tugas.deadline);
    if (deadlineBaru === null) return;

    const prioritasBaru = prompt("Edit prioritas: rendah, sedang, atau tinggi", tugas.prioritas || "sedang");
    if (prioritasBaru === null) return;

    const namaBersih = namaBaru.trim();
    const deadlineBersih = deadlineBaru.trim();
    const prioritasBersih = prioritasBaru.trim().toLowerCase();

    if (namaBersih.length < 3) {
      tampilkanToast("Nama tugas minimal 3 karakter");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadlineBersih)) {
      tampilkanToast("Format deadline harus YYYY-MM-DD");
      return;
    }
    if (!["rendah", "sedang", "tinggi"].includes(prioritasBersih)) {
      tampilkanToast("Prioritas harus rendah, sedang, atau tinggi");
      return;
    }

    try {
      await editTugaDiDatabase(idTugas, namaBersih, tugas.mataKuliah, deadlineBersih, prioritasBersih);
      tampilkanToast("Tugas berhasil diperbarui");
      render();
    } catch (error) {
      tampilkanToast("Gagal mengedit tugas: " + error.message);
    }
  }
});

// Search & filter
elemenHalaman.inputPencarianTugas.addEventListener("input", function () {
  dataAplikasi.kataKunciPencarianTugas = this.value;
  clearTimeout(idDebouncePencarianTugas);
  idDebouncePencarianTugas = setTimeout(() => render(), 300);
});

elemenHalaman.filterStatusTugas.addEventListener("change", function () {
  dataAplikasi.filterStatusTugas = this.value;
  render();
});

// Menu navigation
elemenHalaman.semuaTombolMenu.forEach(tombol => {
  tombol.addEventListener("click", function () {
    const halaman = this.dataset.halaman;
    beralihHalaman(halaman);
  });
});

elemenHalaman.semuaTombolNavMobile.forEach(tombol => {
  tombol.addEventListener("click", function () {
    const halaman = this.dataset.halaman;
    beralihHalaman(halaman);
  });
});

function beralihHalaman(namaHalaman) {
  dataAplikasi.halamanYangSedangDibuka = namaHalaman;

  elemenHalaman.semuaTombolMenu.forEach(t => t.classList.remove("aktif"));
  elemenHalaman.semuaTombolNavMobile.forEach(t => t.classList.remove("aktif"));
  elemenHalaman.semuaHalaman.forEach(h => h.classList.remove("halaman-aktif"));

  const tombolMenuAktif = document.querySelector(`[data-halaman="${namaHalaman}"].tombol-menu`);
  if (tombolMenuAktif) tombolMenuAktif.classList.add("aktif");
  const tombolMobileAktif = document.querySelector(`[data-halaman="${namaHalaman}"].tombol-nav-mobile`);
  if (tombolMobileAktif) tombolMobileAktif.classList.add("aktif");
  const halamanEl = document.getElementById(namaHalaman);
  if (halamanEl) halamanEl.classList.add("halaman-aktif");

  render();
}

// Modegelap
elemenHalaman.toggleModeGelap.addEventListener("change", function () {
  if (this.checked) {
    elemenHalaman.body.classList.add("mode-gelap");
  } else {
    elemenHalaman.body.classList.remove("mode-gelap");
  }
  simpanDataKeLocalStorage(namaPenyimpananLocalStorage.modeGelap, this.checked);
  simpanProfilKeDatabase({
    name: elemenHalaman.inputNamaPengguna ? elemenHalaman.inputNamaPengguna.value.trim() || document.body.dataset.nama || "User" : document.body.dataset.nama || "User",
    theme: this.checked ? "dark" : "light"
  }).catch(() => tampilkanToast("Preferensi dark mode belum tersimpan ke akun"));
});

// Simpan nama user
elemenHalaman.tombolSimpanNama.addEventListener("click", function () {
  const namaBaru = elemenHalaman.inputNamaPengguna.value.trim();
  if (!namaBaru) {
    tampilkanToast("Nama tidak boleh kosong");
    return;
  }
  simpanProfilKeDatabase({
    name: namaBaru,
    theme: elemenHalaman.toggleModeGelap && elemenHalaman.toggleModeGelap.checked ? "dark" : "light"
  }).then(function () {
    document.body.dataset.nama = namaBaru;
    localStorage.removeItem(namaPenyimpananLocalStorage.namaPengguna);
    tampilkanToast("Nama berhasil disimpan");
    renderTampilan();
  }).catch(function (error) {
    tampilkanToast("Gagal menyimpan nama: " + error.message);
  });
});

/*
================================
FUNGSI-FUNGSI RENDER HTML
================================
*/

function buatHtmlItemTugas(tugas) {
  const statusClass = tugas.sudahSelesai ? "tugas-selesai" : "";
  const checkboxChecked = tugas.sudahSelesai ? "checked" : "";
  const teksDeadline = buatTeksSisaDeadline(tugas.deadline);
  const formatDeadline = formatTanggalIndonesia(tugas.deadline);
  const prioritas = tugas.prioritas || "sedang";
  const labelPrioritas = prioritas.charAt(0).toUpperCase() + prioritas.slice(1);

  return `
    <div class="item-tugas ${statusClass}" data-id="${tugas.id}">
      <div class="bagian-checkbox">
        <input type="checkbox" class="checkbox-tugas" data-id="${tugas.id}" ${checkboxChecked}>
      </div>
      <div class="konten-tugas">
        <h4>${amankanTeksUntukHtml(tugas.namaTugas)}</h4>
        <small class="label-prioritas">Prioritas ${labelPrioritas}</small>
        <p class="keterangan-tugas">${amankanTeksUntukHtml(tugas.mataKuliah)} • ${formatDeadline}</p>
      </div>
      <div class="badge-deadline ${teksDeadline === 'Terlewat' ? 'badge-terlewat' : ''}">${teksDeadline}</div>
      <button class="tombol-edit-tugas" type="button" data-id="${tugas.id}">Edit</button>
      <button class="tombol-hapus-tugas" type="button" data-id="${tugas.id}">Hapus</button>
    </div>
  `;
}

function buatHtmlItemTugasRingkas(tugas) {
  const statusClass = tugas.sudahSelesai ? "tugas-selesai" : "";
  const checkboxChecked = tugas.sudahSelesai ? "checked" : "";
  const teksDeadline = buatTeksSisaDeadline(tugas.deadline);

  return `
    <div class="item-tugas-ringkas ${statusClass}">
      <input type="checkbox" class="checkbox-tugas" data-id="${tugas.id}" ${checkboxChecked}>
      <div>
        <h5>${amankanTeksUntukHtml(tugas.namaTugas)}</h5>
        <small>${teksDeadline}</small>
      </div>
    </div>
  `;
}

function buatHtmlKalender(bulan, petaItem) {
  const tahun = bulan.getFullYear();
  const bulanIndex = bulan.getMonth();

  const tanggalPertama = new Date(tahun, bulanIndex, 1);
  const hari1 = tanggalPertama.getDay();

  const jumlahHariDalamBulan = new Date(tahun, bulanIndex + 1, 0).getDate();

  let html = "";

  // Hari kosong di awal
  for (let i = 0; i < hari1; i++) {
    html += '<div class="hari-kalender hari-lain-bulan"></div>';
  }

  // Hari-hari dalam bulan
  for (let hari = 1; hari <= jumlahHariDalamBulan; hari++) {
    const kodeTanggal = ubahTanggalMenjadiKode(new Date(tahun, bulanIndex, hari));
    const jumlahItem = petaItem[kodeTanggal]?.length || 0;
    const isToday = cekApakahTanggalSama(new Date(), new Date(tahun, bulanIndex, hari));

    html += `
      <div class="hari-kalender ${isToday ? 'hari-hari-ini' : ''}${jumlahItem > 0 ? ' ada-item' : ''}"
           data-tanggal="${kodeTanggal}">
        <span class="nomor-hari">${hari}</span>
        ${jumlahItem > 0 ? `<span class="indikator-item">${jumlahItem}</span>` : ''}
      </div>
    `;
  }

  // Hari kosong di akhir (tampilkan grid 35 atau 42 kotak agar layout konsisten)
  const totalKotak = hari1 + jumlahHariDalamBulan;
  const kotakSisa = (totalKotak <= 35) ? (35 - totalKotak) : (42 - totalKotak);
  for (let i = 0; i < kotakSisa; i++) {
    html += '<div class="hari-kalender hari-lain-bulan"></div>';
  }

  return html;
}

function renderAgendaHariIni(petaItem) {
  const hariIniKode = ubahTanggalMenjadiKode(new Date());
  const itemHariIni = petaItem[hariIniKode] || [];

  elemenHalaman.daftarAgendaHariIni.innerHTML = itemHariIni.length
    ? itemHariIni.map(item => `<div class="item-agenda"><strong>${item.jam}</strong> ${amankanTeksUntukHtml(item.judul)}</div>`).join("")
    : buatTampilanKosong("Tidak ada agenda hari ini");
}

function renderReminderDeadline() {
  const deadlineDekat = ambilTugasYangDeadlineDekat();
  elemenHalaman.daftarReminderDeadline.innerHTML = deadlineDekat.length
    ? deadlineDekat.map(t => `<div class="item-reminder"><strong>${buatTeksSisaDeadline(t.deadline)}</strong> ${amankanTeksUntukHtml(t.namaTugas)}</div>`).join("")
    : buatTampilanKosong("Tidak ada deadline dekat");
}

function perbaruhiTampilan() {
  // [DIPERBAIKI] daftarMataKuliah sekarang array objek {id, nama} dari database
  // Jika belum di-load (null), tampilkan default
  const matakuList = dataAplikasi.daftarMataKuliah
    ? dataAplikasi.daftarMataKuliah.map(mk => mk.nama)
    : daftarMataKuliahDefault;

  elemenHalaman.pilihanMataKuliah.innerHTML = '<option value="">Pilih mata kuliah</option>' +
    matakuList.map(mk => `<option value="${amankanTeksUntukHtml(mk)}">${amankanTeksUntukHtml(mk)}</option>`).join("");

  // Update checkbox mode gelap
  elemenHalaman.toggleModeGelap.checked = dataAplikasi.modeGelapAktif;
  if (dataAplikasi.modeGelapAktif) {
    elemenHalaman.body.classList.add("mode-gelap");
  }
}

/*
================================
BUG FIX #3: FUNGSI KALENDER YANG HILANG
================================
Tiga fungsi ini dipanggil di renderKalender() tapi tidak pernah didefinisikan.
Akibatnya: halaman kalender selalu crash dengan ReferenceError.
*/

// Kumpulkan semua item kalender: jadwal + deadline tugas
function ambilSemuaItemKalender() {
  const filterKategori = dataAplikasi.filterKategoriJadwal;

  // Jadwal dari localStorage
  const jadwalFiltered = dataAplikasi.daftarSemuaJadwal.filter(function (jadwal) {
    return filterKategori === "semua" || jadwal.kategori === filterKategori;
  });

  // Deadline tugas dari database — tampil sebagai kategori "deadline"
  const deadlineItems = (filterKategori === "semua" || filterKategori === "deadline")
    ? dataAplikasi.daftarSemuaTugas
        .filter(t => !t.sudahSelesai)
        .map(t => ({
          id: "deadline-" + t.id,
          judul: t.namaTugas,
          tanggal: t.deadline,
          jam: "23:59",
          kategori: "deadline"
        }))
    : [];

  return [...jadwalFiltered, ...deadlineItems];
}

// Buat peta { "YYYY-MM-DD": [item, item, ...] } untuk render kalender
function buatPetaItemKalenderBerdasarkanTanggal() {
  const semuaItem = ambilSemuaItemKalender();
  const peta = {};

  semuaItem.forEach(function (item) {
    const kode = item.tanggal;
    if (!peta[kode]) {
      peta[kode] = [];
    }
    peta[kode].push(item);
  });

  return peta;
}

// Urutkan tiap tanggal berdasarkan jam
function urutkanPetaItemKalender(petaItem) {
  Object.keys(petaItem).forEach(function (kode) {
    petaItem[kode].sort(function (a, b) {
      return (a.jam || "00:00").localeCompare(b.jam || "00:00");
    });
  });
}

/*
================================
BUG FIX #4: MINI KALENDER DASHBOARD TIDAK DIRENDER
================================
renderDashboard() tidak pernah memanggil fungsi render mini kalender.
*/
function renderMiniKalender() {
  const bulan = new Date();
  const tahun = bulan.getFullYear();
  const bulanIndex = bulan.getMonth();

  const namaKalender = bulan.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  if (elemenHalaman.judulMiniKalender) {
    elemenHalaman.judulMiniKalender.textContent = namaKalender;
  }

  const tanggalPertama = new Date(tahun, bulanIndex, 1);
  const hari1 = tanggalPertama.getDay();
  const jumlahHari = new Date(tahun, bulanIndex + 1, 0).getDate();

  let html = "";

  for (let i = 0; i < hari1; i++) {
    html += '<div class="mini-hari kosong"></div>';
  }

  const petaItem = buatPetaItemKalenderBerdasarkanTanggal();

  for (let h = 1; h <= jumlahHari; h++) {
    const kode = ubahTanggalMenjadiKode(new Date(tahun, bulanIndex, h));
    const isToday = cekApakahTanggalSama(new Date(), new Date(tahun, bulanIndex, h));
    const adaItem = petaItem[kode] && petaItem[kode].length > 0;

    // gunakan kelas sesuai CSS: mini-hari-ini & mini-ada-agenda
    html += `<div class="mini-hari ${isToday ? "mini-hari-ini" : ""} ${adaItem ? "mini-ada-agenda" : ""}">${h}</div>`;
  }

  if (elemenHalaman.isiMiniKalender) {
    elemenHalaman.isiMiniKalender.innerHTML = html;
  }
}

/*
================================
BUG FIX #5 & #6: EVENT LISTENER KALENDER NAVIGASI + AKSI CEPAT
================================
tombolBulanSebelumnya, tombolBulanBerikutnya, tombolHariIni, dan semuaTombolAksiCepat
tidak pernah diberi event listener.
*/

// Navigasi bulan kalender
if (elemenHalaman.tombolBulanSebelumnya) {
  elemenHalaman.tombolBulanSebelumnya.addEventListener("click", function () {
    const bulan = dataAplikasi.bulanKalenderYangDibuka;
    dataAplikasi.bulanKalenderYangDibuka = new Date(bulan.getFullYear(), bulan.getMonth() - 1, 1);
    renderKalender();
  });
}

if (elemenHalaman.tombolBulanBerikutnya) {
  elemenHalaman.tombolBulanBerikutnya.addEventListener("click", function () {
    const bulan = dataAplikasi.bulanKalenderYangDibuka;
    dataAplikasi.bulanKalenderYangDibuka = new Date(bulan.getFullYear(), bulan.getMonth() + 1, 1);
    renderKalender();
  });
}

if (elemenHalaman.tombolHariIni) {
  elemenHalaman.tombolHariIni.addEventListener("click", function () {
    dataAplikasi.bulanKalenderYangDibuka = new Date();
    renderKalender();
  });
}

// Filter kategori kalender
if (elemenHalaman.filterKategoriJadwal) {
  elemenHalaman.filterKategoriJadwal.addEventListener("change", function () {
    dataAplikasi.filterKategoriJadwal = this.value;
    renderKalender();
  });
}

// Aksi cepat di dashboard
elemenHalaman.semuaTombolAksiCepat.forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    const aksi = this.dataset.quickAction;
    if (aksi === "tambah-tugas") {
      beralihHalaman("tugas");
      setTimeout(function () {
        if (elemenHalaman.inputNamaTugas) elemenHalaman.inputNamaTugas.focus();
      }, 100);
    } else if (aksi === "tambah-jadwal") {
      beralihHalaman("kalender");
      bukaModalJadwal();
    } else if (aksi === "lihat-kalender") {
      beralihHalaman("kalender");
    } else if (aksi === "fokus-hari-ini") {
      beralihHalaman("tugas");
      dataAplikasi.filterStatusTugas = "belum";
      if (elemenHalaman.filterStatusTugas) elemenHalaman.filterStatusTugas.value = "belum";
      render();
    }
  });
});

/*
================================
BUG FIX #7: MODAL JADWAL - OPEN/CLOSE TIDAK ADA
================================
*/

function bukaModalJadwal(tanggalDipilih) {
  const modal = elemenHalaman.modalJadwal;
  if (!modal) return;
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";

  // Isi tanggal jika ada
  if (tanggalDipilih && elemenHalaman.inputTanggalJadwal) {
    elemenHalaman.inputTanggalJadwal.value = tanggalDipilih;
    if (elemenHalaman.teksTanggalJadwalDipilih) {
      elemenHalaman.teksTanggalJadwalDipilih.textContent = "Tanggal: " + formatTanggalIndonesia(tanggalDipilih);
    }
  } else {
    const hariIni = ubahTanggalMenjadiKode(new Date());
    if (elemenHalaman.inputTanggalJadwal) elemenHalaman.inputTanggalJadwal.value = hariIni;
    if (elemenHalaman.teksTanggalJadwalDipilih) {
      elemenHalaman.teksTanggalJadwalDipilih.textContent = "Tanggal: " + formatTanggalIndonesia(hariIni);
    }
  }

  if (elemenHalaman.inputNamaJadwal) elemenHalaman.inputNamaJadwal.focus();
}

function tutupModalJadwal() {
  const modal = elemenHalaman.modalJadwal;
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  if (elemenHalaman.formTambahJadwal) elemenHalaman.formTambahJadwal.reset();
}

// Tombol buka modal jadwal
if (elemenHalaman.tombolTambahJadwalCepat) {
  elemenHalaman.tombolTambahJadwalCepat.addEventListener("click", function () {
    bukaModalJadwal();
  });
}

// Tombol batal modal jadwal
if (elemenHalaman.tombolBatalJadwal) {
  elemenHalaman.tombolBatalJadwal.addEventListener("click", function () {
    tutupModalJadwal();
  });
}

// Tutup modal jika klik backdrop
if (elemenHalaman.modalJadwal) {
  elemenHalaman.modalJadwal.addEventListener("click", function (e) {
    if (e.target === this) tutupModalJadwal();
  });
}

// [DIPERBAIKI] Submit form jadwal → database (bukan localStorage)
if (elemenHalaman.formTambahJadwal) {
  elemenHalaman.formTambahJadwal.addEventListener("submit", async function (e) {
    e.preventDefault();

    const namaJadwal    = elemenHalaman.inputNamaJadwal    ? elemenHalaman.inputNamaJadwal.value.trim()    : "";
    const tanggalJadwal = elemenHalaman.inputTanggalJadwal ? elemenHalaman.inputTanggalJadwal.value         : "";
    const jamJadwal     = elemenHalaman.inputJamJadwal     ? elemenHalaman.inputJamJadwal.value              : "";
    const kategoriJadwal = elemenHalaman.pilihanKategoriJadwal ? elemenHalaman.pilihanKategoriJadwal.value  : "kuliah";

    // Validasi
    let valid = true;
    if (elemenHalaman.pesanErrorNamaJadwal) elemenHalaman.pesanErrorNamaJadwal.textContent = "";
    if (elemenHalaman.pesanErrorTanggalJadwal) elemenHalaman.pesanErrorTanggalJadwal.textContent = "";
    if (elemenHalaman.pesanErrorJamJadwal) elemenHalaman.pesanErrorJamJadwal.textContent = "";

    if (namaJadwal.length < 3) {
      if (elemenHalaman.pesanErrorNamaJadwal) elemenHalaman.pesanErrorNamaJadwal.textContent = "Nama kegiatan minimal 3 karakter.";
      valid = false;
    }
    if (!tanggalJadwal) {
      if (elemenHalaman.pesanErrorTanggalJadwal) elemenHalaman.pesanErrorTanggalJadwal.textContent = "Pilih tanggal.";
      valid = false;
    }
    if (!jamJadwal) {
      if (elemenHalaman.pesanErrorJamJadwal) elemenHalaman.pesanErrorJamJadwal.textContent = "Pilih jam.";
      valid = false;
    }

    if (!valid) return;

    try {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      // Simpan ke DATABASE, bukan localStorage
      await tambahJadwalKeDatabase(namaJadwal, tanggalJadwal, jamJadwal, kategoriJadwal);
      tutupModalJadwal();
      tampilkanToast("Jadwal berhasil ditambahkan");
      renderKalender(); // Update kalender secara realtime
    } catch (err) {
      tampilkanToast("Gagal tambah jadwal: " + err.message);
    } finally {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// [DIPERBAIKI] Klik tanggal di kalender → buka modal jadwal + tampilkan detail jadwal yang ada
document.addEventListener("click", async function (e) {
  const hariKalender = e.target.closest(".hari-kalender");
  if (hariKalender && !hariKalender.classList.contains("hari-lain-bulan")) {
    const tanggal = hariKalender.dataset.tanggal;
    if (tanggal) {
      dataAplikasi.tanggalJadwalYangDipilih = tanggal;

      // Tampilkan modal detail tanggal jika ada
      const modalDetail = document.getElementById("modalDetailTanggal");
      const judulDetail = document.getElementById("judulModalDetail");
      const daftarDetail = document.getElementById("daftarJadwalDetailTanggal");
      const tombolTambahDariDetail = document.getElementById("tombolTambahJadwalDariDetail");

      if (modalDetail && judulDetail && daftarDetail) {
        judulDetail.textContent = formatTanggalIndonesia(tanggal);

        // Ambil jadwal di tanggal ini
        const petaItem = buatPetaItemKalenderBerdasarkanTanggal();
        const itemHariIni = petaItem[tanggal] || [];

        if (itemHariIni.length > 0) {
          daftarDetail.innerHTML = itemHariIni.map(item => {
            const isDeadline = item.kategori === "deadline";
            return `
              <div class="item-jadwal-detail" style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--line,#eee);">
                <div>
                  <strong>${amankanTeksUntukHtml(item.judul)}</strong>
                  <small style="display:block; color:var(--text-2,#888);">${item.jam} · ${item.kategori}</small>
                </div>
                ${!isDeadline ? `<button class="tombol-hapus-jadwal tombol-kecil tombol-hapus" data-jadwal-id="${item.id}" style="font-size:12px; padding:4px 10px;">Hapus</button>` : ''}
              </div>
            `;
          }).join("");
        } else {
          daftarDetail.innerHTML = buatTampilanKosong("Tidak ada agenda di tanggal ini");
        }

        // Buka modal detail dulu, lalu bisa tambah dari sana
        modalDetail.setAttribute("aria-hidden", "false");
        modalDetail.style.display = "flex";
      } else {
        // Fallback: langsung buka modal tambah jadwal
        bukaModalJadwal(tanggal);
      }
    }
  }
});

/*
================================
BUG FIX #8: MATA KULIAH DI PENGATURAN - TIDAK ADA RENDER & EVENT
================================
*/
function renderMataKuliahPengaturan() {
  if (!elemenHalaman.daftarMataKuliahPengaturan) return;
  // [DIPERBAIKI] daftarMataKuliah sekarang array objek {id, nama} dari database
  const list = dataAplikasi.daftarMataKuliah;

  if (!list || list.length === 0) {
    elemenHalaman.daftarMataKuliahPengaturan.innerHTML = buatTampilanKosong("Belum ada mata kuliah. Tambahkan di bawah.");
    return;
  }

  elemenHalaman.daftarMataKuliahPengaturan.innerHTML = list.map(function (mk) {
    const warna = mk.color || "#4f46e5";
    const icon = mk.icon || "book";
    return `
      <div class="item-mata-kuliah" style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; margin-bottom:6px; background:var(--surface-2,#f5f5f7); border-radius:8px;">
        <span style="display:flex; align-items:center; gap:8px; min-width:0;">
          <i style="width:12px;height:12px;border-radius:999px;background:${amankanTeksUntukHtml(warna)};display:inline-block;flex-shrink:0;"></i>
          <strong style="font-size:12px;color:var(--text-soft);text-transform:uppercase;">${amankanTeksUntukHtml(icon)}</strong>
          <span>${amankanTeksUntukHtml(mk.nama)}</span>
        </span>
        <span style="display:flex; gap:6px;">
          <button class="tombol-edit-mk tombol-kecil" type="button" data-mk-id="${mk.id}" data-mk-nama="${amankanTeksUntukHtml(mk.nama)}" data-mk-color="${amankanTeksUntukHtml(warna)}" data-mk-icon="${amankanTeksUntukHtml(icon)}" style="font-size:12px; padding:4px 10px;">Edit</button>
          <button class="tombol-hapus-mk tombol-kecil tombol-hapus" type="button" data-mk-id="${mk.id}" style="font-size:12px; padding:4px 10px;">Hapus</button>
        </span>
      </div>
    `;
  }).join("");
}

// [DIPERBAIKI] Tambah mata kuliah → database, bukan localStorage
if (elemenHalaman.tombolTambahMataKuliah) {
  elemenHalaman.tombolTambahMataKuliah.addEventListener("click", async function () {
    const input = elemenHalaman.inputNamaMataKuliah;
    const namaBaru = input ? input.value.trim() : "";
    const warna = elemenHalaman.inputWarnaMataKuliah ? elemenHalaman.inputWarnaMataKuliah.value : "#4f46e5";
    const icon = elemenHalaman.pilihanIconMataKuliah ? elemenHalaman.pilihanIconMataKuliah.value : "book";

    if (elemenHalaman.pesanErrorMataKuliahBaru) elemenHalaman.pesanErrorMataKuliahBaru.textContent = "";

    if (namaBaru.length < 3) {
      if (elemenHalaman.pesanErrorMataKuliahBaru) elemenHalaman.pesanErrorMataKuliahBaru.textContent = "Nama mata kuliah minimal 3 karakter.";
      return;
    }

    // Cek duplikat lokal
    const list = dataAplikasi.daftarMataKuliah || [];
    if (list.find(mk => mk.nama.toLowerCase() === namaBaru.toLowerCase())) {
      if (elemenHalaman.pesanErrorMataKuliahBaru) elemenHalaman.pesanErrorMataKuliahBaru.textContent = "Mata kuliah sudah ada.";
      return;
    }

    try {
      elemenHalaman.tombolTambahMataKuliah.disabled = true;
      await tambahMataKuliahKeDatabase(namaBaru, warna, icon);
      if (input) input.value = "";
      renderMataKuliahPengaturan();
      perbaruhiTampilan();
      tampilkanToast("Mata kuliah berhasil ditambahkan");
    } catch (err) {
      tampilkanToast("Gagal tambah mata kuliah: " + err.message);
    } finally {
      elemenHalaman.tombolTambahMataKuliah.disabled = false;
    }
  });
}

// [DIPERBAIKI] Hapus mata kuliah → database via data-mk-id (bukan data-index)
document.addEventListener("click", async function (e) {
  if (e.target.matches(".tombol-edit-mk")) {
    const mkId = e.target.dataset.mkId;
    const namaLama = e.target.dataset.mkNama || "";
    const warnaLama = e.target.dataset.mkColor || "#4f46e5";
    const iconLama = e.target.dataset.mkIcon || "book";
    const namaBaru = prompt("Edit nama mata kuliah", namaLama);
    if (namaBaru === null) return;
    const warnaBaru = prompt("Edit warna hex", warnaLama);
    if (warnaBaru === null) return;
    const iconBaru = prompt("Edit icon", iconLama);
    if (iconBaru === null) return;
    try {
      await updateMataKuliahKeDatabase(mkId, namaBaru.trim(), warnaBaru.trim(), iconBaru.trim());
      renderMataKuliahPengaturan();
      perbaruhiTampilan();
      tampilkanToast("Mata kuliah berhasil diperbarui");
    } catch (err) {
      tampilkanToast("Gagal edit mata kuliah: " + err.message);
    }
  }

  if (e.target.matches(".tombol-hapus-mk")) {
    const mkId = e.target.dataset.mkId;
    if (!mkId) return;
    try {
      await hapusMataKuliahDariDatabase(mkId);
      renderMataKuliahPengaturan();
      perbaruhiTampilan();
      tampilkanToast("Mata kuliah berhasil dihapus");
    } catch (err) {
      tampilkanToast("Gagal hapus mata kuliah: " + err.message);
    }
  }
});

/*
================================
BUG FIX #1: AVATAR / FOTO PROFIL HEADER TIDAK BISA DIKLIK
================================
Langsung redirect ke halaman pengaturan (bagian profil di dalam dashboard).
*/
if (elemenHalaman.fotoProfilHeader) {
  elemenHalaman.fotoProfilHeader.style.cursor = "pointer";
  elemenHalaman.fotoProfilHeader.setAttribute("title", "Buka Pengaturan Profil");
  elemenHalaman.fotoProfilHeader.addEventListener("click", function () {
    beralihHalaman("pengaturan");
  });
  elemenHalaman.fotoProfilHeader.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      beralihHalaman("pengaturan");
    }
  });
}

/*
================================
FOTO PROFIL UPLOAD/HAPUS (PENGATURAN)
================================
*/
if (elemenHalaman.tombolUploadFoto) {
  elemenHalaman.tombolUploadFoto.addEventListener("click", function () {
    if (elemenHalaman.inputFotoProfil) elemenHalaman.inputFotoProfil.click();
  });
}

if (elemenHalaman.inputFotoProfil) {
  elemenHalaman.inputFotoProfil.addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    if (elemenHalaman.pesanErrorFotoProfil) elemenHalaman.pesanErrorFotoProfil.textContent = "";

    if (!aturanFotoProfil.tipeFileYangDiizinkan.includes(file.type)) {
      if (elemenHalaman.pesanErrorFotoProfil) elemenHalaman.pesanErrorFotoProfil.textContent = "Hanya file JPG/PNG yang diizinkan.";
      return;
    }
    if (file.size > aturanFotoProfil.ukuranMaksimal) {
      if (elemenHalaman.pesanErrorFotoProfil) elemenHalaman.pesanErrorFotoProfil.textContent = "Ukuran file maksimal 2MB.";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch("backend/upload_profile_photo.php", {
        method: "POST",
        credentials: "same-origin",
        body: formData
      });
      const data = await response.json();
      if (data.redirect) { window.location.href = "login.html"; return; }
      if (!data.success) throw new Error(data.message);
      localStorage.removeItem(namaPenyimpananLocalStorage.fotoProfil);
      document.body.dataset.avatar = data.avatar;
      terapkanFotoProfil(data.avatar);
      tampilkanToast("Foto profil berhasil diubah");
    } catch (error) {
      if (elemenHalaman.pesanErrorFotoProfil) elemenHalaman.pesanErrorFotoProfil.textContent = error.message;
      tampilkanToast("Gagal upload foto: " + error.message);
    }
  });
}

if (elemenHalaman.tombolHapusFoto) {
  elemenHalaman.tombolHapusFoto.addEventListener("click", async function () {
    try {
      const response = await fetch("backend/hapus_profile_photo.php", {
        method: "POST",
        credentials: "same-origin"
      });
      const data = await response.json();
      if (data.redirect) { window.location.href = "login.html"; return; }
      if (!data.success) throw new Error(data.message);
      localStorage.removeItem(namaPenyimpananLocalStorage.fotoProfil);
      document.body.dataset.avatar = "";
      terapkanFotoProfil(null);
      tampilkanToast("Foto profil dihapus");
    } catch (error) {
      tampilkanToast("Gagal hapus foto: " + error.message);
    }
  });
}

function terapkanFotoProfil(base64) {
  const elemen = [elemenHalaman.fotoProfilHeader, elemenHalaman.previewFotoProfil];
  elemen.forEach(function (el) {
    if (!el) return;
    if (base64) {
      el.style.backgroundImage = `url(${base64})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      // Sembunyikan inisial jika ada foto
      const inisial = el.querySelector("span");
      if (inisial) inisial.style.display = "none";
    } else {
      el.style.backgroundImage = "";
      const inisial = el.querySelector("span");
      if (inisial) inisial.style.display = "";
    }
  });
}

/*
================================
[DIPERBAIKI] MODAL DETAIL TANGGAL — EVENT HANDLERS
================================
*/
// Tutup modal detail tanggal
const elTombolTutupDetail = document.getElementById("tombolTutupDetailTanggal");
if (elTombolTutupDetail) {
  elTombolTutupDetail.addEventListener("click", function () {
    const modal = document.getElementById("modalDetailTanggal");
    if (modal) { modal.setAttribute("aria-hidden", "true"); modal.style.display = "none"; }
  });
}

// Klik backdrop modal detail → tutup
const elModalDetail = document.getElementById("modalDetailTanggal");
if (elModalDetail) {
  elModalDetail.addEventListener("click", function (e) {
    if (e.target === this) { this.setAttribute("aria-hidden", "true"); this.style.display = "none"; }
  });
}

// Tombol "Tambah jadwal di tanggal ini" di modal detail
const elTombolTambahDariDetail = document.getElementById("tombolTambahJadwalDariDetail");
if (elTombolTambahDariDetail) {
  elTombolTambahDariDetail.addEventListener("click", function () {
    // Tutup detail, buka modal tambah jadwal dengan tanggal yang dipilih
    const modalDetail = document.getElementById("modalDetailTanggal");
    if (modalDetail) { modalDetail.setAttribute("aria-hidden", "true"); modalDetail.style.display = "none"; }
    bukaModalJadwal(dataAplikasi.tanggalJadwalYangDipilih);
  });
}

// [DIPERBAIKI] Hapus jadwal dari modal detail → database
document.addEventListener("click", async function (e) {
  if (e.target.matches(".tombol-hapus-jadwal")) {
    const jadwalId = e.target.dataset.jadwalId;
    if (!jadwalId) return;
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      await hapusJadwalDariDatabase(jadwalId);
      tampilkanToast("Jadwal berhasil dihapus");
      // Refresh detail modal
      const tanggal = dataAplikasi.tanggalJadwalYangDipilih;
      const petaItem = buatPetaItemKalenderBerdasarkanTanggal();
      const daftarDetail = document.getElementById("daftarJadwalDetailTanggal");
      if (daftarDetail && tanggal) {
        const itemHariIni = petaItem[tanggal] || [];
        if (itemHariIni.length > 0) {
          daftarDetail.innerHTML = itemHariIni.map(item => {
            const isDeadline = item.kategori === "deadline";
            return `
              <div class="item-jadwal-detail" style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--line,#eee);">
                <div>
                  <strong>${amankanTeksUntukHtml(item.judul)}</strong>
                  <small style="display:block; color:var(--text-2,#888);">${item.jam} · ${item.kategori}</small>
                </div>
                ${!isDeadline ? `<button class="tombol-hapus-jadwal tombol-kecil tombol-hapus" data-jadwal-id="${item.id}" style="font-size:12px; padding:4px 10px;">Hapus</button>` : ''}
              </div>
            `;
          }).join("");
        } else {
          daftarDetail.innerHTML = buatTampilanKosong("Tidak ada agenda di tanggal ini");
          // Tutup detail modal karena sudah kosong
          setTimeout(() => {
            const modalDetail = document.getElementById("modalDetailTanggal");
            if (modalDetail) { modalDetail.setAttribute("aria-hidden", "true"); modalDetail.style.display = "none"; }
          }, 800);
        }
      }
      renderKalender(); // Update indikator kalender secara realtime
    } catch (err) {
      tampilkanToast("Gagal hapus jadwal: " + err.message);
    }
  }
});

/*
================================
TOMBOL TAMBAH CEPAT MOBILE
================================
*/
const tombolMobileList = [
  document.getElementById("tombolTambahCepatMobile"),
  document.getElementById("tombolTambahMobile")
];
tombolMobileList.forEach(function (t) {
  if (t) {
    t.addEventListener("click", function () {
      beralihHalaman("tugas");
      setTimeout(function () {
        if (elemenHalaman.inputNamaTugas) elemenHalaman.inputNamaTugas.focus();
      }, 100);
    });
  }
});

/*
================================
TOMBOL RESET DATA
================================
*/
if (elemenHalaman.tombolResetData) {
  elemenHalaman.tombolResetData.addEventListener("click", function () {
    if (!confirm("Yakin ingin menghapus SEMUA tugas? Ini akan menghapus dari database!")) return;
    // Hapus satu per satu dari database
    const janji = dataAplikasi.daftarSemuaTugas.map(function (t) {
      return hapusTugaDariDatabase(t.id);
    });
    Promise.all(janji).then(function () {
      dataAplikasi.daftarSemuaTugas = [];
      tampilkanToast("Semua tugas berhasil dihapus");
      render();
    }).catch(function () {
      tampilkanToast("Gagal menghapus sebagian tugas");
    });
  });
}

// Handler ganti password (di panel Pengaturan)
if (document.getElementById('tombolGantiPassword')) {
  document.getElementById('tombolGantiPassword').addEventListener('click', async function () {
    // Clear previous errors
    ['errPwLama','errPwBaru','errPwKonf'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
    const pwLama = (document.getElementById('pwLama') || {value:''}).value.trim();
    const pwBaru = (document.getElementById('pwBaru') || {value:''}).value;
    const pwKonf = (document.getElementById('pwKonf') || {value:''}).value;

    let ok = true;
    if (!pwLama) { const e = document.getElementById('errPwLama'); if (e) e.textContent = 'Password lama wajib diisi'; ok = false; }
    if (!pwBaru || pwBaru.length < 6) { const e = document.getElementById('errPwBaru'); if (e) e.textContent = 'Password baru minimal 6 karakter'; ok = false; }
    if (pwBaru !== pwKonf) { const e = document.getElementById('errPwKonf'); if (e) e.textContent = 'Konfirmasi tidak cocok'; ok = false; }
    if (!ok) return;

    try {
      const res = await fetch('auth/change_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ current_password: pwLama, new_password: pwBaru, confirm_password: pwKonf })
      });

      const raw = await res.text();
      console.log('Change password raw response:', raw);
      let data;
      try { data = JSON.parse(raw); } catch (err) { console.error('Parse change password response error:', err); tampilkanToast('Format respon server tidak valid. Cek console.', 'error'); return; }

      if (data.success) {
        tampilkanToast(data.message || 'Password berhasil diubah', 'sukses');
        document.getElementById('pwLama').value = '';
        document.getElementById('pwBaru').value = '';
        document.getElementById('pwKonf').value = '';
      } else {
        tampilkanToast(data.message || 'Gagal mengubah password', 'error');
      }
    } catch (err) {
      console.error('Network error change password:', err);
      tampilkanToast('Gagal terhubung ke server.', 'error');
    }
  });
}

/*
================================
PATCH renderDashboard — tambah mini kalender
================================
*/
const _renderDashboardOriginal = renderDashboard;
renderDashboard = function () {
  _renderDashboardOriginal();
  renderMiniKalender();
  // Render notifikasi deadline di sidebar dashboard
  if (elemenHalaman.daftarNotifikasiDeadline) {
    const deadlineDekat = ambilTugasYangDeadlineDekat();
    elemenHalaman.daftarNotifikasiDeadline.innerHTML = deadlineDekat.length
      ? deadlineDekat.map(t => `<div class="item-reminder"><strong>${buatTeksSisaDeadline(t.deadline)}</strong> ${amankanTeksUntukHtml(t.namaTugas)}</div>`).join("")
      : buatTampilanKosong("Tidak ada deadline dekat");
  }
};

/*
================================
PATCH renderHalamanAktif — tambah render pengaturan
================================
*/
const _renderHalamanAktifOriginal = renderHalamanAktif;
renderHalamanAktif = function () {
  _renderHalamanAktifOriginal();
  if (dataAplikasi.halamanYangSedangDibuka === "pengaturan") {
    renderMataKuliahPengaturan();
  }
};

/*
================================
BUG FIX #2: TANGGAL/JAM REALTIME — PASTIKAN FORMAT BENAR
================================
tampilkanTanggalRealtime sudah benar secara logic.
Masalah hanya pada tanggal statis yang di-hardcode di PHP dashboard.php.
JavaScript sudah mengganti isinya setelah load — ini sudah OK.
*/

/*
================================
INISIALISASI SAAT HALAMAN DIMUAT
================================
*/
window.addEventListener("load", async function () {
  // Terapkan foto profil tersimpan
  const fotoDariAkun = document.body.dataset.avatar || null;
  const fotoTersimpan = fotoDariAkun || ambilDataDariLocalStorage(namaPenyimpananLocalStorage.fotoProfil, null);
  if (fotoTersimpan) terapkanFotoProfil(fotoTersimpan);

  if (document.body.dataset.theme === "dark") {
    dataAplikasi.modeGelapAktif = true;
    simpanDataKeLocalStorage(namaPenyimpananLocalStorage.modeGelap, true);
  }

  // [DIPERBAIKI] Ambil SEMUA data dari database secara paralel
  const [berhasilTugas, berhasilJadwal, berhasilMK] = await Promise.all([
    ambilTugasDariDatabase(),
    ambilJadwalDariDatabase(),
    ambilMataKuliahDariDatabase()
  ]);

  if (!berhasilTugas) tampilkanToast("Gagal mengambil data tugas dari database");
  if (!berhasilJadwal) console.warn('[DEBUG] Gagal mengambil jadwal — lanjut dengan data kosong');
  if (!berhasilMK) console.warn('[DEBUG] Gagal mengambil mata kuliah — tampilkan daftar default');

  // Render halaman
  render();

  // Atur update jam realtime setiap detik
  setInterval(tampilkanTanggalRealtime, 1000);
});
