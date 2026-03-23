import type { GroupExpense } from "@/lib/types";

export type LedgerParticipant = {
  userId: string;
  displayName: string;
};

export type LedgerExpenseInput = {
  id: string;
  description: string;
  payerUserId: string;
  totalAmountPence: number;
  shares: Array<{
    userId: string;
    amountPence: number;
  }>;
};

export type NetPosition = {
  userId: string;
  displayName: string;
  netPence: number;
};

export type SettlementSuggestion = {
  fromUserId: string;
  fromDisplayName: string;
  toUserId: string;
  toDisplayName: string;
  amountPence: number;
};

export function buildEqualShares(expense: Pick<GroupExpense, "payer_user_id" | "total_amount_pence">, userIds: string[]) {
  const baseShare = Math.floor(expense.total_amount_pence / userIds.length);
  let remainder = expense.total_amount_pence - baseShare * userIds.length;

  return userIds.map((userId) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;

    return {
      userId,
      amountPence: baseShare + extra,
    };
  });
}

export function computeNetPositions(participants: LedgerParticipant[], expenses: LedgerExpenseInput[]): NetPosition[] {
  const map = new Map(participants.map((participant) => [participant.userId, { ...participant, netPence: 0 }]));

  expenses.forEach((expense) => {
    const payer = map.get(expense.payerUserId);
    if (payer) {
      payer.netPence += expense.totalAmountPence;
    }

    expense.shares.forEach((share) => {
      const participant = map.get(share.userId);
      if (participant) {
        participant.netPence -= share.amountPence;
      }
    });
  });

  return Array.from(map.values());
}

export function generateSettlementSuggestions(positions: NetPosition[]): SettlementSuggestion[] {
  const debtors = positions
    .filter((position) => position.netPence < 0)
    .map((position) => ({ ...position, remaining: Math.abs(position.netPence) }));
  const creditors = positions
    .filter((position) => position.netPence > 0)
    .map((position) => ({ ...position, remaining: position.netPence }));

  const suggestions: SettlementSuggestion[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountPence = Math.min(debtor.remaining, creditor.remaining);

    suggestions.push({
      fromUserId: debtor.userId,
      fromDisplayName: debtor.displayName,
      toUserId: creditor.userId,
      toDisplayName: creditor.displayName,
      amountPence,
    });

    debtor.remaining -= amountPence;
    creditor.remaining -= amountPence;

    if (debtor.remaining === 0) {
      debtorIndex += 1;
    }

    if (creditor.remaining === 0) {
      creditorIndex += 1;
    }
  }

  return suggestions;
}
