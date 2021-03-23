 const mysql = require("mysql2")
const dbconnection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "login-register"

}).promise()

module.exports = dbconnection