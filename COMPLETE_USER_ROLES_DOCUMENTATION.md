# KAYTOP Complete User Roles - Documentation

## 🎉 **Mission Accomplished - All User Roles Created!**

This document provides comprehensive documentation for all user roles created in the KAYTOP system, including credentials, access levels, and testing procedures.

---

## 📋 **Complete User Credentials**

All users have been successfully created and verified through the backend API. Each user can authenticate and access their respective dashboards.

### **System Administrator**
- **Email**: `admin@kaytop.com`
- **Password**: `Admin123`
- **Role**: `system_admin`
- **Dashboard**: `/dashboard/system-admin`
- **Status**: ✅ **EXISTING - VERIFIED**
- **Access Level**: Full system access, can create other users
- **Note**: Primary admin account used for creating other users

### **Branch Manager**
- **Email**: `branchmanager@kaytop.com`
- **Password**: `BranchManager123`
- **Role**: `branch_manager`
- **Dashboard**: `/dashboard/bm`
- **Status**: ✅ **CREATED AND VERIFIED**
- **Access Level**: Branch management, can access BM and AM dashboards
- **Note**: Manages branch operations and staff

### **Account Manager**
- **Email**: `accountmanager@kaytop.com`
- **Password**: `AccountManager123`
- **Role**: `account_manager`
- **Dashboard**: `/dashboard/am`
- **Status**: ✅ **CREATED AND VERIFIED**
- **Access Level**: Account management operations
- **Note**: Standard Account Manager role

### **HQ Manager**
- **Email**: `hqmanager@kaytop.com`
- **Password**: `HQManager123`
- **Role**: `hq_manager`
- **Dashboard**: `/dashboard/am`
- **Status**: ✅ **CREATED AND VERIFIED**
- **Access Level**: Same as Account Manager (backend role mapping)
- **Note**: Backend uses this role instead of account_manager for AM dashboard

### **Credit Officer**
- **Email**: `creditofficer@kaytop.com`
- **Password**: `CreditOfficer123`
- **Role**: `credit_officer`
- **Dashboard**: `/dashboard/credit-officer`
- **Status**: ✅ **CREATED AND VERIFIED**
- **Access Level**: Credit operations and loan processing
- **Note**: Handles loan applications and credit assessments

### **Customer**
- **Email**: `customer@kaytop.com`
- **Password**: `Customer123`
- **Role**: `customer`
- **Dashboard**: `/dashboard/customer`
- **Status**: ✅ **CREATED AND VERIFIED**
- **Access Level**: Customer portal access only
- **Note**: End-user customer account

---

## 🔐 **Authentication Format**

All users authenticate using the same format:

```json
{
  "email": "[user_email]",
  "password": "[user_password]",
  "userType": "admin"
}
```

**Important Notes:**
- The `userType` field must be set to `"admin"` for all roles
- Authentication endpoint: `POST /auth/login`
- Response includes `access_token` for API calls
- Use `Bearer [token]` format for authenticated requests

---

## 🏗️ **Role Hierarchy & Access Control**

### **Access Matrix**

| Role | System Admin | Branch Mgmt | Account Mgmt | Credit Officer | Customer |
|------|:------------:|:-----------:|:------------:|:--------------:|:--------:|
| **system_admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **branch_manager** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **account_manager** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **hq_manager** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **credit_officer** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **customer** | ❌ | ❌ | ❌ | ❌ | ✅ |

### **Dashboard Routing**

```typescript
const ROLE_DASHBOARD_MAPPINGS = {
  system_admin: '/dashboard/system-admin',
  branch_manager: '/dashboard/bm',
  account_manager: '/dashboard/am',
  hq_manager: '/dashboard/am',      // Same as account_manager
  credit_officer: '/dashboard/credit-officer',
  customer: '/dashboard/customer'
};
```

---

## 🧪 **Testing Procedures**

### **Postman Collection: "KAYTOP - Complete User Role Creation"**

**Collection ID**: `50645954-4a895d60-420c-4a49-b327-efc8bf69c380`

This collection includes:
1. **System Admin Login** - Authenticates admin user
2. **Create Branch Manager** - Creates branch_manager user
3. **Create Account Manager** - Creates account_manager user  
4. **Create Credit Officer** - Creates credit_officer user
5. **Create Customer User** - Creates customer user
6. **Verify Branch Manager Login** - Tests BM authentication
7. **Verify Account Manager Login** - Tests AM authentication
8. **Verify Credit Officer Login** - Tests CO authentication
9. **Verify Customer Login** - Tests customer authentication
10. **Verify HQ Manager Login** - Tests HQ Manager authentication

