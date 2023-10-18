module.exports = function(app, shopData) {
    var mysql = require('mysql');
    const bcrypt = require('bcrypt'); 

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        let search = "%" + req.query.keyword + "%";
        let sqlquery = "SELECT name, price FROM books WHERE name LIKE " + mysql.escape(search);
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./search');
            }
            let newData = Object.assign({}, shopData, {availablnewBooks:result});
            res.render('searchResult', newData)
        });
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered', function (req,res) {
        const saltRounds = 10; 
        const plainPassword = req.body.pass; 

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { 
        // storing hashed password in database
        // insert values into database
        let sqlquery = "INSERT INTO user_details (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)";
        
        // execute sql query
        let newrecord = [req.body.user, req.body.first, req.body.last, req.body.email, hashedPassword];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else {
                result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email; 
                result += ' Your password is: '+ req.body.pass +' and your hashed password is: '+ hashedPassword + ' your username is ' + req.body.user; 
                res.send(result); 
            }
        });
        }); 

    }); 
    app.get('/list', function(req, res) {
        // query database to get all the books
        let sqlquery = "SELECT * FROM books";
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData) 
        });
    });
    app.get('/addbook', function(req,res){
        res.render('addBook.ejs', shopData);
    });
    app.post('/bookadded', function (req,res) {
        // saving data in database
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
        // execute sql query
        let newrecord = [req.body.name, req.body.price];
        db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
        return console.error(err.message);
        }
        else
        res.send(' This book is added to database, name: ' + req.body.name
        + ' price: '+ req.body.price);
        });
        }); 
    app.get('/bargainbooks', function(req,res){
        // get books under 20
        let sqlquery = "SELECT name, price FROM books WHERE price < 20";
        // execute the query
        db.query(sqlquery, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            let newData2 = Object.assign({}, shopData, {bargainBooks:result});
            res.render('bargain-books', newData2)
        });
    });
    app.get('/listusers', function (req,res) {
        // query database to get all the users
        let sqlquery = "SELECT username FROM user_details";
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {allUsers:result});
            console.log(newData)
            res.render("user-list", newData) 
        });
    });
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);
    });
    app.post('/loggedin', function (req,res) {
        let formUser = req.body.user;
    
        // compare form with table
        let sqlquery = "SELECT hashedPassword FROM user_details WHERE username = " + mysql.escape(formUser);
        

        db.query(sqlquery, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else {
                if (result.length === 0) {
                    res.send('User not found');
                } else {
                    const hashedPassword = result[0].hashedPassword; 
    
                    bcrypt.compare(req.body.pass, hashedPassword, function (err, result) {
                        if (err) {
                            res.send('Cannot find user');
                        } else if (result === true) {
                            res.send('You have successfully logged in:) welcome back ' + req.body.user);
                        } else {
                            res.send('Error');
                        }
                    });
                }
            }
        });
    });
}
