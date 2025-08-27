import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  FileText,
  Loader2,
  ArrowRight,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadCSV, type Platform } from "@/stores/integrations";
import { cn } from "@/lib/utils";

interface CSVUploadModalProps {
  platform?: Platform;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedRow {
  [key: string]: string;
}

interface ValidationIssue {
  row: number;
  column: string;
  message: string;
  severity: "error" | "warning";
}

const REQUIRED_COLUMNS = {
  date: "Date",
  rating: "Rating", 
  text: "Review Text",
  platform: "Platform"
};

const OPTIONAL_COLUMNS = {
  title: "Review Title",
  author_name: "Author Name",
  author_location: "Author Location",
  reply_text: "Reply Text",
  reply_date: "Reply Date"
};

const ALL_COLUMNS = { ...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS };

const CSV_TEMPLATES = {
  google: {
    name: "Google Business Profile",
    filename: "google_reviews_template.csv",
    headers: ["Date", "Rating", "Review Text", "Review Title", "Author Name", "Platform", "Reply Text", "Reply Date"]
  },
  tripadvisor: {
    name: "TripAdvisor",
    filename: "tripadvisor_reviews_template.csv", 
    headers: ["Date", "Rating", "Review Text", "Review Title", "Author Name", "Author Location", "Platform"]
  },
  booking: {
    name: "Booking.com",
    filename: "booking_reviews_template.csv",
    headers: ["Date", "Rating", "Review Text", "Author Name", "Platform"]
  }
};

export default function CSVUploadModal({ platform, open, onOpenChange }: CSVUploadModalProps) {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rememberMapping, setRememberMapping] = useState(true);
  const [importResults, setImportResults] = useState<{
    imported: number;
    failed: number;
    errors?: ValidationIssue[];
  } | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setCurrentTab("upload");
      setFile(null);
      setParsedData([]);
      setHeaders([]);
      setColumnMapping({});
      setValidationIssues([]);
      setIsProcessing(false);
      setUploadProgress(0);
      setImportResults(null);
    }
  }, [open]);

  // Listen for modal open events
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      if (event.detail?.platform) {
        onOpenChange(true);
      }
    };

    window.addEventListener('open-csv-upload-modal', handleOpenModal as EventListener);
    return () => window.removeEventListener('open-csv-upload-modal', handleOpenModal as EventListener);
  }, [onOpenChange]);

  const downloadTemplate = useCallback(() => {
    if (!platform) return;
    
    const template = CSV_TEMPLATES[platform];
    
    // Create comprehensive sample data based on platform
    let sampleRows = [];
    
    if (platform === "google") {
      sampleRows = [
        "2024-01-15,5,\"Excellent service! The staff was incredibly friendly and went above and beyond to make our stay comfortable. The room was spotless and the amenities exceeded our expectations.\",\"Outstanding Experience\",\"Sarah Johnson\",google,\"Thank you so much for your wonderful review! We're thrilled to hear you had such a great experience.\",2024-01-16",
        "2024-01-14,4,\"Good location and decent facilities. The breakfast was tasty but could use more variety. Overall satisfied with the value for money.\",\"Good value for money\",\"Mike Thompson\",google,\"Thanks for your feedback! We'll definitely consider expanding our breakfast options.\",2024-01-15",
        "2024-01-13,3,\"Average experience. Room was clean but quite small. Check-in process took longer than expected.\",\"Average stay\",\"Emma Davis\",google,,",
        "2024-01-12,5,\"Amazing place! Beautiful views, excellent food, and top-notch service. Will definitely come back!\",\"Perfect getaway\",\"David Wilson\",google,\"We're so glad you enjoyed your stay with us! Looking forward to welcoming you back soon.\",2024-01-13"
      ];
    } else if (platform === "tripadvisor") {
      sampleRows = [
        "2024-01-15,5,\"Fantastic hotel with great amenities and service. Highly recommended!\",\"Highly Recommend\",\"John Smith\",\"New York, USA\",tripadvisor",
        "2024-01-14,4,\"Nice place, good location. Some minor issues but overall positive experience.\",\"Good Experience\",\"Maria Garcia\",\"Madrid, Spain\",tripadvisor",
        "2024-01-13,3,\"Average hotel. Nothing special but decent for the price.\",\"Decent Stay\",\"Robert Brown\",\"London, UK\",tripadvisor"
      ];
    } else if (platform === "booking") {
      sampleRows = [
        "2024-01-15,5,\"Perfect stay! Everything was exactly as described and the staff was very helpful.\",\"Lisa Anderson\",booking",
        "2024-01-14,4,\"Good hotel with comfortable rooms. Would stay again.\",\"James Wilson\",booking",
        "2024-01-13,3,\"Acceptable accommodation. Clean but basic amenities.\",\"Anna Mueller\",booking"
      ];
    }
    
    const csvContent = template.headers.join(",") + "\n" + sampleRows.join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = template.filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: `${template.name} CSV template with sample data has been downloaded.`,
    });
  }, [platform, toast]);

  const parseCSV = useCallback(async (file: File): Promise<{ data: ParsedRow[]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error("CSV must have at least a header row and one data row");
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const data = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: ParsedRow = {};
            headers.forEach((header, i) => {
              row[header] = values[i] || '';
            });
            return row;
          });

          resolve({ data, headers });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }, []);

  const validateData = useCallback((data: ParsedRow[], mapping: Record<string, string>): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV rows are 1-indexed and we skip header

      // Validate required fields
      Object.entries(REQUIRED_COLUMNS).forEach(([key, label]) => {
        const mappedColumn = mapping[key];
        if (!mappedColumn || !row[mappedColumn]?.trim()) {
          issues.push({
            row: rowNumber,
            column: label,
            message: `${label} is required`,
            severity: "error"
          });
        }
      });

      // Validate rating
      const ratingColumn = mapping.rating;
      if (ratingColumn && row[ratingColumn]) {
        const rating = parseInt(row[ratingColumn]);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          issues.push({
            row: rowNumber,
            column: "Rating",
            message: "Rating must be between 1 and 5",
            severity: "error"
          });
        }
      }

      // Validate date
      const dateColumn = mapping.date;
      if (dateColumn && row[dateColumn]) {
        const date = new Date(row[dateColumn]);
        if (isNaN(date.getTime())) {
          issues.push({
            row: rowNumber,
            column: "Date",
            message: "Invalid date format",
            severity: "error"
          });
        }
      }

      // Validate text length
      const textColumn = mapping.text;
      if (textColumn && row[textColumn] && row[textColumn].length > 5000) {
        issues.push({
          row: rowNumber,
          column: "Review Text",
          message: "Review text is too long (max 5000 characters)",
          severity: "warning"
        });
      }
    });

    return issues;
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setFile(selectedFile);
      const { data, headers } = await parseCSV(selectedFile);
      setParsedData(data);
      setHeaders(headers);
      
      // Auto-map columns
      const autoMapping: Record<string, string> = {};
      Object.entries(ALL_COLUMNS).forEach(([key, label]) => {
        const matchingHeader = headers.find(h => 
          h.toLowerCase().includes(key.toLowerCase()) ||
          h.toLowerCase().includes(label.toLowerCase()) ||
          label.toLowerCase().includes(h.toLowerCase())
        );
        if (matchingHeader) {
          autoMapping[key] = matchingHeader;
        }
      });
      setColumnMapping(autoMapping);
      
      setCurrentTab("mapping");
      
      toast({
        title: "File uploaded",
        description: `Successfully parsed ${data.length} rows from ${selectedFile.name}`,
      });
    } catch (error) {
      toast({
        title: "Parse error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive",
      });
    }
  }, [parseCSV, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleMappingComplete = useCallback(() => {
    const issues = validateData(parsedData, columnMapping);
    setValidationIssues(issues);
    setCurrentTab("preview");
  }, [parsedData, columnMapping, validateData]);

  const handleImport = useCallback(async () => {
    if (!file || !platform) return;

    const errors = validationIssues.filter(issue => issue.severity === "error");
    if (errors.length > 0) {
      toast({
        title: "Cannot import",
        description: "Please fix all errors before importing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await uploadCSV(platform, file, columnMapping);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // Simulate results
      const failedCount = validationIssues.filter(issue => issue.severity === "warning").length;
      setImportResults({
        imported: parsedData.length - failedCount,
        failed: failedCount,
        errors: validationIssues.filter(issue => issue.severity === "warning")
      });
      
      setCurrentTab("results");
      
      toast({
        title: "Import complete",
        description: `Successfully imported ${parsedData.length - failedCount} reviews`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import reviews",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [file, platform, columnMapping, validationIssues, parsedData, toast]);

  const platformConfig = platform ? CSV_TEMPLATES[platform] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Import Reviews from CSV
            {platformConfig && (
              <span className="text-muted-foreground font-normal"> - {platformConfig.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" disabled={!file} className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!file || Object.keys(columnMapping).length === 0} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!importResults} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="upload" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={downloadTemplate} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h4 className="font-medium mb-2">CSV Format Requirements</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Required fields:</strong> Date (YYYY-MM-DD), Rating (1-5), Review Text, Platform</p>
                    <p><strong>Optional fields:</strong> Review Title, Author Name, Author Location, Reply Text, Reply Date</p>
                    <p><strong>Date format:</strong> Use YYYY-MM-DD format (e.g., 2024-01-15)</p>
                    <p><strong>Text fields:</strong> Wrap in quotes if they contain commas</p>
                  </div>
                </div>

                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    file && "border-success bg-success/5"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-3">
                      <CheckCircle className="h-12 w-12 text-success mx-auto" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • {parsedData.length} rows
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setParsedData([]);
                          setHeaders([]);
                          setColumnMapping({});
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove file
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium">Drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground">
                          or click to select a file (max 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) handleFileSelect(selectedFile);
                        }}
                        className="hidden"
                        id="csv-upload"
                      />
                      <Label htmlFor="csv-upload">
                        <Button variant="outline" asChild>
                          <span>Select file</span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="flex justify-end">
                    <Button onClick={() => setCurrentTab("mapping")}>
                      Next: Map Columns
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Map CSV columns to review fields</h3>
                  <p className="text-sm text-muted-foreground">
                    Match your CSV columns to the required review fields. Required fields are marked with *.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(ALL_COLUMNS).map(([key, label]) => {
                    const isRequired = key in REQUIRED_COLUMNS;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="flex items-center gap-1">
                          {label}
                          {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Select
                          value={columnMapping[key] || ""}
                          onValueChange={(value) => {
                            setColumnMapping(prev => ({...prev, [key]: value}));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-- No mapping --</SelectItem>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-mapping" 
                    checked={rememberMapping}
                    onCheckedChange={(checked) => setRememberMapping(checked as boolean)}
                  />
                  <Label htmlFor="remember-mapping" className="text-sm">
                    Remember this mapping for future uploads
                  </Label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentTab("upload")}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleMappingComplete}
                    disabled={!Object.values(REQUIRED_COLUMNS).every(req => 
                      Object.keys(columnMapping).some(key => 
                        REQUIRED_COLUMNS[key as keyof typeof REQUIRED_COLUMNS] === req && 
                        columnMapping[key]
                      )
                    )}
                  >
                    Next: Preview Data
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Data Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      Showing first 20 rows • {parsedData.length} total rows
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-success/10 text-success">
                      {parsedData.length - validationIssues.filter(i => i.severity === "error").length} valid
                    </Badge>
                    {validationIssues.filter(i => i.severity === "error").length > 0 && (
                      <Badge variant="destructive">
                        {validationIssues.filter(i => i.severity === "error").length} errors
                      </Badge>
                    )}
                    {validationIssues.filter(i => i.severity === "warning").length > 0 && (
                      <Badge variant="secondary">
                        {validationIssues.filter(i => i.severity === "warning").length} warnings
                      </Badge>
                    )}
                  </div>
                </div>

                {validationIssues.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Found {validationIssues.length} validation issues. 
                      {validationIssues.filter(i => i.severity === "error").length > 0 && 
                        " Please fix all errors before importing."
                      }
                    </AlertDescription>
                  </Alert>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        {Object.values(REQUIRED_COLUMNS).map((label) => (
                          <TableHead key={label}>{label}</TableHead>
                        ))}
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 20).map((row, index) => {
                        const rowNumber = index + 2;
                        const rowIssues = validationIssues.filter(issue => issue.row === rowNumber);
                        
                        return (
                          <TableRow key={index} className={rowIssues.some(i => i.severity === "error") ? "bg-destructive/5" : ""}>
                            <TableCell className="font-medium">{rowNumber}</TableCell>
                            {Object.entries(REQUIRED_COLUMNS).map(([key, label]) => {
                              const mappedColumn = columnMapping[key];
                              const value = mappedColumn ? row[mappedColumn] : "";
                              return (
                                <TableCell key={key} className="max-w-32 truncate">
                                  {value || <span className="text-muted-foreground">--</span>}
                                </TableCell>
                              );
                            })}
                            <TableCell>
                              {rowIssues.length > 0 && (
                                <div className="flex gap-1">
                                  {rowIssues.map((issue, i) => (
                                    <Badge 
                                      key={i} 
                                      variant={issue.severity === "error" ? "destructive" : "secondary"}
                                      className="text-xs"
                                    >
                                      {issue.message}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentTab("mapping")}>
                    Back to Mapping
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={validationIssues.filter(i => i.severity === "error").length > 0}
                  >
                    Import Reviews
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6 mt-6">
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                    <h3 className="font-semibold">Processing your import...</h3>
                    <p className="text-sm text-muted-foreground">This may take a few moments</p>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              ) : importResults ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <h3 className="font-semibold text-lg">Import Complete!</h3>
                    <p className="text-muted-foreground">Your reviews have been successfully imported</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="text-2xl font-bold text-success">{importResults.imported}</div>
                      <div className="text-sm text-muted-foreground">Reviews Imported</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg border">
                      <div className="text-2xl font-bold">{importResults.failed}</div>
                      <div className="text-sm text-muted-foreground">Skipped (warnings)</div>
                    </div>
                  </div>

                  {importResults.errors && importResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Warnings & Skipped Rows</h4>
                      <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Error Report
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button onClick={() => onOpenChange(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : null}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}