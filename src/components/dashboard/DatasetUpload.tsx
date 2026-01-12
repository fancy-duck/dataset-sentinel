import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DatasetUploadProps {
  onDatasetLoaded: (data: { name: string; rows: number; features: string[] }) => void;
  isScanning?: boolean;
}

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function DatasetUpload({ onDatasetLoaded, isScanning = false }: DatasetUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateUpload = useCallback((file: File) => {
    setFileName(file.name);
    setStatus("uploading");
    setProgress(0);
    setError(null);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(uploadInterval);
      setProgress(100);
      setStatus("processing");

      // Simulate processing
      setTimeout(() => {
        // Generate mock features based on file
        const mockFeatures = [
          "user_id", "timestamp", "age", "income", "zip_code",
          "education", "occupation", "marital_status", "credit_score",
          "loan_amount", "interest_rate", "term_months", "default_risk"
        ];

        const mockRows = Math.floor(Math.random() * 5000000) + 100000;

        setStatus("success");
        onDatasetLoaded({
          name: file.name,
          rows: mockRows,
          features: mockFeatures,
        });
      }, 1500);
    }, 1200);
  }, [onDatasetLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = [".csv", ".json", ".parquet", ".xlsx"];
      const ext = file.name.substring(file.name.lastIndexOf("."));
      if (!validTypes.includes(ext)) {
        setError("Invalid file type. Supported: CSV, JSON, Parquet, XLSX");
        setStatus("error");
        return;
      }
      simulateUpload(file);
    }
  }, [simulateUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  }, [simulateUpload]);

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setFileName(null);
    setError(null);
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Dataset Upload
          </h3>
        </div>
        {status === "success" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {status === "idle" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center 
            transition-all cursor-pointer
            ${isDragOver 
              ? "border-primary bg-primary/10" 
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
            }
          `}
        >
          <input
            type="file"
            accept=".csv,.json,.parquet,.xlsx"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm text-foreground mb-1">
            {isDragOver ? "Drop file here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports CSV, JSON, Parquet, XLSX
          </p>
        </div>
      )}

      {(status === "uploading" || status === "processing") && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {status === "uploading" ? "Uploading..." : "Processing & profiling..."}
              </p>
            </div>
          </div>
          <Progress value={status === "processing" ? 100 : progress} className="h-1.5" />
          {status === "processing" && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Analyzing schema & detecting features...
            </div>
          )}
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-success" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
            <p className="text-xs text-success">Dataset loaded successfully</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Upload failed</p>
              <p className="text-xs text-destructive">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
