'use client';

import InvoicePreview from '@/components/Main/Invoices/InvoicePreview';
import Invoices from '@/components/Main/Invoices/Invoices';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

export default function InvoicesPage() {
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <main className='flex-1 w-full overflow-auto bg-background h-screen'>
      <div className='flex h-full'>
        <div className='w-full h-full overflow-auto'>
          <Invoices
            onPreviewClick={() => {
              return setShowPreview(true);
            }}
          />
        </div>
        {isMobile ? (
          <Sheet open={showPreview} onOpenChange={setShowPreview}>
            <SheetContent side='right' className='w-full sm:max-w-lg p-0'>
              <SheetHeader className='sr-only'>
                <SheetTitle>Invoice Preview</SheetTitle>
              </SheetHeader>
              <InvoicePreview
                onClose={() => {
                  return setShowPreview(false);
                }}
              />
            </SheetContent>
          </Sheet>
        ) : (
          <div className='w-full border-l border-l-gray-800 overflow-hidden'>
            <InvoicePreview
              onClose={() => {
                return setShowPreview(false);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
