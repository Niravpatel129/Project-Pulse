import { FC } from 'react';

interface InvoiceCardProps {
  amount: number;
  status: 'Open' | 'Paid' | 'Overdue';
  count: number;
}

const InvoiceCard: FC<InvoiceCardProps> = ({ amount, status, count }) => {
  return (
    <button type='button' className='hidden sm:block text-left w-full'>
      <div className='border bg-background text-card-foreground rounded-lg'>
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

const PaymentScoreCard: FC = () => {
  return (
    <div className='border bg-background text-card-foreground rounded-lg'>
      <div className='space-y-1.5 p-6 pb-2 flex flex-col xl:flex-row justify-between'>
        <h3 className='tracking-tight mb-2 font-mono font-medium text-2xl'>Unknown</h3>
        <div className='flex items-end gap-[6px]'>
          {[...Array(10)].map((_, i) => {
            return (
              <div key={i} className='relative'>
                <div
                  className='w-1 bg-primary relative z-10'
                  style={{
                    height: '27px',
                    transform: 'none',
                    transformOrigin: '50% 100% 0px',
                    opacity: 0.3,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className='p-6 pt-0 sm:hidden xl:flex'>
        <div className='flex flex-col gap-2'>
          <div>Payment score</div>
          <div className='text-sm text-muted-foreground'>No payment history yet.</div>
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
          <div key={index} className='flex-1 min-w-[300px]'>
            <InvoiceCard {...card} />
          </div>
        );
      })}
      <div className='flex-1 min-w-[300px]'>
        <PaymentScoreCard />
      </div>
    </div>
  );
};

export default InvoiceCards;
