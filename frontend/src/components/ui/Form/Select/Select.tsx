import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Select as HeroSelect, SelectItem, SelectProps } from '@heroui/react';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps_<T extends FieldValues>
  extends Omit<SelectProps, 'name' | 'children'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
}

export const Select = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  ...props
}: SelectProps_<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <HeroSelect
          {...field}
          {...props}
          label={label}
          selectedKeys={field.value ? [field.value.toString()] : []}
          isInvalid={!!error}
          errorMessage={error?.message}
          color={error ? 'danger' : 'default'}
          validationBehavior="aria"
        >
          {options.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </HeroSelect>
      )}
    />
  );
};
