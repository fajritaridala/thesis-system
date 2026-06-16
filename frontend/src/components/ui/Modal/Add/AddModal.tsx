import { ReactNode } from 'react';
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';

export type AddModalProps = {
  /** Modal open state */
  isOpen: boolean;
  /** Close modal handler */
  onClose: () => void;
  /** Form submit handler */
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  /** Modal title */
  title: string;
  /** Description text below title */
  description?: string;
  /** Loading/submitting state */
  isSubmitting?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Submit button text */
  submitText?: string;
  /** Disable submit button */
  isSubmitDisabled?: boolean;
  /** Form fields as children */
  children: ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
};

/**
 * AddModal - Reusable modal wrapper for Add/Edit forms
 *
 * @example
 * ```tsx
 * <AddModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSubmit={handleSubmit}
 *   title="Tambah Layanan"
 *   description="Isi informasi layanan secara lengkap."
 *   isSubmitting={isPending}
 * >
 *   <Controller name="name" control={control} render={...} />
 *   <Controller name="price" control={control} render={...} />
 * </AddModal>
 * ```
 */
export function AddModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  isSubmitting = false,
  cancelText = 'Batal',
  submitText = 'Simpan',
  isSubmitDisabled = false,
  children,
  size = 'lg',
}: AddModalProps) {
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      size={size}
      onClose={onClose}
      placement="center"
      className="px-3 py-6"
    >
      <ModalContent>
        {() => (
          <Form onSubmit={onSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <h1 className="text-text text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-text-muted text-sm">{description}</p>
              )}
            </ModalHeader>

            <ModalBody className="w-full space-y-4">{children}</ModalBody>

            <ModalFooter className="flex w-full justify-center gap-3">
              <Button
                variant="flat"
                color="danger"
                onPress={onClose}
                className="w-1/3 font-semibold"
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                color="primary"
                className="w-1/3 font-semibold text-white"
                isLoading={isSubmitting}
                isDisabled={isSubmitDisabled}
              >
                {submitText}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
}
