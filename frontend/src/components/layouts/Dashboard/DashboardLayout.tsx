'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import { SIDEBAR_ADMIN } from './Dashboard.constans';
import DashboardNavbar from './DashboardNavbar';
import { DashboardLayoutSidebar } from './DashboardSidebar';

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

function DashboardLayout(props: Props) {
  const { title, children, description } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path: string) => router.push(path);

  return (
    <>
      <Header title={title} />
      <section className="max-w-screen-3xl 3xl:container bg-bg-light flex">
        <DashboardLayoutSidebar
          sidebarItems={SIDEBAR_ADMIN}
          isOpen={open}
          onNavigate={handleNavigate}
        />
        <div className="bg-gray-50 m-auto h-screen w-full overflow-y-auto">
          <DashboardNavbar
            onMenuToggle={() => setOpen(!open)}
            description={description}
            heading={title}
          />
          <main className="p-6">
            {children}
          </main>
        </div>
      </section>
    </>
  );
}

export default DashboardLayout;
