export const ReceiptPaymentTypeSchema = {
    name: 'ReceiptPaymentType',
    properties: {
        id: { type: 'int', optional: true },
        receipt_id:  { type: 'string', optional: true },
        payment_type_id: { type: 'int', optional: true },
        amount: { type: 'int', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};