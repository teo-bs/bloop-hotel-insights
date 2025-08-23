import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportJobData {
  integration_id: string;
  filename: string;
  file_size: number;
  column_mapping: Record<string, string>;
  csv_data: string[][];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { integration_id, filename, file_size, column_mapping, csv_data }: ImportJobData = await req.json()

    console.log(`Starting CSV import for integration ${integration_id}, file: ${filename}`)

    // Create import job
    const { data: importJob, error: jobError } = await supabaseClient
      .from('import_jobs')
      .insert({
        integration_id,
        filename,
        file_size,
        total_rows: csv_data.length,
        column_mapping,
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (jobError) {
      console.error('Failed to create import job:', jobError)
      throw new Error('Failed to create import job')
    }

    console.log(`Created import job ${importJob.id}`)

    // Process CSV data in background
    EdgeRuntime.waitUntil(processCsvData(supabaseClient, importJob.id, csv_data, column_mapping))

    return new Response(
      JSON.stringify({ 
        success: true, 
        import_job_id: importJob.id,
        message: 'Import started successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('CSV import error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Import failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processCsvData(
  supabaseClient: any,
  importJobId: string,
  csvData: string[][],
  columnMapping: Record<string, string>
) {
  let processedRows = 0;
  let importedRows = 0;
  let failedRows = 0;
  const errors: Array<{ row_number: number; error_message: string; row_data: any }> = [];

  try {
    console.log(`Processing ${csvData.length} rows for import job ${importJobId}`)

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      processedRows++;

      try {
        // Map CSV columns to database columns
        const mappedRow: any = {
          user_id: null, // Will be set from integration
        };

        // Apply column mapping
        Object.entries(columnMapping).forEach(([csvColumn, dbColumn]) => {
          const columnIndex = parseInt(csvColumn);
          if (columnIndex < row.length && row[columnIndex]) {
            mappedRow[dbColumn] = row[columnIndex].trim();
          }
        });

        // Validate required fields
        if (!mappedRow.text || !mappedRow.rating || !mappedRow.date || !mappedRow.platform) {
          throw new Error('Missing required fields: text, rating, date, or platform');
        }

        // Convert rating to number
        mappedRow.rating = parseInt(mappedRow.rating);
        if (isNaN(mappedRow.rating) || mappedRow.rating < 1 || mappedRow.rating > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }

        // Parse date
        const parsedDate = new Date(mappedRow.date);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date format');
        }
        mappedRow.date = parsedDate.toISOString().split('T')[0];

        // Set default values
        mappedRow.sentiment = mappedRow.sentiment || 'neutral';
        mappedRow.topics = mappedRow.topics ? mappedRow.topics.split(',').map((t: string) => t.trim()) : [];

        // Get user_id from integration  
        const { data: integration } = await supabaseClient
          .from('integrations')
          .select('user_id')
          .eq('id', await getIntegrationIdFromJob(supabaseClient, importJobId))
          .single();

        if (integration) {
          mappedRow.user_id = integration.user_id;
        }

        // Upsert review (prevent duplicates based on platform, date, text)
        const { error: upsertError } = await supabaseClient
          .from('reviews')
          .upsert(
            mappedRow,
            { 
              onConflict: 'user_id,platform,date,text',
              ignoreDuplicates: false 
            }
          );

        if (upsertError) {
          throw new Error(`Database error: ${upsertError.message}`);
        }

        importedRows++;
        console.log(`Imported row ${i + 1}/${csvData.length}`);

      } catch (rowError) {
        console.error(`Error processing row ${i + 1}:`, rowError);
        failedRows++;
        
        errors.push({
          row_number: i + 1,
          error_message: rowError.message || 'Unknown error',
          row_data: row
        });

        // Store error in database
        await supabaseClient
          .from('import_errors')
          .insert({
            import_job_id: importJobId,
            row_number: i + 1,
            error_type: 'processing_error',
            error_message: rowError.message || 'Unknown error',
            row_data: row
          });
      }

      // Update progress every 10 rows
      if (processedRows % 10 === 0) {
        await supabaseClient
          .from('import_jobs')
          .update({
            processed_rows: processedRows,
            imported_rows: importedRows,
            failed_rows: failedRows
          })
          .eq('id', importJobId);
      }
    }

    // Final update
    await supabaseClient
      .from('import_jobs')
      .update({
        status: failedRows === 0 ? 'completed' : 'completed_with_errors',
        processed_rows: processedRows,
        imported_rows: importedRows,
        failed_rows: failedRows,
        completed_at: new Date().toISOString()
      })
      .eq('id', importJobId);

    // Update integration stats
    const { data: integration } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('id', await getIntegrationIdFromJob(supabaseClient, importJobId))
      .single();

    if (integration) {
      await supabaseClient
        .from('integrations')
        .update({
          status: 'connected',
          total_reviews: (integration.total_reviews || 0) + importedRows,
          last_sync_at: new Date().toISOString(),
          metadata: {
            ...integration.metadata,
            last_import: {
              filename: await getFilenameFromJob(supabaseClient, importJobId),
              imported_rows: importedRows,
              failed_rows: failedRows,
              completed_at: new Date().toISOString()
            }
          }
        })
        .eq('id', integration.id);
    }

    console.log(`CSV import completed. Processed: ${processedRows}, Imported: ${importedRows}, Failed: ${failedRows}`);

  } catch (error) {
    console.error('Fatal error during CSV processing:', error);
    
    // Mark job as failed
    await supabaseClient
      .from('import_jobs')
      .update({
        status: 'failed',
        error_message: error.message || 'Unknown error occurred',
        processed_rows: processedRows,
        imported_rows: importedRows,
        failed_rows: failedRows,
        completed_at: new Date().toISOString()
      })
      .eq('id', importJobId);
  }
}

async function getIntegrationIdFromJob(supabaseClient: any, importJobId: string): Promise<string> {
  const { data } = await supabaseClient
    .from('import_jobs')
    .select('integration_id')
    .eq('id', importJobId)
    .single();
  return data?.integration_id;
}

async function getFilenameFromJob(supabaseClient: any, importJobId: string): Promise<string> {
  const { data } = await supabaseClient
    .from('import_jobs')
    .select('filename')
    .eq('id', importJobId)
    .single();
  return data?.filename;
}