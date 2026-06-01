export type SortDirection = 'asc' | 'desc';

export type Scope = 'all' | 'system' | 'mine';

export enum Priority {
    Unconfigured = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    VeryHigh = 4,
    Critical = 5
}

export const PriorityLabels: Record<number, string> = {
    [Priority.Unconfigured]: 'Não Configurada',
    [Priority.Low]: 'Baixa',
    [Priority.Medium]: 'Média',
    [Priority.High]: 'Alta',
    [Priority.VeryHigh]: 'Muito Alta',
    [Priority.Critical]: 'Crítico'
};
