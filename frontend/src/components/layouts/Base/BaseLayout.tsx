'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import BaseFooter from '@/components/ui/Footer/Base';
import { BaseNavbar } from '@/components/ui/Navbar/BaseNavbar';
import useUserSession from '@/hooks/useUserSession';
import { SessionExt } from '@/types/auth.types';

type Props = {
  children: ReactNode;
  title: string;
  isAuthenticated?: boolean;
  user?: SessionExt | null;
  pathname?: string;
};

const BaseLayout = (props: Props) => {
  const { children, title, isAuthenticated, user, pathname } = props;
  const router = useRouter();
  const currentPathname = usePathname();

  // Use provided values or get from hooks
  const { data: sessionData, isAuthenticated: sessionAuth } = useUserSession();
  console.log(sessionAuth, sessionData);
  const finalUser = user ?? sessionData;
  const finalAuth = isAuthenticated ?? sessionAuth;
  const finalPathname = pathname ?? currentPathname ?? '/';

  // Navigation handlers
  const handleLogin = () => router.push('/auth/login');
  const handleNavigate = (path: string) => router.push(path);

  return (
    <>
      <Header title={title} />
      <BaseNavbar
        isAuthenticated={finalAuth}
        user={finalUser}
        pathname={finalPathname}
        onLogin={handleLogin}
        onNavigate={handleNavigate}
      />
      {children}
      <BaseFooter />
    </>
  );
};

export default BaseLayout;
