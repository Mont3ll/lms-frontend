import React, { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone"; // npm install react-dropzone
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void; // Callback when file selected/removed
  label?: string;
  accept?: Record<string, string[]>; // e.g., { 'image/*': ['.png', '.jpg'] }
  className?: string;
  initialFile?: File | { name: string }; // Allow showing initial file name
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  label = "Upload File",
  accept,
  className,
  initialFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(
    initialFile instanceof File ? initialFile : null,
  );
  const [fileName, setFileName] = useState<string | null>(
    initialFile ? initialFile.name : null,
  );
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);
      if (rejectedFiles && rejectedFiles.length > 0) {
        // Handle rejection (e.g., wrong file type, size limit)
        setError(
          rejectedFiles[0].errors[0].message || "File type not accepted.",
        );
        setSelectedFile(null);
        setFileName(null);
        onFileSelect(null);
        return;
      }
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept,
    multiple: false, // Only allow single file upload
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering dropzone click
    setSelectedFile(null);
    setFileName(null);
    onFileSelect(null);
    setError(null);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      {selectedFile || fileName ? (
        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50 text-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{fileName}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 px-4 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:border-primary/50 hover:bg-muted/50 transition-colors",
            isDragActive ? "border-primary bg-primary/10" : "border-border",
            error ? "border-destructive" : "",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
            {isDragActive ? (
              <p className="font-semibold text-primary">
                Drop the file here ...
              </p>
            ) : (
              <>
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                {/* <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p> */}
              </>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};
