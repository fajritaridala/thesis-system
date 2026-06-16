import jsPDF from 'jspdf';
import { CertificatePayload } from '@/types/certificate.types';
import { preparedData } from './preparedData';

export async function generateCertificate(
  data: CertificatePayload,
  qrCode: string
): Promise<jsPDF> {
  const render = preparedData(data);

  const doc = new jsPDF({
    compress: true,
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background color
  doc.setFillColor(245, 245, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header section
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`6/30/25, 12:39 AM`, 15, 15);
  doc.text(`Sertifikat Tes TOEFL [${render.nama_lengkap}]`, pageWidth / 2, 15, {
    align: 'center',
  });

  // Logo Placeholder (Gunakan Path Public)
  const logoX = 35;
  const logoY = 35;
  const logoWidth = 32;
  const logoHeight = 32;

  const logoUHO = '/img/logo-uho.png';
  doc.addImage(
    logoUHO,
    'PNG',
    logoX - logoWidth / 2,
    logoY - logoHeight / 2,
    logoWidth,
    logoHeight
  );

  // Main header
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'MINISTRY OF EDUCATION, CULTURE, RESEARCH, AND TECHNOLOGY',
    pageWidth / 2,
    24,
    { align: 'center' }
  );

  doc.setFontSize(13);
  doc.text('HALU OLEO UNIVERSITY', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('UPT BAHASA (Language Center)', pageWidth / 2, 36, {
    align: 'center',
  });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Kampus Hijau Bumi Tridharma, Kendari, 93232', pageWidth / 2, 42, {
    align: 'center',
  });
  doc.text(
    'Phone/Fax : (0401) 3195241, Email : uptbahasa@uho.ac.id',
    pageWidth / 2,
    46,
    { align: 'center' }
  );

  // Horizontal line
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(2);
  doc.line(15, 54, pageWidth - 15, 54);

  // Serial number and title
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Serial Number : ${render.nomor_serial}`, 15, 65);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${render.jenis_tes} - SCORE`, pageWidth / 2, 65, {
    align: 'center',
  });

  // Personal information section
  const leftColumnX = 15;
  const rightColumnX = 90;
  let currentY = 75;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const personalInfo = [
    { label: 'Name', value: render.nama_lengkap.toUpperCase() },
    { label: 'Date of Birth', value: render.tanggal_lahir.toUpperCase() },
    { label: 'Faculty', value: render.fakultas.toUpperCase() },
    { label: 'Study Program/Dept.', value: render.program_studi.toUpperCase() },
    { label: "NIM/Participant's ID", value: render.nomor_induk_mahasiswa },
    { label: 'Gender', value: render.jenis_kelamin.toUpperCase() },
  ];

  personalInfo.forEach((info) => {
    doc.setFont('helvetica', 'normal');
    doc.text(info.label, leftColumnX, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(info.value, rightColumnX, currentY);
    currentY += 4.5;
  });

  const qrCodeX = 25;
  const qrCodeY = 105;
  const qrCodeSize = 35;

  // Add QR code image to PDF
  doc.addImage(qrCode, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Pindai kode untuk memeriksa',
    qrCodeX + qrCodeSize / 2,
    qrCodeY + qrCodeSize + 4,
    { align: 'center' }
  );
  doc.text(
    'keaslian sertifikat ini',
    qrCodeX + qrCodeSize / 2,
    qrCodeY + qrCodeSize + 8,
    { align: 'center' }
  );

  const tableStartX = 80;
  const tableStartY = 105;
  const colWidth1 = 110;
  const colWidth2 = 30;
  const rowHeight = 8;

  // Table header
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);

  // Score rows
  const scores = [
    { label: 'Listening Comprehension', score: render.nilai_listening },
    {
      label: 'Structure and Written Expression',
      score: render.nilai_structure,
    },
    { label: 'Reading Comprehension', score: render.nilai_reading },
  ];

  scores.forEach((item, index) => {
    const y = tableStartY + index * rowHeight;

    // Draw cells
    doc.rect(tableStartX, y, colWidth1, rowHeight);
    doc.rect(tableStartX + colWidth1, y, colWidth2, rowHeight);

    // Add text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, tableStartX + 3, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(item.score.toString(), tableStartX + colWidth1 + 15, y + 5, {
      align: 'center',
    });
  });

  // Total score row
  const totalY = tableStartY + scores.length * rowHeight;
  doc.setFont('helvetica', 'bold');
  doc.rect(tableStartX, totalY, colWidth1, rowHeight);
  doc.rect(tableStartX + colWidth1, totalY, colWidth2, rowHeight);
  doc.text('TOTAL SCORE', tableStartX + 3, totalY + 5);
  doc.text(
    render.nilai_total.toString(),
    tableStartX + colWidth1 + 15,
    totalY + 5,
    { align: 'center' }
  );

  const dateBoxX = 230;
  const dateBoxY = 105;
  const dateBoxWidth = 50;
  const dateBoxHeight = 30;

  doc.rect(dateBoxX, dateBoxY, dateBoxWidth, dateBoxHeight);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('Test Date', dateBoxX + dateBoxWidth / 2, dateBoxY + 6, {
    align: 'center',
  });
  doc.setFont('helvetica', 'normal');
  doc.text(render.tanggal_tes, dateBoxX + dateBoxWidth / 2, dateBoxY + 12, {
    align: 'center',
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Valid Until', dateBoxX + dateBoxWidth / 2, dateBoxY + 18, {
    align: 'center',
  });
  doc.setFont('helvetica', 'normal');
  doc.text(render.tanggal_valid, dateBoxX + dateBoxWidth / 2, dateBoxY + 24, {
    align: 'center',
  });

  // Signature section
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Head of UPT Bahasa UHO,', 210, 145);
  doc.setFont('helvetica', 'bold');
  doc.text('Deddy Anriand, S.S., M.TESOL, Ph.D.', 202, 165);
  doc.setFont('helvetica', 'normal');
  doc.text('Off Reg: 19720628 199903 1 002', 202, 170);

  // Footer note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 80);
  doc.text('* Hanya digunakan sebagai syarat untuk mengikuti', 15, 160);
  doc.text('ujian skripsi bagi mahasiswa program sarjana (S1)', 15, 164);
  doc.text('pada Universitas Halu Oleo', 15, 168);

  // Footer URL
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'https://simpeka-uptbahasauho.id/TOEFL/sertifikat_toefl/66338',
    15,
    pageHeight - 25
  );
  doc.text('1/1', pageWidth - 20, pageHeight - 10);

  return doc;
}
