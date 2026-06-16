interface CertificatePayload {
  serviceName: string;
  scheduleDate: Date;
  fullName: string;
  gender:  string;
  birthDate: Date;
  nim: string;
  faculty: string;
  major: string;
  listening: number;
  reading: number;
  structure: number;
  totalScore: number;
}

interface CertificateRenderer extends CertificatePayload {
  validUntil: Date
}

// Interface khusus untuk Render PDF (String Formatted & Snake Case)
interface CertificatePdfRender {
  jenis_tes: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  nomor_induk_mahasiswa: string;
  fakultas: string;
  program_studi: string;
  tanggal_tes: string;
  nilai_listening: number;
  nilai_structure: number;
  nilai_reading: number;
  nilai_total: number;
  tanggal_valid: string;
  nomor_serial: string;
}

export type { CertificatePayload, CertificateRenderer, CertificatePdfRender }