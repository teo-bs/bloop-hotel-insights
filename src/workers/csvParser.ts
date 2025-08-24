import Papa from 'papaparse';

export interface ParseProgress {
  type: 'progress';
  parsed: number;
  total: number;
}

export interface ParseComplete {
  type: 'complete';
  preview: any[];
  total: number;
  headers: string[];
}

export interface ParseError {
  type: 'error';
  error: string;
}

export type ParseMessage = ParseProgress | ParseComplete | ParseError;

self.onmessage = function(e) {
  const { file } = e.data;
  
  let parsed = 0;
  const preview: any[] = [];
  let headers: string[] = [];
  
  Papa.parse(file, {
    worker: true,
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    encoding: 'utf-8',
    step: (result, parser) => {
      parsed++;
      
      // Store first row headers
      if (headers.length === 0 && result.meta.fields) {
        headers = result.meta.fields;
      }
      
      // Store first 100 rows for preview
      if (preview.length < 100) {
        preview.push(result.data);
      }
      
      // Send progress updates every 1000 rows
      if (parsed % 1000 === 0) {
        self.postMessage({
          type: 'progress',
          parsed,
          total: parsed // We don't know total until complete
        } as ParseProgress);
      }
    },
    complete: (results) => {
      self.postMessage({
        type: 'complete',
        preview,
        total: parsed,
        headers
      } as ParseComplete);
    },
    error: (error) => {
      self.postMessage({
        type: 'error',
        error: error.message
      } as ParseError);
    }
  });
};