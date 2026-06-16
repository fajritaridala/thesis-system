'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { Menu, Settings, LogOut, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

type Props = {
  onMenuToggle: () => void;
  description?: string;
  heading?: string;
};

function DashboardNavbar({ onMenuToggle, description, heading }: Props) {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu Toggle + Page Title */}
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={onMenuToggle}
            className="text-gray-500 hover:text-primary lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {heading}
            </h1>
            {description && (
              <p className="hidden text-xs text-gray-500 sm:block">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* User Profile Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="group flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white p-1 pr-4 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                   <User className="h-5 w-5" />
                </div>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-xs font-bold text-gray-900">
                    {session?.user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {session?.user?.email || 'admin@example.com'}
                  </span>
                </div>
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{session?.user?.email}</p>
              </DropdownItem>
              <DropdownItem key="settings" startContent={<Settings className="h-4 w-4" />}>
                My Settings
              </DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut className="h-4 w-4" />}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
