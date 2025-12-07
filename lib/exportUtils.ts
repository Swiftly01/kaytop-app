/**
 * Export Utilities
 * 
 * Utilities for exporting data to various formats (CSV, Excel, PDF)
 */

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: any[], filename: string, headers: string[]) {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Download loan details as CSV
 */
export function exportLoanDetailsToCSV(loanData: {
  reportId: string;
  creditOfficer: string;
  branch: string;
  loansDispursed: number;
  loansValueDispursed: string;
  savingsCollected: string;
  repaymentsCollected: number;
  dateSent: string;
  timeSent: string;
}) {
  const data = [
    { field: 'Report ID', value: loanData.reportId },
    { field: 'Credit Officer', value: loanData.creditOfficer },
    { field: 'Branch', value: loanData.branch },
    { field: 'Loans Disbursed', value: loanData.loansDispursed },
    { field: 'Loans Value Disbursed', value: loanData.loansValueDispursed },
    { field: 'Savings Collected', value: loanData.savingsCollected },
    { field: 'Repayments Collected', value: loanData.repaymentsCollected },
    { field: 'Date Sent', value: loanData.dateSent },
    { field: 'Time Sent', value: loanData.timeSent },
  ];
  
  downloadCSV(data, `loan-report-${loanData.reportId}`, ['field', 'value']);
}

/**
 * Print loan details
 */
export function printLoanDetails(loanData: {
  reportId: string;
  creditOfficer: string;
  branch: string;
  loansDispursed: number;
  loansValueDispursed: string;
  savingsCollected: string;
  repaymentsCollected: number;
  dateSent: string;
  timeSent: string;
}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loan Report - ${loanData.reportId}</title>
      <style>
        body {
          font-family: 'Open Sauce Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #021C3E;
          font-size: 24px;
          margin-bottom: 30px;
          border-bottom: 2px solid #7F56D9;
          padding-bottom: 10px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          color: #021C3E;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .field {
          margin-bottom: 10px;
        }
        .label {
          color: #464A53;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .value {
          color: #021C3E;
          font-size: 16px;
          font-weight: 600;
        }
        .value-large {
          font-size: 20px;
          font-weight: 700;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          color: #6B7280;
          font-size: 12px;
          text-align: center;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <h1>Loan Report Details</h1>
      
      <div class="section">
        <div class="info-grid">
          <div class="field">
            <div class="label">Report ID</div>
            <div class="value">${loanData.reportId}</div>
          </div>
          <div class="field">
            <div class="label">Credit Officer</div>
            <div class="value">${loanData.creditOfficer}</div>
          </div>
          <div class="field">
            <div class="label">Branch</div>
            <div class="value">${loanData.branch}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Details</div>
        <div class="details-grid">
          <div class="field">
            <div class="label">Loans Disbursed</div>
            <div class="value value-large">${loanData.loansDispursed}</div>
          </div>
          <div class="field">
            <div class="label">Loans Value Disbursed</div>
            <div class="value value-large">${loanData.loansValueDispursed}</div>
          </div>
          <div class="field">
            <div class="label">Savings Collected</div>
            <div class="value value-large">${loanData.savingsCollected}</div>
          </div>
          <div class="field">
            <div class="label">Repayments Collected</div>
            <div class="value value-large">${loanData.repaymentsCollected}</div>
          </div>
          <div class="field">
            <div class="label">Date Sent</div>
            <div class="value">${loanData.dateSent}</div>
          </div>
          <div class="field">
            <div class="label">Time Sent</div>
            <div class="value">${loanData.timeSent}</div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        Generated on ${new Date().toLocaleString()} | Kaytop Loan Management System
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Export multiple reports to CSV
 */
export function exportReportsToCSV(reports: any[], filename: string = 'reports') {
  const headers = Object.keys(reports[0] || {});
  downloadCSV(reports, filename, headers);
}
