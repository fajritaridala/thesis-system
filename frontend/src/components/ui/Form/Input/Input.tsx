import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input as HeroInput, InputProps } from '@heroui/react';

interface InputProps_<T extends FieldValues> extends Omit<InputProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

export const Input = <T extends FieldValues>({
  name,
  control,
  label,
  ...props
}: InputProps_<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <HeroInput
          {...field}
          {...props}
          label={label}
          isInvalid={!!error}
          errorMessage={error?.message}
          color={error ? 'danger' : 'default'}
          validationBehavior="aria"
          value={field.value?.toString() ?? ''}
        />
      )}
    />
  );
};
