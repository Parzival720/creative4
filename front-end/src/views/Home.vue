<template>
<div class="home">
  <div class="user-container">
    <img :src="user.profilePath" class="profile-pic">
    <div class="user-info">
      <p class="name">{{user.firstName}} {{user.lastName}} </p>
      <p class="level">Projects: {{projects.length}} </p>
    </div>
    <button @click="logout" class="pure-button pure-button-primary logout">Logout</button>
  </div>

  <h1>Your CS Projects</h1>
  <div class="add">
    <div class="circle">Add a new project:</div>
    <div class="project-info">
      <input v-model="title" placeholder="Title of Project" class="project-title">
      <p></p>
      <textarea v-model="description" placeholder="Project Description" rows="2" cols="20"/>
      <p></p>
    </div>
    <input type="file" name="file-upload" class="form-section" @change="fileChanged">
    <p></p>
    <button @click="upload" class="pure-button pure-button-primary upload-button">Upload Project</button>
    <p v-if="error" class="error">{{error}}</p>
  </div>
  <div class="projects-container">
    <div v-for="project in projects" v-bind:key="project.id" >
      <div class="project">
        <a :href="project.path" :download="project.title" class="project-link">
        <p class="title-el">{{project.title}}</p>
        <p class="description-el">{{project.description}}</p>
        <p class="download"/>
        </a>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Home',
  data() {
    return {
     projects: [],
     error: "",
     file: null,
     title: "",
     description: ""
    }
  },
  computed: {
    user() {
      return this.$root.$data.user;
    }
  },
  created() {
    this.getProjects();
  },
  methods: {
    async logout() {
      try {
        await axios.delete("/api/users");
        this.$root.$data.user = null;
      } catch (error) {
        this.$root.$data.user = null;
      }
    },
    async getProjects() {
      try {
        let response = await axios.get("/api/projects");
        this.projects = response.data.projects;
        return true;
      } catch (error) {
        window.console.log(error);
      }
    },
    async upload() {
      this.error = '';
      if (!this.file) {
        this.error = "No file selected";
        return;
      }
      try {
        const formData = new FormData();
        formData.append('file', this.file, this.file.name)
        let r1 = await axios.post('/api/projects/files', formData);
        if (this.title == "") {
          this.title = "Untitled Project";
        }
        if (this.description == "") {
          this.description = "No description";
        }
        await axios.post('/api/projects', {
          title: this.title,
          description: this.description,
          path: r1.data.path
        });
        this.title = "";
        this.description = "";
        this.getProjects();
        return true;
      } catch (error) {
        this.error = error.response.data.message;
      }
    },
    fileChanged(event) {
      this.file = event.target.files[0]
    },
  }
}
</script>

<style scoped>

.circle {
  border-radius: 10%;
  padding: 8px;
  background: #333;
  color: #fff;
  text-align: center;
  margin-right: 30px;
  display: flex;
}

.add {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: row;
}

.project-link {
  text-decoration: none;
  color: #333;
}

/* Form */
input,
textarea,
select,
button {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
}

.form {
  margin-right: 50px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: row;
}

.form-section {
  margin-left: 30px;
}

.project-info {
  display: flex;
  align-items: space-between;
  flex-direction: column;
}

.project-title {
  margin-bottom: 10px;
}

.image h2 {
  font-style: italic;
  font-size: 20px;
}

.projects-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
}

.project {
  padding: 10px;
  margin: 30px;
}

.project,
.project::after {
  -webkit-transition: all 0.3s;
  -moz-transition: all 0.3s;
  -o-transition: all 0.3s;
  transition: all 0.3s;
}
.project::before,
.project::after {
  background: #fff;
  content: '';
  position: absolute;
  z-index: -1;
}
.project:hover {
  color: #333;
    border: 4px solid #333;
    border-radius: 10px;
    background: #F64C72;
}

.project:hover .download:after {
  content: 'Click To Download!';
  color: #2F2FA2;
}

.title-el {
    font-size: 30px;
    font-weight: bold;
}

.description-el {
    margin: 10px;
    font-size: 20px;
}

/* Masonry */
*,
*:before,
*:after {
  box-sizing: inherit;
}

.image-gallery {
  column-gap: 1.5em;
}

.image {
  margin: 0 0 1.5em;
  display: inline-block;
  width: 100%;
}

.image img {
  width: 100%;
}

/* Masonry on large screens */
@media only screen and (min-width: 1024px) {
  .image-gallery {
    column-count: 4;
  }
}

/* Masonry on medium-sized screens */
@media only screen and (max-width: 1023px) and (min-width: 768px) {
  .image-gallery {
    column-count: 3;
  }
}

/* Masonry on small screens */
@media only screen and (max-width: 767px) and (min-width: 540px) {
  .image-gallery {
    column-count: 2;
  }
}

.user-container {
  background-color: #F64C72;
  border-radius: 5px;
  padding: 20px;
  margin: 10px;
  display: flex;
  justify-content: left;
  align-items: center;
}

.name {
  font-weight: bold;
  font-size: 30px;
}

.level {
  font-weight: bold;
  font-size: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.profile-pic {
  width: 60px;
  height: 60px;
  border-radius: 40px;
  float: left;
  margin-right: 20px;
}

button,
button::after {
  -webkit-transition: all 0.3s;
  -moz-transition: all 0.3s;
  -o-transition: all 0.3s;
  transition: all 0.3s;
}
button {
  background: none;
  border: 4px solid #fff;
  border-radius: 10px;
  color: #fff;
  display: block;
  font-size: 1.0em;
  font-weight: bold;
  margin: 10px;
  padding: 1em 2em;
  position: relative;
  text-transform: uppercase;
}
button::before,
button::after {
  background: #fff;
  content: '';
  position: absolute;
  z-index: -1;
}
button:hover {
  color: #333;
    border: 4px solid #333;
}
.button1::after {
  height: 0;
  left: 0;
  top: 0;
  width: 100%;
}
.button1:hover:after {
  height: 100%;
}
.button2::after {
  height: 100%;
  left: 0;
  top: 0;
  width: 0;
}
.button2:hover:after {
  width: 100%;
}
.logout::after {
  height: 0;
  left: 50%;
  top: 50%;
  width: 0;
}
.logout:hover:after {
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
}

.logout {
    margin-left: auto;
}

.upload-button {
  border: 4px solid #333;
  color: #333;
  margin: 0px;
}

.upload-button:hover {
  background: #2F2FA2;
  color: #fff;
}


p {
  padding: 0px;
  margin: 0px;
}
</style>
