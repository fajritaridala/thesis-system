import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
} from '@heroui/react';
import { EnrollmentItem } from '@/types/admin.types';

type ScoreFormValues = {
  listening: number;
  structure: number;
  reading: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  participant: Pick<
    EnrollmentItem,
    'fullName' | 'nim' | 'enrollId' | 'participantId'
  > | null;
  onSubmit: (
    enrollId: string,
    participantId: string,
    scores: ScoreFormValues
  ) => void;
  isSubmitting: boolean;
  blockchainStatus:
    | 'idle'
    | 'submitting'
    | 'uploading-ipfs'
    | 'storing-blockchain'
    | 'updating-status'
    | 'success'
    | 'error';
  statusMessage: string;
  onRetry: () => void;
};

export function InputModal({
  isOpen,
  onClose,
  participant,
  onSubmit,
  isSubmitting,
  blockchainStatus,
  statusMessage,
  onRetry,
}: Props) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScoreFormValues>({
    defaultValues: {
      listening: 0,
      structure: 0,
      reading: 0,
    },
  });

  const listening = watch('listening');
  const structure = watch('structure');
  const reading = watch('reading');

  const totalScore = Math.round(((listening + structure + reading) * 10) / 3);

  useEffect(() => {
    if (isOpen) {
      reset({ listening: 0, structure: 0, reading: 0 });
    }
  }, [isOpen, reset]);

  const submitHandler = (values: ScoreFormValues) => {
    if (!participant) return;
    onSubmit(participant.enrollId, participant.participantId, values);
  };

  const isIdle = blockchainStatus === 'idle';
  const isError = blockchainStatus === 'error';
  const isSuccess = blockchainStatus === 'success';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting && !isError ? undefined : onClose}
      isDismissable={!isSubmitting}
      hideCloseButton={isSubmitting && !isError}
      size="lg"
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <form onSubmit={handleSubmit(submitHandler)}>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Input Nilai Peserta</h2>
              <div className="text-sm font-normal text-gray-500">
                {participant?.fullName} - {participant?.nim}
              </div>
            </ModalHeader>
            <ModalBody>
              {!isIdle && (
                <div className="mb-4">
                  <Alert
                    color={
                      isError ? 'danger' : isSuccess ? 'success' : 'primary'
                    }
                    title={
                      isError
                        ? 'Gagal'
                        : isSuccess
                          ? 'Berhasil'
                          : 'Proses Berjalan'
                    }
                    description={statusMessage}
                    variant={isSuccess ? 'solid' : 'faded'}
                  />
                </div>
              )}

              <div
                className={`flex flex-col gap-4 ${
                  !isIdle && !isError ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="listening"
                    control={control}
                    rules={{
                      required: 'Wajib diisi',
                      min: { value: 0, message: 'Min 0' },
                      max: { value: 68, message: 'Max 68' },
                      validate: (val) => val <= 68 || 'Max 68',
                    }}
                    render={({ field }) => (
                      <NumberInput
                        {...field}
                        label="Listening"
                        placeholder="0"
                        min={0}
                        max={68}
                        isInvalid={!!errors.listening}
                        errorMessage={errors.listening?.message}
                        classNames={{ inputWrapper: 'h-14' }}
                        onValueChange={(val) => field.onChange(val)}
                      />
                    )}
                  />
                  <Controller
                    name="structure"
                    control={control}
                    rules={{
                      required: 'Wajib diisi',
                      min: 0,
                      max: { value: 68, message: 'Max 68' },
                    }}
                    render={({ field }) => (
                      <NumberInput
                        {...field}
                        label="Structure"
                        placeholder="0"
                        min={0}
                        max={68}
                        isInvalid={!!errors.structure}
                        errorMessage={errors.structure?.message}
                        classNames={{ inputWrapper: 'h-14' }}
                        onValueChange={(val) => field.onChange(val)}
                      />
                    )}
                  />
                  <Controller
                    name="reading"
                    control={control}
                    rules={{
                      required: 'Wajib diisi',
                      min: 0,
                      max: { value: 67, message: 'Max 67' },
                    }}
                    render={({ field }) => (
                      <NumberInput
                        {...field}
                        label="Reading"
                        placeholder="0"
                        min={0}
                        max={67}
                        isInvalid={!!errors.reading}
                        errorMessage={errors.reading?.message}
                        classNames={{ inputWrapper: 'h-14' }}
                        onValueChange={(val) => field.onChange(val)}
                      />
                    )}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <span className="font-semibold text-gray-700">
                    Estimasi Skor Total (PBT):
                  </span>
                  <span className="text-primary text-2xl font-bold">
                    {totalScore}
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {isError ? (
                <div className="flex w-full gap-2">
                  <Button variant="light" onPress={onClose} fullWidth>
                    Batal
                  </Button>
                  <Button color="primary" onPress={onRetry} fullWidth>
                    Coba Lagi
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="light"
                    onPress={onClose}
                    isDisabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    isDisabled={!isIdle}
                  >
                    Simpan Nilai
                  </Button>
                </>
              )}
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
