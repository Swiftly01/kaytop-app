'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { AMSavingsService, type SavingsAccount, type SavingsTransaction } from '@/lib/services/amSavings';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDate } from '@/lib/formatDate';

export default function AMSavingsPage() {
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [summary, setSummary] = useState({
    totalAccounts: 0,
    totalBalance: 0,
    activeAccounts: 0,
    pendingTransactions: 0,
    monthlyDeposits: 0,
    monthlyWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadSavingsData();
  }, [activeTab, pagination.page, searchTerm]);

  const loadSavingsData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'accounts') {
        const result = await AMSavingsService.getSavingsAccounts({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });
        setSavingsAccounts(result.data);
        setPagination(result.pagination);
        setSummary(result.summary);
      } else {
        const result = await AMSavingsService.getSavingsTransactions({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });
        setTransactions(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error loading savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (transactionId: string) => {
    try {
      await AMSavingsService.approveWithdrawal(transactionId, {
        action: 'approve',
        notes: 'Approved by Account Manager'
      });
      loadSavingsData(); // Reload data
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };

  const handleDeclineWithdrawal = async (transactionId: string) => {
    try {
      await AMSavingsService.approveWithdrawal(transactionId, {
        action: 'decline',
        notes: 'Declined by Account Manager'
      });
      loadSavingsData(); // Reload data
    } catch (error) {
      console.error('Error declining withdrawal:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      suspended: { variant: 'destructive' as const, label: 'Suspended' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      approved: { variant: 'default' as const, label: 'Approved' },
      declined: { variant: 'destructive' as const, label: 'Declined' },
      completed: { variant: 'default' as const, label: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = {
      deposit: { variant: 'default' as const, label: 'Deposit' },
      withdrawal: { variant: 'secondary' as const, label: 'Withdrawal' },
      loan_coverage: { variant: 'outline' as const, label: 'Loan Coverage' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.deposit;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Savings Management</h1>
          <p className="text-muted-foreground">
            Manage customer savings accounts and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAccounts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary.activeAccounts} active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.monthlyDeposits)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          <Button
            variant={activeTab === 'accounts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('accounts')}
          >
            Savings Accounts
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : activeTab === 'accounts' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Account Number</th>
                    <th className="text-left p-4 font-medium">Balance</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Branch</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savingsAccounts.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{account.customerName}</div>
                          <div className="text-sm text-muted-foreground">ID: {account.customerId}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{account.accountNumber}</td>
                      <td className="p-4 font-medium">{formatCurrency(account.balance)}</td>
                      <td className="p-4">{getStatusBadge(account.status)}</td>
                      <td className="p-4">{account.branch || 'N/A'}</td>
                      <td className="p-4">{formatDate(account.createdAt)}</td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{transaction.customerName}</div>
                          <div className="text-sm text-muted-foreground">ID: {transaction.customerId}</div>
                        </div>
                      </td>
                      <td className="p-4">{getTransactionTypeBadge(transaction.type)}</td>
                      <td className="p-4 font-medium">{formatCurrency(transaction.amount)}</td>
                      <td className="p-4">{getStatusBadge(transaction.status)}</td>
                      <td className="p-4">{formatDate(transaction.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {transaction.status === 'pending' && transaction.type === 'withdrawal' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveWithdrawal(transaction.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeclineWithdrawal(transaction.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}