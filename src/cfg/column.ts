import Table from './table';

export enum ColumnType {
    primary = 'primary',
    string = 'string',
    int = 'int',
    float = 'float',
    date = 'date',
    datetime = 'datetime',
    reference = 'reference'
}

export default class Column {

    constructor(table: Table, name: string, type: ColumnType, reference_target: string | undefined, display_name: string | undefined, reference_column_names: Record<string, string> | undefined, reference_main_column: string | undefined) {
        this.table = table;
        this.name = name;
        this.type = type;
        this.reference_target = reference_target;
        this.display_name = display_name;
        this.reference_column_names = reference_column_names;
        this.reference_main_column = reference_main_column;
    }

    public table: Table;
    public name!: string;
    public type!: ColumnType;
    public reference_target: string | undefined;
    public display_name: string | undefined;
    public reference_column_names: Record<string, string> | undefined;
    public reference_main_column: string | undefined;

    public getSqlType(not_null: boolean): string {
        switch(this.type) {
        case ColumnType.primary: return 'INT NOT NULL AUTO_INCREMENT';
        case ColumnType.string: return `TEXT${not_null ? ' NOT NULL' : ''}`;
        case ColumnType.int: return `INT${not_null ? ' NOT NULL' : ''}`;
        case ColumnType.float: return `FLOAT${not_null ? ' NOT NULL' : ''}`;
        case ColumnType.date: return `DATE${not_null ? ' NOT NULL' : ''}`;
        case ColumnType.datetime: return `DATETIME${not_null ? ' NOT NULL' : ''}`;
        case ColumnType.reference: return `INT${not_null ? ' NOT NULL' : ''}`;
        }
    }

}