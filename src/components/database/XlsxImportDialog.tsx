import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookText,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Hash,
  Layers,
  Maximize2,
  Minimize2,
  ScanEye,
  Sigma,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface XlsxImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { columns: string[]; rows: any[] }) => void;
}

// Color palette for data values
const COLOR_PALETTE = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
];

type DataType = 'text' | 'number' | 'date' | 'boolean' | 'empty' | 'mixed' | 'unknown';

interface ColumnAnalysis {
  type: DataType;
  uniqueValues: number;
  completeness: number; // Percentage of non-empty values
  valueColorMap: Record<string, number>; // Maps values to color indexes
}

export function XlsxImportDialog({ isOpen, onClose, onImport }: XlsxImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [previewData, setPreviewData] = useState<{
    columns: string[];
    rows: any[];
    totalRows: number;
  } | null>(null);
  const [columnAnalysis, setColumnAnalysis] = useState<ColumnAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Number of rows to display in preview
  const MAX_PREVIEW_ROWS = 50;

  // Detect value data type
  const detectDataType = useCallback((value: any): DataType => {
    if (value === null || value === undefined || value === '') return 'empty';

    // Check if it's a boolean
    if (typeof value === 'boolean' || value === 'true' || value === 'false') return 'boolean';

    // Check if it's a number
    if (!isNaN(Number(value)) && typeof value !== 'boolean') return 'number';

    // Check if it's a date (simple check for common formats)
    const dateRegex = /^(\d{1,4}[-/]\d{1,2}[-/]\d{1,4})|(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})$/;
    if (typeof value === 'string' && dateRegex.test(value)) return 'date';

    // If it's a string that doesn't match other types
    if (typeof value === 'string') return 'text';

    return 'unknown';
  }, []);

  // Analyze column data types and unique values
  const analyzeColumns = useCallback(
    (columns: string[], rows: any[]): ColumnAnalysis[] => {
      return columns.map((_, colIndex) => {
        const values = rows.map((row) => {
          return row[colIndex];
        });
        const nonEmptyValues = values.filter((v) => {
          return v !== null && v !== undefined && v !== '';
        });
        const uniqueValues = new Set(
          values.map((v) => {
            return String(v);
          }),
        ).size;

        // Detect data type for each value in the column
        const types = values.map(detectDataType);
        const typeCounts: Record<DataType, number> = {
          text: 0,
          number: 0,
          date: 0,
          boolean: 0,
          empty: 0,
          mixed: 0,
          unknown: 0,
        };

        types.forEach((type) => {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Determine dominant type
        let dominantType: DataType = 'mixed';
        let maxCount = 0;

        Object.entries(typeCounts).forEach(([type, count]) => {
          if (count > maxCount && type !== 'empty') {
            maxCount = count;
            dominantType = type as DataType;
          }
        });

        // If most values are empty, use the type of non-empty values
        if (dominantType === 'mixed' && typeCounts.empty > 0) {
          const nonEmptyTypes = Object.entries(typeCounts)
            .filter(([type, _]) => {
              return type !== 'empty';
            })
            .sort(([_, countA], [__, countB]) => {
              return countB - countA;
            });

          if (nonEmptyTypes.length > 0) {
            dominantType = nonEmptyTypes[0][0] as DataType;
          }
        }

        // Create value to color mapping for consistent coloring
        const valueColorMap: Record<string, number> = {};
        const uniqueValuesList = [
          ...new Set(
            values.map((v) => {
              return String(v);
            }),
          ),
        ];
        uniqueValuesList.forEach((val, index) => {
          if (val !== '' && val !== 'null' && val !== 'undefined') {
            valueColorMap[val] = index % COLOR_PALETTE.length;
          }
        });

        return {
          type: dominantType,
          uniqueValues,
          completeness: (nonEmptyValues.length / values.length) * 100,
          valueColorMap,
        };
      });
    },
    [detectDataType],
  );

  // Process workbook to extract sheet data
  const processSheet = useCallback(
    (wb: XLSX.WorkBook, sheetName: string) => {
      try {
        const worksheet = wb.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          toast.error(`Sheet "${sheetName}" must contain at least a header row and one data row`);
          return null;
        }

        // First row is the header
        const columns = jsonData[0] as string[];
        // Rest are data rows
        const rows = jsonData.slice(1);
        const totalRows = rows.length;

        // Analyze columns for data types and unique values
        const analysis = analyzeColumns(columns, rows);
        setColumnAnalysis(analysis);

        return {
          columns,
          rows: rows.slice(0, MAX_PREVIEW_ROWS),
          totalRows,
        };
      } catch (error) {
        console.error(`Error processing sheet "${sheetName}":`, error);
        toast.error(`Failed to process sheet "${sheetName}"`);
        return null;
      }
    },
    [analyzeColumns],
  );

  // Get icon for data type
  const getTypeIcon = (type: DataType) => {
    switch (type) {
      case 'text':
        return <BookText className='h-3 w-3' />;
      case 'number':
        return <Hash className='h-3 w-3' />;
      case 'date':
        return <Calendar className='h-3 w-3' />;
      case 'boolean':
        return <CheckCircle2 className='h-3 w-3' />;
      case 'mixed':
        return <Layers className='h-3 w-3' />;
      default:
        return <ScanEye className='h-3 w-3' />;
    }
  };

  // Get the appropriate color for a specific value
  const getValueColor = (value: any, colIndex: number) => {
    if (value === null || value === undefined || value === '') return {};

    const stringValue = String(value);
    const colorIndex = columnAnalysis[colIndex]?.valueColorMap[stringValue] ?? -1;

    if (colorIndex === -1) return {};
    return {
      bg: COLOR_PALETTE[colorIndex].bg,
      text: COLOR_PALETTE[colorIndex].text,
      border: COLOR_PALETTE[colorIndex].border,
    };
  };

  // Update preview when selected sheet changes
  useEffect(() => {
    if (workbook && selectedSheet) {
      const data = processSheet(workbook, selectedSheet);
      if (data) {
        setPreviewData(data);
      }
    }
  }, [workbook, selectedSheet, processSheet]);

  // Stats about the data
  const dataStats = useMemo(() => {
    if (!previewData || !columnAnalysis.length) return null;

    const numberColumns = columnAnalysis.filter((col) => {
      return col.type === 'number';
    }).length;
    const dateColumns = columnAnalysis.filter((col) => {
      return col.type === 'date';
    }).length;
    const textColumns = columnAnalysis.filter((col) => {
      return col.type === 'text';
    }).length;
    const booleanColumns = columnAnalysis.filter((col) => {
      return col.type === 'boolean';
    }).length;
    const mixedColumns = columnAnalysis.filter((col) => {
      return col.type === 'mixed';
    }).length;

    return {
      numberColumns,
      dateColumns,
      textColumns,
      booleanColumns,
      mixedColumns,
      totalColumns: previewData.columns.length,
    };
  }, [previewData, columnAnalysis]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFile = e.target.files[0];

    // Check if it's an Excel file
    if (
      !selectedFile.name.endsWith('.xlsx') &&
      !selectedFile.name.endsWith('.xls') &&
      !selectedFile.name.endsWith('.csv')
    ) {
      toast.error('Please select a valid Excel file (.xlsx, .xls, or .csv)');
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        if (!evt.target?.result) {
          toast.error('Failed to read file');
          setIsLoading(false);
          return;
        }

        const data = evt.target.result;
        const wb = XLSX.read(data, { type: 'array' });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          toast.error('No sheets found in the workbook');
          setIsLoading(false);
          return;
        }

        setWorkbook(wb);
        setAvailableSheets(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  }, []);

  const handleImport = () => {
    if (!workbook || !selectedSheet || !previewData) return;

    try {
      const worksheet = workbook.Sheets[selectedSheet];
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // First row is the header
      const columns = jsonData[0] as string[];
      // Rest are data rows
      const rows = jsonData.slice(1);

      onImport({
        columns,
        rows,
      });

      // Reset state
      setFile(null);
      setWorkbook(null);
      setAvailableSheets([]);
      setSelectedSheet('');
      setPreviewData(null);
      setColumnAnalysis([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error during import:', error);
      toast.error('Failed to import data');
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];

        // Create a synthetic event to reuse handleFileChange
        const syntheticEvent = {
          target: {
            files: e.dataTransfer.files,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        handleFileChange(syntheticEvent);
      }
    },
    [handleFileChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const resetSelection = () => {
    setFile(null);
    setWorkbook(null);
    setAvailableSheets([]);
    setSelectedSheet('');
    setPreviewData(null);
    setColumnAnalysis([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSheetChange = (value: string) => {
    setSelectedSheet(value);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Calculate the height for the scrollable area
  const getTableHeight = () => {
    if (isFullScreen) {
      // For full screen, make the table take available space without overflowing the footer
      return '100%';
    }
    return '400px'; // Normal mode
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isFullScreen
            ? 'w-[98vw] h-[98vh] max-w-[98vw] max-h-[98vh]'
            : 'sm:max-w-[900px] max-h-[90vh]'
        } p-0 flex flex-col overflow-hidden`}
      >
        {/* Header section - fixed at top */}
        <div className='p-6 border-b shrink-0'>
          <div className='flex flex-row items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Import Table from Excel</h2>
              <p className='text-sm text-gray-500'>
                Upload an Excel file (.xlsx, .xls) or CSV file to create a new table.
              </p>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleFullScreen}
              className='h-8 w-8 rounded-full'
            >
              {isFullScreen ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
            </Button>
          </div>
        </div>

        {/* Main content area - scrollable */}
        <div className='flex-grow overflow-auto p-6'>
          {!file ? (
            <div
              className='border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center'
              style={{ minHeight: isFullScreen ? '400px' : '300px' }}
              onClick={() => {
                return fileInputRef.current?.click();
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <FileSpreadsheet className='mx-auto h-12 w-12 text-gray-400' />
              <p className='mt-2 text-sm text-gray-600'>
                Drop your Excel file here, or{' '}
                <span className='text-blue-600 font-medium'>click to browse</span>
              </p>
              <p className='mt-1 text-xs text-gray-500'>Supports .xlsx, .xls, and .csv files</p>
              <Input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls,.csv'
                className='hidden'
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className='space-y-4 h-full flex flex-col'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <FileSpreadsheet className='h-6 w-6 text-blue-600' />
                  <span className='font-medium'>{file.name}</span>
                  <span className='text-sm text-gray-500'>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={resetSelection}
                  className='text-gray-500'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='flex flex-wrap gap-2'>
                {/* Sheet selector */}
                {availableSheets.length > 0 && (
                  <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-md'>
                    <span className='text-sm font-medium text-gray-700'>Sheet:</span>
                    <Select value={selectedSheet} onValueChange={handleSheetChange}>
                      <SelectTrigger className='w-[220px] h-8 bg-white'>
                        <SelectValue placeholder='Select a sheet' />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSheets.map((sheet) => {
                          return (
                            <SelectItem key={sheet} value={sheet}>
                              {sheet}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Badge variant='outline' className='ml-2 bg-white'>
                      {availableSheets.length} {availableSheets.length === 1 ? 'sheet' : 'sheets'}
                    </Badge>
                  </div>
                )}

                {/* Data statistics */}
                {dataStats && (
                  <div className='flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md'>
                    <Badge variant='outline' className='bg-white flex items-center gap-1'>
                      <Sigma className='h-3 w-3' />
                      <span>{dataStats.totalColumns} columns</span>
                    </Badge>
                    {dataStats.textColumns > 0 && (
                      <Badge
                        variant='outline'
                        className='bg-white flex items-center gap-1 text-blue-700 border-blue-200'
                      >
                        <BookText className='h-3 w-3' />
                        <span>{dataStats.textColumns} text</span>
                      </Badge>
                    )}
                    {dataStats.numberColumns > 0 && (
                      <Badge
                        variant='outline'
                        className='bg-white flex items-center gap-1 text-green-700 border-green-200'
                      >
                        <Hash className='h-3 w-3' />
                        <span>{dataStats.numberColumns} numeric</span>
                      </Badge>
                    )}
                    {dataStats.dateColumns > 0 && (
                      <Badge
                        variant='outline'
                        className='bg-white flex items-center gap-1 text-amber-700 border-amber-200'
                      >
                        <Calendar className='h-3 w-3' />
                        <span>{dataStats.dateColumns} date</span>
                      </Badge>
                    )}
                    {dataStats.booleanColumns > 0 && (
                      <Badge
                        variant='outline'
                        className='bg-white flex items-center gap-1 text-purple-700 border-purple-200'
                      >
                        <CheckCircle2 className='h-3 w-3' />
                        <span>{dataStats.booleanColumns} boolean</span>
                      </Badge>
                    )}
                    {dataStats.mixedColumns > 0 && (
                      <Badge
                        variant='outline'
                        className='bg-white flex items-center gap-1 text-gray-700'
                      >
                        <Layers className='h-3 w-3' />
                        <span>{dataStats.mixedColumns} mixed</span>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className='py-8 text-center flex-grow flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                  <p className='mt-2 text-sm text-gray-600'>Parsing file...</p>
                </div>
              ) : (
                previewData && (
                  <div className='border rounded-md flex-grow overflow-hidden'>
                    <Table className='min-w-full'>
                      <TableCaption>
                        {previewData.rows.length < previewData.totalRows
                          ? `Showing ${previewData.rows.length} of ${previewData.totalRows} rows from "${selectedSheet}"`
                          : `${previewData.totalRows} rows total from "${selectedSheet}"`}
                      </TableCaption>
                      <TableHeader className='sticky top-0 bg-white z-10'>
                        <TableRow>
                          <TableHead className='text-xs font-medium text-gray-500 w-10 p-2'>
                            #
                          </TableHead>
                          {previewData.columns.map((column, index) => {
                            const analysis = columnAnalysis[index];
                            return (
                              <TableHead
                                key={index}
                                className='text-xs font-medium whitespace-nowrap'
                              >
                                <div className='flex flex-col'>
                                  <div className='flex items-center gap-1'>
                                    {analysis && getTypeIcon(analysis.type)}
                                    <span>{column || `Column ${index + 1}`}</span>
                                  </div>
                                  {analysis && (
                                    <div className='text-[10px] text-gray-500 flex gap-1 items-center mt-0.5'>
                                      <span>{analysis.uniqueValues} unique</span>
                                      <span>•</span>
                                      <span>{Math.round(analysis.completeness)}% filled</span>
                                    </div>
                                  )}
                                </div>
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody className='overflow-auto'>
                        {previewData.rows.map((row, rowIndex) => {
                          return (
                            <TableRow key={rowIndex}>
                              <TableCell className='text-xs text-gray-500 w-10 p-2'>
                                {rowIndex + 1}
                              </TableCell>
                              {previewData.columns.map((_, colIndex) => {
                                const value = row[colIndex];
                                const color = getValueColor(value, colIndex);
                                const cellContent = value !== undefined ? String(value) : '';

                                return (
                                  <TableCell key={colIndex} className='whitespace-nowrap'>
                                    {cellContent && Object.keys(color).length > 0 ? (
                                      <Badge
                                        className={`${color.bg} ${color.text} border ${color.border} font-normal`}
                                      >
                                        {cellContent}
                                      </Badge>
                                    ) : (
                                      cellContent || <span className='text-gray-300'>—</span>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer section - fixed at bottom */}
        <div className='border-t p-6 bg-gray-50 shrink-0'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-500'>
              {previewData &&
                `Found ${previewData.columns.length} columns and ${previewData.totalRows} rows in "${selectedSheet}"`}
            </div>
            <div className='space-x-2'>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!previewData || isLoading}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Upload className='mr-2 h-4 w-4' />
                Import Data
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
