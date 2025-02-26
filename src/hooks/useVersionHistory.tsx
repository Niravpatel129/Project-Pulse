import { Attachment, Comment, FileVersion, ProjectFile } from '@/lib/mock/projectFiles';
import { useState } from 'react';

interface UseVersionHistoryProps {
  selectedFile: ProjectFile | null;
  setSelectedFile: (file: ProjectFile | null) => void;
  files: ProjectFile[];
  setFiles: (files: ProjectFile[]) => void;
  setShowSendEmailDialog: (show: boolean) => void;
  setEmailSubject: (subject: string) => void;
  setEmailMessage: (message: string) => void;
}

export function useVersionHistory({
  selectedFile,
  setSelectedFile,
  files,
  setFiles,
  setShowSendEmailDialog,
  setEmailSubject,
  setEmailMessage,
}: UseVersionHistoryProps) {
  // Version history related states
  const [showVersionHistoryDialog, setShowVersionHistoryDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [showVersionCompareDialog, setShowVersionCompareDialog] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    older: FileVersion | null;
    newer: FileVersion | null;
  }>({ older: null, newer: null });
  const [notifyClient, setNotifyClient] = useState(false);

  // Version history handlers
  const handleOpenVersionHistory = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setShowVersionHistoryDialog(true);
  };

  const handleCreateNewVersion = () => {
    if (!selectedFile || !selectedAttachment || !changeDescription.trim()) return;

    // Create a new version object
    const currentVersions = selectedAttachment.versions || [];
    const newVersionNumber =
      currentVersions.length > 0 ? Math.max(...currentVersions.map((v) => v.versionNumber)) + 1 : 1;

    // Create a simple version ID
    const versionId = `v${newVersionNumber}`;

    const newVersion: FileVersion = {
      id: `v${Date.now()}`,
      versionNumber: newVersionNumber,
      versionId,
      dateCreated: new Date().toISOString(),
      createdBy: 'Hitarth', // Would be current user in production
      changeDescription: changeDescription.trim(),
      size: selectedAttachment.size,
      url: '#', // Would be a real URL in production
      isCurrent: true,
    };

    // Set all other versions to not current
    const updatedVersions = currentVersions.map((v) => ({
      ...v,
      isCurrent: false,
    }));

    // Add new version
    updatedVersions.push(newVersion);

    // Update the attachment with new versions
    const updatedAttachment = {
      ...selectedAttachment,
      versions: updatedVersions,
    };

    // Update the file with the new attachment
    const updatedAttachments = selectedFile.attachments.map((att) =>
      att.id === selectedAttachment.id ? updatedAttachment : att,
    );

    const updatedFile = {
      ...selectedFile,
      attachments: updatedAttachments,
      latestVersion: versionId,
    };

    // Update files state
    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
    setSelectedAttachment(updatedAttachment);
    setChangeDescription('');

    // If notify client is checked, prepare email
    if (notifyClient && selectedFile.clientEmail) {
      setEmailSubject(`New version uploaded: ${selectedFile.name}`);
      setEmailMessage(
        `I've uploaded a new version of ${selectedFile.name} with the following changes:\n\n${changeDescription}`,
      );
      setShowVersionHistoryDialog(false);
      setShowSendEmailDialog(true);
    } else {
      // Close the dialog after creating a new version
      setShowVersionHistoryDialog(false);
    }

    // Reset notify client checkbox
    setNotifyClient(false);
  };

  const handleRevertToVersion = (version: FileVersion) => {
    if (!selectedFile || !selectedAttachment) return;

    // Update all versions, setting only the selected one to current
    const updatedVersions = (selectedAttachment.versions || []).map((v) => ({
      ...v,
      isCurrent: v.id === version.id,
    }));

    // Update the attachment
    const updatedAttachment = {
      ...selectedAttachment,
      size: version.size, // Update size to match reverted version
      versions: updatedVersions,
    };

    // Update the file
    const updatedAttachments = selectedFile.attachments.map((att) =>
      att.id === selectedAttachment.id ? updatedAttachment : att,
    );

    const updatedFile = {
      ...selectedFile,
      attachments: updatedAttachments,
      latestVersion: version.versionId,
    };

    // Update files state
    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
    setSelectedAttachment(updatedAttachment);

    // Create a reversion comment
    const newComment: Comment = {
      id: `c${Date.now()}`,
      text: `Restored version ${version.versionNumber} (${version.changeDescription})`,
      author: 'Hitarth', // Would be current user in production
      authorRole: 'Photographer',
      timestamp: new Date().toISOString(),
    };

    // Add the comment to the file
    const updatedFileWithComment = {
      ...updatedFile,
      comments: [...updatedFile.comments, newComment],
    };

    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFileWithComment : file)));
    setSelectedFile(updatedFileWithComment);
  };

  const handleCompareVersions = (olderVersion: FileVersion, newerVersion: FileVersion) => {
    setCompareVersions({
      older: olderVersion,
      newer: newerVersion,
    });
    setShowVersionCompareDialog(true);
  };

  return {
    // States
    showVersionHistoryDialog,
    setShowVersionHistoryDialog,
    selectedAttachment,
    setSelectedAttachment,
    changeDescription,
    setChangeDescription,
    showVersionCompareDialog,
    setShowVersionCompareDialog,
    compareVersions,
    setCompareVersions,
    notifyClient,
    setNotifyClient,

    // Functions
    handleOpenVersionHistory,
    handleCreateNewVersion,
    handleRevertToVersion,
    handleCompareVersions,
  };
}
