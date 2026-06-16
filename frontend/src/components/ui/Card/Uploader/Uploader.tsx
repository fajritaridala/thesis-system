'use client';

import { ChangeEvent, DragEvent, RefObject } from 'react';
import { LuCircleCheck, LuCloudUpload, LuFilePlus } from 'react-icons/lu';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Spinner,
  cn,
} from '@heroui/react';
import Image from 'next/image';

type DragHandlers = {
  onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
};

type Props = {
  error?: string;
  handleSubmit: () => void;
  isPreview?: string;
  handleClick: () => void;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
  isDragging?: boolean;
  dragHandlers?: DragHandlers;
};

export function UploaderCard(props: Props) {
  const {
    handleSubmit,
    isPreview,
    handleClick,
    handleFile,
    fileInputRef,
    loading = true,
    isDragging = false,
    dragHandlers,
  } = props;

  return (
    <>
      <Card className="shadow-neo w-full rounded-2xl border border-gray-200 px-2 py-4 transition-all delay-75 duration-200 ease-in-out">
        <CardBody>
          <div
            onClick={handleClick}
            {...dragHandlers}
            className={cn(
              'bg-bg border-secondary/60 hover:border-secondary hover:bg-bg-dark cursor-pointer rounded-lg border-2 border-dashed py-32 text-center transition-all delay-100 duration-300',
              {
                'hover:bg-bg hover:border-secondary/60 p-2': isPreview,
                'bg-bg-dark scale-102': isDragging && !isPreview,
              }
            )}
          >
            {loading && (
              <Spinner
                className={cn('', { hidden: isPreview })}
                classNames={{
                  circle1: ['border-b-secondary'],
                }}
              />
            )}
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFile}
              accept="application/pdf"
              className="hidden"
            />
            <span>
              {isPreview ? (
                <Image
                  src={isPreview}
                  alt="preview image"
                  width={24}
                  height={24}
                  className="w-fit"
                />
              ) : (
                <div className={cn('', { hidden: loading })}>
                  <div className="mb-2 flex justify-center-safe">
                    <LuCloudUpload
                      strokeWidth={2}
                      className="text-secondary/60 text-3xl"
                    />
                  </div>
                  <p className="text-text-muted text-sm transition-all">
                    <span className="text-secondary/60 font-bold">
                      Klik untuk mengunggah&nbsp;
                    </span>
                    atau seret dan lepas
                  </p>
                  <p className="text-text-muted text-extrasmall mt-2">
                    Format file: PDF
                  </p>
                </div>
              )}
            </span>
          </div>
        </CardBody>
        <Divider className="bg-secondary/60 my-2" />
        <CardFooter>
          <div className="flex w-full justify-end">
            <Button
              onPress={handleSubmit}
              size="lg"
              radius="full"
              color="primary"
              startContent={<LuCircleCheck strokeWidth={3} />}
              className="text-medium font-semibold text-white"
            >
              Verifikasi
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
