const express = require('express');
const cors = require('cors');


const app = express();

// tack on middleware
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    res.send('Hello World!');
});

app.post('/login', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    email = req.body.email;
    password = req.body.password;
    console.log(email, password);
    res.status(200).send();
});

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});