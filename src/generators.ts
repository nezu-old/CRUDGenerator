import Column, { ColumnType } from './cfg/column';
import Config from './cfg/config';
import ConnectionSettings from './cfg/connection_settings';
import Table from './cfg/table';
import Constants from './constants';

export function generateComment(style: 'HTML' | 'PHP' | 'SQL'): string {
    let base = 
'##########################################################\n\
##                                                      ##\n\
##    THIS FILE WAS GENERATED USING A CRUD GENERATOR    ##\n\
##                                                      ##\n\
##    the purpose of this generator is to prove that    ##\n\
##                 the tasks we get on                  ##\n\
##          "4GT administracja bazami danych"           ##\n\
##      are so repetitive and boring that making a      ##\n\
##  generator is more optimal than actually doing them  ##\n\
##                                                      ##\n\
##             For more information visit               ##\n\
##       https://github.com/dumbasPL/CRUDGenerator      ##\n\
##                                                      ##\n\
##########################################################';
    switch(style) {
    case 'HTML': base = `<!--\n${base}\n-->`; break;
    case 'PHP': base = `/*\n${base}\n*/`; break;
    case 'SQL': base = base.replace(/^/gm, '-- '); break;
    }
    return base + '\n';
}

export function generateDocument(config: Config, comment = true): string {
    return (comment ? generateComment('HTML') : '') + `<?php
${generateDBConnection(config.connection_settings)}
$${Constants.edit_var_name} = null;
${config.tables.map(table => generatePhpSection(table)).join('')}
//tables referenced by other tables
${config.tables.filter(table => config.tables.filter(t => t.columns.map(col => 
        col.reference_target?.split('.')[0]).filter(t => table.name == t).length > 0).length > 0).map(table => generateSelectQuery(table, true)).join('\n')}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.page_title}</title>
    <style>
    td, th {
        border: 1px solid black;
        padding: 10px;
    }
    table {
        border-collapse: collapse;
    }
    input, select, textarea {
        margin: 5px;
    }
    </style>
</head>
<body>
<?php if($${Constants.edit_var_name} == null) { ?>
${config.tables.map(table => generateHtmlTable(table, config)).join('\n<hr>\n').replace(/^/gm, '    ')}
<?php } else { ?>
${config.tables.map(table => generateEditForm(table, config)).join('\n').replace(/^/gm, '    ')}
<?php } ?>
</body>
</html>`;
}

function generatePhpSection(table: Table): string {
    return `if(($_GET["${Constants.section_selector_paramter_name}"] ?? "") == "${table.name}"){
    $action = $_GET["${Constants.action_type_paramter_name}"] ?? "";
    if($action == "delete") {
        ${generateDeleteQuery(table.name, table.primary_key, 'GET')}
        header('Location: '.$_SERVER['PHP_SELF']);
        die();
    } else if($action == "insert") {
        ${generateInsertQuery(table, 'POST')}
        header('Location: '.$_SERVER['PHP_SELF']);
        die();
    } else if($action == "update") {
        ${generateUpdateQuery(table, 'POST')}
        header('Location: '.$_SERVER['PHP_SELF']);
        die();
    } else if($action == "edit") {
        ${generateEditQuery(table, 'GET')}
    } else if($action == "add") {
        $${Constants.edit_var_name} = -1;
    }
}
${generateSelectQuery(table, false)}\n`;
}

function generateHtmlTable(table: Table, config: Config): string {
    const cols = new Map<string, string>();
    table.columns.forEach(col => {
        if(col.type == ColumnType.reference && col.reference_column_names) {
            const foreign_table = col.reference_target?.split('.')[0];
            if(foreign_table) {
                for (const k in col.reference_column_names) {
                    cols.set(foreign_table + '_' + k, col.reference_column_names[k]);
                }
            }
        } else if(col.display_name) {
            cols.set(col.name, col.display_name);
        }
    });
    return `${table.display_name ? `<h1>${table.display_name}</h1>\n` : ''}<table>
    <tr>${Array.from(cols.values(), display_name => `<th>${display_name}</th>`).join('')}<th>akcje</th></tr>
    <?php while($row = $${table.name}_select->fetch_assoc()): ?>
    <tr>
        ${Array.from(cols.keys(), name => `<td><?= $row["${name}"] ?></td>`).join('')}
        <td>
            <a href="?${Constants.action_type_paramter_name}=delete&${Constants.section_selector_paramter_name}=${table.name}&${table.primary_key}=<?= $row["${table.primary_key}"] ?>">${config.delete_text}</a>
            <a href="?${Constants.action_type_paramter_name}=edit&${Constants.section_selector_paramter_name}=${table.name}&${table.primary_key}=<?= $row["${table.primary_key}"] ?>">${config.edit_text}</a>
        </td>
    </tr>
    <?php endwhile; ?>
</table>
<a href="?${Constants.action_type_paramter_name}=add&${Constants.section_selector_paramter_name}=${table.name}">${table.insert_text}</a>`;
}

