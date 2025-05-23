'use client';

import NumberFlow from '@number-flow/react';

type Props = {
  value: number;
  currency: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
};

export function AnimatedNumber({
  value,
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
  locale,
}: Props) {
  const localeToUse = locale || 'en-US';

  return (
    <NumberFlow
      value={value}
      format={{
        style: 'currency',
        currency: currency ?? 'USD',
        minimumFractionDigits,
        maximumFractionDigits,
      }}
      willChange
      locales={localeToUse}
    />
  );
}
