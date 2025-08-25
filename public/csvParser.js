// Import Papa Parse from CDN
importScripts('https://unpkg.com/papaparse@5.5.3/papaparse.min.js');

self.onmessage = function(e) {
  const { file } = e.data;
  
  let parsed = 0;
  const preview = [];
  let headers = [];
  
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
        });
      }
    },
    complete: (results) => {
      self.postMessage({
        type: 'complete',
        preview,
        total: parsed,
        headers
      });
    },
    error: (error) => {
      self.postMessage({
        type: 'error',
        error: error.message
      });
    }
  });
};