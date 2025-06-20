
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const getAmountColor = (type: TransactionType, amount: number) => {
    if (type === TransactionType.BUY || type === TransactionType.WITHDRAW_FUNDS || (type === TransactionType.DELETE_ACTIVE_INVESTMENT && amount < 0) ) {
      return 'text-error'; // Costs, withdrawals are red
    }
    if (type === TransactionType.SELL || type === TransactionType.ADD_FUNDS || (type === TransactionType.DELETE_ACTIVE_INVESTMENT && amount >= 0)) {
      return 'text-success'; // Income, additions are green
    }
    return 'text-neutral';
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-neutral mb-4">Transaction History</h2>
        <p className="text-gray-500">No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-neutral mb-4">Transaction History Log</h2>
      <div className="overflow-x-auto shadow-md rounded-lg max-h-[500px] "> {/* Added max-h and overflow-y-auto */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (LKR)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{transaction.type}</td>
                <td className="px-4 py-3 text-sm text-gray-700 min-w-[300px]">{transaction.description}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${getAmountColor(transaction.type, transaction.amount)}`}>
                  {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TransactionHistory;
