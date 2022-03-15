import { throwError } from 'rxjs';

export class Quizz {
    rows: Array<Row>;
    private _allChars: Array<string>;
    constructor(data: Partial<Quizz> = {}) {
        this.rows = data.rows;
    }

    setUserValue(value, rowInfo = {}, row) {
        this.cleanRow(row);
        [...value].forEach((char, index) => {
            this.rows[row].cells[index].value = char;
        });
        this.rows[row].info = new RowInfo(rowInfo);
    }

    finish(row) {
        this.rows[row].cells.forEach(cell => {
            cell.okayCheck = true;
            cell.discardCheck = false;
        });
    }

    cleanRow(row) {
        this.rows[row].cells.forEach( r => {
            r.value = '';
        });
    }

    clearCheck() {
        this.rows.forEach(row => {
            row.cells.forEach(val => {
                val.discardCheck = false;
                val.okayCheck = false;
            });
        });
    }
}

export class Row {
    cells: Array<Cell>;
    info: RowInfo;

    constructor(data: Partial<Row> = {}) {
        if(!data.info)  {
            throwError('Info cant be null');
        }
        const defualtValue = [
            new Cell({value: ''}),
            new Cell({value: ''}),
            new Cell({value: ''}),
            new Cell({value: ''}),
            new Cell({value: ''}),
            new Cell({value: ''}),
            new Cell({value: ''})
        ];
        this.cells = data.cells || defualtValue;
        this.info = data.info;
    }
}

export class Cell {
    value: string;
    okayCheck: boolean;
    discardCheck: boolean;

    constructor(data: Partial<Cell> = {}) {
        this.value = data.value;
        this.okayCheck = data.okayCheck || false;
        this.discardCheck = data.discardCheck || false;
    }
}

export class RowInfo {
    numCorrect: number;
    numPositionCorrect: number;

    constructor(data: Partial<RowInfo> = {}) {
        this.numCorrect = data.numCorrect ?? 0;
        this.numPositionCorrect = data.numPositionCorrect ?? 0;
    }
}
