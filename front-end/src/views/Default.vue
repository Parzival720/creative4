<template>
  <div>
    <Home v-if="user" />
    <Login v-else />
  </div>

</template>

<script>
import axios from 'axios';
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
export default {
  name: 'home',
  components: {
    Home,
    Login
  },
  async created() {
    try {
      let response = await axios.get('/api/users');
      this.$root.$data.user = response.data.user;
    } catch (error) {
      this.$root.$data.user = null;
    }
  },
  computed: {
    user() {
      return this.$root.$data.user;
    }
  }
}
</script>
