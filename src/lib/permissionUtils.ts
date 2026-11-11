import { supabase } from './supabase';

export interface ViewerPermissions {
  can_view_reports: boolean;
  can_download_reports: boolean;
  can_move_projects: boolean;
  can_edit_projects: boolean;
}

const DEFAULT_PERMISSIONS: ViewerPermissions = {
  can_view_reports: true,
  can_download_reports: true,
  can_move_projects: true,
  can_edit_projects: true,
};

export async function loadViewerPermissions(): Promise<ViewerPermissions> {
  try {
    const { data, error } = await supabase
      .from('viewer_permissions')
      .select('*')
      .single();

    if (error || !data) {
      return DEFAULT_PERMISSIONS;
    }

    return {
      can_view_reports: data.can_view_reports ?? true,
      can_download_reports: data.can_download_reports ?? true,
      can_move_projects: data.can_move_projects ?? true,
      can_edit_projects: data.can_edit_projects ?? true,
    };
  } catch (err) {
    console.error('Failed to load viewer permissions:', err);
    return DEFAULT_PERMISSIONS;
  }
}

export async function checkPermission(permission: keyof ViewerPermissions): Promise<boolean> {
  const perms = await loadViewerPermissions();
  return perms[permission];
}
