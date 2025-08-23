import { useSyncExternalStore } from "react";

export type Platform = "google" | "tripadvisor" | "booking";
export type IntegrationType = "csv" | "api";
export type IntegrationStatus = "not_connected" | "connected" | "error" | "syncing";
export type ImportJobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface Integration {
  id: string;
  platform: Platform;
  type: IntegrationType;
  status: IntegrationStatus;
  last_sync_at?: string;
  total_reviews: number;
  metadata: Record<string, any>;
}

export interface ImportJob {
  id: string;
  integration_id: string;
  filename: string;
  file_size?: number;
  total_rows?: number;
  processed_rows: number;
  imported_rows: number;
  failed_rows: number;
  status: ImportJobStatus;
  column_mapping: Record<string, string>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface IntegrationsState {
  integrations: Integration[];
  currentJob?: ImportJob;
  loading: boolean;
  error?: string;
}

const STORAGE_KEY = "padu.integrations";

function getDefaultState(): IntegrationsState {
  return {
    integrations: [],
    loading: false,
  };
}

function loadState(): IntegrationsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultState(), ...(JSON.parse(raw) as IntegrationsState) };
  } catch {}
  return getDefaultState();
}

let state: IntegrationsState = loadState();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function setState(partial: Partial<IntegrationsState>) {
  state = { ...state, ...partial };
  persist();
  emit();
}

export function getIntegrationsState() {
  return state;
}

export function subscribeIntegrations(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useIntegrations() {
  return useSyncExternalStore(subscribeIntegrations, getIntegrationsState, getIntegrationsState);
}

// Actions
export async function loadIntegrations() {
  setState({ loading: true, error: undefined });
  try {
    // TODO: Fetch from Supabase
    const mockIntegrations: Integration[] = [
      {
        id: "1",
        platform: "google",
        type: "csv",
        status: "not_connected",
        total_reviews: 0,
        metadata: {},
      },
      {
        id: "2", 
        platform: "tripadvisor",
        type: "csv",
        status: "not_connected",
        total_reviews: 0,
        metadata: {},
      },
      {
        id: "3",
        platform: "booking",
        type: "csv", 
        status: "not_connected",
        total_reviews: 0,
        metadata: {},
      },
    ];
    setState({ integrations: mockIntegrations, loading: false });
  } catch (error) {
    setState({ error: error instanceof Error ? error.message : "Failed to load integrations", loading: false });
  }
}

export async function uploadCSV(platform: Platform, file: File, columnMapping: Record<string, string>) {
  setState({ loading: true, error: undefined });
  try {
    // TODO: Implement CSV upload and processing
    await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
    
    // Update integration status
    const updatedIntegrations = state.integrations.map(integration =>
      integration.platform === platform
        ? {
            ...integration,
            status: "connected" as IntegrationStatus,
            last_sync_at: new Date().toISOString(),
            total_reviews: 150, // Mock count
            metadata: { ...integration.metadata, last_upload: file.name }
          }
        : integration
    );
    
    setState({ integrations: updatedIntegrations, loading: false });
  } catch (error) {
    setState({ error: error instanceof Error ? error.message : "Failed to upload CSV", loading: false });
  }
}

export async function disconnectIntegration(platform: Platform) {
  setState({ loading: true, error: undefined });
  try {
    // TODO: Implement disconnect logic
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedIntegrations = state.integrations.map(integration =>
      integration.platform === platform
        ? {
            ...integration,
            status: "not_connected" as IntegrationStatus,
            last_sync_at: undefined,
            total_reviews: 0,
            metadata: {}
          }
        : integration
    );
    
    setState({ integrations: updatedIntegrations, loading: false });
  } catch (error) {
    setState({ error: error instanceof Error ? error.message : "Failed to disconnect", loading: false });
  }
}

// Event handlers for modals
export function openCSVUploadModal(platform: Platform) {
  window.dispatchEvent(new CustomEvent('open-csv-upload-modal', { detail: { platform } }));
}

export function openManageIntegrationModal(platform: Platform) {
  window.dispatchEvent(new CustomEvent('open-manage-integration-modal', { detail: { platform } }));
}