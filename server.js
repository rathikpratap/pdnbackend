require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json());
app.use(cors({
    origin: 'https://www.creator.admixmedia.in',
    credentials:true
}));
// app.use(cors({
//     origin: 'http://localhost:4200',
//     credentials: true
// }));

require('./config');

const port = process.env.PORT || 3000;

const authRoute = require('./auth-route');
app.use('/creator/auth',authRoute);
//app.use('/auth',authRoute);

app.get('/',(req,res)=>{
    res.send('Welcome PDN')
});
app.listen(port,()=>{
    console.log(`Server Connected on port ${port}!`)
});