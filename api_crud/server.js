const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

// homepage
app.get('/', (req,res)=> {
    return res.send({
        error: false,
        message: 'Wellcome to RESTAPI with nodejs',
        written: 'Thanuchch NSN'
    })

})
//connecttion to mysql
let dbconnect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "nodejs_api"

})
dbconnect.connect()

//retrieve all books
app.get('/books',(req,res) => {
    dbconnect.query('SELECT * FROM books',(error,result,fields)=>{
        if(error) throw error

        let message = ""
        if(result === undefined || result.length == 0){
            message = "Books table is empty"
        }else{
            message = "Successfull retrieve all books"
        }
        return res.send({ error: false, data: result , message: message})
    })
})
// add a new book
app.post('/book',(req,res) => {
    let name = req.body.name
    let author = req.body.author

// validation
    if(!name || !author){
        return res.status(400).send({ error: true , message: 'Please provide name and author your book.'})

    }else{
    dbconnect.query('INSERT INTO books (name,author) VALUES (? , ?)',[name,author],(error,result,fields)=> {
        if(error) throw error
        return res.send({ error: false, data: result , message: 'Add books successfully.'})
    })
}
})
// retieve book by id
app.get('/books/:id',(req,res)=> {
    let id = req.params.id

    if(!id){
        return res.status(400).send({error: true , message: 'Please provies book id.'})
    }else{
        dbconnect.query('SELECT * FROM books WHERE id = ?',[id],(error,result,fields)=>{
            if(error) throw error
            
            let message = ''
            if(result === undefined || result.length<0){
                message = 'Book not found.'
            }else{
                message = 'Sucessfully retreive book data.'
            }
            return res.send({ error: false, data: result,message: message})
        })
    }
})
// update books
app.put('/book',(req,res)=>{
    let id = req.body.id
    let name = req.body.name
    let author = req.body.author

    if(!id || !name || !author){
        return res.status(400).send({error: true , message: 'Please id, name, and author book.'})
    }else{
        dbconnect.query('UPDATE books SET name = ? , author = ? WHERE id = ?',[name,author,id],(error,result,fields)=>{
            if(error) throw error

            let message = ''
            if(result.changedRows ===0){
                message = 'Book not found or data are same.'
            }else{
                message = 'Book sucessfully.'
            }
            return res.send({error: false,data:result , message:message})
        })
    }
})
//delect book 
app.delete('/book',(req,res)=>{
    let id = req.body.id

    if(!id){
        return res.status(400).send({error: true , message: 'Pleaes provid id.'})
    } else{
        dbconnect.query('DELETE FROM books WHERE id = ?',[id],(error,result,fields)=>{
            if(error) throw error

            let message = ''
            if(result.affectedRows === 0){
                message = 'Book not found.'
            }else {
                message = 'Delete book sucessfully.'
            }
            return res.send({ error: false , data: result , message:message})
        })
    }
})

app.listen(3000,console.log("server is running..."))
 module.exports=app