export interface IAIService {
    summarizeText(text: string): Promise<string>
    expandText(text: string): Promise<string>
}