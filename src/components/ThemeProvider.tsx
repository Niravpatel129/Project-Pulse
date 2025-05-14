'use client';

import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <div>
      <NextThemesProvider attribute='class' defaultTheme='dark' enableSystem={false} {...props}>
        {children}
      </NextThemesProvider>
    </div>
  );
}
