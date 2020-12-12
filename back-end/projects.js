
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const users = require("./users.js");


// Configure multer so that it will upload to '../front-end/public/images'
const multer = require('multer');
const uploadFile = multer({
  dest: '/var/www/cp4.rifttec.com/files/',
  limits: {
    fileSize: 10000000
  }
});

const User = users.model;
const validUser = users.valid;

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

router.get('/', validUser, async (req, res) => {
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

router.post('/', validUser, async (req, res) => {
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


router.post('/files', uploadFile.single('file'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/files/" + req.file.filename
  });
});

module.exports = {
  routes: router
}
