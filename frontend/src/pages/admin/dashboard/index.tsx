import { useMemo } from 'react';
import { Button, Chip, Progress, Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock3,
  ListChecks,
  Package,
  Users,
} from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/Dashboard';
import {
  enrollmentsService,
  schedulesService,
  servicesService,
} from '@/services/admin.service';
import {
  EnrollmentItem,
  EnrollmentStatus,
  ScheduleItem,
  ScheduleStatus,
} from '@/types/admin.types';

// ============ STATUS COLOR MAP ============
const statusColorMap: Record<string, 'warning' | 'success' | 'danger'> = {
  menunggu: 'warning',
  disetujui: 'success',
  ditolak: 'danger',
};

// ============ ANIMATION VARIANTS ============
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ============ HOOK: useDashboard ============
const useDashboard = () => {
  const servicesQuery = useQuery({
    queryKey: ['admin-dashboard', 'services'],
    queryFn: async () => {
      const response = await servicesService.getServices({ page: 1, limit: 1 });
      return response.data;
    },
  });

  const schedulesQuery = useQuery({
    queryKey: ['schedules', 'admin', 'upcoming'],
    queryFn: async () => {
      const response = await schedulesService.getAdminSchedules({
        limit: 100,
        status: ScheduleStatus.ACTIVE,
      });
      return response.data;
    },
  });

  const enrollmentsQuery = useQuery({
    queryKey: ['enrollments', 'recent'],
    queryFn: async () => {
      const response = await enrollmentsService.getEnrollments({
        limit: 100,
      });
      return response.data;
    },
  });

  const summary = useMemo(() => {
    const totalServices = servicesQuery.data?.pagination?.total ?? 0;
    const totalSchedules =
      schedulesQuery.data?.pagination?.total ??
      schedulesQuery.data?.data.length ??
      0;
    const enrollments = (enrollmentsQuery.data?.data as EnrollmentItem[]) || [];

    const pending = enrollments.filter(
      (e) => e.status === EnrollmentStatus.PENDING
    ).length;
    const approved = enrollments.filter(
      (e) => e.status === EnrollmentStatus.APPROVED
    ).length;
    const rejected = enrollments.filter(
      (e) => e.status === EnrollmentStatus.REJECTED
    ).length;

    return {
      totalServices,
      totalSchedules,
      pendingEnrollments: pending,
      approvedEnrollments: approved,
      rejectedEnrollments: rejected,
    };
  }, [servicesQuery.data, schedulesQuery.data, enrollmentsQuery.data]);

  const upcomingSchedules = useMemo(() => {
    const schedules = (schedulesQuery.data?.data as ScheduleItem[]) || [];
    return schedules
      .sort(
        (a, b) =>
          new Date(a.scheduleDate).getTime() -
          new Date(b.scheduleDate).getTime()
      )
      .slice(0, 5);
  }, [schedulesQuery.data]);

  const recentParticipants = useMemo(() => {
    const enrollments = (enrollmentsQuery.data?.data as EnrollmentItem[]) || [];
    return enrollments.slice(0, 5);
  }, [enrollmentsQuery.data]);

  return {
    summary,
    upcomingSchedules,
    recentParticipants,
    isLoadingSummary:
      servicesQuery.isLoading ||
      schedulesQuery.isLoading ||
      enrollmentsQuery.isLoading,
    isLoadingSchedules: schedulesQuery.isLoading,
    isLoadingParticipants: enrollmentsQuery.isLoading,
  };
};

