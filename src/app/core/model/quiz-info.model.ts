export class QuizzInfo {
    date: Date;
    nextDate: Date;
    codes: Array<string>;
    disorderCodes: any[];

    constructor(data: Partial<QuizzInfo> = {}) {
        this.date = data.date || null;
        this.nextDate = data.nextDate || null;
        this.codes = data.codes || [];
        this.disorderCodes = data.disorderCodes || [];
    }
}
