import { Lock } from 'lucide-react';

export default function InvoicePage() {
  return (
    <div className='min-h-screen bg-[#fafafa] flex flex-col items-center py-16 px-4 antialiased'>
      {/* Company Logo */}
      <div className='mb-16'>
        <div className='flex items-center gap-3'>
          <div className='w-6 h-6 rounded-full bg-[#0066FF]' />
          <span className='text-[15px] font-medium text-gray-900 tracking-tight'>
            Bolo Print Inc.
          </span>
        </div>
      </div>

      {/* Invoice Card */}
      <div className='w-full max-w-[440px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 mb-3'>
        <div className='flex justify-between items-start mb-10'>
          <div>
            <h1 className='text-[32px] font-semibold text-gray-900 mb-1 tracking-tight'>
              CA$169.50
            </h1>
            <p className='text-[13px] text-gray-500'>Due May 10, 2025</p>
          </div>
          <button className='text-gray-400 hover:text-gray-600 transition-colors'>
            <span className='sr-only'>Download invoice</span>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </button>
        </div>

        <div className='space-y-5 mb-7'>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-gray-500'>To</span>
            <span className='text-[13px] text-gray-900'>Divesh</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-gray-500'>From</span>
            <span className='text-[13px] text-gray-900'>Bolo Print Inc.</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-gray-500'>Invoice</span>
            <span className='text-[13px] text-gray-900 font-mono'>#16786F48-0001</span>
          </div>
        </div>

        <button className='w-full text-[13px] text-gray-500 text-left hover:text-gray-900 transition-colors'>
          View invoice and payment details →
        </button>
      </div>

      {/* Payment Methods */}
      <div className='w-full max-w-[440px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8'>
        {/* Google Pay Button */}
        <button className='w-full bg-black text-white rounded-lg py-3 px-4 mb-6 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity'>
          <span className='text-[13px] font-medium'>G Pay</span>
          <span className='text-[13px] opacity-60'>•••• 5011</span>
        </button>

        <div className='text-center text-[13px] text-gray-500 mb-6'>Or pay another way</div>

        {/* Payment Options */}
        <div className='space-y-3 mb-8'>
          <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors'>
            <input
              type='radio'
              name='payment'
              className='h-4 w-4 text-[#0066FF] focus:ring-[#0066FF]'
            />
            <span className='text-[13px] text-gray-700'>Card</span>
          </label>

          <label className='flex items-center gap-3 p-3 border border-[#0066FF] rounded-lg cursor-pointer bg-blue-50/50'>
            <input
              type='radio'
              name='payment'
              className='h-4 w-4 text-[#0066FF] focus:ring-[#0066FF]'
              defaultChecked
            />
            <span className='text-[13px] text-[#0066FF]'>Pre-authorized Debit</span>
          </label>
        </div>

        {/* Form Fields */}
        <div className='space-y-4 mb-8'>
          <div>
            <label className='block text-[13px] text-gray-700 mb-1.5'>Full name</label>
            <input
              type='text'
              defaultValue='Divesh'
              className='w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-shadow'
            />
          </div>
          <div>
            <label className='block text-[13px] text-gray-700 mb-1.5'>Email</label>
            <input
              type='email'
              defaultValue='Dipu051098@gmail.com'
              className='w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-shadow'
            />
          </div>
        </div>

        <p className='text-[13px] text-gray-500 leading-relaxed mb-8'>
          By confirming your payment, you allow Bolo Print Inc. to charge you for this payment and
          future payments in accordance with their terms.
        </p>

        {/* Pay Button */}
        <button className='w-full bg-[#0066FF] text-white rounded-lg h-10 font-medium flex items-center justify-center gap-2 hover:bg-[#0052CC] transition-colors'>
          <span className='text-[13px]'>Pay CA$169.50</span>
          <Lock className='w-3.5 h-3.5' />
        </button>

        {/* Footer */}
        <div className='mt-10 flex items-center justify-center gap-6 text-[13px] text-gray-400'>
          <span>Powered by stripe</span>
          <span className='hover:text-gray-600 transition-colors cursor-pointer'>Terms</span>
          <span className='hover:text-gray-600 transition-colors cursor-pointer'>Privacy</span>
        </div>
      </div>
    </div>
  );
}
