'use client';

import { LuCircleCheckBig } from 'react-icons/lu';
import { Card, CardBody, CardFooter, CardHeader, Divider } from '@heroui/react';
import moment from 'moment';

type ParticipantInfo = {
  nama_lengkap?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  nomor_induk_mahasiswa?: string;
  fakultas?: string;
  program_studi?: string;
  layanan?: string;
  tanggal_tes?: string;
};

type ScoreInfo = {
  nilai_listening?: number;
  nilai_structure?: number;
  nilai_reading?: number;
  nilai_total?: number;
};

type Props = {
  isPeserta: ParticipantInfo;
  isScorePeserta: ScoreInfo;
};

// Helper function to format dates
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = moment(dateString);
  return date.isValid() ? date.format('D MMMM YYYY') : dateString;
};

export function VerificationCard(props: Props) {
  const { isPeserta, isScorePeserta } = props;

  const biodataPeserta = [
    { label: 'Nama', value: isPeserta.nama_lengkap },
    { label: 'Jenis Kelamin', value: isPeserta.jenis_kelamin },
    { label: 'Tanggal Lahir', value: formatDate(isPeserta.tanggal_lahir) },
    { label: 'NIM', value: isPeserta.nomor_induk_mahasiswa },
    { label: 'Program Studi', value: isPeserta.program_studi },
    { label: 'Fakultas', value: isPeserta.fakultas },
    { label: 'Layanan', value: isPeserta.layanan },
    { label: 'Tanggal Tes', value: formatDate(isPeserta.tanggal_tes) },
  ];

  const scorePeserta = [
    { label: 'Listening Comprehension', value: isScorePeserta.nilai_listening },
    { label: 'Reading Comprehension', value: isScorePeserta.nilai_reading },
    { label: 'Structure Comprehension', value: isScorePeserta.nilai_structure },
  ];
  return (
    <div className="mx-auto max-w-4xl">
      <Card className="shadow-neo rounded-2xl">
        <CardHeader className="p-0">
          <div className="relative w-full overflow-hidden bg-white pt-12 pb-8">
            <div className="absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-3xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-success/10 flex h-20 w-20 items-center justify-center rounded-full">
                <div className="bg-success-500 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg">
                  <LuCircleCheckBig className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-6 px-4 text-center">
                <h1 className="text-primary mb-2 text-2xl font-extrabold lg:text-5xl">
                  Sertifikat Terverifikasi
                </h1>
                <p className="text-text-muted text-sm sm:text-base md:text-lg">
                  Sertifikat ini telah diverifikasi dan valid secara resmi
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <Divider className="mx-auto opacity-50" />

        <CardBody className="py-8">
          <div className="mx-auto w-full max-w-2xl">
            <h2 className="text-default-400 mb-6 text-start text-sm font-bold tracking-widest uppercase">
              Informasi Peserta
            </h2>
            <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-12">
              {biodataPeserta.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col border-b border-dashed border-gray-100 sm:border-0"
                >
                  <p className="text-default-500 mb-1 text-xs font-medium tracking-wider uppercase">
                    {item.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900 sm:text-lg md:text-xl">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardBody>

        <div className="bg-gray-50/50 p-6 md:p-8">
          <div className="mx-auto w-full max-w-2xl">
            <h2 className="text-default-400 mb-6 text-start text-sm font-bold tracking-widest uppercase">
              Detail Nilai
            </h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {scorePeserta.map((item) => (
                <div
                  key={item.label}
                  className="border-primary-100/50 flex flex-col items-center justify-center rounded-2xl border bg-white p-4 text-center shadow-sm transition-transform hover:scale-105"
                >
                  <h3 className="text-default-500 mb-2 flex h-10 items-center text-sm leading-tight font-semibold uppercase">
                    {item.label}
                  </h3>
                  <p className="text-primary text-3xl font-extrabold md:text-4xl">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-primary bg-primary shadow-primary-900/20 mt-6 overflow-hidden rounded-2xl border text-center text-white shadow-lg">
              <div className="relative p-6">
                {/* Background Pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '10px 10px',
                  }}
                ></div>

                <div className="relative z-10">
                  <h3 className="mb-2 text-lg font-medium opacity-90">
                    Total Score
                  </h3>
                  <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                    {isScorePeserta.nilai_total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
