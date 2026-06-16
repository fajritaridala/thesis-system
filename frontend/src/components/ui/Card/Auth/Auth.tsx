'use client';

import { LuLockKeyhole } from 'react-icons/lu';
import { Button, Card, CardBody, CardHeader, Spinner } from '@heroui/react';

type Props = {
  handleOnPress: () => void;
  isLoading: boolean;
  heading: string;
  buttonLabel: string;
};

export function AuthCard(props: Props) {
  const { handleOnPress, isLoading, heading, buttonLabel } = props;

  return (
    <Card className="border-border shadow-main flex w-full items-center justify-center rounded-2xl border bg-white px-6 py-10">
      <CardHeader>
        <div className="mx-auto w-full text-center">
          <h1 className="text-text my-6 text-5xl font-extrabold tracking-tight">
            {heading}
          </h1>
          <p className="text-text-muted text-base md:text-lg">
            Akses platform verifikasi sertifikat yang aman dan terpercaya.
          </p>
        </div>
      </CardHeader>
      <CardBody className="w-full">
        <div className="mx-auto mt-4 w-full max-w-md px-2">
          <Button
            data-hover="false"
            data-active="false"
            className="bg-primary hover:shadow-primary/30 h-12 w-full rounded-full text-lg font-bold text-white transition-all delay-75 duration-100 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md"
            onPress={handleOnPress}
            size="lg"
          >
            {isLoading ? (
              <Spinner
                variant="wave"
                color="current"
                size="sm"
                className="text-white"
              />
            ) : (
              buttonLabel
            )}
          </Button>
          <div className="mt-6 flex items-center justify-center gap-2 opacity-80">
            <LuLockKeyhole className="text-text-muted h-4 w-4" />
            <p className="text-text-muted text-center text-xs font-medium">
              Verifikasi sertifikat berbasis blockchain yang aman
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
