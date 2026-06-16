import {
  LuGithub,
  LuLinkedin,
  LuMail,
  LuMessageSquareMore,
  LuPhone,
} from 'react-icons/lu';
import { Divider } from '@heroui/react';
import Link from 'next/link';
import { NAVBAR_ITEMS } from '../../Navbar/BaseNavbar/BaseNavbarConstants';

const BaseFooter = () => {
  return (
    <footer className="bg-primary border-secondary border-t-2">
      <div className="mx-auto w-full bg-transparent pt-16 pb-6 text-white lg:max-w-6xl">
        <div className="grid grid-cols-4 text-sm">
          <div className="col-span-2">
            <h1 className="text-secondary mb-4 text-lg font-bold">Simpeka</h1>
            <p className="lg:max-w-[90%]">
              Platform tes TOEFL modern yang mengintegrasikan teknologi
              blockchain untuk memastikan keaslian dan keamanan sertifikat Anda.
            </p>
          </div>
          <div>
            <h1 className="mb-4 font-bold">Navigasi</h1>
            <div className="flex flex-col gap-2">
              {NAVBAR_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h1 className="mb-4 font-bold">Hubungi Kami</h1>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <LuPhone className="mt-1" />
                <p>0401-3195241</p>
              </div>
              <div className="flex gap-2">
                <LuMessageSquareMore className="mt-1" />
                <p>+62 813-9295-5256</p>
              </div>
              <div className="flex gap-2">
                <LuMail className="mt-1" />
                <Link
                  href="mailto:uptbahasa.unhalu@gmail.com"
                  className="hover:underline"
                >
                  uptbahasa.unhalu@gmail.com
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Divider className="mt-12 mb-6" />
        <div className="flex w-full justify-between text-[.7rem]">
          <div>
            <p>&copy; 2025 Simpeka. Seluruh hak cipta dilindungi.</p>
          </div>
          <div className="flex gap-4">
            <Link href="#">
              <LuGithub />
            </Link>
            <Link href="#">
              <LuLinkedin />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BaseFooter;
