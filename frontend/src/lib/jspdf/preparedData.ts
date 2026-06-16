import moment from 'moment';
import {
  CertificatePayload,
  CertificatePdfRender,
} from '@/types/certificate.types';

export function preparedData(data: CertificatePayload): CertificatePdfRender {
  const { scheduleDate, birthDate, listening, reading, structure, totalScore } =
    data;

  // Handle scheduleDate - bisa string atau Date
  const scheduleDateParsed =
    scheduleDate instanceof Date ? scheduleDate : new Date(scheduleDate);

  // Handle birthDate - bisa string atau Date
  const birthDateParsed =
    birthDate instanceof Date ? birthDate : new Date(birthDate);

  const tanggal_valid = moment(scheduleDateParsed)
    .add(2, 'years')
    .locale('id')
    .format('D MMMM YYYY');

  const _tanggal_tes = moment(scheduleDateParsed)
    .locale('id')
    .format('D MMMM YYYY');

  const _tanggal_lahir = moment(birthDateParsed)
    .locale('id')
    .format('D MMMM YYYY');

  // Hardcode serial number sementara atau ambil dari data jika ada
  const nomor_serial = 'S0034405';

  return {
    jenis_tes: data.serviceName,
    nama_lengkap: data.fullName,
    jenis_kelamin: data.gender,
    tanggal_lahir: _tanggal_lahir,
    nomor_induk_mahasiswa: data.nim,
    fakultas: data.faculty,
    program_studi: data.major,
    tanggal_tes: _tanggal_tes,
    nilai_listening: listening,
    nilai_structure: structure,
    nilai_reading: reading,
    nilai_total: totalScore,
    tanggal_valid: tanggal_valid,
    nomor_serial: nomor_serial,
  };
}
