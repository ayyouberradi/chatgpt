import React, { useState, useEffect, useRef, useCallback } from 'react';
import { request } from '../../lib/http';
import { Upload, Trash2, Copy, Check, FileImage, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

export default function MediaAdmin() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await request<unknown>('/media', { cache: 'no-store' });
      if (!Array.isArray(data)) throw new Error('The media library returned an invalid response. Please retry.');
      const fileList: MediaFile[] = data.filter((file): file is MediaFile =>
        file !== null && typeof file === 'object' && typeof file.name === 'string' && typeof file.url === 'string'
      ).map(file => ({
        ...file,
        type: typeof file.type === 'string' && file.type.trim() ? file.type.trim().toLowerCase() : 'application/octet-stream',
        size: typeof file.size === 'number' && Number.isFinite(file.size) && file.size >= 0 ? file.size : 0,
      }));
      fileList.sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0));
      setFiles(fileList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the media library. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadFiles = async (filesToUpload: File[]) => {
    try {
      setUploading(true);
      for (const file of filesToUpload) {

        
        const body = new FormData();
        body.append('file', file);
        await request('/media', { method: 'POST', body });
      }
      await fetchFiles();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      alert(`Error uploading files: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadFiles(Array.from(e.target.files));
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleDelete = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await request(`/media/${encodeURIComponent(fileName)}`, { method: 'DELETE' });
      
      setFiles(files.filter((f: any) => f.name !== fileName));
    } catch (error: any) {
      console.error('Error deleting file:', error);
      alert(`Error deleting file: ${error.message}`);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={handleUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${
          isDragging 
            ? 'border-accent bg-accent/10' 
            : 'border-[var(--border)] bg-[var(--surface)] hover:border-secondary/50'
        }`}
      >
        <ImageIcon className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-accent' : 'text-secondary'}`} />
        <h3 className="text-lg font-medium mb-2">Drag and drop files here</h3>
        <p className="text-secondary text-sm">or click the Upload Media button above</p>
      </div>

      {error && <div role="alert" className="card p-6 mb-6"><p>{error}</p><button className="btn-primary mt-3" onClick={fetchFiles}>Retry loading media</button></div>}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? null : files.length === 0 ? (
        <div className="card p-12 text-center">
          <FileImage className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium mb-2">No media files yet</h3>
          <p className="text-gray-400">Upload images or videos to use across your website.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card overflow-hidden group"
              >
                <div className="aspect-square bg-gray-800 relative">
                  {typeof file.type === 'string' && file.type.startsWith('video/') ? (
                    <video src={file.url} className="w-full h-full object-cover" />
                  ) : typeof file.type === 'string' && file.type.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" aria-label="Preview unavailable"><FileImage className="w-12 h-12 text-gray-400" /></div>
                  )}
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === file.url ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-300 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatSize(file.size)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
