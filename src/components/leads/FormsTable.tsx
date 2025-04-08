'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Form {
  id: string;
  name: string;
  description: string;
  submissionsCount: number;
  lastSubmissionDate: string;
  autoCreateProject: boolean;
  publicUrl: string;
}

export function FormsTable() {
  const [forms, setForms] = useState<Form[]>([]);

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form Name</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Last Submission</TableHead>
              <TableHead>Auto-create Project</TableHead>
              <TableHead>Public Link</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8'>
                  No forms created yet
                </TableCell>
              </TableRow>
            ) : (
              forms.map((form) => {
                return (
                  <TableRow key={form.id}>
                    <TableCell className='font-medium'>{form.name}</TableCell>
                    <TableCell>{form.submissionsCount}</TableCell>
                    <TableCell>
                      {form.lastSubmissionDate
                        ? new Date(form.lastSubmissionDate).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={form.autoCreateProject}
                        onCheckedChange={(checked) => {
                          // TODO: Update form settings
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-500 truncate max-w-[200px]'>
                          {form.publicUrl}
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            navigator.clipboard.writeText(form.publicUrl);
                          }}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <Button variant='ghost' size='icon'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='icon'>
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='icon'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
