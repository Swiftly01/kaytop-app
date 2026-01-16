# Kaytop Banking Application

A comprehensive banking management system built with Next.js, featuring role-based access control and unified API integration.

## Features

### System Administrator Dashboard
- Complete system oversight and management
- User role management and permissions
- System configuration and settings
- Comprehensive reporting and analytics

### Account Manager Dashboard  
- Customer account management
- Loan processing and approval workflows
- Savings account management
- Branch and credit officer oversight
- Performance tracking and reporting

### Unified Authentication System
- Role-based access control (RBAC)
- Secure authentication with JWT tokens
- Multi-role support (System Admin, Account Manager, Branch Manager, Credit Officer, Customer)
- Intelligent role detection and routing

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui foundation
- **Authentication**: JWT-based with role validation
- **API**: RESTful API with unified service layer

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd kaytop-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Configure your environment variables
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── dashboard/               # Dashboard pages
│   │   ├── system-admin/       # System admin dashboard
│   │   └── am/                 # Account manager dashboard
│   ├── auth/                   # Authentication pages
│   ├── api/                    # API routes
│   ├── _components/            # Reusable UI components
│   └── contexts/               # React contexts
├── lib/                        # Utility libraries
│   ├── api/                    # API client and utilities
│   ├── services/               # Business logic services
│   └── utils/                  # Helper utilities
├── middleware.ts               # Next.js middleware for auth
└── public/                     # Static assets
```

## Key Features

### Role-Based Access Control
- **System Admin**: Full system access and management
- **Account Manager**: Customer and loan management
- **Branch Manager**: Branch-specific operations
- **Credit Officer**: Loan processing and customer service
- **Customer**: Personal banking interface

### Unified API Integration
- Centralized authentication management
- Consistent error handling across all services
- Unified data transformation and validation
- Comprehensive logging and debugging

### Security Features
- JWT-based authentication
- Role-based route protection
- Secure cookie management
- CSRF protection via middleware

## Development

### Code Style
- ESLint configuration for code quality
- TypeScript for type safety
- Consistent component architecture
- Comprehensive error handling

### Testing
- Component testing with Jest
- API endpoint testing
- Authentication flow testing
- Role-based access testing

## Deployment

The application is configured for deployment on Vercel with:
- Automatic deployments from main branch
- Environment variable management
- Edge middleware for authentication
- Optimized build configuration

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the established patterns
3. Test thoroughly including role-based access
4. Submit a pull request with detailed description

## License

This project is proprietary and confidential.