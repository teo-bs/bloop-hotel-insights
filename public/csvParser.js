// Direct Papa Parse import for Web Worker
importScripts('https://unpkg.com/papaparse@5.5.3/papaparse.min.js');

console.log('CSV Parser Web Worker loaded');

self.onmessage = function(e) {
  console.log('Worker received message:', e.data);
  const { file } = e.data;
  
  if (!file) {
    console.error('No file provided to worker');
    self.postMessage({
      type: 'error',
      error: 'No file provided'
    });
    return;
  }
  
  let parsed = 0;
  const preview = [];
  let headers = [];
  
  console.log('Starting Papa Parse...');
  
  Papa.parse(file, {
    worker: true,
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    encoding: 'utf-8',
    step: (result, parser) => {
      parsed++;
      
      console.log('Parsed row:', parsed, result.data);
      
      // Store first row headers
      if (headers.length === 0 && result.meta.fields) {
        headers = result.meta.fields;
        console.log('Headers found:', headers);
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
        });
      }
    },
    complete: (results) => {
      console.log('Parse complete. Total rows:', parsed, 'Headers:', headers, 'Preview length:', preview.length);
      self.postMessage({
        type: 'complete',
        preview,
        total: parsed,
        headers
      });
    },
    error: (error) => {
      console.error('Papa Parse error:', error);
      self.postMessage({
        type: 'error',
        error: error.message || 'Unknown parsing error'
      });
    }
  });
};