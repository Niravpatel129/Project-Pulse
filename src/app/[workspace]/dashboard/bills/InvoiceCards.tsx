import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FC, useState } from 'react';

interface CurrencyAmount {
  currency: string;
  total_amount: number;
  invoice_count: number;
}

interface InvoiceStatusSummary {
  currencies: CurrencyAmount[];
}

interface InvoiceSummary {
  open: InvoiceStatusSummary;
  paid: InvoiceStatusSummary;
  overdue: InvoiceStatusSummary;
}

interface InvoiceCardProps {
  status: 'Open' | 'Paid' | 'Overdue';
  currencies: CurrencyAmount[];
  onFilter?: (status: string) => void;
}

const formatCurrencyDisplay = (currency: string, amount: number) => {
  const currencyMap: Record<string, string> = {
    CAD: 'CA$',
    USD: 'US$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = currencyMap[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
};

const InvoiceCard: FC<InvoiceCardProps> = ({ status, currencies, onFilter }) => {
  const defaultCurrency = { currency: 'CAD', total_amount: 0, invoice_count: 0 };
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    currencies[0]?.currency || defaultCurrency.currency,
  );

  const selectedAmount =
    currencies.find((c) => {
      return c.currency === selectedCurrency;
    }) || defaultCurrency;

  return (
    <button
      type='button'
      className='text-left w-full h-full'
      onClick={() => {
        return onFilter?.(status.toLowerCase());
      }}
    >
      <div className='border bg-background text-card-foreground rounded-lg h-full pb-6'>
        <div className='flex flex-col space-y-1.5 p-4 sm:p-6 pb-1 sm:pb-2 relative'>
          <h3 className='tracking-tight mb-1 sm:mb-2 font-mono font-medium text-xl sm:text-2xl'>
            {formatCurrencyDisplay(selectedAmount.currency, selectedAmount.total_amount)}
          </h3>
          {currencies.length > 1 && (
            <div className='flex gap-1 mt-1'>
              {currencies.map((currency) => {
                return (
                  <div
                    key={currency.currency}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      setSelectedCurrency(currency.currency);
                    }}
                    className={`px-2 py-0.5 text-xs rounded cursor-pointer ${
                      selectedCurrency === currency.currency
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  ></div>
                );
              })}
            </div>
          )}
        </div>
        <div className='px-4 md:px-6'>
          <div className='flex flex-col gap-1 sm:gap-2'>
            <div className='text-sm sm:text-base'>{status}</div>
            <div className='text-xs sm:text-sm text-muted-foreground'>
              {selectedAmount.invoice_count}{' '}
              {selectedAmount.invoice_count === 1 ? 'invoice' : 'invoices'}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export function PaymentScoreVisualizer({
  score,
  paymentStatus,
}: {
  score: number;
  paymentStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';
}) {
  const getColor = (status: typeof paymentStatus) => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-500';
      case 'Good':
        return 'bg-blue-500';
      case 'Fair':
        return 'bg-yellow-500';
      case 'Poor':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className='flex items-end gap-[6px]'>
      {[...Array(10)].map((_, index) => {
        const color = getColor(paymentStatus);
        return (
          <div className='relative' key={index.toString()}>
            <motion.div
              className={`w-1 ${color} relative z-10`}
              initial={{
                scaleY: 0,
                height: index >= 8 ? '31px' : '27px',
                y: index >= 8 ? -4 : 0,
              }}
              animate={{
                scaleY: 1,
                height: '27px',
                y: 0,
                opacity: index < score ? 1 : 0.3,
              }}
              transition={{
                duration: 0.15,
                delay: index * 0.02,
                scaleY: { duration: 0.15, delay: index * 0.02 },
                height: { duration: 0.1, delay: 0.15 + index * 0.02 },
                y: { duration: 0.1, delay: 0.15 + index * 0.02 },
                opacity: { duration: 0.1, delay: 0.15 + index * 0.02 },
              }}
              style={{ originY: 1 }}
            />
          </div>
        );
      })}
    </div>
  );
}

const PaymentScoreCard: FC = () => {
  type PaymentStatus = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';

  // Calculate payment score based on paid vs overdue invoices
  const calculatePaymentScore = () => {
    const paidInvoices = 5; // Example: from the cards data
    const overdueInvoices = 2; // Example: from the cards data
    const totalInvoices = paidInvoices + overdueInvoices;

    if (totalInvoices === 0)
      return {
        score: 'Unknown' as PaymentStatus,
        text: 'No payment history yet.',
        numericScore: 0,
      };

    const numericScore = Math.round((paidInvoices / totalInvoices) * 100);
    const score = Math.round((numericScore / 100) * 10); // Convert to 0-10 scale

    if (numericScore >= 90)
      return {
        score: 'Excellent' as PaymentStatus,
        text: 'Consistently pay on time.',
        numericScore: score,
      };
    if (numericScore >= 75)
      return { score: 'Good' as PaymentStatus, text: 'Mostly pay on time.', numericScore: score };
    if (numericScore >= 50)
      return { score: 'Fair' as PaymentStatus, text: 'Some late payments.', numericScore: score };
    return { score: 'Poor' as PaymentStatus, text: 'Frequent late payments.', numericScore: score };
  };

  const { score, text, numericScore } = calculatePaymentScore();

  return (
    <div className='border bg-background text-card-foreground rounded-lg h-full relative'>
      <div className='space-y-1 sm:space-y-1.5 p-4 sm:p-6 pb-1 sm:pb-2 flex flex-col xl:flex-row justify-between'>
        <h3 className='tracking-tight mb-1 sm:mb-2 font-mono font-medium text-xl sm:text-2xl'>
          {score}
        </h3>
        <div className='hidden xl:block'>
          <PaymentScoreVisualizer score={numericScore} paymentStatus={score} />
        </div>
      </div>
      <div className='px-4 sm:px-6 flex-col gap-1 sm:gap-2 hidden md:flex'>
        <div className='text-sm sm:text-base'>Payment score</div>
        <div className='text-xs sm:text-sm text-muted-foreground'>{text}</div>
      </div>
    </div>
  );
};

interface InvoiceCardsProps {
  onFilter?: (status: string) => void;
  openAmount: number;
  openCount: number;
  paidAmount: number;
  paidCount: number;
  overdueAmount: number;
  overdueCount: number;
}

const InvoiceCards: FC<InvoiceCardsProps> = ({
  onFilter,
  openAmount,
  openCount,
  paidAmount,
  paidCount,
  overdueAmount,
  overdueCount,
}) => {
  const { data: summaryData, isLoading, error } = useInvoiceSummary();

  if (isLoading) {
    return (
      <div className='flex gap-2 sm:gap-4'>
        {[...Array(4)].map((_, index) => {
          return (
            <div key={index} className='w-[calc(25%-6px)] min-w-0'>
              <div className='border bg-background text-card-foreground rounded-lg h-full pb-6'>
                <div className='flex flex-col space-y-1.5 p-4 sm:p-6 pb-1 sm:pb-2'>
                  <div className='h-8 bg-muted animate-pulse rounded' />
                  <div className='h-4 w-16 bg-muted animate-pulse rounded' />
                </div>
                <div className='px-4 md:px-6'>
                  <div className='flex flex-col gap-1 sm:gap-2'>
                    <div className='h-5 w-20 bg-muted animate-pulse rounded' />
                    <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (error) {
    return <div className='flex gap-2 sm:gap-4'>Error loading invoice summary</div>;
  }

  const cards = [
    { status: 'Open' as const, currencies: summaryData?.open.currencies || [] },
    { status: 'Paid' as const, currencies: summaryData?.paid.currencies || [] },
    { status: 'Overdue' as const, currencies: summaryData?.overdue.currencies || [] },
  ];

  return (
    <div className='flex gap-2 sm:gap-4'>
      {cards.map((card, index) => {
        return (
          <div key={index} className='w-[calc(25%-6px)] min-w-0'>
            <InvoiceCard {...card} onFilter={onFilter} />
          </div>
        );
      })}
      <div className='w-[calc(25%-6px)] min-w-0 h-[155px]'>
        <PaymentScoreCard />
      </div>
    </div>
  );
};

const useInvoiceSummary = () => {
  return useQuery({
    queryKey: ['invoiceSummary'],
    queryFn: async () => {
      const response = await newRequest.get<{ data: InvoiceSummary }>('/invoices2/summary');
      return response.data.data;
    },
  });
};

export default InvoiceCards;
