const db = require("../../config/db");

function find(filters, table) {
  let query = `SELECT * FROM ${table}`;

  if (filters) {
    Object.keys(filters).map((key) => {
      // WHERE | OR | AND
      query += ` ${key}`;

      Object.keys(filters[key]).map((field) => {
        query += ` ${field} = '${filters[key][field]}'`;
      });
    });
  }

  return db.query(query);
}

const Base = {
  init({ table }) {
    if (!table) {
      throw new Error("Invalid params");
    } else {
      this.table = table;

      return this;
    }
  },
  async find(id) {
    results = await find({ where: { id } }, this.table);
    return results.rows[0];
  },
  async findOne(filters) {
    results = await find(filters, this.table);
    return results.rows[0];
  },
  async findAll(filters) {
    results = await find(filters, this.table);
    return results.rows;
  },
  async create(fields) {
    try {
      let keys = [];
      let values = [];

      Object.keys(fields).map((key) => {
        keys.push(key);
        values.push(`'${fields[key]}'`);
      });

      const query = `INSERT INTO ${this.table} (${keys.join(",")})
                     VALUES (${values.join(",")})
                     RETURNING id`;

      const results = await db.query(query);
      return results.rows[0].id;
    } catch (err) {
      console.error(err);
    }
  },
  update(id, fields) {
    try {
      let update = [];

      Object.keys(fields).map((key) => {
        //category_id = ($1)
        const line = `${key} = '${fields[key]}'`;
        update.push(line);
      });

      const query = `UPDATE ${this.table} SET
                     ${update.join(",")} WHERE id = ${id}`;

      return db.query(query);
    } catch (err) {
      console.error(err);
    }
  },
  delete(id) {
    return db.query(`DELETE from ${this.table} WHERE id = ${id}`);
  },
};

module.exports = Base;
