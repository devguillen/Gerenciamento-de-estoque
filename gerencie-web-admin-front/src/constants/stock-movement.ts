
export enum StockMovementType {
    PURCHASE = 'PURCHASE',
    CONSUMPTION = 'CONSUMPTION',
    ADJUSTMENT = 'ADJUSTMENT',
    LOSS = 'LOSS',
    EXPIRED = 'EXPIRED'
}

export const StockMovementLabel: Record<string, string> = {
    [StockMovementType.PURCHASE]: 'Compra',
    [StockMovementType.CONSUMPTION]: 'Consumo',
    [StockMovementType.ADJUSTMENT]: 'Ajuste',
    [StockMovementType.LOSS]: 'Perda',
    [StockMovementType.EXPIRED]: 'Vencido'
};

export function getStockMovementLabel(type: string | null): string {
    if (!type) return '-';
    return StockMovementLabel[type] || type;
}
