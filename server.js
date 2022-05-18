var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

var urlencodedParser = bodyParser.urlencoded({
    extended: false
})

var exists = fs.existsSync('user_file.json');
if (exists) {
    console.log('loading user file');
    var mydata = fs.readFileSync('user_file.json', 'utf8');

    obj = JSON.parse(mydata);
} else {

    console.log('Created new object')
    var obj = {
        user: []
    };
}

app.use(express.static('pages'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send("Welcome to register! Please use http://localhost:3005/signup to open a registration form");
});


// ***** Login area *****
const userAuth = {
    userLogged: false,
    userID: "",
    userName: "",
    userEmail: "",
    userRole: ""
};


// ***** Is user logged in? *****
function isLoggedIn() {
    return userAuth.userLogged;
}


// ***** Signup area *****
app.get('/signup', function (req, res) {
    if (isLoggedIn()) {
        res.redirect("http://localhost:3005/home");
    } else {
        res.sendFile(__dirname + "/pages/" + "signup.html");
    }
});

app.post('/user', urlencodedParser, Newuser);

function Newuser(req, res) {
    response = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password
    }
    if (!response.name || !response.phone || !response.email || !response.role || !response.password) {
        reply = {
            msg: "Please complete the form before you submit"
        }
        res.send(reply);
        console.log(reply)
    } else {
        if (response.role == "manager") {
            obj.user.push({
                userID: (obj.user.length + 1),
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                role: req.body.role,
                items: [],
                password: req.body.password
            });
        } else {
            obj.user.push({
                userID: (obj.user.length + 1),
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                role: req.body.role,
                password: req.body.password
            });
        }

        let data = JSON.stringify(obj, null, 2);
        fs.writeFile('user_file.json', data, finished);
        console.log('user_file.JSON is updated')

        function finished(err) {
            reply = {
                name: req.body.name,
                phone: req.body.phone,
                role: req.body.role,
                password: req.body.password,
                status: "success",
                msg: "thank you"
            }
            console.log(reply);
        }
    }
    res.redirect("http://localhost:3005/home");
}
// ***** End signup area *****


// ***** Login area *****
app.get('/login', function (req, res) {
    if (isLoggedIn()) {
        res.redirect("http://localhost:3005/home");
    } else {
        res.sendFile(__dirname + "/pages/login.html");
    }
});

app.post('/login', (req, res) => {
    let inputEmail = req.body.email;
    let inputPassword = req.body.password;

    const mydata = fs.readFileSync('user_file.json', 'utf8');
    obj = JSON.parse(mydata);

    const loginResponse = {
        success: false,
        message: ''
    };
    if (inputEmail && inputPassword) {
        for (let i = 0; i < obj.user.length; i++) {
            if (obj.user[i].email == inputEmail && obj.user[i].password == inputPassword) {

                userAuth.userLogged = true;
                userAuth.userID = obj.user[i].userID;
                userAuth.userName = obj.user[i].name;
                userAuth.userEmail = obj.user[i].email;
                userAuth.userRole = obj.user[i].role;

                loginResponse.success = true;
                loginResponse.message = 'Login success';

                res.status(200).json(loginResponse);
                break;
            }
        }
        if (!loginResponse.success) {

            loginResponse.message = 'User not found';

            res.status(404).json(loginResponse);
        }
    } else {
        loginResponse.message = 'Empty input area';

        res.status(404).json(loginResponse);
    }
})
//***** End login area *****


// ***** Auth area *****
app.get('/auth', function (req, res) {
    res.send(userAuth);
})
// ***** End Auth area *****


// ***** Home page *****
app.get('/home', function (req, res) {
    if (isLoggedIn()) {
        res.sendFile(__dirname + "/pages/home.html");
    } else {
        res.redirect("http://localhost:3005/login");
    }
});
// ***** End home page *****


// ***** Logout area *****
app.post('/logout', (req, res) => {
    if (isLoggedIn()) {

        userAuth.userLogged = false;
        userAuth.userName = "";
        userAuth.userEmail = "";
        userAuth.userRole = "";

        res.redirect("http://localhost:3005/login");
    } else {
        res.redirect("http://localhost:3005/login");
    }
})
// ***** End logout area *****


// ***** Item list area *****
app.get('/itemlist', function (req, res) {
    if (isLoggedIn()) {
        res.sendFile(__dirname + "/pages/itemlist.html");
    } else {
        res.redirect("http://localhost:3005/login");
    }
});

