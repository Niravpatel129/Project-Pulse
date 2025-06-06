import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProject } from '@/contexts/ProjectContext';
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronDown,
  CreditCardIcon,
  DollarSign,
  Edit,
  FileText,
  Mail,
  Repeat,
  Sparkle,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import UpfrontPaymentDialog from './UpfrontPaymentDialog';

type ProjectState = 'in-progress' | 'invoice-created' | 'partial-payment' | 'completed';

interface ButtonConfig {
  state: ProjectState;
  label: string;
  icon: ReactNode;
  className: string;
  menuItems: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    separatorBefore?: boolean;
  }[];
}

interface ProjectReviewButtonProps {
  openInvoiceWizard?: () => void;
}

export default function ProjectReviewButton({ openInvoiceWizard }: ProjectReviewButtonProps) {
  const { project } = useProject();
  const [projectState, setProjectState] = useState<ProjectState>(project.state as ProjectState);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'upfront' | 'recurring'>(
    'upfront',
  );

  const buttonConfigs: ButtonConfig[] = [
    {
      state: 'in-progress',
      label: 'Review & Invoice',
      icon: <FileText className='h-4 w-4 mr-2 text-gray-500' />,
      className:
        'font-light h-9 text-sm tracking-wide text-gray-700 transition-all text-white focus-visible:ring-0 bg-gray-50 text-gray-700 hover:bg-gray-100 font-normal shadow-none px-1',
      menuItems: [
        {
          label: 'Request Upfront Payment',
          icon: <DollarSign className='h-4 w-4 mr-2 text-blue-500' />,
          onClick: () => {
            setSelectedPaymentType('upfront');
            setIsPaymentDialogOpen(true);
          },
        },
        {
          label: 'Setup Payment Schedule',
          icon: <Repeat className='h-4 w-4 mr-2 text-purple-500' />,
          onClick: () => {
            setSelectedPaymentType('recurring');
            setIsPaymentDialogOpen(true);
          },
        },
        {
          label: 'Complete & Final Invoice',
          icon: <Sparkle className='h-4 w-4 mr-2 text-green-500' />,
          onClick: () => {
            if (openInvoiceWizard) {
              openInvoiceWizard();
            }
          },
          separatorBefore: true,
        },
      ],
    },
    {
      state: 'invoice-created',
      label: 'Awaiting Payment',
      icon: <AlertCircle className='h-4 w-4 mr-2' />,
      className:
        'h-9 text-sm tracking-wide text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all focus-visible:ring-0 shadow-none',
      menuItems: [
        {
          label: 'Edit Project',
          icon: <Edit className='h-4 w-4 mr-2 text-gray-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'Cancel Invoice',
          icon: <Ban className='h-4 w-4 mr-2 text-red-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'Mark as Paid',
          icon: <CheckCircle className='h-4 w-4 mr-2 text-green-500' />,
          onClick: () => {
            return setProjectState('completed');
          },
        },
      ],
    },
    {
      state: 'partial-payment',
      label: 'Payment Plan Active',
      icon: <CreditCardIcon className='h-4 w-4 mr-2' />,
      className:
        'h-9 text-sm tracking-wide text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all',
      menuItems: [
        {
          label: 'Edit Project',
          icon: <Edit className='h-4 w-4 mr-2 text-gray-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'View Payment Schedule',
          icon: <FileText className='h-4 w-4 mr-2 text-blue-500' />,
          onClick: () => {
            return console.log('View Payment Schedule clicked');
          },
        },
        {
          label: 'Complete & Final Invoice',
          icon: <CheckCircle className='h-4 w-4 mr-2 text-green-500' />,
          onClick: () => {
            return console.log('Complete & Final Invoice clicked');
          },
          separatorBefore: true,
        },
      ],
    },
    {
      state: 'completed',
      label: 'Payment Received',
      icon: <CheckCircle className='h-4 w-4 mr-2' />,
      className:
        'h-9 text-sm tracking-wide text-green-600 bg-green-50 hover:bg-green-100 transition-all focus-visible:ring-0',
      menuItems: [
        {
          label: 'Edit Project',
          icon: <Edit className='h-4 w-4 mr-2 text-gray-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'View Invoice',
          icon: <FileText className='h-4 w-4 mr-2 text-amber-500' />,
          onClick: () => {
            return setProjectState('invoice-created');
          },
        },
        {
          label: 'Send Receipt',
          icon: <Mail className='h-4 w-4 mr-2 text-blue-500' />,
          onClick: () => {
            return console.log('Send Receipt clicked');
          },
        },
      ],
    },
  ];

  const currentConfig = buttonConfigs.find((config) => {
    return config.state === projectState;
  });

  if (!currentConfig) return null;

  return (
    <div className=''>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='default' className={currentConfig.className}>
            {currentConfig.icon}
            <span className='font-normal'>{currentConfig.label}</span>
            <ChevronDown className='h-3 w-3 ml-2 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-full min-w-[var(--radix-dropdown-menu-trigger-width)]'
        >
          {currentConfig.menuItems.map((item, index) => {
            return (
              <div key={index}>
                {item.separatorBefore && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={item.onClick}>
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <UpfrontPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        paymentType={selectedPaymentType}
      />
    </div>
  );
}
