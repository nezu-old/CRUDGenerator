export default class ConnectionSettings {

    constructor(host: string, username: string, password: string, database: string) {
        this.host = host;
        this.username = username;
        this.password = password;
        this.database = database;
    }

    public host!: string;
    public username!: string;
    public password!: string;
    public database!: string;

}