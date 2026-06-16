import { ChangeEvent, RefObject } from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import { LuCloudUpload, LuFileCheck } from 'react-icons/lu';
import { Button, Card, CardBody, Form, cn } from '@heroui/react';
import { Input, Select } from '@/components/ui/Form';
import { Gender, ScheduleRegister } from '@/types/admin.types';

type Props = {
  handleSubmitAction: (
    onSubmit: (data: ScheduleRegister) => void,
    onError?: (errors: FieldErrors) => void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleRegisterAction: (data: ScheduleRegister) => void;
  onErrorAction: (errors: FieldErrors) => void;
  control: Control<ScheduleRegister>;
  errors: FieldErrors<ScheduleRegister>;
  isLoading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  paymentReceipt: File | null;
  handleFileChangeAction: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFilePickerAction: () => void;
};

export function ScheduleRegisterForm(props: Props) {
  const {
    handleSubmitAction,
    handleRegisterAction,
    onErrorAction,
    control,
    errors,
    isLoading,
    fileInputRef,
    paymentReceipt,
    handleFileChangeAction,
    handleFilePickerAction,
  } = props;
  console.log(errors);

  return (
    <Card className="hover:border-secondary shadow-neo w-full rounded-2xl border border-gray-200 p-6 transition-colors delay-100 duration-300">
      <CardBody>
        <Form
          onSubmit={handleSubmitAction(handleRegisterAction, onErrorAction)}
          className="my-2 space-y-6"
        >
          <div className="grid w-full grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {/* Kolom Kiri: Data Diri */}
            <div className="flex flex-col gap-4">
              <Input
                control={control}
                name="fullName"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />

              <Input
                control={control}
                name="birthDate"
                label="Tanggal Lahir"
                placeholder="Pilih tanggal lahir"
                type="date"
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />

              <Select
                control={control}
                name="gender"
                label="Jenis Kelamin"
                placeholder="Pilih jenis kelamin"
                isRequired
                variant="bordered"
                labelPlacement="outside"
                options={[
                  { label: 'Laki-laki', value: Gender.MALE },
                  { label: 'Perempuan', value: Gender.FEMALE },
                ]}
              />

              <Input
                control={control}
                name="email"
                label="Email"
                placeholder="Contoh: email@gmail.com"
                type="email"
                isRequired
                variant="bordered"
                labelPlacement="outside-top"
              />

              <Input
                control={control}
                name="phoneNumber"
                label="Nomor Telepon"
                placeholder="Contoh: 081234567890"
                type="tel"
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />
            </div>

            {/* Kolom Kanan: Data Kontak & Akademik */}
            <div className="flex flex-col gap-4">
              <Input
                control={control}
                name="nim"
                label="Nomor Induk Mahasiswa"
                placeholder="Masukkan NIM"
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />

              <Input
                control={control}
                name="faculty"
                label="Fakultas"
                placeholder="Masukkan fakultas"
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />

              <Input
                control={control}
                name="major"
                label="Program Studi"
                placeholder="Masukkan program studi"
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />

              <Input
                control={control}
                name="paymentDate"
                label="Tanggal Pembayaran"
                type="date"
                isRequired
                variant="bordered"
                labelPlacement="outside"
              />
            </div>

            {/* Full Width: Upload Bukti Pembayaran */}
            <div className="col-span-1 flex flex-col pt-2 md:col-span-2">
              <label className="text-default-700 text-sm font-medium">
                Bukti Pembayaran
                <span className="text-danger-500">*</span>
              </label>
              <div
                onClick={handleFilePickerAction}
                className={cn(
                  'mt-2 flex cursor-pointer justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors',
                  !!errors.paymentProof
                    ? 'border-danger bg-danger-50'
                    : 'border-default-200 hover:border-primary hover:bg-default-50'
                )}
              >
                <div className="text-center">
                  {paymentReceipt ? (
                    <LuFileCheck
                      className="text-success-500 mx-auto h-12 w-12"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <LuCloudUpload
                      className={cn(
                        'mx-auto h-12 w-12 transition-colors',
                        !!errors.paymentProof
                          ? 'text-danger'
                          : 'text-default-400'
                      )}
                      strokeWidth={1.5}
                    />
                  )}
                  <div className="text-default-600 mt-4 flex text-sm leading-6">
                    <p
                      className={cn(
                        'pl-1',
                        !!errors.paymentProof
                          ? 'text-danger'
                          : 'text-default-600'
                      )}
                    >
                      {paymentReceipt
                        ? 'File terpilih:'
                        : 'Unggah file atau seret dan lepas'}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-xs leading-5',
                      !!errors.paymentProof ? 'text-danger' : 'text-default-500'
                    )}
                  >
                    {paymentReceipt?.name || 'PNG, JPG, PDF hingga 10MB'}
                  </p>
                </div>
              </div>
              {errors.paymentProof && (
                <p className="text-danger mt-2 px-1 text-sm font-medium">
                  {errors.paymentProof?.message}
                </p>
              )}
              <input
                type="file"
                ref={(node) => {
                  fileInputRef.current = node;
                }}
                onChange={handleFileChangeAction}
                className="hidden"
                accept="image/png, image/jpeg, application/pdf"
              />
            </div>
          </div>

          <div className="flex w-full justify-end">
            <Button
              radius="full"
              color="primary"
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="px-6 font-semibold text-white"
            >
              {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