### **Test Results Summary**
- ✅ **Total Tests**: 10
- ✅ **Passed**: 10 (100% success rate)
- ✅ **Duration**: 11.64 seconds
- ✅ **Status**: All users created and verified successfully

### **Running the Tests**

```bash
# Using Postman CLI (if available)
postman collection run "KAYTOP - Complete User Role Creation" \
  --environment "Kaytop API Environment"

# Or run via Postman app using collection ID:
# 50645954-4a895d60-420c-4a49-b327-efc8bf69c380
```

---

## 🔧 **User Creation Process**

### **API Endpoint**
- **URL**: `POST /admin/users`
- **Authentication**: Bearer token from system admin
- **Content-Type**: `application/json`

### **Request Format**
```json
{
  "firstName": "User",
  "lastName": "Name", 
  "email": "user@kaytop.com",
  "mobileNumber": "+2348012345678",
  "role": "user_role",
  "password": "UserPassword123",
  "state": "Lagos",
  "branch": "Lagos Central"
}
```

### **Supported Roles**
- `system_admin`
- `branch_manager`
- `account_manager`
- `hq_manager`
- `credit_officer`
- `customer`

---

## 📱 **Frontend Integration**

### **Login Component Usage**

```typescript
// Example login for any role
const loginData = {
  email: 'accountmanager@kaytop.com',
  password: 'AccountManager123',
  userType: 'admin'
};

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
});
```

### **Role-Based Routing**

The system automatically routes users to their appropriate dashboard based on their role:

```typescript
import { detectUserRole, getDefaultDashboard } from '@/lib/utils/roleUtils';

const role = detectUserRole(authResponse);
const dashboardUrl = getDefaultDashboard(role);
// Redirects to appropriate dashboard
```

---

## 🚀 **Usage Instructions**

### **For Testing**
1. Use any credentials from the "Complete User Credentials" section
2. Login format: `{email, password, userType: "admin"}`
3. All users are verified and ready for dashboard testing
4. Each role has access to their designated dashboard

### **For Development**
1. Run the "KAYTOP - Complete User Role Creation" collection to recreate users
2. Collection handles existing users gracefully (won't create duplicates)
3. All users follow consistent password format: `[Role]123`
4. Use system admin credentials to create additional users if needed

### **For Role-Specific Testing**
- **system_admin**: Test full system access and user management
- **branch_manager**: Test branch management and AM dashboard access
- **account_manager**: Test account management operations
- **hq_manager**: Test AM dashboard with backend role mapping
- **credit_officer**: Test credit operations and loan processing
- **customer**: Test customer portal functionality

---

## 📊 **Integration Status**

### **Completed Features** ✅
- Backend API Infrastructure Setup
- Authentication System Integration
- Customer Management Integration
- Loan Management Integration
- Savings Management Integration
- Dashboard KPI Integration
- Profile and Settings Integration
- HQ Manager Role Support
- **Complete User Role Creation System**

### **Progress**: 69.2% Complete (9/13 tasks)

### **Remaining Tasks** 🔧
- OTP Verification Integration
- Comprehensive Error Handling
- UI Consistency with Real Data
- Mock Data Cleanup

---

## 🔄 **Maintenance & Updates**

### **Adding New Users**
1. Authenticate as system admin using `admin@kaytop.com / Admin123`
2. Use `POST /admin/users` endpoint with Bearer token
3. Follow the request format documented above
4. Verify login with new credentials

### **Updating Existing Users**
- Users can be updated through the admin interface
- Password changes should follow the same security requirements
- Role changes require system admin privileges

### **Backup & Recovery**
- All user credentials are documented in `.postman.json`
- Postman collection can recreate all users if needed
- Environment variables contain all necessary configuration

---

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **401 Unauthorized**: Check that `userType: "admin"` is included in login request
2. **404 Not Found**: Verify the correct API endpoint URLs
3. **User Already Exists**: Collection handles this gracefully, user creation will be skipped

### **Verification Steps**
1. Run the complete user creation collection
2. Check that all 10 tests pass
3. Verify each user can login successfully
4. Test dashboard access for each role

### **Contact Information**
- Collection ID: `50645954-4a895d60-420c-4a49-b327-efc8bf69c380`
- Environment ID: `50645954-882436f4-1117-4eb5-b0a4-876fd173fc8e`
- Workspace ID: `28542185-d0cd-44e4-8eec-f9d0d965d0b3`

---

**Last Updated**: December 26, 2024  
**Status**: ✅ All user roles created and verified successfully  
**Next Steps**: Ready for comprehensive role-based testing and dashboard validation