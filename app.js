const express = require("express");
const mysql = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

//routes
app.get("/", async function (req, res) {
    let categories = await getCategories();
    let authors = await getAuthors();
    res.render("index", {"categories": categories, "authors": authors});
});//root

app.get("/quotes", async function (req, res) {
    let rows = await getQuotes(req.query);
    res.render("quotes", {"records": rows});
});//quotes

app.get("/authorInfo", async function (req, res) {
    let rows = await getAuthorInfo(req.query.authorId);
    res.render("quotes", {"authors": rows});
});//authorInfo

app.post('/quotes/add', function(req, res, next) {

    let conn = dbConnection();
    // Get a query string value for filter
    const nameFilter = req.query.name;

    conn.connect();

    conn.query(
        'INSERT INTO l9_quotes(authorId, quote, category) VALUES (?, ?, ?)',
        [req.body.authorId, req.body.quote, req.body.category], // assuming POST
        (error, results, fields) => {
            if (error) throw error;
            res.json({
                id: results.insertId
            });
        });

    conn.end();

});


function getAuthorInfo(authorId) {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT * 
                      FROM l9_author
                      WHERE authorId = ${authorId}`;
            console.log(sql);
            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getAuthorInfo

function getQuotes(query) {
    let keyword = query.keyword;
    let author = query.firstName;
    let name = author.split(' ');

    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");

            let params = [];
            let sql = `SELECT q.quote, a.firstName, a.lastName, q.category, a.authorId FROM l9_quotes q
                      NATURAL JOIN l9_author a
                      WHERE 
                      q.quote LIKE '%${keyword}%'`;

            if (query.category) { //user selected a category
                sql += " AND q.category = ?"; //To prevent SQL injection, SQL statement shouldn't have any quotes.
            }
            if (author) { //user selected an author
                sql += " AND a.firstName = ?"; //To prevent SQL injection, SQL statement shouldn't have any quotes.
            }
            if (query.sex) { //user selected the authors gender
                sql += " AND a.sex = ?"; //To prevent SQL injection, SQL statement shouldn't have any quotes.
            }
            params.push(query.category);
            params.push(name[0]);
            params.push(query.sex);

            console.log("SQL:", sql);
            console.log(params);

            conn.query(sql, params,function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getQuotes


function getCategories() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT DISTINCT category 
                      FROM l9_quotes
                      ORDER BY category`;

            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getCategories

function getAuthors() {
    let conn = dbConnection();

    return new Promise(function (resolve, reject) {
        conn.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT DISTINCT firstName, lastName 
                      FROM l9_author
                      ORDER BY firstName`;

            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });
        });//connect
    });//promise
}//getCategories

app.get("/dbTest", function (req, res) {
    let conn = dbConnection();

    conn.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");

        let sql = "SELECT * FROM l9_author WHERE sex = 'F'";

        conn.query(sql, function (err, rows, fields) {
            if (err) throw err;
            conn.end();
            res.send(rows);
        });
    });//connect
});//dbTest

function dbConnection() {
    let conn = mysql.createConnection({
        host: "p2d0untihotgr5f6.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
        user: "kqrrbws9y9oik2o0",
        password: "xjpcocg1ocp6u62t",
        database: "yuvrm41b3cz5fbx5"
    });//createConnection
    return conn;
}

// starting server
app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("Express server is running...");
});