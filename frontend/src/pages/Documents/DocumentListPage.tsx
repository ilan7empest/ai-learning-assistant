import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import DocumentCard from './DocumentCard';
import UploadModal from './UploadModal';
import DeleteModal from './DeleteModal';

import { documentService } from '../../services/document.service';
import type { Document } from '../../types/document.type';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState<Array<Document>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Upload document states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  // Delete document states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast.error('Failed to fetch documents.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension for default title
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error('Please provide a file and title for the document.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('file', uploadFile);

    try {
      await documentService.uploadDocument(formData);

      toast.success('Document uploaded successfully.');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = async (doc: Document) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted successfully.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((doc) => doc._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error?.message || 'Failed to delete document.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-100">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
              <FileText className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight mb-2">No documents available.</h3>
            <p className="text-sm text-slate-500 mb-6">
              Get started by uploading your first PDF document to begin learning.
            </p>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {documents?.map((doc) => (
          <DocumentCard key={doc._id} document={doc} onDelete={() => handleDeleteRequest(doc)} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">My Documents</h1>
            <p className="text-slate-500 text-sm">Manage and organize your learning materials.</p>
          </div>
          {documents.length > 0 && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </Button>
          )}
        </div>
        {renderContent()}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal
          setIsUploadModalOpen={setIsUploadModalOpen}
          setUploadFile={setUploadFile}
          setUploadTitle={setUploadTitle}
          handleFileChange={handleFileChange}
          handleFileUpload={handleFileUpload}
          uploadTitle={uploadTitle}
          uploadFile={uploadFile}
          uploading={uploading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedDoc && (
        <DeleteModal
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          selectedDoc={{ id: selectedDoc._id, title: selectedDoc.title }}
          deleting={deleting}
          handleConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default DocumentListPage;
