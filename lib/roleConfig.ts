/**
 * Role and Permission Configuration
 * 
 * Centralized configuration for roles and their default permissions.
 */

export type UserRoleType = 'HQ' | 'CO' | 'BM' | 'ADMIN';

export interface RoleConfig {
    label: string;
    color: string;
    backgroundColor: string;
    defaultPermissions: string[];
}

export const ROLE_CONFIG: Record<UserRoleType, RoleConfig> = {
    HQ: {
        label: 'HQ Manager',
        color: '#AB659C',
        backgroundColor: '#FBEFF8',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Reports', 'Analytics', 'Branch Management']
    },
    CO: {
        label: 'Credit Officer',
        color: '#462ACD',
        backgroundColor: '#DEDAF3',
        defaultPermissions: ['Services', 'Clients', 'Loan Processing']
    },
    BM: {
        label: 'Branch Manager',
        color: '#AB659C',
        backgroundColor: '#FBEFF8',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Staff Management']
    },
    ADMIN: {
        label: 'System Administrator',
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Reports', 'Analytics', 'Branch Management', 'Staff Management', 'User Administration', 'System Configuration']
    }
};

export const PERMISSION_CATEGORIES = {
    'Core Services': ['Services', 'Clients', 'Subscriptions'],
    'Financial': ['Loan Processing', 'Payment Management', 'Financial Reports'],
    'Management': ['Staff Management', 'Branch Management', 'User Administration'],
    'Analytics': ['Reports', 'Analytics', 'Data Export']
};

/**
 * Enhanced role mapping with email-based inference as fallback
 * when backend doesn't provide role field
 */
export const mapBackendToFrontendRole = (backendRole: string, email?: string, name?: string): UserRoleType => {
    // If backend provides a valid role, use it
    if (backendRole && backendRole !== 'undefined') {
        if (backendRole === 'branch_manager') return 'BM';
        if (backendRole === 'account_manager') return 'HQ'; // Legacy map to HQ
        if (backendRole === 'credit_officer') return 'CO';
        if (backendRole === 'hq_manager') return 'HQ';
        if (backendRole === 'system_admin') return 'ADMIN';
    }
    
    // Fallback: Infer role from email patterns when backend role is missing
    if (email) {
        // System Admin patterns
        if (email.includes('admin@kaytop.com') || email.includes('system') || name?.toLowerCase().includes('system administrator')) {
            return 'ADMIN';
        }
        
        // Branch Manager patterns
        if (email.includes('bm@') || email.includes('branch') || email.includes('bmadmin') || 
            email.includes('_branch@') || name?.toLowerCase().includes('branch manager')) {
            return 'BM';
        }
        
        // HQ Manager patterns
        if (email.includes('hq') || email.includes('adminhq') || name?.toLowerCase().includes('hq manager')) {
            return 'HQ';
        }
        
        // Credit Officer patterns (less specific, so check last)
        if (email.includes('credit') || email.includes('officer') || name?.toLowerCase().includes('credit officer')) {
            return 'CO';
        }
    }
    
    // Default fallback
    return 'HQ';
};

/**
 * Maps frontend role to backend role
 */
export const mapFrontendToBackendRole = (frontendRole: UserRoleType): string => {
    switch (frontendRole) {
        case 'BM': return 'branch_manager';
        case 'CO': return 'credit_officer';
        case 'HQ': return 'hq_manager';
        case 'ADMIN': return 'system_admin';
        default: return 'hq_manager';
    }
};

/**
 * Gets default permissions for a backend role
 */
export const getPermissionsForRole = (backendRole: string): string[] => {
    const frontendRole = mapBackendToFrontendRole(backendRole);
    return ROLE_CONFIG[frontendRole].defaultPermissions;
};
