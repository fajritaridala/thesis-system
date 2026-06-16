import { LuNewspaper, LuShieldCheck, LuStickyNote } from 'react-icons/lu';

const CONTENT_WHY = [
  {
    title: 'Sertifikat Terverifikasi',
    description:
      'Setiap sertifikat dicatat dalam blockchain, menjamin keaslian dan mencegah pemalsuan data.',
    icon: <LuNewspaper />,
  },
  {
    title: 'Tes TOEFL Standar',
    description:
      'Soal dan penilaian tes TOEFL kami dirancang sesuai dengan standar internasional untuk hasil yang akurat.',
    icon: <LuStickyNote />,
  },
  {
    title: 'Sertifikat Terverifikasi',
    description:
      'Dengan smart contract, data Anda aman dan transparan, memberikan ketenangan selama proses tes.',
    icon: <LuShieldCheck />,
  },
];

const CONTENT_HOW = [
  {
    title: 'Daftar dan Pilih Tes',
    description:
      'Buat akun Anda dan pilih jenis tes TOEFL yang paling sesuai dengan kebutuhan Anda dari layanan yang kami sediakan.',
  },
  {
    title: 'Ikuti Tes Online',
    description:
      'Selesaikan tes TOEFL secara online melalui platform kami yang aman dan mudah digunakan, kapan saja dan di mana saja.',
  },
  {
    title: 'Dapatkan Sertifikat',
    description:
      'Setelah menyelesaikan tes, sertifikat Anda akan diterbitkan dan dicatat di blockchain untuk verifikasi yang mudah dan abadi.',
  },
];

const CONTENT_TESTIMONY = [
  {
    testimony:
      'Prosesnya sangat mudah dan cepat. Fitur verifikasi blockchain memberikan rasa aman karena saya tahu sertifikat saya tidak dapat dipalsukan. Sangat direkomendasikan untuk para pencari beasiswa!',
    name: 'Aisha Rahmawati',
    job: 'Mahasiswa S2',
  },
  {
    testimony:
      'Saya mengambil tes prediksi di SIMPEKA dan hasilnya sangat membantu saya mempersiapkan diri untuk tes resmi. Platformnya stabil dan antarmukanya sangat ramah pengguna',
    name: 'Budi Santoso',
    job: 'Profesional',
  },
];

export { CONTENT_WHY, CONTENT_HOW, CONTENT_TESTIMONY };
