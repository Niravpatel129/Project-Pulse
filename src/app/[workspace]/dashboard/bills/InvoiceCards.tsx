import { motion } from 'framer-motion';
import { FC } from 'react';

interface InvoiceCardProps {
  amount: number;
  status: 'Open' | 'Paid' | 'Overdue';
  count: number;
}

const InvoiceCard: FC<InvoiceCardProps> = ({ amount, status, count }) => {
  return (
    <button type='button' className='hidden sm:block text-left w-full h-full'>
      <div className='border bg-background text-card-foreground rounded-lg h-full'>
        <div className='flex flex-col space-y-1.5 p-6 pb-2 relative'>
          <h3 className='tracking-tight mb-2 font-mono font-medium text-2xl'>
            ${amount.toLocaleString()}
          </h3>
        </div>
        <div className='p-6 pt-0'>
          <div className='flex flex-col gap-2'>
            <div>{status}</div>
            <div className='text-sm text-muted-foreground'>
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
      <div className='space-y-1.5 p-6 pb-2 flex flex-col xl:flex-row justify-between'>
        <h3 className='tracking-tight mb-2 font-mono font-medium text-2xl'>{score}</h3>
        <PaymentScoreVisualizer score={numericScore} paymentStatus={score} />
      </div>
      <div className='p-6 pt-0 sm:hidden xl:flex'>
        <div className='flex flex-col gap-2'>
          <div>Payment score</div>
          <div className='text-sm text-muted-foreground'>{text}</div>
        </div>
      </div>
    </div>
  );
};

const InvoiceCards: FC = () => {
  // Example data - replace with your actual data
  const cards = [
    { amount: 15000, status: 'Open' as const, count: 0 },
    { amount: 25000, status: 'Paid' as const, count: 5 },
    { amount: 5000, status: 'Overdue' as const, count: 2 },
  ];

  return (
    <div className='flex flex-wrap gap-4'>
      {cards.map((card, index) => {
        return (
          <div key={index} className='flex-1 min-w-[300px] h-[200px]'>
            <InvoiceCard {...card} />
          </div>
        );
      })}
      <div className='flex-1 min-w-[300px] h-[200px]'>
        <PaymentScoreCard />
      </div>
    </div>
  );
};

export default InvoiceCards;
