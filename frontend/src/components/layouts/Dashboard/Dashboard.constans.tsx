import { LuCalendar, LuDock, LuLayoutGrid, LuUsers } from 'react-icons/lu';

const SIDEBAR_ADMIN = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LuLayoutGrid />,
  },
  {
    key: 'participants',
    label: 'Manajemen Peserta',
    href: '/admin/participants',
    icon: <LuUsers />,
    children: [
      {
        key: 'participants-list',
        label: 'Daftar Pendaftar',
        href: '/admin/participants',
      },
      {
        key: 'participants-validation',
        label: 'Validasi Pendaftaran',
        href: '/admin/participants/validation',
      },
      {
        key: 'participants-score',
        label: 'Input Nilai',
        href: '/admin/participants/input',
      },
    ],
  },
  {
    key: 'services',
    label: 'Manajemen Layanan',
    href: '/admin/services',
    icon: <LuDock />,
  },
  {
    key: 'schedules',
    label: 'Manajemen Jadwal',
    href: '/admin/schedules',
    icon: <LuCalendar />,
  },
];

export { SIDEBAR_ADMIN };
