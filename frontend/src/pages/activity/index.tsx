'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  cn,
} from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  History,
  Trophy,
} from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import BaseLayout from '@/components/layouts/Base';
import { EnrollmentStatus } from '@/components/ui/Chip/EnrollmentStatus';
import { ActivityItem, activityService } from '@/services/activity.service';
import { formatDate } from '@/utils/common';

// ============ ANIMATION VARIANTS ============
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeInItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

// ============ HOOK: useActivity ============
const useActivity = () => {
  const {
    data: dataActivity,
    isLoading: isLoadingActivity,
    isRefetching: isRefetchingActivity,
    refetch: refetchActivity,
    error: errorActivity,
  } = useQuery({
    queryKey: ['user-activity'],
    queryFn: async () => {
      const response = await activityService.getActivity();
      return response.data;
    },
  });

  return {
    dataActivity,
    isLoadingActivity,
    isRefetchingActivity,
    refetchActivity,
    errorActivity,
  };
};

// ============ PAGE COMPONENT ============
export default function ActivityPage() {
  const router = useRouter();
  const { dataActivity, isLoadingActivity } = useActivity();
  const activities = (dataActivity?.data as ActivityItem[]) || [];

  const handlePress = (hash?: string) => {
    if (hash) {
      router.push(`/certificate?hash=${hash}`);
    }
  };

  return (
    <BaseLayout title="Aktivitas Saya">
      <Head>
        <title>Aktivitas Saya | UPT Bahasa</title>
        <meta
          name="description"
          content="Riwayat aktivitas dan pendaftaran sertifikat TOEFL"
        />
      </Head>
      <div className="bg-bg-light pt-24 pb-12">
        <main className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-10"
          >
            <Button
              variant="light"
              data-hover={false}
              onPress={() => router.back()}
              className="text-secondary hover:text-secondary/60 group mb-2 -ml-3 w-fit p-0"
              startContent={
                <ArrowLeft
                  size={18}
                  className="transform duration-300 group-hover:-translate-x-1"
                />
              }
            >
              Kembali
            </Button>
            <h1 className="text-text text-3xl font-extrabold tracking-tight">
              Aktivitas Saya
            </h1>
            <p className="text-text-muted mt-2 text-lg">
              Riwayat pendaftaran tes dan status sertifikat Anda.
            </p>
          </motion.div>

          {isLoadingActivity ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card
                  key={i}
                  className="h-[250px] animate-pulse rounded-2xl border border-transparent bg-white/50 shadow-none"
                />
              ))}
            </div>
          ) : activities.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {activities.map((item) => (
                <motion.div key={item.enrollId} variants={fadeInItem}>
                  <Card
                    className={cn(
                      'w-sm rounded-2xl bg-white shadow-none',
                      'group transition-all duration-300 hover:-translate-y-2',
                      'hover:shadow-neo'
                    )}
                    isPressable
                    onPress={() => handlePress(item.hash)}
                  >
                    <CardHeader className="flex items-start justify-between px-6 pt-6 pb-0">
                      <div className="bg-primary/10 text-primary group-hover:bg-primary flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-white">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <EnrollmentStatus status={item.status} />
                    </CardHeader>

                    <CardBody className="px-6 py-4">
                      <h3 className="text-text group-hover:text-primary mb-4 line-clamp-1 text-lg font-bold transition-colors">
                        {item.serviceName}
                      </h3>

                      <div className="text-text-muted mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {formatDate(item.scheduleDate)}
                        </span>
                      </div>

                      {item.hash && (
                        <div className="text-success flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Terverifikasi Blockchain
                          </span>
                        </div>
                      )}
                    </CardBody>

                    <CardFooter className="px-6 pt-0 pb-6">
                      <div className="text-text-muted group-hover:text-primary flex w-full items-center gap-2 text-sm font-semibold transition-colors">
                        <span>Lihat Detail</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="shadow-neo flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center"
            >
              <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <History className="h-10 w-10" />
              </div>
              <h3 className="text-text text-xl font-bold">
                Belum Ada Aktivitas
              </h3>
              <p className="text-text-muted mt-2 mb-8 max-w-md">
                Anda belum mendaftar layanan apapun.
              </p>
              <Button
                className="bg-primary font-bold text-white"
                size="lg"
                radius="full"
                onPress={() => router.push('/service')}
                endContent={
                  <ChevronRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                }
              >
                Lihat Layanan
              </Button>
            </motion.div>
          )}
        </main>
      </div>
    </BaseLayout>
  );
}
