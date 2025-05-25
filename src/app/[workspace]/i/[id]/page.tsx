'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const InvoicePage = () => {
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPayment(true);
    }, 1000); // Show payment after 2 seconds

    return () => {
      return clearTimeout(timer);
    };
  }, []);

  return (
    <div className='dotted-bg min-h-screen w-full'>
      <div className='flex flex-col w-full max-w-full py-6 mx-auto' style={{ maxWidth: '750px' }}>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center space-x-2'>
            <Avatar className='size-5'>
              <AvatarImage src='https://api.midday.ai/storage/v1/object/public/avatars/9726f43a-45fa-44a3-a6a6-eeb36887f1d7/invoice/image001.png' />
              <AvatarFallback>m</AvatarFallback>
            </Avatar>
            <span className='truncate text-sm'>mrmapletv</span>
          </div>
          <Badge
            variant='outline'
            className='px-2 py-0.5 rounded-full cursor-default font-mono text-[11px] text-[#00C969] bg-[#DDF1E4] dark:text-[#00C969] dark:bg-[#00C969]/10'
          >
            <span className='line-clamp-1 truncate inline-block'>Paid</span>
          </Badge>
        </div>

        <div className='pb-24 md:pb-0'>
          <Card className='shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]'>
            <CardContent className='p-4 sm:p-6 md:p-8'>
              <AnimatePresence mode='wait'>
                {!showPayment ? (
                  <motion.div
                    key='invoice'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='flex justify-between'>
                      <div className='mb-2'>
                        <h2 className='text-[21px] font-medium font-mono mb-1 w-fit min-w-[100px]'>
                          asdasdasdasdsadasd
                        </h2>
                        <div className='flex flex-col gap-0.5'>
                          <div className='flex space-x-1 items-center'>
                            <div className='flex items-center flex-shrink-0 space-x-1'>
                              <span className='truncate font-mono text-[11px] text-[#878787]'>
                                Invoice No:
                              </span>
                              <span className='text-[11px] font-mono flex-shrink-0'>INV-0005</span>
                            </div>
                          </div>
                          <div>
                            <div className='flex space-x-1 items-center'>
                              <div className='flex items-center flex-shrink-0 space-x-1'>
                                <span className='truncate font-mono text-[11px] text-[#878787]'>
                                  Issue Date:
                                </span>
                                <span className='text-[11px] font-mono flex-shrink-0'>
                                  05/24/2025
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className='flex space-x-1 items-center'>
                              <div className='flex items-center flex-shrink-0 space-x-1'>
                                <span className='truncate font-mono text-[11px] text-[#878787]'>
                                  Due Date:
                                </span>
                                <span className='text-[11px] font-mono flex-shrink-0'>
                                  06/24/2025
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <img
                        src='https://api.midday.ai/storage/v1/object/public/avatars/9726f43a-45fa-44a3-a6a6-eeb36887f1d7/invoice/image001.png'
                        alt='mrmapletv'
                        className='h-20 object-contain'
                      />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 mb-4'>
                      <div>
                        <p className='text-[11px] text-[#878787] font-mono mb-2 block'>From</p>
                        <div className='font-mono leading-4'>
                          <p>
                            <span className='text-[11px]'>sdf</span>
                          </p>
                        </div>
                      </div>
                      <div className='mt-4 md:mt-0'>
                        <p className='text-[11px] text-[#878787] font-mono mb-2 block'>To</p>
                        <div className='font-mono leading-4'>
                          <p>
                            <span className='text-[11px]'>mrmapletv</span>
                          </p>
                          <p>
                            <a href='mailto:mrmapletv@gmail.com' className='text-[11px] underline'>
                              mrmapletv@gmail.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='mt-5 font-mono'>
                      <div className='grid grid-cols-[1.5fr_15%_15%_15%] gap-4 items-end relative group mb-2 w-full pb-1 border-b border-border'>
                        <div className='text-[11px] text-[#878787]'>Description</div>
                        <div className='text-[11px] text-[#878787]'>Quantity</div>
                        <div className='text-[11px] text-[#878787]'>Price</div>
                        <div className='text-[11px] text-[#878787] text-right'>Total</div>
                      </div>
                      <div className='grid grid-cols-[1.5fr_15%_15%_15%] gap-4 items-start relative group mb-1 w-full py-1'>
                        <div className='self-start'>
                          <div className='font-mono leading-4'>
                            <p>
                              <span className='text-[11px]'>asdadasd</span>
                            </p>
                          </div>
                        </div>
                        <div className='text-[11px] self-start'>2220</div>
                        <div className='text-[11px] self-start'>CA$1,230</div>
                        <div className='text-[11px] text-right self-start'>CA$2,730,600</div>
                      </div>
                    </div>

                    <div className='mt-10 md:mt-12 flex justify-end mb-6 md:mb-8'>
                      <div className='w-[320px] flex flex-col'>
                        <div className='flex justify-between items-center py-1'>
                          <span className='text-[11px] text-[#878787] font-mono'>Subtotal</span>
                          <span className='text-right font-mono text-[11px] text-[#878787]'>
                            CA$2,730,600
                          </span>
                        </div>
                        <div className='flex justify-between items-center py-1'>
                          <span className='text-[11px] text-[#878787] font-mono'>Discount</span>
                          <span className='text-right font-mono text-[11px] text-[#878787]'>
                            CA$0
                          </span>
                        </div>
                        <div className='flex justify-between items-center py-1'>
                          <span className='text-[11px] text-[#878787] font-mono'>VAT2222 (0%)</span>
                          <span className='text-right font-mono text-[11px] text-[#878787]'>
                            CA$0
                          </span>
                        </div>
                        <div className='flex justify-between items-center py-1'>
                          <span className='text-[11px] text-[#878787] font-mono'>11Tax (0%)</span>
                          <span className='text-right font-mono text-[11px] text-[#878787]'>
                            CA$0
                          </span>
                        </div>
                        <div className='flex justify-between items-center py-4 mt-2 border-t border-border'>
                          <span className='text-[11px] text-[#878787] font-mono'>Total</span>
                          <span className='text-right font-mono text-[21px]'>CA$2,730,600</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key='payment'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='flex flex-col items-center justify-center py-12'
                  >
                    <div className='text-center mb-8'>
                      <h2 className='text-2xl font-mono mb-4'>Payment Details</h2>
                      <p className='text-[11px] text-[#878787] mb-6'>Total Amount Due</p>
                      <div className='text-4xl font-mono mb-8'>CA$2,730,600</div>
                    </div>
                    <div className='w-full max-w-md space-y-4'>
                      <div className='p-4 border rounded-lg'>
                        <p className='text-[11px] text-[#878787] mb-2'>Payment Method</p>
                        <p className='font-mono'>Credit Card</p>
                      </div>
                      <div className='p-4 border rounded-lg'>
                        <p className='text-[11px] text-[#878787] mb-2'>Transaction ID</p>
                        <p className='font-mono'>TRX-123456789</p>
                      </div>
                      <div className='p-4 border rounded-lg'>
                        <p className='text-[11px] text-[#878787] mb-2'>Payment Status</p>
                        <p className='font-mono text-[#00C969]'>Completed</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
