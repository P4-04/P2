const express = require('express')
const app = express()
const path = require('path');

const port = 8080;

app.use("/modules", express.static('modules'))

app.get('/script.js', (req, res) => {
    res.sendFile("./script.js", { root: __dirname });
})

app.get('/', (req, res) => {
    res.sendFile("./site.html", { root: __dirname });
})
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
