import {
  Attachment,
  Comment,
  FileType,
  Product,
  ProjectFile,
  mockProducts,
  mockProjectFiles,
} from '@/lib/mock/projectFiles';
import { File, FileText, FolderPlus, Image, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { useVersionHistory } from './useVersionHistory';

export function useProjectFiles() {
  // All state declarations
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<FileType>('upload');
  const [showFileDetailsDialog, setShowFileDetailsDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [requestApproval, setRequestApproval] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Variation related states (renamed from branch)
  const [showVariationDialog, setShowVariationDialog] = useState(false);
  const [variationName, setVariationName] = useState('');
  const [variationDescription, setVariationDescription] = useState('');

  // Use the mock data from the imported file
  const [files, setFiles] = useState<ProjectFile[]>(mockProjectFiles);
  const [products, setProducts] = useState<Product[]>(mockProducts);

  // Use version history hook
  const versionHistory = useVersionHistory({
    selectedFile,
    setSelectedFile,
    files,
    setFiles,
    setShowSendEmailDialog,
    setEmailSubject,
    setEmailMessage,
  });

  // Helper functions
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'proposal':
        return <File className='h-5 w-5 text-blue-500' />;
      case 'invoice':
        return <File className='h-5 w-5 text-green-500' />;
      case 'contract':
        return <File className='h-5 w-5 text-purple-500' />;
      case 'questionnaire':
        return <File className='h-5 w-5 text-orange-500' />;
      case 'sales_product':
        return <Image className='h-5 w-5 text-pink-500' />;
      case 'service':
        return <File className='h-5 w-5 text-indigo-500' />;
      case 'file_item':
        return <FolderPlus className='h-5 w-5 text-teal-500' />;
      default:
        return <FileText className='h-5 w-5 text-gray-500' />;
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className='h-5 w-5 text-red-500' />;
      case 'docx':
      case 'doc':
        return <FileText className='h-5 w-5 text-blue-500' />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className='h-5 w-5 text-green-500' />;
      default:
        return <Paperclip className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-600';

    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'sent':
        return 'bg-blue-100 text-blue-600';
      case 'signed':
        return 'bg-green-100 text-green-600';
      case 'paid':
        return 'bg-emerald-100 text-emerald-600';
      case 'viewed':
        return 'bg-amber-100 text-amber-600';
      case 'awaiting_approval':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Logic functions
  const handleAddFile = () => {
    // Generate a simple ID (would use a proper UUID in production)
    const newId = (Math.max(...files.map((f) => parseInt(f.id))) + 1).toString();

    // Get the name from the input - if not provided, use a generic name
    const itemName = document.getElementById('item-name') as HTMLInputElement;
    const itemDescription = document.getElementById('description') as HTMLTextAreaElement;

    const newAttachments: Attachment[] = uploadedFiles.map((file, index) => ({
      id: `a-${newId}-${index}`,
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.name.split('.').pop() || 'unknown',
      url: '#', // Would be a real URL in production
    }));

    const newFile: ProjectFile = {
      id: newId,
      name: itemName?.value || 'New File Item',
      type: 'file_item', // Generic type for all file items
      dateUploaded: new Date().toISOString().split('T')[0],
      size:
        uploadedFiles.length > 0
          ? `${Math.round(uploadedFiles.reduce((total, file) => total + file.size, 0) / 1024)} KB`
          : '0.1 MB',
      status: 'active',
      uploadedBy: 'Current User',
      attachments: newAttachments,
      comments: [],
      description: itemDescription?.value || '',
    };

    setFiles([...files, newFile]);
    setShowUploadDialog(false);
    setUploadedFiles([]);
  };

  const filteredFiles = () => {
    let filtered = files;

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchLower) ||
          file.type.toLowerCase().includes(searchLower) ||
          file.uploadedBy.toLowerCase().includes(searchLower),
      );
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((file) => file.type === activeTab);
    }

    return filtered;
  };

  const handleFileClick = (file: ProjectFile) => {
    setSelectedFile(file);
    setShowFileDetailsDialog(true);
  };

  const handleAddComment = () => {
    if (!selectedFile || !commentText.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      text: commentText,
      author: 'Hitarth', // Would be current user in production
      authorRole: 'Photographer',
      timestamp: new Date().toISOString(),
    };

    const updatedFile = {
      ...selectedFile,
      comments: [...selectedFile.comments, newComment],
    };

    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
    setCommentText('');
  };

  const handleSendEmail = () => {
    if (!selectedFile) return;

    // In a real app, this would send an API request to send the email
    const updatedFile = {
      ...selectedFile,
      status: requestApproval ? 'awaiting_approval' : ('sent' as const),
      emailSent: true,
      emailSentDate: new Date().toISOString().split('T')[0],
      needsApproval: requestApproval,
    };
    setFiles(
      files.map((file) => (file.id === selectedFile.id ? (updatedFile as ProjectFile) : file)),
    );
    setSelectedFile(updatedFile as ProjectFile);
    setShowSendEmailDialog(false);
    setEmailSubject('');
    setEmailMessage('');
    setRequestApproval(false);
  };

  const handleSimulateApproval = () => {
    if (!selectedFile) return;

    // Simulate client approving the file
    const updatedFile = {
      ...selectedFile,
      status: 'signed' as const,
      needsApproval: false,
    };

    const newComment: Comment = {
      id: `c${Date.now()}`,
      text: "I've approved these files.",
      author: 'Shannon',
      authorRole: 'Client',
      timestamp: new Date().toISOString(),
    };

    updatedFile.comments = [...updatedFile.comments, newComment];

    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleAddAttachmentToFileItem = (fileItemId: string) => {
    if (uploadedFiles.length === 0) return;

    // Find the file item to add attachments to
    const fileItemToUpdate = files.find((f) => f.id === fileItemId);
    if (!fileItemToUpdate) return;

    // Create new attachments from the uploaded files
    const newAttachments: Attachment[] = uploadedFiles.map((file, index) => ({
      id: `a-${fileItemId}-${Date.now()}-${index}`,
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.name.split('.').pop() || 'unknown',
      url: '#', // Would be a real URL in production
    }));

    // Update the file item with new attachments
    const updatedFileItem = {
      ...fileItemToUpdate,
      attachments: [...fileItemToUpdate.attachments, ...newAttachments],
      size: `${Math.round(
        parseInt(fileItemToUpdate.size) +
          uploadedFiles.reduce((total, file) => total + file.size, 0) / 1024,
      )} KB`,
    };

    // Update files array
    setFiles(files.map((f) => (f.id === fileItemId ? updatedFileItem : f)));

    // If this is the currently selected file, update it
    if (selectedFile && selectedFile.id === fileItemId) {
      setSelectedFile(updatedFileItem);
    }

    // Clear uploaded files
    setUploadedFiles([]);
  };

  const handleAddProductToFileItem = (
    fileItemId: string,
    productData: {
      id?: string;
      name?: string;
      price?: string;
      description?: string;
      isNew: boolean;
    },
  ) => {
    // Find the file item to add product to
    const fileItemToUpdate = files.find((f) => f.id === fileItemId);
    if (!fileItemToUpdate) return;

    let productToAdd: Product;

    if (productData.isNew && productData.name && productData.price) {
      // Create new product
      const newProductId = `p${Date.now()}`;
      productToAdd = {
        id: newProductId,
        name: productData.name,
        price: productData.price,
        description: productData.description || '',
        sku: `PROD-${newProductId.substring(0, 5)}`,
      };

      // Add to products list
      setProducts([...products, productToAdd]);
    } else if (!productData.isNew && productData.id) {
      // Use existing product
      const existingProduct = products.find((p) => p.id === productData.id);
      if (!existingProduct) return;
      productToAdd = existingProduct;
    } else {
      return; // Invalid data
    }

    // Update the file item with the product
    const updatedFileItem = {
      ...fileItemToUpdate,
      products: fileItemToUpdate.products
        ? [...fileItemToUpdate.products, productToAdd]
        : [productToAdd],
    };

    // Update files array
    setFiles(files.map((f) => (f.id === fileItemId ? updatedFileItem : f)));

    // If this is the currently selected file, update it
    if (selectedFile && selectedFile.id === fileItemId) {
      setSelectedFile(updatedFileItem);
    }
  };

  const handleCreateVariation = () => {
    if (!selectedFile || !variationName.trim()) return;

    // Create a new variation by copying the file with a new name
    const newId = (Math.max(...files.map((f) => parseInt(f.id))) + 1).toString();

    const newFile: ProjectFile = {
      ...selectedFile,
      id: newId,
      name: `${selectedFile.name} (${variationName})`,
      variation: variationName,
      description: variationDescription || `Variation of ${selectedFile.name}`,
      comments: [], // Start with no comments on the new variation
    };

    setFiles([...files, newFile]);
    setShowVariationDialog(false);
    setVariationName('');
    setVariationDescription('');
  };

  return {
    // States
    activeTab,
    setActiveTab,
    search,
    setSearch,
    showUploadDialog,
    setShowUploadDialog,
    selectedFileType,
    setSelectedFileType,
    showFileDetailsDialog,
    setShowFileDetailsDialog,
    selectedFile,
    setSelectedFile,
    commentText,
    setCommentText,
    showSendEmailDialog,
    setShowSendEmailDialog,
    emailSubject,
    setEmailSubject,
    emailMessage,
    setEmailMessage,
    requestApproval,
    setRequestApproval,
    uploadedFiles,
    setUploadedFiles,
    showVariationDialog,
    setShowVariationDialog,
    variationName,
    setVariationName,
    variationDescription,
    setVariationDescription,
    files,
    setFiles,
    products,

    // Helper functions
    getFileIcon,
    getAttachmentIcon,
    getStatusBadgeClass,

    // Logic functions
    handleAddFile,
    filteredFiles,
    handleFileClick,
    handleAddComment,
    handleSendEmail,
    handleSimulateApproval,
    handleFileUpload,
    handleAddAttachmentToFileItem,
    handleAddProductToFileItem,
    handleCreateVariation,

    // Version history (from hook)
    ...versionHistory,
  };
}
