<template>
<div class="admin">
  <h1>TAs: There is a sample user already made if you want. Username: SampleUser, Password: password</h1>
  <div class="heading">
    <div class="circle">1</div>
    <h2>Login</h2>
  </div>
  <div class="add">
    <div class="form">
      <input v-model="usernameLogin" placeholder="Username">
      <p></p>
      <input v-model="passwordLogin" placeholder="Password">
      <p></p>
      <button @click="login">Login</button>
    </div>
    <p v-if="errorLogin" class="error">{{errorLogin}}</p>
  </div>
  <div class="heading">
    <div class="circle">2</div>
    <h2>Or Create an Account!</h2>
  </div>
  <div class="edit">
    <div class="form">
      <input v-model="firstName" placeholder="First Name">
      <input v-model="lastName" placeholder="Last Name">
      <input v-model="username" placeholder="Username">
      <input v-model="password" placeholder="Password">
      <p>Upload a Profile Picture</p>
      <input type="file" name="photo" @change="fileChanged">
      <p></p>
      <button @click="register">Register</button>
    </div>
    <p v-if="error" class="error">{{error}}</p>
  </div>
</div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Admin',
  data() {
    return {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      usernameLogin: "",
      passwordLogin: "",
      file: null,
      error: "",
      errorLogin: "",
    }
  },
  methods: {
    async register() {
      this.error = '';
      this.errorLogin = '';
      if (!this.firstName || !this.lastName || !this.username || !this.password)
        return;
      try {
        const formData = new FormData();
        formData.append('photo', this.file, this.file.name)
        let r1 = await axios.post('/api/users/photos', formData);
        let response = await axios.post('/api/users', {
          firstName: this.firstName,
          lastName: this.lastName,
          username: this.username,
          password: this.password,
          profilePath: r1.data.path
        });
        this.$root.$data.user = response.data.user;
      } catch (error) {
        this.error = error.response.data.message;
        this.$root.$data.user = null;
      }
    },
    async login() {
     this.error = '';
     this.errorLogin = '';
     if (!this.usernameLogin || !this.passwordLogin)
       return;
     try {
       let response = await axios.post('/api/users/login', {
         username: this.usernameLogin,
         password: this.passwordLogin,
       });
       this.$root.$data.user = response.data.user;
     } catch (error) {
       this.errorLogin = "Error: " + error.response.data.message;
       this.$root.$data.user = null;
     }
   },
    fileChanged(event) {
      this.file = event.target.files[0]
    },
  }
}
</script>

<style scoped>
.admin {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.image h2 {
  font-style: italic;
  font-size: 1em;
}

.heading {
  display: flex;
  margin-bottom: 20px;
  margin-top: 20px;
}

.heading h2 {
  margin-top: 8px;
  margin-left: 10px;
}

.add,
.edit {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.circle {
  border-radius: 50%;
  width: 18px;
  height: 18px;
  padding: 8px;
  background: #333;
  color: #fff;
  text-align: center
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
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

/* Uploaded images */
.upload h2 {
  margin: 0px;
}

.upload img {
  max-width: 300px;
}

/* Suggestions */
.suggestions {
  width: 200px;
  border: 1px solid #ccc;
}

.suggestion {
  min-height: 20px;
}

.suggestion:hover {
  background-color: #5BDEFF;
  color: #fff;
}

.error {
  margin-top: 20px;
  display: inline;
  padding: 5px 20px;
  border-radius: 30px;
  font-size: 10px;
  background-color: #d9534f;
  color: #fff;
}
</style>
