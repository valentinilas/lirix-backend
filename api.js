const sqlite3 = require('sqlite3');
const express = require("express");
var app = express();
var bodyParser = require('body-parser')
    // var cors = require('cors');

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// app.use(cors());

const HTTP_PORT = 8000;

app.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});



const dbCallback = (err) => {
    if (err) {
        console.error("Error opening database " + err);
    } else {
        console.log("Connected to the database.")
        db.run('CREATE TABLE IF NOT EXISTS lirix( \
            lirixId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            title NVARCHAR(20)  NOT NULL,\
            bodyText BLOB  NOT NULL,\
            authorId INTEGER  NOT NULL,\
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP\
        )', (err) => {
            if (err) {
                console.log("Table already exists. No new table has been created.");
            }

            // let insert = 'INSERT INTO lirix (title,bodyText,authorId) VALUES (?,?,?)';
            // db.run(insert, ["TestTitle", "TestBodyText", 1]);
            // db.run(insert, ["TestTitle2", "TestBodyText2", 2]);

        });

        db.run('CREATE TABLE IF NOT EXISTS authors (authorId INTEGER PRIMARY KEY, authorName NVARCHAR(20)  NOT NULL)', (err) => {
            if (err) {
                console.log(err);
            }
            // else {
            //     db.run('INSERT INTO authors (authorId, authorName) VALUES (?,?)', [0, "Vali"]);
            //     db.run('INSERT INTO authors (authorId, authorName) VALUES (?,?)', [1, "Cosmin"]);
            // }
        })
    }
}

// Returns a new Database object and automatically opens the database
const db = new sqlite3.Database('./lirix-data.db', dbCallback);





// GET
app.get("/api/:id", (req, res) => {
    var params = [req.params.id]
    db.get(`SELECT lirixId,title,bodyText,timestamp,authorName,authors.authorId FROM lirix INNER JOIN authors ON authors.authorId = lirix.authorId where lirixId = ?`, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        res.status(200).json(row);
    });
});
// SELECT lirixId,title,bodyText,timestamp,authorName,authorId FROM lirix INNER JOIN authors ON authors.authorId = lirix.authorId
app.get("/api/", (req, res) => {
    db.all("SELECT lirixId,title,bodyText,timestamp,authorName,authors.authorId FROM lirix INNER JOIN authors ON authors.authorId = lirix.authorId", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        console.log(rows);
        res.status(200).json({ rows });
    });
});

// SELECT a1, a2, b1, b2
// FROM A
// INNER JOIN B on B.f = A.f;

// POST
app.post("/api/", jsonParser, (req, res) => {
    var reqBody = req.body;
    console.log('reqBody', reqBody);
    db.run(`INSERT INTO lirix (title,bodyText,authorId) VALUES (?,?,?)`, [reqBody.title, reqBody.bodyText, reqBody.authorId],
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            setTimeout(function() {

                res.status(201).json({
                    "lirixId": this.lastID
                })
            }, 1000)

        });
});

// PUT
app.patch("/api/", jsonParser, (req, res) => {
    var reqBody = req.body;
    console.log(reqBody);
    db.run(`UPDATE lirix set title = ?, bodyText = ?, authorId = ? WHERE lirixId = ?`, [reqBody.title, reqBody.bodyText, reqBody.authorId, reqBody.lirixId],
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            setTimeout(function() {
                res.status(200).json({ updatedID: this.changes });
            }, 1000)
        });
});

// DELETE

app.delete("/api/:id", (req, res) => {
    db.run(`DELETE FROM lirix WHERE lirixId = ?`,
        req.params.id,
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            setTimeout(function() {
                res.status(200).json({ deletedID: this.changes })
            }, 1000)
        });
});