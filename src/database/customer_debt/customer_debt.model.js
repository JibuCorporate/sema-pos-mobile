export const CustomerDebtSchema = {
    name: 'CustomerDebt',
    properties: {
        id: { type: 'int', optional: true },
        customer_debt_id:  { type: 'string', optional: true },
        customer_account_id:  { type: 'string', optional: true },
        due_amount: { type: 'int', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        active: { type: 'bool', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};

export const CustomerDebtSyncDateSchema = {
    name: 'CustomerDebtSyncDate',
    properties: {
        lastCustomerDebtSync: 'date',
    }
};