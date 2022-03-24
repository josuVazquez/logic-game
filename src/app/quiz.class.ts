import { throwError } from 'rxjs';

export class Quizz {
    rows: Array<Row>;
    private _allChars: Array<string>;
    constructor(data: Partial<Quizz> = {}) {
        this.rows = data.rows;
    }

    setUserValue(value, row, rowInfo = {}) {
        this.cleanRow(row);
        [...value].forEach((char, index) => {
            this.rows[row].cells[index].value = char;
        });
        this.rows[row].info = new RowInfo(rowInfo);
    }

    rowCorrect(row) {
        return this.rows[row].info.numPositionCorrect === 7;
    }

    numCorrectRows() {
        return this.rows.filter( row => row.info.numPositionCorrect === 7);
    }

    cleanRow(row) {
        this.rows[row].cells.forEach( r => {
            r.value = '';
        });
    }

    setCheck(row, column, selected = false) {
        const value = this.rows[row].cells[column];
        value.selected = selected;
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
    selected: boolean;

    constructor(data: Partial<Cell> = {}) {
        this.value = data.value;
        this.selected = data.selected || false;
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