function generateEditForm(table: Table, config: Config): string {
    return `<?php if($_GET["${Constants.section_selector_paramter_name}"] == "${table.name}") { ?>
    <form method="POST" action="?${Constants.action_type_paramter_name}=<?= $${Constants.edit_var_name} === -1 ? "insert" : "update" ?>&${Constants.section_selector_paramter_name}=${table.name}">
        ${table.columns.map(col => generateInput(col)).join('\n        ')}
        <input type="submit" value="${config.submit_text}" />
    </form>
<?php } ?>`;
}

function generateInput(column: Column): string {
    const id = `${column.table.name}_${column.name}`; 
    let out = `<label for="${id}">${column.display_name}</label>`;
    switch (column.type) {
    case ColumnType.primary: out = `<input type="hidden" name="${column.name}" value="<?= $${Constants.edit_var_name} === -1 ? -1 : $${Constants.edit_var_name}["${column.name}"] ?>" />`; break;
    case ColumnType.string: out += `<input type="text" name="${column.name}" id="${id}" value="<?= $${Constants.edit_var_name} === -1 ? "" : $${Constants.edit_var_name}["${column.name}"] ?>" />`; break;
    case ColumnType.int: out += `<input type="number" name="${column.name}" id="${id}" value="<?= $${Constants.edit_var_name} === -1 ? "" : $${Constants.edit_var_name}["${column.name}"] ?>" />`; break;
    case ColumnType.float: out += `<input type="number" name="${column.name}" id="${id}" value="<?= $${Constants.edit_var_name} === -1 ? "" : $${Constants.edit_var_name}["${column.name}"] ?>" step="any" />`; break;
    case ColumnType.date: out += `<input type="date" name="${column.name}" id="${id}" value="<?= $${Constants.edit_var_name} === -1 ? "" : $${Constants.edit_var_name}["${column.name}"] ?>"/>`; break;
    case ColumnType.datetime: out += `<input type="date" name="${column.name}_date" id="${id}" value="<?= $${Constants.edit_var_name} === -1 ? "" : explode(" ", $${Constants.edit_var_name}["${column.name}"])[0] ?>"/>` + 
        `<input type="time" name="${column.name}_time" id="${id}_time" value="<?= $${Constants.edit_var_name} === -1 ? "" : substr(explode(" ", $${Constants.edit_var_name}["${column.name}"])[1], 0, 5) ?>"/>`; break;
    case ColumnType.reference: out += `<select name="${column.name}" id="${id}">${ column.reference_target && column.reference_main_column ? '<?php ' +
        `while($row_${column.reference_target.split('.')[0]} = $${column.reference_target.split('.')[0]}_values->fetch_assoc()) { ?>` +
            `<option value="<?= $row_${column.reference_target.split('.')[0]}["${column.reference_target.split('.')[1]}"] ?>"` + 
            `<?= $row_${column.reference_target.split('.')[0]}["${column.reference_target.split('.')[1]}"] == ($${Constants.edit_var_name} === -1 ? "" : $${Constants.edit_var_name}["${column.name}"]) ? " selected" : "" ?>>` +
            `<?= $row_${column.reference_target.split('.')[0]}["${column.reference_main_column}"] ?></option><?php } ?>` : ''}</select>`; break;
    default: out = '<b>invalid input type!</b>'; break;
    }
    return out.trim().length > 0 ? out + '<br>' : '';
}

// SQL generators

class Join {

    constructor(
        private table: string,
        private column: string,
        private foreign_table: string,
        private foreign_column: string,
    ) {}
 
    public generateJoin(join_type: '' | 'INNER' | 'LEFT' | 'LEFT OUTER' | 'RIGHT' | 'RIGHT OUTER' | 'FULL' | 'FULL OUTER'): string {
        return `${join_type} JOIN \`${this.foreign_table}\` ON \`${this.foreign_table}\`.\`${this.foreign_column}\` = \`${this.table}\`.\`${this.column}\``;
    }

}

