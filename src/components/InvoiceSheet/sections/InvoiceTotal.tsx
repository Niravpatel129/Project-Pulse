const InvoiceTotal = () => {
  return (
    <div className='w-full justify-end flex mt-8'>
      <div className='w-[300px] font-mono text-[#878787]'>
        <div className='flex justify-between mb-3'>
          <span className='text-[11px]'>Subtotal</span>
          <span className='text-[11px]'>$66,600</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-[11px]'>Tax (0%)</span>
          <span className='text-[11px]'>$0</span>
        </div>
        <div className='h-[1px] bg-[#e0e0e0] my-3'></div>
        <div className='flex justify-between items-center'>
          <span className='text-[11px]'>Total</span>
          <span className='text-[21px] text-[#111] font-medium'>$66,600</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTotal;
