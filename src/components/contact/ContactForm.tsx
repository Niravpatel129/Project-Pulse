import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters.',
  }),
});

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Here you would typically send the form data to your backend
    console.log(values);
    toast({
      title: 'Success!',
      description: "Your message has been sent. We'll get back to you soon.",
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel className='text-[#86868b] text-[14px] font-[400] tracking-[-0.01em]'>
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='John Doe'
                    {...field}
                    className='bg-[#1d1d1f] border-[#333333] text-[#f5f5f7] placeholder:text-[#86868b] focus:border-[#2997ff] focus:ring-0 text-[17px] font-[400] tracking-[-0.022em] h-12'
                  />
                </FormControl>
                <FormMessage className='text-[#ff453a] text-[14px] font-[400] tracking-[-0.01em]' />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel className='text-[#86868b] text-[14px] font-[400] tracking-[-0.01em]'>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='john@example.com'
                    {...field}
                    className='bg-[#1d1d1f] border-[#333333] text-[#f5f5f7] placeholder:text-[#86868b] focus:border-[#2997ff] focus:ring-0 text-[17px] font-[400] tracking-[-0.022em] h-12'
                  />
                </FormControl>
                <FormMessage className='text-[#ff453a] text-[14px] font-[400] tracking-[-0.01em]' />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name='message'
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel className='text-[#86868b] text-[14px] font-[400] tracking-[-0.01em]'>
                  Message
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us about your project...'
                    className='min-h-[120px] bg-[#1d1d1f] border-[#333333] text-[#f5f5f7] placeholder:text-[#86868b] focus:border-[#2997ff] focus:ring-0 text-[17px] font-[400] tracking-[-0.022em] resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-[#ff453a] text-[14px] font-[400] tracking-[-0.01em]' />
              </FormItem>
            );
          }}
        />
        <Button
          type='submit'
          className='w-full bg-[#2997ff] text-white hover:bg-[#0077ed] text-[17px] font-[400] tracking-[-0.022em] h-12'
        >
          Send Message
        </Button>
      </form>
    </Form>
  );
}
