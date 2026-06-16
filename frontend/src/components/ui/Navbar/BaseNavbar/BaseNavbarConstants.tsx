import { Bookmark, FileCheck, LogOut, User } from 'lucide-react';
import { signOut } from 'next-auth/react';

export const NAVBAR_ITEMS = [
  { label: 'Beranda', href: '/' },
  { label: 'Layanan', href: '/service' },
  { label: 'Verifikasi', href: '/verification' },
];

export const NAVBAR_DROPDOWN_ITEMS = (onNavigate: (path: string) => void) => [
  {
    key: 'user_profile',
    label: 'Profil saya',
    icon: <User strokeWidth={2} className="h-4 w-4" />,
    onPress: () => onNavigate('/profile'),
  },
  {
    key: 'user_activity',
    label: 'Aktivitas saya',
    icon: <Bookmark strokeWidth={2} className="h-4 w-4" />,
    onPress: () => onNavigate('/activity'),
  },
  {
    key: 'logout',
    label: 'Logout',
    icon: <LogOut strokeWidth={2} className="h-4 w-4" />,
    onPress: () => signOut({ callbackUrl: '/auth/login' }),
  },
];
