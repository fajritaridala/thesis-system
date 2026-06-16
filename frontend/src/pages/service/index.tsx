'use client';

import { useQuery } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/layouts/Base';
import { ServiceCard } from '@/components/ui/Card/Service';
import { servicesService } from '@/services/admin.service';
import { ServiceItem } from '@/types/admin.types';
import toRupiah from '@/utils/formatters/currency';

// ============ ANIMATION VARIANTS ============
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ============ HOOK: useService ============
const useService = () => {
  const router = useRouter();
  const {
    data: serviceData,
    isPending: isPendingServices,
    isError: isErrorServices,
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await servicesService.getServices();
      return response;
    },
  });
  const services = (serviceData?.data.data as ServiceItem[]) || [];

  const handleRedirect = (service_id: string) => {
    router.push(`/service/${service_id}/schedule`);
  };

  return { services, isPendingServices, isErrorServices, handleRedirect };
};

// ============ PAGE COMPONENT ============
export default function ServicePage() {
  const { services, handleRedirect } = useService();

  return (
    <>
      <Head>
        <title>Layanan - Simpeka</title>
      </Head>
      <BaseLayout title="Layanan">
        <div className="bg-bg">
          <section className="relative mx-auto my-32 flex w-full max-w-7xl flex-row items-center justify-between gap-8 px-[5%]">
            <div className="bg-secondary absolute -top-50 -left-20 h-[30rem] w-[30rem] rounded-full blur-[12rem]" />
            <div className="bg-primary absolute right-30 bottom-20 h-[10rem] w-[10rem] rounded-full blur-[9rem]" />
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInLeft}
              className="relative z-0 flex flex-col justify-center text-left"
            >
              <h1 className="text-primary mb-4 text-6xl font-extrabold">
                Bahasa menghubungkan <br />
                kita semua
              </h1>
              <p className="text-text-muted w-lg text-lg">
                Melalui kemampuan bahasa, setiap individu dapat saling terhubung
                dan memahami satu sama lain
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
              className="relative z-0 w-[30vw]"
            >
              <Image
                src="/img/our-services.webp"
                alt="our services images"
                width={1580}
                height={1580}
                priority
                className="rounded-lg"
              />
            </motion.div>
          </section>
          <section className="relative overflow-hidden px-[5%]">
            <div className="bg-secondary absolute -right-30 bottom-0 h-72 w-72 rounded-full blur-[10rem]" />
            <div className="relative mx-auto max-w-7xl bg-transparent">
              <div className="pt-12 text-center">
                <motion.h1
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  variants={fadeInUp}
                  className="text-text text-4xl font-extrabold"
                >
                  Layanan Kami
                </motion.h1>
                <motion.p
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  variants={fadeInUp}
                  transition={{ delay: 0.2 }}
                  className="text-text-muted mx-auto mt-3 text-xl lg:max-w-[50%]"
                >
                  Kami menyediakan berbagai pilihan tes TOEFL yang dapat
                  disesuaikan dengan kebutuhan Anda
                </motion.p>
              </div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
                className="mx-auto grid w-full grid-flow-col justify-between gap-8 py-14"
              >
                {services?.map((item) => (
                  <ServiceCard
                    key={item._id}
                    title={item.name}
                    description={item.description}
                    price={toRupiah(item.price ?? 0)}
                    redirect={() => handleRedirect(item._id)}
                  />
                ))}
              </motion.div>
            </div>
          </section>
        </div>
      </BaseLayout>
    </>
  );
}