// ============ PAGE COMPONENT ============
export default function AdminDashboard() {
  const {
    summary,
    upcomingSchedules,
    recentParticipants,
    isLoadingSummary,
    isLoadingSchedules,
    isLoadingParticipants,
  } = useDashboard();

  const totalEnrolled =
    summary.pendingEnrollments +
    summary.approvedEnrollments +
    summary.rejectedEnrollments;
  const approvalRate = totalEnrolled
    ? Math.round((summary.approvedEnrollments / totalEnrolled) * 100)
    : 0;
  const rejectionRate = totalEnrolled
    ? Math.round((summary.rejectedEnrollments / totalEnrolled) * 100)
    : 0;

  const summaryCards = [
    {
      key: 'services',
      label: 'Total Layanan',
      value: summary.totalServices,
      icon: <Package className="h-6 w-6" />,
    },
    {
      key: 'schedules',
      label: 'Jadwal Aktif',
      value: summary.totalSchedules,
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      key: 'pending',
      label: 'Menunggu Validasi',
      value: summary.pendingEnrollments,
      icon: <Clock3 className="h-6 w-6" />,
    },
    {
      key: 'participants',
      label: 'Peserta Disetujui',
      value: summary.approvedEnrollments,
      icon: <ListChecks className="h-6 w-6" />,
    },
  ];

  return (
    <DashboardLayout
      title="Overview Dashboard"
      description="Ringkasan statistik dan aktivitas terbaru Simpeka."
    >
      <section className="space-y-8 pt-2">
        {/* Summary Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {summaryCards.map((card) => (
            <motion.div
              key={card.key}
              variants={fadeInItem}
              className="group hover:border-primary-100 relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-md shadow-blue-500/5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>
                  {isLoadingSummary ? (
                    <Skeleton className="mt-2 h-8 w-24 rounded-lg" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                      {card.value}
                    </p>
                  )}
                </div>
                <div className="bg-primary-50 text-primary group-hover:bg-primary flex h-12 w-12 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                  {card.icon}
                </div>
              </div>
              <div className="bg-primary-50/50 group-hover:bg-primary-100/50 absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-2xl transition-all" />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content: Schedules */}
          <div className="space-y-8 lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md shadow-gray-100/50"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Jadwal Terdekat
                  </h3>
                  <p className="text-sm text-gray-500">
                    Sesi tes TOEFL yang akan datang
                  </p>
                </div>
                <Button
                  as={Link}
                  href="/admin/schedules"
                  size="sm"
                  variant="light"
                  color="primary"
                  radius="full"
                  className="font-semibold"
                  endContent={<ArrowRight className="h-4 w-4" />}
                >
                  Lihat Semua
                </Button>
              </div>

              <div className="space-y-4">
                {isLoadingSchedules ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))
                ) : upcomingSchedules.length ? (
                  upcomingSchedules.map((schedule) => (
                    <div
                      key={schedule.scheduleId}
                      className="group hover:border-primary-100 flex items-center gap-6 rounded-lg border border-gray-100 bg-white p-4 transition-all hover:bg-gray-50/50"
                    >
                      <div className="bg-primary-50 group-hover:bg-primary flex h-20 w-20 min-w-[5rem] flex-col items-center justify-center rounded-lg text-center transition-colors group-hover:text-white">
                        <span className="text-xs font-bold uppercase opacity-80">
                          {moment(schedule.scheduleDate).format('MMM')}
                        </span>
                        <span className="text-2xl font-bold">
                          {moment(schedule.scheduleDate).format('DD')}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 py-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="truncate text-lg font-bold text-gray-900">
                            {schedule.serviceName}
                          </h4>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              schedule.status === 'aktif'
                                ? 'success'
                                : 'default'
                            }
                            classNames={{ content: 'font-semibold' }}
                          >
                            {schedule.status === 'aktif'
                              ? 'Aktif'
                              : 'Non-aktif'}
                          </Chip>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock3 className="text-primary h-4 w-4" />
                            <span className="font-medium">
                              {moment(schedule.startTime).format('HH:mm')} -{' '}
                              {moment(schedule.endTime).format('HH:mm')}
                            </span>
                          </div>
                          <div className="h-1 w-1 rounded-full bg-gray-300" />
                          <div className="flex items-center gap-1.5">
                            <Users className="text-primary h-4 w-4" />
                            <span className="font-medium">
                              <b className="text-gray-900">
                                {schedule.registrants}
                              </b>
                              /{schedule.quota} Peserta
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden pr-4 sm:block">
                        <div className="group-hover:border-primary-200 group-hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 opacity-0 transition-all group-hover:opacity-100">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900">
                      Tidak ada jadwal
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Participants */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md shadow-gray-100/50"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Pendaftar Terbaru
                  </h3>
                  <p className="text-sm text-gray-500">
                    Update pendaftaran real-time
                  </p>
                </div>
                <Button
                  as={Link}
                  href="/admin/participants"
                  size="sm"
                  variant="light"
                  color="primary"
                  radius="full"
                  className="font-semibold"
                >
                  Lihat Semua
                </Button>
              </div>

              <div className="space-y-4">
                {isLoadingParticipants ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3 rounded" />
                        <Skeleton className="h-3 w-1/4 rounded" />
                      </div>
                    </div>
                  ))
                ) : recentParticipants.length ? (
                  recentParticipants.map((p) => {
                    const initials = p.fullName
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={p.enrollId}
                        className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 transition-colors group-hover:bg-white group-hover:shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {p.fullName}
                            </p>
                            <p className="text-xs font-medium text-gray-500">
                              NIM: {p.nim}
                            </p>
                          </div>
                        </div>
                        <Chip
                          size="sm"
                          variant="dot"
                          color={statusColorMap[p.status]}
                          classNames={{
                            content: 'capitalize font-bold text-xs',
                            base: 'border-0',
                          }}
                        >
                          {p.status}
                        </Chip>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-4 text-center text-sm text-gray-500">
                    Belum ada pendaftar baru
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Approval Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md shadow-gray-100/50"
            >
              <h3 className="text-xl font-bold text-gray-900">
                Ringkasan Validasi
              </h3>
              <p className="text-sm text-gray-500">
                Statistik persetujuan peserta
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-600">
                      Approval Rate
                    </span>
                    <span className="font-bold text-green-600">
                      {approvalRate}%
                    </span>
                  </div>
                  <Progress
                    size="sm"
                    value={approvalRate}
                    color="success"
                    classNames={{ track: 'bg-gray-100' }}
                    aria-label="Approval Rate"
                  />
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-600">
                      Rejection Rate
                    </span>
                    <span className="font-bold text-red-600">
                      {rejectionRate}%
                    </span>
                  </div>
                  <Progress
                    size="sm"
                    value={rejectionRate}
                    color="danger"
                    classNames={{ track: 'bg-gray-100' }}
                    aria-label="Rejection Rate"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-xs font-semibold text-gray-400 uppercase">
                      Total
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {totalEnrolled}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <div className="text-xs font-semibold text-green-600 uppercase">
                      Valid
                    </div>
                    <div className="text-xl font-bold text-green-700">
                      {summary.approvedEnrollments}
                    </div>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4 text-center">
                    <div className="text-xs font-semibold text-amber-600 uppercase">
                      Wait
                    </div>
                    <div className="text-xl font-bold text-amber-700">
                      {summary.pendingEnrollments}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Access */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h4 className="px-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Quick Actions
              </h4>
              <div className="grid gap-4">
                <Link
                  href="/admin/services"
                  className="group hover:border-primary-200 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md hover:shadow-blue-500/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="group-hover:text-primary font-bold text-gray-900 transition-colors">
                      Layanan
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      Kelola jenis tes
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/schedules"
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 transition-colors group-hover:text-emerald-600">
                      Jadwal
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      Atur sesi ujian
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/participants"
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 transition-colors group-hover:text-violet-600">
                      Peserta
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      Validasi pendaftar
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
