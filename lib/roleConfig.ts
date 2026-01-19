/**
 * Role and Permission Configuration
 * 
 * Centralized configuration for roles and their default permissions.
 */

export type UserRoleType = 'HQ' | 'AM' | 'CO' | 'BM';

export interface RoleConfig {
    label: string;
    color: string;
    backgroundColor: string;
    defaultPermissions: string[];
}

export const ROLE_CONFIG: Record<UserRoleType, RoleConfig> = {
    HQ: {
        label: 'Headquarters',
        color: '#AB659C',
        backgroundColor: '#FBEFF8',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Reports', 'Analytics']
    },
    AM: {
        label: 'Account Manager',
        color: '#4C5F00',
        backgroundColor: '#ECF0D9',
        defaultPermissions: ['Services', 'Clients', 'Subscriptions', 'Branch Management']
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
    }
};

export const PERMISSION_CATEGORIES = {
    'Core Services': ['Services', 'Clients', 'Subscriptions'],
    'Financial': ['Loan Processing', 'Payment Management', 'Financial Reports'],
    'Management': ['Staff Management', 'Branch Management', 'User Administration'],
    'Analytics': ['Reports', 'Analytics', 'Data Export']
};

/**
 * Maps backend role to frontend role
 */
export const mapBackendToFrontendRole = (backendRole: string): UserRoleType => {
    if (backendRole === 'branch_manager') return 'BM';
    if (backendRole === 'account_manager') return 'AM';
    if (backendRole === 'credit_officer') return 'CO';
    if (backendRole === 'hq_manager' || backendRole === 'system_admin') return 'HQ';
    return 'HQ'; // Default fallback
};

/**
 * Maps frontend role to backend role
 */
export const mapFrontendToBackendRole = (frontendRole: UserRoleType): string => {
    switch (frontendRole) {
        case 'BM': return 'branch_manager';
        case 'AM': return 'account_manager';
        case 'CO': return 'credit_officer';
        case 'HQ': return 'hq_manager';
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
