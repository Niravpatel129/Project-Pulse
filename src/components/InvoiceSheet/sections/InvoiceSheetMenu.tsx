import {
  Calculator,
  Calendar,
  DollarSign,
  Hash,
  Landmark,
  Maximize2,
  MoreVertical,
  Ruler,
  Ticket,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface InvoiceSettings {
  dateFormat: string;
  invoiceSize: string;
  salesTax: string;
  vat: string;
  currency: string;
  discount: string;
  attachPdf: string;
  units: string;
  decimals: 'yes' | 'no';
  qrCode: string;
}

interface InvoiceSheetMenuProps {
  settings: InvoiceSettings;
  onSettingsChange: (settings: InvoiceSettings) => void;
}

const InvoiceSheetMenu = ({ settings, onSettingsChange }: InvoiceSheetMenuProps) => {
  const handleSettingChange = (key: keyof InvoiceSettings, value: string) => {
    if (key === 'decimals') {
      onSettingsChange({
        ...settings,
        [key]: value as 'yes' | 'no',
      });
    } else {
      onSettingsChange({
        ...settings,
        [key]: value,
      });
    }
  };

  return (
    <div className='flex justify-end'>
      <DropdownMenu modal>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' sideOffset={5} className='z-[100] min-w-[240px]'>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className='mr-2 h-4 w-4' />
              Date format
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.dateFormat}
                onValueChange={(value) => {
                  return handleSettingChange('dateFormat', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='MM/DD/YYYY'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('dateFormat', 'MM/DD/YYYY');
                  }}
                >
                  MM/DD/YYYY
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='DD/MM/YYYY'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('dateFormat', 'DD/MM/YYYY');
                  }}
                >
                  DD/MM/YYYY
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Maximize2 className='mr-2 h-4 w-4' />
              Invoice size
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.invoiceSize}
                onValueChange={(value) => {
                  return handleSettingChange('invoiceSize', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='A4'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('invoiceSize', 'A4');
                  }}
                >
                  A4
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='Letter'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('invoiceSize', 'Letter');
                  }}
                >
                  Letter
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Landmark className='mr-2 h-4 w-4' />
              Add sales tax
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.salesTax}
                onValueChange={(value) => {
                  return handleSettingChange('salesTax', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('salesTax', 'enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('salesTax', 'disable');
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calculator className='mr-2 h-4 w-4' />
              Add VAT
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.vat}
                onValueChange={(value) => {
                  return handleSettingChange('vat', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('vat', 'enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('vat', 'disable');
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <DollarSign className='mr-2 h-4 w-4' />
              Currency
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.currency}
                onValueChange={(value) => {
                  return handleSettingChange('currency', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='USD'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('currency', 'USD');
                  }}
                >
                  USD
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='EUR'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('currency', 'EUR');
                  }}
                >
                  EUR
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='CAD'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('currency', 'CAD');
                  }}
                >
                  CAD
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Ticket className='mr-2 h-4 w-4' />
              Add discount
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.discount}
                onValueChange={(value) => {
                  return handleSettingChange('discount', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('discount', 'enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('discount', 'disable');
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.attachPdf}
                onValueChange={(value) => {
                  return handleSettingChange('attachPdf', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('attachPdf', 'enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('attachPdf', 'disable');
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Ruler className='mr-2 h-4 w-4' />
              Add units
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.units}
                onValueChange={(value) => {
                  return handleSettingChange('units', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('units', 'enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('units', 'disable');
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Hash className='mr-2 h-4 w-4' />
              Decimals
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.decimals}
                onValueChange={(value) => {
                  return handleSettingChange('decimals', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='yes'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('decimals', 'yes');
                  }}
                >
                  Yes
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='no'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('decimals', 'no');
                  }}
                >
                  No
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.qrCode}
                onValueChange={(value) => {
                  return handleSettingChange('qrCode', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('qrCode', 'enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSettingChange('qrCode', 'disable');
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default InvoiceSheetMenu;
