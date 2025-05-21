import { PaymentType } from '@/hooks/useStripePayment';
import { Invoice } from '@/types/invoice';
import { mapCurrency } from '@/utils/currency';
import { useState } from 'react';

interface PaymentSelectorProps {
  invoice: Invoice;
  onSelectPayment: (amount: number, type: PaymentType) => void;
  loading: boolean;
}

export function PaymentSelector({ invoice, onSelectPayment, loading }: PaymentSelectorProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [customAmount, setCustomAmount] = useState('');

  const handlePaymentSubmit = () => {
    let paymentAmount: number;

    if (paymentType === 'custom') {
      if (!customAmount || parseFloat(customAmount) <= 0) {
        return;
      }
      paymentAmount = parseFloat(customAmount);
    } else if (paymentType === 'deposit') {
      paymentAmount = invoice.total * (invoice.depositPercentage / 100);
    } else {
      paymentAmount = invoice.total;
    }

    onSelectPayment(paymentAmount, paymentType);
  };

  return (
    <div className='space-y-8'>
      {/* Payment Options */}
      <div className='flex gap-4'>
        <button
          onClick={() => {
            return setPaymentType('full');
          }}
          className={`p-4 w-full rounded-xl border transition-all ${
            paymentType === 'full'
              ? 'border-[#0066FF] bg-[#0066FF]/5'
              : 'border-[#E4E4E7] dark:border-[#232323] hover:border-[#3F3F46] dark:hover:border-[#333333]'
          }`}
        >
          <div className='space-y-1'>
            <div className='text-sm font-medium text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
              Full Amount
            </div>
            <div className='text-lg font-semibold text-[#3F3F46] dark:text-[#fafafa]'>
              {mapCurrency(invoice.currency)}
              {invoice.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </button>

        {invoice.requireDeposit && (
          <button
            onClick={() => {
              return setPaymentType('deposit');
            }}
            className={`p-4 rounded-xl border transition-all ${
              paymentType === 'deposit'
                ? 'border-[#0066FF] bg-[#0066FF]/5'
                : 'border-[#E4E4E7] dark:border-[#232323] hover:border-[#3F3F46] dark:hover:border-[#333333]'
            }`}
          >
            <div className='space-y-1'>
              <div className='text-sm font-medium text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                Deposit
              </div>
              <div className='text-lg font-semibold text-[#3F3F46] dark:text-[#fafafa]'>
                {mapCurrency(invoice.currency)}
                {(invoice.total * (invoice.depositPercentage / 100)).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </button>
        )}

        <button
          onClick={() => {
            return setPaymentType('custom');
          }}
          className={`p-4 w-full rounded-xl border transition-all ${
            paymentType === 'custom'
              ? 'border-[#0066FF] bg-[#0066FF]/5'
              : 'border-[#E4E4E7] dark:border-[#232323] hover:border-[#3F3F46] dark:hover:border-[#333333]'
          }`}
        >
          <div className='space-y-1'>
            <div className='text-sm font-medium text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
              Custom Amount
            </div>
          </div>
        </button>
      </div>

      {paymentType === 'custom' && (
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
            Enter Payment Amount
          </label>
          <div className='relative p-1'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
              {mapCurrency(invoice.currency)}
            </span>
            <input
              type='number'
              value={customAmount}
              onChange={(e) => {
                return setCustomAmount(e.target.value);
              }}
              className='w-full pl-10 pr-4 py-3 bg-[#F4F4F5] dark:bg-[#232323] border border-[#E4E4E7] dark:border-[#232323] text-[#3F3F46] dark:text-[#fafafa] rounded-xl focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] outline-none transition-all placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
              placeholder='0.00'
              min='0'
              step='0.01'
              max={invoice.total}
            />
          </div>
          <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
            Maximum amount: {mapCurrency(invoice.currency)}
            {invoice.total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      )}

      <button
        onClick={handlePaymentSubmit}
        disabled={
          (paymentType === 'custom' && (!customAmount || parseFloat(customAmount) <= 0)) || loading
        }
        className='w-full bg-[#0066FF] text-white rounded-xl h-12 font-medium flex items-center justify-center gap-2 hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <>
            <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
            Loading Payment...
          </>
        ) : (
          <>
            Continue to Payment
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
