import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAuthToken } from '@/integrations/supabase/client';

interface ResumeUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (resume: any) => void;
}

export const ResumeUploader = ({
  open,
  onOpenChange,
  onSuccess,
}: ResumeUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Only PDF and Word documents are allowed');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size cannot exceed 10 MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const token = await getAuthToken();

      // Step 1: Get upload URL from backend
      const uploadUrlResponse = await fetch(
        `${import.meta.env.VITE_API_URI}/resume/get-upload-url`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { upload_url, upload_token } = await uploadUrlResponse.json();
      setUploadProgress(30);

      // Step 2: Upload file to Supabase
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file, // the raw file object, not FormData
      });


      if (!uploadResponse.ok) {
        const err = await uploadResponse.text();
        console.error('Supabase error:', uploadResponse.status, err);
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      setUploadProgress(70);

      // Step 3: Confirm upload with backend
      const confirmResponse = await fetch(
        `${import.meta.env.VITE_API_URI}/resume/confirm-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            upload_token,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            visibility: 'private',
            is_primary: false,
          }),
        }
      );

      if (!confirmResponse.ok) {
        const err = await confirmResponse.json();
        throw new Error(err.error || 'Failed to confirm upload');
      }

      setUploadProgress(100);
      const { resume } = await confirmResponse.json();

      // Success
      onSuccess(resume);
      setFile(null);
      setUploadProgress(0);
      onOpenChange(false);

      toast.success('Resume uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />

            {!file ? (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PDF or Word (max 10 MB)</p>
              </>
            ) : (
              <>
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}
          </div>

          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Uploading...</p>
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Secure Upload</p>
              <p>Your file is uploaded securely to our servers.</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-gradient-primary"
            >
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Resume'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};