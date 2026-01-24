export function exportLoanDetailsToCSV(loanData: any): void {
  // Simple CSV export functionality
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Field,Value\n"
    + `Loan ID,${loanData.id || ''}\n`
    + `Customer,${loanData.customerName || ''}\n`
    + `Amount,${loanData.amount || ''}\n`
    + `Status,${loanData.status || ''}\n`;
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `loan_${loanData.id || 'details'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printLoanDetails(loanData: any): void {
  // Simple print functionality
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Loan Details</title></head>
        <body>
          <h1>Loan Details</h1>
          <p><strong>Loan ID:</strong> ${loanData.id || ''}</p>
          <p><strong>Customer:</strong> ${loanData.customerName || ''}</p>
          <p><strong>Amount:</strong> ${loanData.amount || ''}</p>
          <p><strong>Status:</strong> ${loanData.status || ''}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}