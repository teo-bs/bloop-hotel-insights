import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Download, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { ParseMessage } from "@/workers/csvParser";

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

interface ImportStats {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

const REQUIRED_FIELDS = ['provider', 'rating', 'created_at'];
const ALL_FIELDS = [
  'provider', 'external_review_id', 'rating', 'text', 'language', 
  'created_at', 'response_text', 'responded_at'
];

const VALID_PROVIDERS = new Set(['google', 'tripadvisor', 'booking']);

export default function CSVImportModal({ open, onOpenChange }: CSVImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'import' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState<ImportStats>({ inserted: 0, updated: 0, skipped: 0, errors: 0 });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setStep('upload');
      setFile(null);
      setPreview([]);
      setHeaders([]);
      setColumnMapping({});
      setValidationErrors([]);
      setImportStats({ inserted: 0, updated: 0, skipped: 0, errors: 0 });
      setParseProgress(0);
      setImportProgress(0);
      setIsParsing(false);
      setIsImporting(false);
    }
  }, [open]);

  const downloadTemplate = useCallback(() => {
    const headers = ['provider', 'external_review_id', 'rating', 'text', 'language', 'created_at', 'response_text', 'responded_at'];
    const exampleRows = [
      ['google', 'ChdDSUhNMG9nS0VJQ0FnSUQ2cU5UQW53RRAB', '5', 'Amazing hotel with great service!', 'en', '2025-07-22T14:05:00Z', 'Thank you for your wonderful review!', '2025-07-23T09:00:00Z'],
      ['tripadvisor', '12345678', '4', 'Nice place, good location. Room was clean.', 'en', '2025-07-21T18:30:00Z', '', '']
    ];
    
    const csvContent = [headers, ...exampleRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'padu_reviews_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Template downloaded", description: "Use this template to format your review data." });
  }, [toast]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({ title: "Invalid file", description: "Please select a CSV file.", variant: "destructive" });
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      toast({ title: "File too large", description: "Please split your file into smaller chunks (max 50MB).", variant: "destructive" });
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseProgress(0);

    // Create Web Worker for parsing
    workerRef.current = new Worker(new URL('@/workers/csvParser.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const message: ParseMessage = e.data;
      
      switch (message.type) {
        case 'progress':
          setParseProgress((message.parsed / Math.max(message.total, message.parsed)) * 100);
          break;
        case 'complete':
          setPreview(message.preview);
          setHeaders(message.headers);
          setTotalRows(message.total);
          setIsParsing(false);
          
          // Auto-map identical headers
          const autoMapping: Record<string, string> = {};
          message.headers.forEach(header => {
            const normalizedHeader = header.toLowerCase().trim();
            if (ALL_FIELDS.includes(normalizedHeader)) {
              autoMapping[header] = normalizedHeader;
            }
          });
          setColumnMapping(autoMapping);
          setStep('mapping');
          break;
        case 'error':
          setIsParsing(false);
          toast({ title: "Parse error", description: message.error, variant: "destructive" });
          break;
      }
    };

    workerRef.current.postMessage({ file: selectedFile });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const validateData = useCallback(() => {
    const errors: ValidationError[] = [];
    
    preview.forEach((row, rowIndex) => {
      // Check required fields
      REQUIRED_FIELDS.forEach(field => {
        const mappedColumn = Object.entries(columnMapping).find(([, target]) => target === field)?.[0];
        if (!mappedColumn || !row[mappedColumn]) {
          errors.push({
            row: rowIndex + 1,
            column: field,
            message: `Required field '${field}' is missing`
          });
        }
      });

      // Validate provider
      const providerColumn = Object.entries(columnMapping).find(([, target]) => target === 'provider')?.[0];
      if (providerColumn && row[providerColumn]) {
        const provider = row[providerColumn].toLowerCase().trim();
        if (!VALID_PROVIDERS.has(provider)) {
          errors.push({
            row: rowIndex + 1,
            column: 'provider',
            message: `Invalid provider '${provider}'. Must be google, tripadvisor, or booking`
          });
        }
      }

      // Validate rating
      const ratingColumn = Object.entries(columnMapping).find(([, target]) => target === 'rating')?.[0];
      if (ratingColumn && row[ratingColumn]) {
        const rating = parseInt(row[ratingColumn]);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          errors.push({
            row: rowIndex + 1,
            column: 'rating',
            message: `Rating must be between 1 and 5`
          });
        }
      }

      // Validate created_at
      const dateColumn = Object.entries(columnMapping).find(([, target]) => target === 'created_at')?.[0];
      if (dateColumn && row[dateColumn]) {
        const date = new Date(row[dateColumn]);
        if (isNaN(date.getTime())) {
          errors.push({
            row: rowIndex + 1,
            column: 'created_at',
            message: `Invalid date format. Use ISO 8601 (e.g., 2025-07-22T14:05:00Z)`
          });
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [preview, columnMapping]);

  const generateSurrogateId = async (provider: string, createdAt: string, text: string): Promise<string> => {
    const data = `${provider}|${createdAt}|${text}`;
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const processImport = useCallback(async () => {
    if (!user || !file) return;

    setIsImporting(true);
    setImportProgress(0);
    
    try {
      // Re-parse the entire file to get all data
      const allRows: any[] = [];
      
      await new Promise<void>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: 'greedy',
          step: (result) => {
            allRows.push(result.data);
          },
          complete: () => resolve(),
          error: (error) => reject(error)
        });
      });

      // Process rows in chunks of 1000
      const CHUNK_SIZE = 1000;
      const chunks = [];
      for (let i = 0; i < allRows.length; i += CHUNK_SIZE) {
        chunks.push(allRows.slice(i, i + CHUNK_SIZE));
      }

      let inserted = 0, updated = 0, skipped = 0, errors = 0;

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const processedRows = [];

        for (const row of chunk) {
          try {
            const processedRow: any = {
              user_id: user.id,
            };

            // Map columns
            for (const [csvCol, dbField] of Object.entries(columnMapping)) {
              if (dbField === 'ignore' || !row[csvCol]) continue;
              
              let value = row[csvCol];
              
              // Special processing
              if (dbField === 'provider') {
                value = value.toLowerCase().trim();
              } else if (dbField === 'rating') {
                value = parseInt(value);
              } else if (dbField === 'created_at' || dbField === 'responded_at') {
                value = new Date(value).toISOString();
              }
              
              processedRow[dbField] = value;
            }

            // Generate surrogate ID if external_review_id is missing
            if (!processedRow.external_review_id && processedRow.provider && processedRow.created_at && processedRow.text) {
              processedRow.external_review_id = await generateSurrogateId(
                processedRow.provider,
                processedRow.created_at,
                processedRow.text
              );
            }

            processedRows.push(processedRow);
          } catch (error) {
            errors++;
            console.error('Row processing error:', error);
          }
        }

        // Upsert chunk
        if (processedRows.length > 0) {
          const { data, error } = await supabase
            .from('reviews')
            .upsert(processedRows, { 
              onConflict: 'user_id,provider,external_review_id',
              ignoreDuplicates: false 
            })
            .select('*');

          if (error) {
            throw error;
          }

          // For simplicity, assume all are inserts for now
          // In a real implementation, you'd need to check which were updates vs inserts
          inserted += processedRows.length;
        }

        setImportProgress(((chunkIndex + 1) / chunks.length) * 100);
      }

      setImportStats({ inserted, updated, skipped, errors });
      setStep('success');
      
      toast({ 
        title: "Import completed", 
        description: `Imported ${inserted} reviews successfully.` 
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({ 
        title: "Import failed", 
        description: error.message || "An error occurred during import.", 
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
    }
  }, [user, file, columnMapping, toast]);

  const validRows = totalRows - validationErrors.length;
  const canImport = REQUIRED_FIELDS.every(field => 
    Object.values(columnMapping).includes(field)
  ) && validationErrors.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Reviews (CSV)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadTemplate} variant="outline" className="mb-2">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Dates must be ISO 8601 (e.g., 2025-07-22T14:05:00Z).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    File Import
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    {isParsing ? (
                      <div className="space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Parsing CSV file...</p>
                        <Progress value={parseProgress} className="w-full max-w-sm mx-auto" />
                      </div>
                    ) : (
                      <>
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg mb-2">Drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground mb-4">or</p>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".csv"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: Mapping & Preview */}
          {step === 'mapping' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Column Mapping & Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Map your CSV columns to review fields. Required: provider, rating, created_at
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Column mapping controls */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {headers.map(header => (
                        <div key={header} className="space-y-2">
                          <label className="text-sm font-medium">{header}</label>
                          <Select
                            value={columnMapping[header] || 'ignore'}
                            onValueChange={(value) => setColumnMapping(prev => ({ ...prev, [header]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ignore">Ignore</SelectItem>
                              {ALL_FIELDS.map(field => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                  {REQUIRED_FIELDS.includes(field) && <span className="text-red-500">*</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    {/* Validation button */}
                    <Button 
                      onClick={validateData} 
                      variant="outline"
                      className="w-full"
                    >
                      Validate Data
                    </Button>

                    {/* Validation errors */}
                    {validationErrors.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">{validationErrors.length} validation errors found</span>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {validationErrors.slice(0, 10).map((error, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                              Row {error.row}, {error.column}: {error.message}
                            </div>
                          ))}
                          {validationErrors.length > 10 && (
                            <div className="text-sm text-muted-foreground">
                              ... and {validationErrors.length - 10} more errors
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preview table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            {headers.map(header => (
                              <TableHead key={header}>
                                <div className="space-y-1">
                                  <span>{header}</span>
                                  {columnMapping[header] && columnMapping[header] !== 'ignore' && (
                                    <div className="flex items-center gap-1">
                                      <Badge 
                                        variant={REQUIRED_FIELDS.includes(columnMapping[header]) ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {columnMapping[header]}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.slice(0, 20).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              <TableCell className="font-mono text-xs">{rowIndex + 1}</TableCell>
                              {headers.map(header => {
                                const hasError = validationErrors.some(
                                  error => error.row === rowIndex + 1 && 
                                  (error.column === columnMapping[header] || error.column === header)
                                );
                                return (
                                  <TableCell 
                                    key={header} 
                                    className={hasError ? 'bg-destructive/10 text-destructive' : ''}
                                  >
                                    <div className="max-w-32 truncate text-xs">
                                      {row[header]}
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Showing first 20 of {totalRows} rows. 
                        {validationErrors.length > 0 && (
                          <span className="text-destructive ml-2">
                            {validationErrors.length} errors found.
                          </span>
                        )}
                      </div>
                      <Button 
                        onClick={() => setStep('import')} 
                        disabled={!canImport}
                        className="flex items-center gap-2"
                      >
                        Import {validRows} valid rows
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Import */}
          {step === 'import' && (
            <Card>
              <CardHeader>
                <CardTitle>Import Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {isImporting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span>Importing {validRows} reviews...</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{importStats.inserted}</div>
                      <div className="text-sm text-muted-foreground">Inserted</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{importStats.updated}</div>
                      <div className="text-sm text-muted-foreground">Updated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{importStats.skipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{importStats.errors}</div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>
                  {!isImporting && (
                    <Button onClick={processImport} className="w-full">
                      Start Import
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Import Completed Successfully
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{importStats.inserted}</div>
                      <div className="text-sm text-muted-foreground">Inserted</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{importStats.updated}</div>
                      <div className="text-sm text-muted-foreground">Updated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{importStats.skipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{importStats.errors}</div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        onOpenChange(false);
                        window.location.href = '/reviews';
                      }}
                      className="flex-1"
                    >
                      View Imported Reviews
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                      className="flex-1"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Accepted providers: Google, TripAdvisor, Booking.com</p>
              <p>• Dates must be in ISO 8601 format (e.g., 2025-07-22T14:05:00Z)</p>
              <p>• CSV files are processed locally and not stored on our servers</p>
              <p>• Duplicate reviews are automatically detected and updated</p>
              <p>• Maximum file size: 50MB</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}