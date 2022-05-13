// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const { render } = require("express/lib/response");
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
    console.log("In edit:", selected.cust);
    res.render("edit", {type: "get", cust:selected.cust, message:""})  
  });
  
  // POST /edit/5
  app.post("/edit/:cusid", async (req, res) => {
    // const id = req.params.cusid;
    const customer = req.body;
    console.log("Inside Edit:", customer);
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
    
        console.log("edit post:", customer);
        res.render("edit", {
            type: "post",
            cust: customer,
            message: message
        });
    }
)

  // GET /delete/5
app.get("/delete/:cusid", async (req, res) => {
    const id = req.params.cusid;
    // const sql = "SELECT * FROM custmer WHERE custid = $1";
    // pool.query(sql, [id], (err, result) => {
    const selected = await dblib.selectCustomer(id)
      console.log("In delete get:", selected.message)
    res.render("delete", { type: "get", cust: selected.cust, message:"" });
    });
  
  
  // POST /delete/5
  app.post("/delete/:cusid", async (req, res) => {
    const id = req.params.cusid;
    // const sql = "DELETE FROM customer WHERE custid = $1";
    // pool.query(sql, [id], (err, result) => {
    //   // if (err) ...
    const result = await dblib.deleteCustomer(id)

    res.render("delete", {
        type: "post",
        cust: req.body,
        message: result
    })
})
  
  


////Get INPUT
app.get("/import", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    message = "";
    res.render("import", {type: "get", totRecs: totRecs.totRecords, message: message});
  });
  
app.post("/import",  upload.single('filename'), async(req, res) => {
    if(!req.file || Object.keys(req.file).length === 0) {
        message = "Error: Import file not uploaded";
        res.render("import", {type: "post", errors: message});
    }else{
        const totRecs = await dblib.getTotalRecords();
        //Read file line by line, inserting records
        const buffer = req.file.buffer; 
        const lines = buffer.toString().split(/\r?\n/);
        messages = [];
        i = 0;
        r = 0;
        for(line of lines){
         //console.log(line);
            customer = line.split(",");
            console.log(line);
            const lineinsert = await dblib.insertCustomer(customer);
            if (lineinsert.message === "success"){
                i += 1;
                console.log(lineinsert.desc, i);
            }else{
                r += 1;
                messages.push(lineinsert.desc)
                console.log(lineinsert.desc, r);
            }
        }
        res.render("import", {
            type : "post",
            totRecs: totRecs.totRecords, 
            inserted: i, 
            notinserted: r,
            processed: i+r, 
            errors: messages
        })
    }
    });

    
    //   .then(result => {
    //       message = `Processing Complete - Processed ${lines.length} records`,
    //         res.send(message)})
    //   .catch(err => {
    //       message = `Error: ${err.message}`;});



/////OUTPUT
app.get("/export", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    let message = "";
    res.render("export",{ totRecs: totRecs.totRecords, message: message });
   });


app.post("/export", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    const custlist = await dblib.exportCustomer();
    filename = req.body.filename
    if(custlist.message==="export succeeded"){
        console.log(custlist);
        var output = "";
        custlist.records.forEach(customer => {
            output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd}${customer.cussalesprev}\r\n`;
           });
        res.header("Content-Type", "text/csv");
        res.attachment(filename);
        res.send(output);
    }
    res.render("export", {
        message: custlist.message,
        totRecs: totRecs.totRecords
        })
});