app.get('/getitemlist', function (req, res) {
    const mydata = fs.readFileSync('user_file.json', 'utf8');
    obj = JSON.parse(mydata);
    res.send(obj.user[userAuth.userID - 1].items);
});

app.delete('/deleteitem', function (req, res) {
    const itemIndex = req.body.index;
    const mydata = fs.readFileSync('user_file.json', 'utf8');
    obj = JSON.parse(mydata);
    obj.user[userAuth.userID - 1].items.splice(itemIndex, 1);

    let data = JSON.stringify(obj);
    fs.writeFile('user_file.json', data, () => {

        console.log('user_file.JSON is updated');

        res.send({
            message: "item deleted successfully!"
        })
    });

});
// ***** End item list area *****

// ***** Filtered item list area *****
app.get('/filtereditem', function (req, res) {
    if (isLoggedIn()) {
        res.sendFile(__dirname + "/pages/filtereditem.html");
    } else {
        res.redirect("http://localhost:3005/login");
    }
});
// ***** Filtered item list area *****


// ***** Add item area *****
app.get('/additem', function (req, res) {
    if (isLoggedIn()) {
        res.sendFile(__dirname + "/pages/" + "additem.html");
    } else {
        res.redirect("http://localhost:3005/login");
    }
});

app.post('/itemsent', (req, res) => {
    const mydata = fs.readFileSync('user_file.json', 'utf8');
    obj = JSON.parse(mydata);
    response = {
        name: req.body.name,
        model_id: req.body.model_id,
        color: req.body.color,
        weight: req.body.weight,
        description: req.body.description
    }
    if (!response.name || !response.model_id || !response.color || !response.weight || !response.description) {
        res.send({
            success: false,
            message: "item not added!"
        });
    } else {
        obj.user[userAuth.userID - 1].items.push({
            name: req.body.name,
            model_id: req.body.model_id,
            color: req.body.color,
            weight: req.body.weight,
            description: req.body.description
        });

        let data = JSON.stringify(obj, null, 2);
        fs.writeFile('user_file.json', data, finished);
        console.log('user_file.JSON is updated');

        function finished(err) {
            reply = {
                name: req.body.name,
                model_id: req.body.model_id,
                color: req.body.color,
                weight: req.body.weight,
                description: req.body.description,
                status: "success",
                msg: "thank you"
            }
            console.log(reply);
        }
        res.send({
            success: true,
            message: "item added successfully!"
        });
    }
});
// ***** End add item area *****


// ***** Search item area *****
app.get('/searchitem', function (req, res) {
    if (userAuth.userRole == "client") {
        res.sendFile(__dirname + "/pages/" + "searchitem.html");
    } else {
        res.redirect("http://localhost:3005/home");
    }
});

const usedFilter = {
    filter: {}
}

const filtered = {
    items: []
}

app.post('/filter', function (req, res) {
    if (userAuth.userRole == "client") {
        usedFilter.filter = req.body;
        const mydata = fs.readFileSync('user_file.json', 'utf8');
        obj = JSON.parse(mydata);
        const allitems = [];
        obj.user.forEach(element => {
            if (element.role == "manager") {
                element.items.forEach(item => {
                    allitems.push(item);
                })
            }
        });
        if (req.body.noFilter == "all") {
            filtered.items = allitems;
            const filterResponse = {
                success: true,
                message: "Showing all found items!"
            }
            res.send(filterResponse);
        } else {
            filtered.items = allitems.filter((item) => {
                for (let key in usedFilter.filter) {
                    if (item[key] === undefined || item[key] != usedFilter.filter[key]) {
                        return false;
                    }
                    return true;
                }
            });
            const filterResponse = {
                success: (filtered.items.length < 1) ? false : true,
                message: (filtered.items.length < 1) ? "No item found!" : "items found!"
            }
            res.send(filterResponse);
        }

    } else {
        res.redirect("http://localhost:3005/home");
    }
});

app.get('/getfiltereditems', function (req, res) {
    if (userAuth.userRole == "client") {
        res.send(filtered.items);
    } else {
        res.redirect("http://localhost:3005/home");
    }
})

app.get('/filtereditem', function (req, res) {
    if (userAuth.userRole == "client") {
        res.sendFile(__dirname + "/pages/" + "filtereditem.html");
    } else {
        res.redirect("http://localhost:3005/home");
    }
})
// ***** End search item area *****

var server = app.listen(3005, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("http://localhost:3005/login")
})
