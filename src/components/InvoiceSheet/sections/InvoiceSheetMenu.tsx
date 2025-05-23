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
import { useState } from 'react';
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

const InvoiceSheetMenu = () => {
  // State for each menu group
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [invoiceSize, setInvoiceSize] = useState('A4');
  const [salesTax, setSalesTax] = useState('enable');
  const [vat, setVat] = useState('enable');
  const [currency, setCurrency] = useState('USD');
  const [discount, setDiscount] = useState('disable');
  const [attachPdf, setAttachPdf] = useState('disable');
  const [units, setUnits] = useState('disable');
  const [decimals, setDecimals] = useState('no');
  const [qrCode, setQrCode] = useState('enable');

  return (
    <div className='flex justify-end absolute top-4 right-4'>
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
              <DropdownMenuRadioGroup value={dateFormat} onValueChange={setDateFormat}>
                <DropdownMenuRadioItem
                  value='MM/DD/YYYY'
                  onSelect={(e) => {
                    e.preventDefault();
                    setDateFormat('MM/DD/YYYY');
                  }}
                >
                  MM/DD/YYYY
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='DD/MM/YYYY'
                  onSelect={(e) => {
                    e.preventDefault();
                    setDateFormat('DD/MM/YYYY');
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
              <DropdownMenuRadioGroup value={invoiceSize} onValueChange={setInvoiceSize}>
                <DropdownMenuRadioItem
                  value='A4'
                  onSelect={(e) => {
                    e.preventDefault();
                    setInvoiceSize('A4');
                  }}
                >
                  A4
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='Letter'
                  onSelect={(e) => {
                    e.preventDefault();
                    setInvoiceSize('Letter');
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
              <DropdownMenuRadioGroup value={salesTax} onValueChange={setSalesTax}>
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setSalesTax('enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setSalesTax('disable');
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
              <DropdownMenuRadioGroup value={vat} onValueChange={setVat}>
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setVat('enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setVat('disable');
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
              <DropdownMenuRadioGroup value={currency} onValueChange={setCurrency}>
                <DropdownMenuRadioItem
                  value='USD'
                  onSelect={(e) => {
                    e.preventDefault();
                    setCurrency('USD');
                  }}
                >
                  USD
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='EUR'
                  onSelect={(e) => {
                    e.preventDefault();
                    setCurrency('EUR');
                  }}
                >
                  EUR
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='CAD'
                  onSelect={(e) => {
                    e.preventDefault();
                    setCurrency('CAD');
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
              <DropdownMenuRadioGroup value={discount} onValueChange={setDiscount}>
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setDiscount('enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setDiscount('disable');
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={attachPdf} onValueChange={setAttachPdf}>
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setAttachPdf('enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setAttachPdf('disable');
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
              <DropdownMenuRadioGroup value={units} onValueChange={setUnits}>
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setUnits('enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setUnits('disable');
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
              <DropdownMenuRadioGroup value={decimals} onValueChange={setDecimals}>
                <DropdownMenuRadioItem
                  value='yes'
                  onSelect={(e) => {
                    e.preventDefault();
                    setDecimals('yes');
                  }}
                >
                  Yes
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='no'
                  onSelect={(e) => {
                    e.preventDefault();
                    setDecimals('no');
                  }}
                >
                  No
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={qrCode} onValueChange={setQrCode}>
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setQrCode('enable');
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    e.preventDefault();
                    setQrCode('disable');
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
