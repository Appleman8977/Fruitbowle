const basics = require('./basic_elements');

let Row = function (id, ...rows) {
    basics.BasicContainer.call(this, `tr`, ...rows);
    this.set_attr("id", id);
};
Row.prototype = Object.create(basics.BasicContainer.prototype);
Row.prototype.constructor = Row;


let Col = function (id, heading, ...content) {
    basics.BasicContainer.call(this, heading ? 'th' : 'td', ...content);
    this.set_attr("id", id);
};
Col.prototype = Object.create(basics.BasicContainer.prototype);
Col.prototype.constructor = Col;

module.exports.Table = function (id, data) {
    basics.BasicContainer.call(this, `table`);
    this.set_attr('id', id);
    this.id = id;
    this.first_row_title = false;
    if(data)
        this.set_data(data)
};
module.exports.Table.prototype = Object.create(basics.BasicContainer.prototype);
module.exports.Table.prototype.constructor = module.exports.Table;

module.exports.Table.prototype.set_data = function(data, first_row_title, per_row, per_col){
    this.columns = data[0].length;
    this.rows = data.length;
    if(first_row_title)
        this.first_row_title = true;
    this.contents = [];
    let first = this.first_row_title;
    let i = 0, j = 0;
    let table_id = this.id;
    let contents = this.contents;
    data.forEach(function(row){
        let cols = [];
        row.forEach(function(col_data){
            const newCol = new Col(`${table_id}_${i}_${j}`, first, ...col_data);
            cols.push(newCol);
            if(per_col)
                per_col(newCol, i, j);
            j++;
        });

        const newRow = new Row(`${table_id}_${i}`, ...cols);
        contents.push(newRow);
        if(per_row)
            per_row(newRow, i);
        first = false;
        i++;
        j=0;
    });
    return this;
};

