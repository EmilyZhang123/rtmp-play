import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Cesium from '../views/Cesium.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
    {
      path: '/cesium',
      name: 'cesium',
      component: Cesium
    }
]

const router = new VueRouter({
  routes
})

export default router
