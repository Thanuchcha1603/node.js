const express = require('express')
const path = require('path')
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt')
const dbconnection = require('./database')
const {body,validationResult} = require('express-validator')

const app = express()
app.use(express.urlencoded({ extended: false}))

app.set('views', path.join(__dirname,'views')) 
app.set('view engine', 'ejs')

app.use(cookieSession({
    name: 'session',
    keys: ['key1','key2'],
    maxAge: 3600*1000 //1 hr

}))
//declearing custom
const ifNotLoggedIn = (req,res,next) => {
    if(!req.session.isLoggedIn){
        return res.render('login-register')
    }
    next()
}
const ifLoggedIn = (req,res,next) =>{
    if(req.session.isLoggedIn){
        return res.redirect('/home')
    }
    next()
}
//root page
app.get('/',ifNotLoggedIn ,(req, res ,next) => {
    dbconnection.execute('SELECT name FROM users WHERE id = ?',[req.session.userID])
    .then(([rows]) => {
        res.render('home',{
            name: rows[0].name
        })
    })
})

//register validate
app.post('/register' , ifLoggedIn,[

    body('user_email','Invalid your email.').isEmail().custom((value) => {
        return dbconnection.execute('SELECT email FROM users WHERE email = ?',[value])
        .then(([rows]) => {
            if(rows.length > 0) {
                return Promise.reject('This email already in use!')
            }
            return true;
        } )
    }),
    body('user_name','Username isEmpty!').trim().not().isEmpty ,
    body('user_password','Password must be minimun length 6 charecters').trim().isLength({min:6})
],
    (req,res) => {

        const validation_Result = validationResult(req)
        const {user_name,user_email,user_password} = req.body

        if(validation_Result.isEmpty){
            bcrypt.hash(user_password, 12 ).then((hase_password) => {
                dbconnection.execute('INSERT INTO users (name,email,password) VALUES(? , ? ,?)',[user_name,user_email,user_password])
                .then( result =>{
                    res.send('Create your account suscessfully, Now you can to go login.'+'<a href="/">Login</a>')
                }).catch(err => {
                    if(err) throw err
                })

            }).catch(err => {
                if(err) throw err
            })

        }else{
            let allErrors = validation_Result.errors.map((error) => {
                return errors.msg
            })
        res.render('login-register',{
            register_error: allErrors,
            old_data: req.body
        })

        }
    }
)
//login validate
app.post('/',ifLoggedIn,[
    body('user_email').custom((value) => {
        return dbconnection.execute('SELECT email FROM users WHERE email = ?',[value])
        .then(([rows])=>{
            if(rows.length == 1){
                return true
            }
            return Promise.reject('Invalid  your email.')
        })

    }),
    body('user_password', 'Password is Empty.').trim().not().isEmpty()

], (req,res) =>{
    const validation_Result = validationResult(req)
    const { user_email,user_password} = req.body
    if(validation_Result.isEmpty){
        dbconnection.execute('SELECT * FROM users WHERE email = ?',[user_email,user_password])
        .then(([rows])=>{
            bcrypt.compare(user_password,rows[0].PASSWORD).then(compare_Result => {
                if(compare_Result === ture){
                    req.session.isLoggedIn,
                    req.session.userID = rows[0].id,
                    res.redirect('/')
                } else{
                    res.render('login-register',{
                        loginError: ['Invalid Password.']
                    })
                }
            }).catch(err => {
                if(err) throw err
            })

        }).catch(err => {
            if(err) throw err
        })
    } else{
        let allErrors = validation_Result.errors.map((error) => {
            return error.msg
        })
        res.render('login-register',{
            login_errors : allErrors
        })
    }
}
)
 //logout 
 app.post('/logout',(req,res) => {

    req.session= null
    req.redirect('/')
 })

 // not page found
app.use('/',(req,res)=>{
    res.status(404).send('<h1> 404 page not found.</h1>')
})
app.listen(3000 , () => console.log("Server is running..."))

