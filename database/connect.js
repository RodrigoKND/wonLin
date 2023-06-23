const mysql = require("mysql");
require("dotenv").config()
const connect = mysql.createConnection({
    database:process.env.database,
    password: process.env.passwordDatabase,
    host: process.env.DB_host,
    user: process.env.user_db
})

connect.connect((error)=>{
    if(error) throw error.message
    else(console.log("conexion exitosa a la base de datos"))
})

module.exports = connect