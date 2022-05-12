// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();



// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("index");
});

// search route
app.get("/manage", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    //Create an empty product object (To populate form with values)
    const cust = {
        cusId: "",
        cusFname: "",
        cusLname: "",
        cusState: "",
        cusSalesYTD: "",
        cusSalesPrev: ""
    };
    res.render("manage", {
        type: "get",
        totRecs: totRecs.totRecords,
        cust: cust
    });
  });

// Post search
app.post("/manage", async (req, res) => {
      console.log("dblib.findCustomer req.body is:", req.body)
    // Omitted validation check
    //  Can get this from the page rather than using another DB call.
    //  Add it as a hidden form value.
    const totRecs = await dblib.getTotalRecords();
  
    dblib.findCustomer(req.body)
        .then(result => {
            console.log("dblib.findCustomer result is:", result);
            res.render("manage", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: result,
                cust: req.body
            })
        })
        .catch(err => {
            res.render("manage", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: `Unexpected Error: ${err.message}`,
                cust: req.body
            });
        });
  });

// GET /create
app.get("/create", (req, res) => {
    // const cust = await dblib.cust();
    const cust = {
        cusId: "",
        cusFname: "",
        cusLname: "",
        cusState: "",
        cusSalesYTD: "",
        cusSalesPrev: ""
    };
    res.render("create", {type: "get",  
    cust: cust,
    message: ""});
  });

  // POST /create
app.post("/create", (req, res) => {
    // const cust = await dblib.cust(req.body);
    // const sql = "INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cusslesprev) VALUES ($1, $2, $3, $4, $5, $6)";
    const customer = req.body;
    dblib.insertCustomer(customer)
        .then(result => {
            res.render("create", {
                type: "post",
                cust: customer,
                message: message
            })
        })
        .catch(err => {
            res.render("create", {
                type: "post",
                cust: customer,
                message: `Error - ${err.message}`
            })
        })
    // pool.query(sql, customer, (err, result) => {
    //   if (err){
    //   res.render("create", {
    //     type: "post",  
    //     cust: req.body,
    //     message: `Error - ${err}`
    //   });}else{
    //       res.render("create", {
    //           type: "post",
    //           cust: req.body,
    //           message: "success"
    //       })
    //   };
    //});
  });


  // GET /edit/5
app.get("/edit/:cusid", async (req, res) => {
    const id = req.params.cusid;   
    // const sql = "SELECT * FROM customer WHERE custId = $1";
    // pool.query(sql, [id], (err, result) => {
    //   // if (err) ...
    //   res.render("edit", { cust: result.rows[0] });
    // });
    const selected = await dblib.selectCustomer(id)
    res.render("edit", {type: "get", cust:selected.cust, message:""})  
  });
  
  // POST /edit/5
  app.post("/edit/:cusid", async (req, res) => {
    // const id = req.params.cusid;
    const customer = req.body;
    console.log(customer);
    const message = await dblib.editCustomer(customer)
    // const sql = "UPDATE customer SET cusFname = $2,  cusLname= $3, cusState = $4, cusSalesYTD = $5, cusSalesPrev = $6 WHERE (cusId = $1)";
    // pool.query(sql, customer, (err, result) => {
    //   // if (err) ...
    //   if (err){
    //     res.render("create", {
    //       type: "post",  
    //       cust: req.body,
    //       message: `Error - ${err}`
    //     });}else{
    //         res.render("create", {
    //             type: "post",
    //             cust: req.body,
    //             message: "success"
    //         })
    //     };
    // });
    .then(result => {
        res.render("edit", {
            type: "post",
            cust: customer,
            message: message
        })
    })
    .catch(err => {
        res.render("edit", {
            type: "post",
            cust: customer,
            message: `Error - ${err.message}`
        })
    })
  });

  // GET /delete/5
app.get("/delete/:cusid", (req, res) => {
    const id = req.params.cusid;
    const sql = "SELECT * FROM custmer WHERE custid = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("delete", { cust: result.rows[0] });
    });
  });
  
  // POST /delete/5
  app.post("/delete/:cusid", (req, res) => {
    const id = req.params.cusid;
    const sql = "DELETE FROM customer WHERE custid = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      if (err){
        res.render("create", {
          type: "post",  
          cust: req.body,
          message: `Error - ${err}`
        });}else{
            res.render("create", {
                type: "post",
                cust: req.body,
                message: "success"
            })
        };
    });
  });


////Get INPUT
app.get("/import", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    message = "";
    res.render("import", {totRecs: totRecs.totRecords, message: message});
  });
  
app.post("/import",  upload.single('filename'), (req, res) => {
    if(!req.file || Object.keys(req.file).length === 0) {
        message = "Error: Import file not uploaded";
        return res.send(message);
    };
    //Read file line by line, inserting records
    const buffer = req.file.buffer; 
    const lines = buffer.toString().split(/\r?\n/);
  
    lines.forEach(line => {
        //console.log(line);
        customer = line.split(",");
        console.log(line);
        // const sql = "INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cusslesprev) VALUES ($1, $2, $3, $4, $5, $6)";
        // pool.query(sql, customer, (err, result) => {
        //     if (err) {
        //         console.log(`Insert Error.  Error message: ${err.message}`);
        //     } else {
        //         console.log(`Inserted successfully`);
        //     }
        // });
        const lineinsert = dblib.insertCustomer(customer);
        console.log(lineinsert.desc);
    })
      .then(result => {
          message = `Processing Complete - Processed ${lines.length} records`,
            res.send(message)})
      .catch(err => {
          message = `Error: ${err.message}`;});
});


/////OUTPUT
app.get("/export", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    let message = "";
    res.render("export",{ totRecs: totRecs.totRecords, message: message });
   });

   
app.post("/export", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    filename = req.body;
    dblib.exportCustomer(filename)
        .then(result => {
            res.render("export", {
                message: message,
                totRecs: totRecs.totRecords
            })
        })
        .catch(err =>{
            res.render("export", {
                message: message,
                totRecs: totRecs.totRecords
            })
        })
});