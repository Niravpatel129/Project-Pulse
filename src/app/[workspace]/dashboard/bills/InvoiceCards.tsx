import { motion } from 'framer-motion';
import { FC } from 'react';

interface InvoiceCardProps {
  amount: number;
  status: 'Open' | 'Paid' | 'Overdue';
  count: number;
  onFilter?: (status: string) => void;
}

const InvoiceCard: FC<InvoiceCardProps> = ({ amount, status, count, onFilter }) => {
  return (
    <button
      type='button'
      className='text-left w-full h-full'
      onClick={() => {
        return onFilter?.(status.toLowerCase());
      }}
    >
      <div className='border bg-background text-card-foreground rounded-lg h-full'>
        <div className='flex flex-col space-y-1.5 p-4 sm:p-6 pb-1 sm:pb-2 relative'>
          <h3 className='tracking-tight mb-1 sm:mb-2 font-mono font-medium text-xl sm:text-2xl'>
            ${amount.toLocaleString()}
          </h3>
        </div>
        <div className='px-4 md:px-6'>
          <div className='flex flex-col gap-1 sm:gap-2'>
            <div className='text-sm sm:text-base'>{status}</div>
            <div className='text-xs sm:text-sm text-muted-foreground'>
              {count} {count === 1 ? 'invoice' : 'invoices'}
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
    <div className='border bg-background text-card-foreground rounded-lg h-full'>
      <div className='space-y-1 sm:space-y-1.5 p-4 sm:p-6 pb-1 sm:pb-2 flex flex-col xl:flex-row justify-between'>
        <h3 className='tracking-tight mb-1 sm:mb-2 font-mono font-medium text-xl sm:text-2xl'>
          {score}
        </h3>
        <PaymentScoreVisualizer score={numericScore} paymentStatus={score} />
      </div>
      <div className='px-4 md:px-6 sm:hidden xl:flex'>
        <div className='flex flex-col gap-1 sm:gap-2'>
          <div className='text-sm sm:text-base'>Payment score</div>
          <div className='text-xs sm:text-sm text-muted-foreground'>{text}</div>
        </div>
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
  const cards = [
    { amount: openAmount, status: 'Open' as const, count: openCount },
    { amount: paidAmount, status: 'Paid' as const, count: paidCount },
    { amount: overdueAmount, status: 'Overdue' as const, count: overdueCount },
  ];

  return (
    <div className='flex flex-wrap gap-2 sm:gap-4'>
      {cards.map((card, index) => {
        return (
          <div key={index} className='flex-1 min-w-[200px] sm:min-w-[300px] h-[155px]'>
            <InvoiceCard {...card} onFilter={onFilter} />
          </div>
        );
      })}
      <div className='flex-1 min-w-[200px] sm:min-w-[300px] h-[155px]'>
        <PaymentScoreCard />
      </div>
    </div>
  );
};

export default InvoiceCards;
