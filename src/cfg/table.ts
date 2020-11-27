import Column from './column';

export default class Table {

    constructor(name: string, primary_key: string, columns: Column[], display_name: string | undefined, insert_text: string) {
        this.name = name;
        this.primary_key = primary_key;
        this.columns = columns;
        this.display_name = display_name;
        this.insert_text = insert_text;
    }

    public name!: string;

    public primary_key!: string;

    public insert_text!: string;

    public display_name: string | undefined;

    public columns!: Column[];

}
