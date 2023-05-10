const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { serialize, deserialize } = require('v8');
const port = 8080;


function loadDB() {
    db = fs.readFileSync("db.json")
    try {
        return JSON.parse(db);
    } catch (error) {
        return {};
    }
}

function saveInDB(data) {
    let design = JSON.stringify(data); 
    fs.writeFileSync("db.json", design)
}

app.use("/modules", express.static('modules'))
app.use(express.json({limit: "500kb"}));

app.get('/script.js', (req, res) => {
    res.sendFile("./script.js", { root: __dirname });
})

app.get('/', (req, res) => {
    res.sendFile("./site.html", { root: __dirname });
})
  
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})

app.post('/savedesign', (req, res) => {
    deserializedDesign = JSON.stringify(req.body);
    let db = loadDB();
    let id = Object.keys(db).length;
    db[id] = req.body;
    saveInDB(db);
})

app.get('/getdesign', (req, res) => {
    let db = loadDB()
    let design;
    Object.keys(db).forEach(id => {
        if (db[id].userCookie === req.headers.cookie && db[id].name === req.headers.name){
               design = db[id]; 
        }
    });
    res.send(JSON.stringify(design));
})

app.get('/getdesignnames', (req, res) => {
    let db = loadDB()
    let designs = []
    Object.keys(db).forEach(id => {
        if (db[id].userCookie === req.headers.cookie){
            designs.push(db[id])
        } 
    });
    res.send(JSON.stringify(designs))
})

app.delete('/removedesign', (req, res) => {
    let db = loadDB()
    Object.keys(db).forEach(id => {
        if (db[id].userCookie === req.headers.cookie && db[id].name === req.headers.name){
            delete db[id]; 
        }
    });
    saveInDB(db)
    res.send(200);
})