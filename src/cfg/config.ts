import Column from './column';
import ConnectionSettings from './connection_settings';
import Table from './table';

export default class Config {

    public connection_settings!: ConnectionSettings;

    public page_title!: string;

    public delete_text!: string;
    
    public edit_text!: string;

    public submit_text!: string;
    
    public tables: Table[] = [];

    public static fromJson(config: Config): Config {
        const newConfig = new Config();
        newConfig.page_title = config.page_title;
        newConfig.delete_text = config.delete_text;
        newConfig.edit_text = config.edit_text;
        newConfig.submit_text = config.submit_text;
        newConfig.connection_settings = new ConnectionSettings(
            config.connection_settings.host,
            config.connection_settings.username,
            config.connection_settings.password,
            config.connection_settings.database);
        newConfig.tables = config.tables.map(table => 
            new Table(table.name, table.primary_key, table.columns.map(column => 
                new Column(table, column.name, column.type, column.reference_target, column.display_name, column.reference_column_names, column.reference_main_column)
            ), table.display_name, table.insert_text)
        );
        return newConfig;
    }

}