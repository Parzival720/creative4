<template>
<div id="app">
  <div class="header">
    <router-link to="/">
      <div class="logo">
        <img src="/coding.png">
      </div>
    </router-link>
    <div class="title">
      <h1>The Coding Lair</h1>
    </div>
  </div>
  <div class="content">
    <router-view />
  </div>
  <div class="footer">
    <a class="github-link" href='https://github.com/Parzival720/creative4' target='_blank'>
      <img src="/images/github.png" class="small-icon"  width="50" height="30">
      Link to GitHub repository
    </a>
  </div>
</div>
</template>

<style>
html {
  box-sizing: border-box;
}

body {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  background: #fff;
  padding: 0px;
  margin: 0px;
}

/* Header */
.header {
  display: flex;
  padding: 10px 100px 0px 100px;
  background-color: #2F2FA2;
  color: #333;
}

.title {
  margin-top: 5px;
}

.title h1 {
  font-size: 30px;
}

.content {
  padding: 20px 100px;
  min-height: 500px;
}

/* Footer */
.footer {
  height: 50px;
  padding: 20px 100px 0px 100px;
  background: #e3e3e3;
  font-size: 12px;
  display: flex;

  flex-direction: row;
  font-family: "Trebuchet MS", sans-serif;
}

.footer a {
  color: #000;
}

.logo img {
  width: 80px;
}

h1 {
  font-size: 20px;
}

h2 {
  font-size: 14px;
}

.footer-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.github-link:link,
.github-link:visited {
  align-self: center;
  display: block;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  padding: 1em;
  text-align: center;
  border-radius: 0.25em;
}

.github-link:hover,
.github-link:visited:hover {
  color: #add8e6;
}

.github-link:active,
.github-link:visited:active {
  color: #add8e6;
}
</style>
