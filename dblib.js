// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customer";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};


const findCustomer = (customer) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection
  
    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";
  
    // Check data provided and build query as necessary
    if (customer.cusId !== "") {
        params.push(parseInt(customer.cusId));
        sql += ` AND cusId = $${i}`;
        i++;
    };
    if (customer.cusFname !== "") {
        params.push(`${customer.cusFname}%`);
        sql += ` AND UPPER(cusFname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusLname !== "") {
        params.push(`${customer.cusLname}%`);
        sql += ` AND UPPER(cusLname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusState !== "") {
        params.push(`${customer.cusState}%`);
        sql += ` AND UPPER(cusState) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusSalesYTD !== "") {
        params.push(parseFloat(customer.cusSalesYTD));
        sql += ` AND cusSalesYTD >= $${i}`;
        i++;
    };
    if (customer.cusSalesPrev !== "") {
        params.push(parseFloat(customer.cusSalesPrev));
        sql += ` AND cusSalesPrev >= $${i}`;
        i++;
    };
  
    sql += ` ORDER BY cusId`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);
  
    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
  };


  
//   module.exports = class cust {
//     constructor(cusId, cusFname, cusLname, cusSate, cusSalesYTD, cusSalesPrev){
//     this.cusId = cusId ,
//     this.cusFname = cusFname,
//     this.cusLname = cusLname,
//     this.cusState = cusState,
//     this.cusSalesYTD = cusSalesYTD,
//     this.cusSalesPrev = cusSalesPrev}
//};
  // Add towards the bottom of the page


  const insertCustomer = (customer) => {
    const sql = "INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cusslesprev) VALUES ($1, $2, $3, $4, $5, $6)";
    return pool.query(sql, customer)
        .then(result => {
            console.log("inserted");
            return { 
                message: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                message: "Error",
                result: `Error: ${err.message}`
            }
    });
  }

const exportCustomer = (filename)=>{
    const sql = "SELECT * FROM customer ORDER BY custId";
    pool.query(sql, [], (err, result) => {
        var message = "";
        if(err) {
            message = `Error - ${err.message}`;
            res.render("export", { message: message })
        } else {
            var output = "";
            result.rows.forEach(customer => {
                output += `${customer.custId},${customer.cusFname},${customer.cusLname},${customer.cusState},${customer.cusSalesYTD}${customer.cusSalesPrev}\r\n`;
               });
            res.header("Content-Type", "text/csv");
            res.attachment("filename");
            return res.send(output), message;
        };
    });
}

module.exports.findCustomer = findCustomer;
module.exports.getTotalRecords = getTotalRecords;
module.exports.insertCustomer = insertCustomer;
module.exports.exportCustomer = exportCustomer