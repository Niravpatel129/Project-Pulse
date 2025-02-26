import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectFile } from '@/lib/mock/projectFiles';
import { FilePlus } from 'lucide-react';
import React from 'react';

interface VariationDialogProps {
  selectedFile: ProjectFile | null;
  variationName: string;
  setVariationName: (value: string) => void;
  variationDescription: string;
  setVariationDescription: (value: string) => void;
  handleCreateVariation: () => void;
  onClose: () => void;
}

const VariationDialog: React.FC<VariationDialogProps> = ({
  selectedFile,
  variationName,
  setVariationName,
  variationDescription,
  setVariationDescription,
  handleCreateVariation,
  onClose,
}) => {
  return (
    <DialogContent className='max-w-md'>
      <DialogHeader>
        <DialogTitle>Create New Variation</DialogTitle>
        <DialogDescription>Create a new variation from {selectedFile?.name}</DialogDescription>
      </DialogHeader>

      <div className='space-y-4 py-4'>
        <div className='space-y-2'>
          <Label htmlFor='variation-name'>Variation Name</Label>
          <Input
            id='variation-name'
            placeholder='Client Feedback Version'
            value={variationName}
            onChange={(e) => setVariationName(e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='variation-description'>Description (Optional)</Label>
          <Textarea
            id='variation-description'
            placeholder='Describe the purpose of this variation...'
            value={variationDescription}
            onChange={(e) => setVariationDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreateVariation} disabled={!variationName.trim()}>
          <FilePlus className='mr-2 h-4 w-4' />
          Create Variation
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default VariationDialog;
