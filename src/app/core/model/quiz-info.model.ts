export class QuizzInfo {
    date: Date;
    nextDate: Date;
    code: string;
    constructor(data: Partial<QuizzInfo> = {}) {
        this.date = data.date || null;
        this.nextDate = data.nextDate || null;
        this.code = data.code || '';
    }
}
