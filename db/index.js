const sqlite3 = require("sqlite3").verbose();


let db = new sqlite3.Database("./reports.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
  
  console.log("Connected to the reports database.");
});

const doesTableExist = (tableName) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
    db.get(query, [tableName], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        // If 'row' is defined, the table exists; otherwise, it doesn't.
        const tableExists = !!row;
        resolve(tableExists);
      }
    });
  });
};

const createTable = () => {
    db.serialize(() => {
        db.run(`CREATE TABLE report(id, start_date, end_date, type, email, status)`)
    })
}


const insertValue = async (id, startDate, endDate, type, email, status) => {
  const query = `INSERT INTO report(id, start_date, end_date, type, email, status)
                    VALUES (?,?,?,?,?,?)`;
  await db.run(query, [id, startDate, endDate, type, email, status], (err) => {
    if (err) return console.error(err.message);

    console.log("new row created!");
  });
};

const getAllReportsData = () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM report`;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
}

const updateReportStatus = (id, status) => {
    const data = [status, id]
    console.log('data',data);
    const query = `
            UPDATE report
            SET status = ?
            WHERE id = ?`;

    console.log("query", query);

    db.run(query, data, function (err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`row updated`);
    });
}

const deleteReportDetails = async(id) => {
    const data = [id];
    const query = `
            DELETE FROM report
            WHERE id = ?`;

    await db.run(query, data, function (err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`row deleted`);
    });
}

const closeConnection = () => {
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Close the database connection.");
    });
}

module.exports = {
  doesTableExist,
  createTable,
  insertValue,
  getAllReportsData,
  updateReportStatus,
  deleteReportDetails,
  closeConnection,
};
