"use server";

import connectToDB from "@/server/model/database";
import getSession from "../server-hooks/getsession.action";
import Transaction, { TransactionType } from "@/server/schemas/transaction";

// Define the return type for better type checking
interface TransactionDetails {
    transactionType: string;
    transaction: string;
}

export async function getTransactionHistory(): Promise<TransactionDetails[] | false> {
    try {
        // Ensure the database connection is established
        await connectToDB();

        // Get the current user session
        const session = await getSession();
        if (!session || !session.userId) {
            throw new Error("User is not authenticated");
        }

        // Get the user ID from the session
        const userId = session.userId;

        // Query the transaction collection for the first 5 transactions of this user
        const transactions = await Transaction.find({
            $or: [{ sender: userId }, { receiver: userId }],
        })
            .sort({ timestamp: -1 }) // Sort by the most recent transactions
            .limit(5); // Adjusted to limit to 5 transactions

        // Check if there are no transactions
        if (transactions.length === 0) {
            return false;
        }

        // Format the transactions into the required statements
        const formattedTransactions: TransactionDetails[] = transactions.map((transaction) => {
            const { type, amount, sender, receiver, timestamp } = transaction;
            const date = new Date(timestamp).toLocaleDateString();
            let transactionStatement = "";

            if (type === TransactionType.SENT) {
                const receiverUser = typeof receiver === 'string' ? receiver : (receiver as any)?.email || "unknown user";
                transactionStatement = `Sent $${amount.toFixed(2)} to ${receiverUser} at ${date}`;
            } else if (type === TransactionType.RECEIVED) {
                const senderUser = typeof sender === 'string' ? sender : (sender as any)?.email || "unknown user";
                transactionStatement = `Received $${amount.toFixed(2)} from ${senderUser} at ${date}`;
            }

            return {
                transactionType: type,
                transaction: transactionStatement,
            };
        });

        return formattedTransactions;
    } catch (error) {
        console.error("Error fetching user transactions:", error);
        throw new Error("Unable to fetch transactions. Please try again later.");
    }
}
