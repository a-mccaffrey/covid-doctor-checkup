// Requiring necessary npm packages
var express = require("express");
var session = require("express-session");
// const exphbs = require("express-handlebars");
// Requiring passport as we've configured it
var passport = require("./config/passport");


// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8080;
var db = require("./models");

// Creating express app and configuring middleware needed for authentication
var app = express();
// Handlebars
// app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
// app.set('view engine', 'handlebars');

// // Index route
// app.get('/', (req, res) => res.render('index', { layout: 'landing' }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Set static folder
app.use(express.static("public"));
// We need to use sessions to keep track of our user's login status
app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(function () {
  app.listen(PORT, function () {

    create("iqbal.sian@hotmail.com", "12345", "doctor", "Dr. Iqbal Sian", "Male", "QC", "123456789")
    create("diana.liubarets@gmail.com", "12345", "patient", "Dina Liu", "Female", "QC", "123456789")
    create("smitm@gmail.com", "12345", "doctor","Dr. Morne Smit","Male","British Columbia", "7783983080")
    create("nolanjansen@outlook.com","12345", "doctor","Dr Nolan Jansen", "Male", "Quebec",  "8193456792")
    create("drhui@drhui.com","12345", "doctor","Dr. Fred Hui", "Male", "Ontario",  "4169204209")
    create("k.brien@gmail.com","12345", "doctor","Dr. Kevin O`Brien", "Male","Ontario", "6473490053")
    create("dr.john@hotmail.com","12345", "doctor","Dr. Gary Weinstein", "Male", "Ontario",  "4164859044")
    create( "lesliehousefather@hotmail.com","12345","doctor","Dr Leslie Housefather","Male","Ontario", "4162226160")

    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});


function create(email, password, role, name, gender, province, phone) {
  db.User.create({
    email: email,
    password: password,
    role: role,
    name: name,
    gender: gender,
    province: province,
    phone: phone
  })
    .then(function () {
      //res.redirect(307, "/api/login");
    })
    .catch(function (err) {
      //console.log(err)
      //res.status(401).json(err);
    });
}

