const mysql = require("mysql");
require("dotenv").config()
const connect = mysql.createPool({
    database:process.env.database,
    password: process.env.passwordDatabase,
    host: process.env.DB_host,
    user: process.env.user_db,
})


module.exports = connect