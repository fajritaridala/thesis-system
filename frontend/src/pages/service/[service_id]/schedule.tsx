'use client';

import { useMemo } from 'react';
import { Button, Tooltip } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import BaseLayout from '@/components/layouts/Base';
import { Calendar } from '@/components/ui/Card/Calendar';
import { ScheduleData, useCalendar } from '@/hooks/useCalendar';
import { schedulesService, servicesService } from '@/services/admin.service';
import { ScheduleItem, ServiceItem } from '@/types/admin.types';

export const dynamic = 'force-dynamic';

// ============ HOOK: useSchedule ============
const useSchedule = (serviceId: string) => {
  const { data } = useQuery({
    queryKey: ['schedule', serviceId],
    queryFn: async () => schedulesService.getSchedules({ serviceId }),
    enabled: !!serviceId,
  });

  const scheduleData: ScheduleData[] = useMemo(() => {
    const schedules = (data?.data.data as ScheduleItem[]) || [];
    return schedules.map((item) => ({
      _id: item.scheduleId,
      scheduleDate: item.scheduleDate,
      serviceName: item.serviceName,
      quota: item.quota || 0,
      registrants: item.registrants || 0,
      status: item.status,
    }));
  }, [data]);

  return { scheduleData };
};

// ============ HOOK: useService ============
const useService = () => {
  const { data: serviceData } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await servicesService.getServices();
      return response;
    },
  });
  const services = (serviceData?.data.data as ServiceItem[]) || [];

  return { services };
};

// ============ PAGE COMPONENT ============
export default function SchedulePage() {
  const router = useRouter();
  const params = useParams<{ service_id?: string }>();

  const { scheduleData } = useSchedule(params?.service_id ?? '');
  const { services } = useService();

  const selectedService = services.find((s) => s._id === params?.service_id);

  const { currentDate, calendarGrid, changeMonth, navigateToRegister } =
    useCalendar(scheduleData);

  return (
    <BaseLayout title="Jadwal">
      <section className="flex justify-center bg-white">
        <div className="animate-fade-bottom my-18 flex w-full space-y-6 lg:max-w-6xl">
          {/* Header */}
          <div className="w-1/3 space-y-2">
            <Button
              variant="light"
              data-hover={false}
              onPress={() => router.back()}
              className="text-secondary hover:text-secondary/60 group w-fit p-0"
              startContent={
                <ArrowLeft
                  size={18}
                  className="transform duration-300 group-hover:-translate-x-1"
                />
              }
            >
              Kembali
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-black">
                  {selectedService?.name || 'Jadwal Layanan'}
                </h1>
                <Tooltip
                  color="default"
                  content={
                    <div className="max-w-lg px-1 py-2">
                      <div className="mb-1 text-sm font-bold">
                        Informasi Jadwal
                      </div>
                      <div className="text-xs">
                        Jadwal yang ditampilkan adalah jadwal untuk 7 hari ke
                        depan (H+7). Silakan pilih tanggal dan waktu yang sesuai
                        dengan preferensi Anda.
                      </div>
                    </div>
                  }
                  placement="right"
                >
                  <div className="text-secondary hover:text-secondary/60 cursor-help transition-colors">
                    <Info size={18} />
                  </div>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-500">
                Pilih jadwal yang tersedia
              </p>
            </div>
          </div>

          <div className="flex w-full justify-start pt-12">
            <Calendar
              currentDate={currentDate}
              grid={calendarGrid}
              onChangeMonth={changeMonth}
              onSelectSchedule={navigateToRegister}
            />
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
