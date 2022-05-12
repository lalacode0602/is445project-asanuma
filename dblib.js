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
    if (customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += ` AND cusid = $${i}`;
        i++;
    };
    if (customer.cusFname !== "") {
        params.push(`${customer.cusfname}%`);
        sql += ` AND UPPER(cusfname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cuslname !== "") {
        params.push(`${customer.cuslname}%`);
        sql += ` AND UPPER(cuslname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusstate !== "") {
        params.push(`${customer.cusstate}%`);
        sql += ` AND UPPER(cusstate) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cussalesytd !== "") {
        params.push(parseFloat(customer.cussalesytd));
        sql += ` AND cussalesytd >= $${i}`;
        i++;
    };
    if (customer.cussalesprev !== "") {
        params.push(parseFloat(customer.cussalesprev));
        sql += ` AND cussalesprev >= $${i}`;
        i++;
    };
  
    sql += ` ORDER BY cusid`;
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
    if (customer instanceof Array) {
        params = customer;
    } else {
        params = Object.values(customer);
    };
    const sql = "INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cusslesprev) VALUES ($1, $2, $3, $4, $5, $6)";
    return pool.query(sql, params)
        .then(result => {
            console.log("inserted");
            return { 
                message: "success",
                desc: `customer id ${params[0]} successfully inserted`
                //result: result.rows
            }
        })
        .catch(err => {
            return {
                message: "Error",
                desc: `Error on insert of product id ${params[0]}.  ${err.message}`
                //result: `Error: ${err.message}`
            }
    });
  }

const exportCustomer = (filename)=>{
    const sql = "SELECT * FROM customer ORDER BY cusid";
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

const selectCustomer = (id) => {
    const sql = "SELECT * FROM customer WHERE custId = $1";
    return pool.query(sql, [id])
        .then(result => {
            return{
                cust: result.rows[0],
                message: "success"
            }
        })
        .catch(err =>{
            return{
                cust:[],
                message: `Error- ${err.message}`
            }
        })
}

const editCustomer = (customer) => {
    const sql = "UPDATE customer SET cusfname = $2,  cuslname= $3, cusstate = $4, cussalesytd = $5, cussalesprev = $6 WHERE (cusid = $1)";
    return pool.query(sql, customer)
        .then(result => {
            return "success"
        })
        .catch(err => {
            return `Error -${err.message}`
        })
}



module.exports.findCustomer = findCustomer;
module.exports.getTotalRecords = getTotalRecords;
module.exports.insertCustomer = insertCustomer;
module.exports.exportCustomer = exportCustomer;
module.exports.editCustomer = editCustomer;
module.exports.selectCustomer = selectCustomer;