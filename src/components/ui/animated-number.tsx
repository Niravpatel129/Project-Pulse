'use client';

import NumberFlow from '@number-flow/react';

type Props = {
  value: number;
  currency: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
  decimals?: 'yes' | 'no';
};

export function AnimatedNumber({
  value,
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
  locale,
  decimals,
}: Props) {
  const localeToUse = locale || 'en-US';

  return (
    <NumberFlow
      value={value}
      format={{
        style: 'currency',
        currency: currency ?? 'USD',
        minimumFractionDigits: decimals === 'yes' ? 2 : 0,
        maximumFractionDigits: decimals === 'yes' ? 2 : 0,
        useGrouping: true,
        currencyDisplay: 'symbol',
      }}
      willChange
      locales={localeToUse}
    />
  );
}
