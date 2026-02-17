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

export class Explainer {
    private patterns: ErrorPattern[] = [];
    private targetLang: string = 'en';

    constructor(targetLang: string = 'en') {
        this.targetLang = targetLang;
        this.loadPatterns();
    }

    private loadPatterns() {}

    private getLocalizedText(explanation: MultiLangExplanation): string {
        return "";
    }

    public explain(text: string): Explanation | null {
        for (const pattern of this.patterns) {
            const regex = new RegExp(pattern.regex, 'is');
            const match = text.match(regex);

            if (match) {
                let problemText = this.getLocalizedText(pattern.explanation);
                let title = pattern.explanation.title;

                match.slice(1).forEach((group, index) => {
                    const placeholder = new RegExp(`\\{${index + 1}\\}`, 'g');
                    problemText = problemText.replace(placeholder, group || '');
                    title = title.replace(placeholder, group || '');
                });

                const explanation: Explanation = {
                    id: pattern.id,
                    tool: pattern.tool,
                    severity: pattern.severity,
                    title: title,
                    problem: problemText,
                    causes: pattern.explanation.causes || [],
                    fixes: pattern.explanation.fixes || [],
                };

                if (pattern.learnMoreUrl) {
                    explanation.learnMoreUrl = pattern.learnMoreUrl;
                }

                return explanation;
            }
        }
        return null;
    }
}