import { Textarea } from '@/components/ui/textarea';
import { useRef, useState } from 'react';

interface InvoiceNotesProps {
  notes?: string;
  teamNotes?: string;
  onNotesChange: (notes: string) => void;
  onTeamNotesChange: (teamNotes: string) => void;
}

const InvoiceNotes = ({
  notes = '',
  teamNotes = '',
  onNotesChange,
  onTeamNotesChange,
}: InvoiceNotesProps) => {
  const [isNotesFocused, setIsNotesFocused] = useState(false);
  const [isTeamNotesFocused, setIsTeamNotesFocused] = useState(false);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const teamNotesTextareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className='mt-8'>
      <div className='flex-1'>
        <div className='mb-2'>
          <span className='text-[11px] text-[#878787] font-mono'>Notes/Memo</span>
        </div>
        <div className='relative'>
          <Textarea
            ref={notesTextareaRef}
            className={`!text-[11px] min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden ${
              !isNotesFocused && !notes
                ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] p-0'
                : 'p-0 h-auto'
            }`}
            value={notes}
            name='notes'
            onFocus={() => {
              return setIsNotesFocused(true);
            }}
            onBlur={() => {
              return setIsNotesFocused(false);
            }}
            onChange={(e) => {
              return onNotesChange(e.target.value);
            }}
          />
        </div>
      </div>

      <div className='flex-1 mt-6'>
        <div className='mb-2'>
          <span className='text-[11px] text-[#878787] font-mono'>Team Notes (Private)</span>
        </div>
        <div className='relative'>
          <Textarea
            ref={teamNotesTextareaRef}
            className={`!text-[11px] min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden ${
              !isTeamNotesFocused && !teamNotes
                ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] p-0'
                : 'p-0 h-auto'
            }`}
            value={teamNotes}
            name='team_notes'
            onFocus={() => {
              return setIsTeamNotesFocused(true);
            }}
            onBlur={() => {
              return setIsTeamNotesFocused(false);
            }}
            onChange={(e) => {
              return onTeamNotesChange(e.target.value);
            }}
          />
        </div>
        <p className='text-xs text-muted-foreground mt-1'>
          These notes are only visible to your team and will not be included in the invoice.
        </p>
      </div>
    </div>
  );
};

export default InvoiceNotes;
