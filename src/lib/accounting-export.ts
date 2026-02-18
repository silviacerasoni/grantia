export interface AccountingRecord {
    record_id: string;
    transaction_date: string;
    description: string;
    category_code: string;
    amounts: {
        gross: number;
        net: number;
        vat: number;
        vat_rate: number;
        currency: string;
    };
    payment: {
        status: string;
        reconciled: boolean;
    };
}

export interface AccountingExport {
    export_meta: {
        generated_at: string;
        system: string;
        version: string;
    };
    data: AccountingRecord[];
}

/**
 * Formats a list of expenses into a standardized JSON structure 
 * suitable for import into external accounting software (e.g., SAP, Fattura24).
 */
export function exportExpensesToAccountingFormat(expenses: any[]): AccountingExport {
    const records: AccountingRecord[] = expenses.map(expense => {
        // Calculate missing values if not present (backward compatibility)
        const gross = Number(expense.amount) || 0;
        const rate = Number(expense.vat_rate) || 22; // Default to 22 if missing

        // If net/vat are not stored, calculate them on the fly
        const net = expense.net_amount ? Number(expense.net_amount) : gross / (1 + rate / 100);
        const vat = expense.vat_amount ? Number(expense.vat_amount) : gross - net;

        return {
            record_id: expense.id,
            transaction_date: expense.date,
            description: expense.description,
            category_code: mapCategoryToCode(expense.category),
            amounts: {
                gross: Number(gross.toFixed(2)),
                net: Number(net.toFixed(2)),
                vat: Number(vat.toFixed(2)),
                vat_rate: rate,
                currency: expense.currency || 'EUR'
            },
            payment: {
                status: expense.paymentStatus || 'pending_payment',
                reconciled: expense.paymentStatus === 'reconciled'
            }
        };
    });

    return {
        export_meta: {
            generated_at: new Date().toISOString(),
            system: "Grantia Project Management",
            version: "1.0"
        },
        data: records
    };
}

// Helper to map human categories to accounting codes
function mapCategoryToCode(category: string): string {
    const map: Record<string, string> = {
        'Travel': 'ACC-6001',
        'Equipment': 'ACC-2005',
        'Personnel': 'ACC-1001',
        'Subcontracting': 'ACC-3001',
        'Other': 'ACC-9999'
    };
    return map[category] || 'ACC-0000';
}
