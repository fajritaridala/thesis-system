import { ReactNode } from 'react';
import { cn } from '@heroui/react';
import { Lato } from 'next/font/google';

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
});

type Props = {
  children: ReactNode;
};

function AppShell(props: Props) {
  const { children } = props;
  return <main className={cn(lato.className)}>{children}</main>;
}

export default AppShell;
