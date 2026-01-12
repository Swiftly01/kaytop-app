// export const calculateLoan = ({
//   amount,
//   interestRate,
//   durationDays,
// }: {
//   amount: number;
//   interestRate: number;
//   durationDays: number;
// }) => {
//   const interest = (amount * interestRate) / 100;
//   const total = amount + interest;
//   const monthly = total / (durationDays / 30);

//   return {
//     interest,
//     total,
//     monthly: Math.round(monthly),
//   };
// };

export function calculateLoan({
  amount,
  interestRate,
  durationDays,
}: {
  amount: number;
  interestRate: number;
  durationDays: number;
}) {
  const interest = (amount * interestRate) / 100;
  const totalRepayment = amount + interest;
  const monthlyPayment = totalRepayment / (durationDays / 30);

  return {
    interest,
    totalRepayment: Math.round(totalRepayment),
    monthlyPayment: Math.round(monthlyPayment),
  };
}