function toSqlValue(column: Column, method: 'GET' | 'POST', quote: '"' | '\''): string {
    if(column.type == ColumnType.primary) {
        return 'NULL';
    }
    const final_quote = column.type == ColumnType.string || column.type == ColumnType.date || column.type == ColumnType.datetime ? (quote == '"' ? '\\' : '') + '"': '';
    const final_value = column.type != ColumnType.datetime ? `$_${method}["${column.name}"]` : 
        `($_${method}["${column.name}_date"]." ".$_${method}["${column.name}_time"].":00")`;
    return `${final_quote}${quote}.${final_value}.${quote}${final_quote}`;
}

function generateSelectors(column: Column, skip_joins: boolean): string {
    let out = `\`${column.table.name}\`.\`${column.name}\``;
    if(!skip_joins && column.type == ColumnType.reference && column.reference_column_names && column.reference_target) {
        const foreign_table = column.reference_target.split('.')[0];
        for (const name in column.reference_column_names) {
            out += `, \`${foreign_table}\`.\`${name}\` as \`${foreign_table}_${name}\``;
        }
    }
    return out;
}

export function generateDBConnection(settings: ConnectionSettings): string {
    return `$${Constants.db_connection_var_name} = new mysqli("${settings.host}", "${settings.username}", "${settings.password}", "${settings.database}");\n` + 
        `$${Constants.db_connection_var_name}->set_charset("utf8");\n`;
}

export function generateDeleteQuery(table_name: string, column_name: string, method: 'GET' | 'POST'): string {
    return `$${Constants.db_connection_var_name}->query('DELETE FROM \`${table_name}\` WHERE \`${column_name}\` = ' . $_${method}["${column_name}"]);`;
}

export function generateInsertQuery(table: Table, method: 'GET' | 'POST'): string {
    return `$${Constants.db_connection_var_name}->query('INSERT INTO \`${table.name}\`(${table.columns.map(column => '`' + column.name + '`').join(', ')}) ` +
        `VALUES (${table.columns.map(column => toSqlValue(column, method, '\'')).join(', ')})');`;
}

export function generateUpdateQuery(table: Table, method: 'GET' | 'POST'): string {
    return `$${Constants.db_connection_var_name}->query('UPDATE \`${table.name}\` ` +
        `SET ${table.columns.filter(column => column.name != table.primary_key).map(column => '`' + column.name + '` = ' + toSqlValue(column, method, '\'')).join(', ')} ` +
        `WHERE ${table.primary_key} = ' . $_${method}["${table.primary_key}"]);`;
}

export function generateSelectQuery(table: Table, skip_joins: boolean): string {
    const joins: Join[] = skip_joins ? [] : table.columns.filter(col => col.type == ColumnType.reference).map(col => {
        const split = col.reference_target?.split('.');
        return new Join(table.name, col.name, split ? split[0] : 'Error', split ? split[1] : 'Error');
    });
    return `$${table.name}_${skip_joins ? 'values' : 'select'} = $${Constants.db_connection_var_name}->query('SELECT ${table.columns.map(col => generateSelectors(col, skip_joins)).join(', ')} `+ 
        `FROM \`${table.name}\`${joins.length > 0 ? ' ' : ''}${joins.map(join => join.generateJoin('LEFT')).join(' ')}');`;
}

export function generateEditQuery(table: Table, method: 'GET' | 'POST'): string {
    return `$${Constants.edit_var_name} = $${Constants.db_connection_var_name}->query('SELECT * FROM \`${table.name}\` WHERE \`${table.primary_key}\` = '.$_${method}["${table.primary_key}"])->fetch_assoc();`;
}

export function generateDatabase(config: Config, comment = true): string {
    let out = comment ? generateComment('SQL') : '';
    out += 'START TRANSACTION;\n';
    out += `CREATE DATABASE \`${config.connection_settings.database}\`;\n`;
    config.tables.forEach(table => {
        out += `CREATE TABLE \`${table.name}\` ( ${table.columns.map(col => `\`${col.name}\` ${col.getSqlType(true)}`).join(', ') }, PRIMARY KEY (\`${table.primary_key}\`) ) ENGINE = InnoDB;\n`;
    });
    out += 'COMMIT;';
    return out;
}