'use client';

import { useEffect, useState } from 'react';
import { LuChevronDown, LuUser } from 'react-icons/lu';
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  cn,
} from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SessionExt } from '@/types/auth.types';
import { NAVBAR_DROPDOWN_ITEMS, NAVBAR_ITEMS } from './BaseNavbarConstants';
import { useBaseNavbar } from './useBaseNavbar';

type Props = {
  isAuthenticated?: boolean;
  user?: SessionExt | null;
  pathname?: string;
  onLogin: () => void;
  onNavigate: (path: string) => void;
};

export function BaseNavbar(props: Props) {
  const {
    isAuthenticated = false,
    user,
    pathname,
    onLogin,
    onNavigate,
  } = props;
  const [username, setUsername] = useState('User');
  const currentPathname = usePathname();
  const { isScrolled } = useBaseNavbar();

  useEffect(() => {
    if (user?.user?.username) {
      setUsername(user.user.username);
    } else {
      setUsername('User');
    }
  }, [user]);

  return (
    <div>
      <Navbar
        isBlurred={isScrolled}
        className={cn(
          'animate-fade-top fixed top-0 right-0 left-0 z-50 transition-all duration-300',
          {
            'bg-white/80 shadow-sm': isScrolled,
            'bg-transparent': !isScrolled,
          }
        )}
        classNames={{
          wrapper: ['p-0 max-w-6xl'],
        }}
      >
        {/* left start */}
        <NavbarBrand>
          <p className="text-primary text-2xl font-extrabold">Simpeka</p>
        </NavbarBrand>
        {/* left end */}

        {/* center start */}
        <NavbarContent justify="end">
          <NavbarItem className="flex gap-4">
            {NAVBAR_ITEMS.map((item, index) => {
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'text-text-muted hover:text-secondary border-b-1.5 relative border-transparent px-2 py-2 delay-75 active:translate-y-0.5',
                    {
                      'text-primary hover:text-primary border-primary':
                        (pathname ?? currentPathname) === item.href,
                    }
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </NavbarItem>
          <Divider orientation="vertical" className="bg-secondary h-5" />
          {isAuthenticated && !user?.user?.needsRegistration ? (
            <Dropdown className="bg-bg-light mt-3 rounded-sm shadow!">
              <NavbarItem>
                <DropdownTrigger>
                  <Button
                    data-hover={false}
                    className="bg-primary hover:bg-primary/90 group border-1.5 rounded-full px-4 text-white transition-all delay-75 duration-100 active:translate-y-0.5"
                    startContent={
                      <LuUser
                        strokeWidth={2}
                        className="delay-75 group-hover:text-white"
                      />
                    }
                    endContent={
                      <LuChevronDown
                        strokeWidth={2}
                        className="delay-75 group-hover:text-white"
                      />
                    }
                  >
                    <p className="capitalize delay-75 group-hover:text-white">
                      {username}
                    </p>
                  </Button>
                </DropdownTrigger>
              </NavbarItem>
              <DropdownMenu>
                {NAVBAR_DROPDOWN_ITEMS(onNavigate).map((item) => (
                  <DropdownItem
                    key={item.key}
                    onPress={item.onPress}
                    startContent={item.icon}
                    className={cn(
                      'text-text data-[hover=true]:bg-primary data-[hover=true]:text-bg-light rounded-xl px-3 text-sm delay-[.05s]',
                      {
                        'text-danger data-[hover=true]:bg-danger':
                          item.label === 'Logout',
                      }
                    )}
                  >
                    <p>{item.label}</p>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              data-hover={false}
              onPress={onLogin}
              size="md"
              className="bg-primary hover:bg-primary/90 text-medium rounded-full px-8 font-semibold text-white transition-all delay-75 duration-200 active:translate-y-0.5"
            >
              Login
            </Button>
          )}
        </NavbarContent>
        {/* center end */}
        {/* right start */}
        {/* right end */}
      </Navbar>
    </div>
  );
}
