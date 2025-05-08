'use client';

import { useParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface PaymentUrlProps {
  invoiceId: string;
  children: (paymentUrl: string | undefined) => ReactNode;
}

export function PaymentUrl({ invoiceId, children }: PaymentUrlProps) {
  const params = useParams();
  const [paymentUrl, setPaymentUrl] = useState<string>();

  useEffect(() => {
    if (params.workspace) {
      setPaymentUrl(`${window.location.origin}/${params.workspace}/pay/${invoiceId}`);
    }
  }, [params.workspace, invoiceId]);

  return <>{children(paymentUrl)}</>;
}
