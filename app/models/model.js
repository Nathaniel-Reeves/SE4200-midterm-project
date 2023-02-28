const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
var db_password = "oTKPaGAifu50daff";
var database_name = "contacts";
var url = "mongodb+srv://client:"+db_password+"@bozeman.mls8kja.mongodb.net/"+database_name+"?retryWrites=true&w=majority";
mongoose.connect(url);

