const express = require('express');
const bodyParser = require("body-parser");
const argon2 = require("argon2");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const mongoose = require('mongoose');
const multer = require('multer');

// connect to the database
mongoose.connect('mongodb://127.0.0.1:27017/cp4', {
    useUnifiedTopology: true,
  useNewUrlParser: true
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ['secretValue'],
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));



const upload = multer({
  dest: '/var/www/cp4.rifttec.com/images/',
  limits: {
    fileSize: 10000000
  }
});

// This is the schema. Users have usernames and passwords. We solemnly promise to
// salt and hash the password!
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  level: Number,
  profilePath: String
});

// This is a hook that will be called before a user record is saved,
// allowing us to be sure to salt and hash the password first.
userSchema.pre('save', async function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password'))
    return next();

  try {
    // generate a hash. argon2 does the salting and hashing for us
    const hash = await argon2.hash(this.password);
    // override the plaintext password with the hashed one
    this.password = hash;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// This is a method that we can call on User objects to compare the hash of the
// password the browser sends with the has of the user's true password stored in
// the database.
userSchema.methods.comparePassword = async function(password) {
  try {
    // note that we supply the hash stored in the database (first argument) and
    // the plaintext password. argon2 will do the hashing and salting and
    // comparison for us.
    const isMatch = await argon2.verify(this.password, password);
    return isMatch;
  } catch (error) {
    return false;
  }
};

// This is a method that will be called automatically any time we convert a user
// object to JSON. It deletes the password hash from the object. This ensures
// that we never send password hashes over our API, to avoid giving away
// anything to an attacker.
userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
}

// create a User model from the User schema
const User = mongoose.model('User', userSchema);

/* Middleware */

// middleware function to check for logged-in users
const validUser = async (req, res, next) => {
  if (!req.session.userID)
    return res.status(403).send({
      message: "not logged in"
    });
  try {
    const user = await User.findOne({
      _id: req.session.userID
    });
    if (!user) {
      return res.status(403).send({
        message: "not logged in"
      });
    }
    // set the user field in the request
    req.user = user;
  } catch (error) {
    // Return an error if user does not exist.
    return res.status(403).send({
      message: "not logged in"
    });
  }

  // if everything succeeds, move to the next middleware
  next();
};

/* API Endpoints */

/* All of these endpoints start with "/" here, but will be configured by the
   module that imports this one to use a complete path, such as "/api/user" */

// create a new user
app.post('/api/users', async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // passsword, otherwise return an error. A 400 error means the request was
  // malformed.
  if (!req.body.username || !req.body.password)
    return res.status(400).send({
      message: "username and password are required"
    });

  try {

    //  Check to see if username already exists and if not send a 403 error. A 403
    // error means permission denied.
    const existingUser = await User.findOne({
      username: req.body.username
    });
    if (existingUser)
      return res.status(403).send({
        message: "username already exists"
      });
    let profile_path = "";
    if (req.body.profilePath) {
            profile_path = req.body.profilePath;
    }


    // create a new user and save it to the database
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      level: 0,
      profilePath: profile_path
    });
    await user.save();

    // set user session info
    req.session.userID = user._id;
    // send back a 200 OK response, along with the user that was created
    return res.send({
      user: user
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});


// login a user
app.post('/api/users/login', async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password)
    return res.sendStatus(400);

  try {
    //  lookup user record
    const user = await User.findOne({
      username: req.body.username
    });
    // Return an error if user does not exist.
    if (!user)
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // Return the SAME error if the password is wrong. This ensure we don't
    // leak any information about which users exist.
    if (!await user.comparePassword(req.body.password))
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // set user session info
    req.session.userID = user._id;
    return res.send({
      user: user
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// get logged in user
app.get('/api/users', validUser, async (req, res) => {
  try {
    res.send({
      user: req.user
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// logout
app.delete("/api/users", validUser, async (req, res) => {
  try {
    req.session = null;
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// Upload a photo. Uses the multer middleware for the upload and then returns
// the path where the photo is stored in the file system.
app.post('/api/users/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/images/" + req.file.filename
  });
});




const uploadFile = multer({
  dest: '/var/www/cp4.rifttec.com/files/',
  limits: {
    fileSize: 10000000
  }
});


// This is the schema. Users have usernames and passwords. We solemnly promise to
// salt and hash the password!
const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    default: "Untitled Project"
  },
  description: {
    type: String,
    default: "My project"
  },
  path: String
});

const Project = mongoose.model('Project', projectSchema);

app.get('/api/projects', validUser, async (req, res) => {
  try {
    let projects = await Project.find({
      user: req.user
    }).sort({
      created: -1
    });
    return res.send({
      projects: projects
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.post('/api/projects', validUser, async (req, res) => {
  const project = new Project({
    user: req.user,
    title: req.body.title,
    description: req.body.description,
    path: req.body.path,
  });
  try {
    await project.save();
    return res.send({
      project: project
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});


app.post('/api/projects/files', uploadFile.single('file'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/files/" + req.file.filename
  });
});




//
//
//
// // import the projects module and setup its API path
// const projects = require("./projects.js");
// app.use("/api/projects", projects.routes);


app.listen(3005, () => console.log('Server listening on port 3005!'));
