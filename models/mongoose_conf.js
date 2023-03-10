const mongoose = require('mongoose');


var db_password = "oTKPaGAifu50daff";
var database_name = "codecampapp";
var url =   "mongodb+srv://client:";
url +=      db_password;
url +=     "@bozeman.mls8kja.mongodb.net/";
url +=      database_name;
url +=      "?retryWrites=true&w=majority";


mongoose.set('strictQuery', true);
mongoose.connect(url);
module.exports = mongoose;