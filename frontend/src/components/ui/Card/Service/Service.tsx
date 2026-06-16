'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from '@heroui/react';

type Props = {
  title: string;
  description: string;
  price: string;
  notes?: string;
  redirect?: () => void;
};

export function ServiceCard(props: Props) {
  const { redirect, title, description, price, notes } = props;

  return (
    <Card className="group hover:shadow-neo rounded-xl border border-gray-300 px-4 py-6 shadow-none transition-all delay-75 duration-300 hover:-translate-1">
      <CardHeader>
        <div className="text-primary flex w-full flex-wrap">
          <h1 className="mb-2 text-4xl font-extrabold">{title}</h1>
        </div>
      </CardHeader>
      <CardBody className="-mt-4 flex justify-between">
        <p className="text-text-muted">{description}</p>
        {notes && (
          <div className="border-info bg-info/10 mt-2 flex gap-1 rounded-r-full border-l-3 py-1">
            {/* <LuInfo
              strokeWidth={2}
              className="text-info ml-1 h-full text-[12px]"
            /> */}
            <p className="text-info ml-2 text-sm italic">{notes}</p>
          </div>
        )}
      </CardBody>
      <Divider className="bg-primary/20" />
      <CardFooter>
        <div className="flex w-full flex-wrap">
          <div className="mb-4">
            <h3 className="text-secondary leading-4 font-semibold">Harga</h3>
            <p className="text-2xl font-extrabold">{price}</p>
          </div>
          <Button
            data-hover={false}
            radius="full"
            className="bg-primary w-full text-lg font-bold text-white"
            onPress={redirect}
          >
            Daftar Sekarang
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
