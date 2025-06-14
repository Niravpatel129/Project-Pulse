import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ContactForm } from '../contact/ContactForm';

export default function HourBlockHome() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='h-screen bg-[#000000] text-[#f5f5f7] flex flex-col'>
      {/* Header */}
      <header className='w-full py-5 px-8 flex justify-between items-center border-b border-[#333333]'>
        <div className='text-[17px] font-[500] tracking-[-0.022em]'>HourBlock</div>
        <div className='flex gap-8'>
          <Link href='/terms'>
            <Button
              variant='ghost'
              size='sm'
              className='text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1d1d1f] text-[14px] font-[400] tracking-[-0.01em]'
            >
              Terms
            </Button>
          </Link>
          <Link href='/privacy'>
            <Button
              variant='ghost'
              size='sm'
              className='text-[#86868b] hover:text-[#f5f5f7] hover:bg-[#1d1d1f] text-[14px] font-[400] tracking-[-0.01em]'
            >
              Privacy
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-4'>
        <div className='max-w-[980px] mx-auto text-center'>
          <h1 className='text-[80px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6 leading-[1.05]'>
            Business Management
            <br />
            <span className='text-[#86868b] font-[400]'>Simplified.</span>
          </h1>
          <p className='text-[24px] text-[#86868b] mb-12 max-w-[600px] mx-auto leading-[1.47059] font-[400] tracking-[-0.009em]'>
            Whether you&apos;re a freelancer, agency, or enterprise, we help you manage time better.
            No more missed deadlines, no more scheduling headaches.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  size='lg'
                  className='w-full sm:w-auto bg-[#fff] text-[#000] hover:bg-[#f0f0f0] text-[17px] font-[400] tracking-[-0.022em] px-8 py-6 h-auto'
                >
                  Get Started
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent className='sm:max-w-[540px] bg-[#1d1d1f] border-l border-[#333333]'>
                <SheetHeader>
                  <SheetTitle className='text-[#f5f5f7] text-[28px] font-[600] tracking-[-0.015em]'>
                    Contact Us
                  </SheetTitle>
                  <SheetDescription className='text-[#86868b] text-[17px] font-[400] tracking-[-0.022em]'>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </SheetDescription>
                </SheetHeader>
                <div className='mt-8'>
                  <ContactForm />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </main>
    </div>
  );
}
