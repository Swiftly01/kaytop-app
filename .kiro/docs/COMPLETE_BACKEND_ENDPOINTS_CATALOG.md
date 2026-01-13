# KAYTOP Complete Backend Endpoints Catalog

## Overview

This document provides a comprehensive catalog of all available backend endpoints for the KAYTOP application, compiled from multiple sources including:

- Frontend API configuration (`lib/api/config.ts`)
- Postman testing results (95.2% success rate across 52 endpoints)
- Documentation files in `.kiro/docs/`
- Systematic verification reports

**Base URL:** `https://kaytop-production.up.railway.app`

## 🔐 Authentication Endpoints

### Core Authentication
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| `POST` | `/auth/login` | User login with email/password | ✅ Working |
| `POST` | `/auth/signup` | User registration | ✅ Working |
| `GET` | `/auth/profile` | Get authenticated user profile | ✅ Working |
| `POST` | `/auth/forgot-password` | Initiate password reset | ✅ Working |
| `POST` | `/auth/reset-password` | Complete password reset | ✅ Working |
| `POST` | `/auth/change-password` | Change user password | ✅ Working |

### OTP Operations
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| `POST` | `/otp/send` | Send OTP to user | ✅ Working |
| `POST` | `/otp/verify` | Verify OTP code | ✅ Working |

## 👥 User Management Endpoints

### User CRUD Operations
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| `GET` | `/admin/users` | Get all users (paginated) | ✅ Working |
| `GET` | `/admin/users/{id}` | Get user by ID | ✅ Working |
| `GET` | `/admin/user/{email}` | Get user by email | ✅ Working |
| `PATCH` | `/admin/users/{id}` | Update user profile | ✅ Working |
| `DELETE` | `/admin/user