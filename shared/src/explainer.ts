export type Severity = 'error' | 'warning' | 'info';

interface MultiLangExplanation {
    title: string;
    en: string;
    ja?: string;
    es?: string;
    fr?: string;
    de?: string;
    [key: string]: string | undefined;
}

interface ErrorPattern {
    id: string;
    tool: string;
    regex: string;
    severity: Severity;
    explanation: MultiLangExplanation & {
        causes: string[];
        fixes: string[];
    };
    learnMoreUrl?: string;
}

interface PatternsDB {
    version: string;
    lastUpdated: string;
    patterns: ErrorPattern[];
}

export interface Explanation {
    id: string;
    tool: string;
    severity: Severity;
    title: string;
    problem: string;
    causes: string[];
    fixes: string[];
    learnMoreUrl?: string;
}
