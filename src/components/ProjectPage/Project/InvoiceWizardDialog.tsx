import { Client } from '@/hooks/useInvoiceWizard';
import { InvoiceWizardDialog } from './InvoiceWizard';

interface OriginalInvoiceWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clients?: Client[];
}

/**
 * This is a wrapper component to maintain backward compatibility
 * while using the newly modularized invoice wizard components
 */
const OriginalInvoiceWizardDialog = ({
  open,
  onOpenChange,
  projectId,
  clients = [],
}: OriginalInvoiceWizardDialogProps) => {
  return (
    <InvoiceWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      clients={clients}
    />
  );
};

export default OriginalInvoiceWizardDialog;
