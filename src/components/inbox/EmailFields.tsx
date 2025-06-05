import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface EmailFieldsProps {
  from: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  onToChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  showSubject?: boolean;
}

export function EmailFields({
  from,
  to,
  cc,
  bcc,
  subject,
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  showSubject = true,
}: EmailFieldsProps) {
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSubjectVisible, setIsSubjectVisible] = useState(false);

  const seemLessInput = () => {
    return 'flex-1 text-sm border-none shadow-none active:border-none focus:border-none focus:outline-none focus-visible:outline-none focus-visible:border-none focus-visible:shadow-none focus-visible:ring-0';
  };

  return (
    <div className='px-4 pt-4 pb-2'>
      <div className='flex items-center mb-2'>
        <span className='pr-1 text-gray-500 text-sm'>From:</span>
        <Input className={seemLessInput()} value={from} readOnly />
      </div>
      <div className='flex items-center mb-2'>
        <span className='pr-1 text-gray-500 text-sm'>To:</span>
        <Input
          className={seemLessInput()}
          value={to}
          onChange={(e) => {
            return onToChange(e.target.value);
          }}
          placeholder='Recipient email'
        />

        <Button
          variant='link'
          size='sm'
          className='ml-2 px-1 text-xs'
          style={{
            display: !showCc ? 'block' : 'none',
          }}
          type='button'
          onClick={() => {
            return setShowCc((v) => {
              return !v;
            });
          }}
        >
          Cc
        </Button>
        <Button
          variant='link'
          size='sm'
          className='ml-2 px-1 text-xs'
          style={{
            display: !isSubjectVisible ? 'block' : 'none',
          }}
          type='button'
          onClick={() => {
            setIsSubjectVisible((v) => {
              return !v;
            });
          }}
        >
          Subject
        </Button>
        <Button
          variant='link'
          size='sm'
          className='ml-1 px-1 text-xs'
          style={{
            display: !showBcc ? 'block' : 'none',
          }}
          type='button'
          onClick={() => {
            return setShowBcc((v) => {
              return !v;
            });
          }}
        >
          Bcc
        </Button>
      </div>
      {showCc && (
        <div className='flex items-center mb-2'>
          <span className='pr-1 text-gray-500 text-sm'>Cc:</span>
          <Input
            className={seemLessInput()}
            value={cc}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && cc === '') {
                setShowCc(false);
              }
            }}
            onChange={(e) => {
              return onCcChange(e.target.value);
            }}
            placeholder='Cc email(s)'
          />
        </div>
      )}
      {showBcc && (
        <div className='flex items-center mb-2'>
          <span className='pr-1 text-gray-500 text-sm'>Bcc:</span>
          <Input
            className={seemLessInput()}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && bcc === '') {
                setShowBcc(false);
              }
            }}
            value={bcc}
            onChange={(e) => {
              return onBccChange(e.target.value);
            }}
            placeholder='Bcc email(s)'
          />
        </div>
      )}
      {isSubjectVisible && (
        <div className='flex items-center mb-2'>
          <span className='pr-1 text-gray-500 text-sm'>Subject:</span>
          <Input
            className={seemLessInput()}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && subject === '') {
                setIsSubjectVisible(false);
              }
            }}
            value={subject}
            onChange={(e) => {
              onSubjectChange(e.target.value);
            }}
            placeholder='Subject'
          />
        </div>
      )}
    </div>
  );
}
