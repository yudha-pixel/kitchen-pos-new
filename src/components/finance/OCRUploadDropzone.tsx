'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileImage, FileText, Loader2 } from 'lucide-react';

interface OCRUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function OCRUploadDropzone({ onFileSelect, isProcessing = false }: OCRUploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setValidationError('Hanya file JPG, PNG, atau PDF yang diperbolehkan.');
      return;
    }

    if (file.size > maxSize) {
      setValidationError('Ukuran file maksimal 10MB.');
      return;
    }

    setValidationError('');
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleProcess = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setValidationError('');
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-12 w-12 text-gray-400" />;
    if (selectedFile.type.startsWith('image/')) return <FileImage className="h-12 w-12 text-blue-500" />;
    return <FileText className="h-12 w-12 text-red-500" />;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileInput}
            disabled={isProcessing}
            aria-describedby={`ocr-upload-help${validationError ? ' ocr-upload-error' : ''}`}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {getFileIcon()}
            <p className="mt-4 text-sm text-gray-600">
              <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop
            </p>
            <p id="ocr-upload-help" className="mt-2 text-xs text-gray-500">
              JPG, PNG, atau PDF (maks. 10MB)
            </p>
          </label>
          {validationError && (
            <p id="ocr-upload-error" role="alert" className="mt-3 text-sm font-medium text-red-600">
              {validationError}
            </p>
          )}
        </div>
      ) : (
        <div className="border-2 border-gray-300 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              disabled={isProcessing}
              aria-label={`Hapus file ${selectedFile.name}`}
            >
              <X className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </button>
          </div>

          {previewUrl && (
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses OCR...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Proses OCR
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
