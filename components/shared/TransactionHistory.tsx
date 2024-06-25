"use client";

import useSWR from "swr";
import { TransactionBar } from "./shared";

interface TransactionHistoryProps {
  renderAll?: boolean;
  specificIndex?: number;
}

export default function TransactionHistory({ renderAll = true, specificIndex = 0 }: TransactionHistoryProps) {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error, isLoading } = useSWR('/api/transactions/history', fetcher, { refreshInterval: 1000 });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading transactions.</div>;
  }

  if (data.history === false) {
    return <div>You have not performed any transactions yet.</div>;
  }

  const transactions = data?.history || [];

  if (!renderAll && transactions[specificIndex]) {
    const transaction = transactions[specificIndex];
    return (
      <TransactionBar
        type={transaction.transactionType}
        text={transaction.transaction}
      />
    );
  }

  return (
    <div>
      {transactions.map((transaction: any, index: any) => (
        <TransactionBar
          key={index}
          type={transaction.transactionType}
          text={transaction.transaction}
        />
      ))}
    </div>
  );
}
