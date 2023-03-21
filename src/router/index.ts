import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Profile from '@/views/Profile.vue'
import ProfileUpload from '@/views/profile/Upload.vue'
import Detail from '@/views/profile/Detail.vue'
import ProfileDeploy from '@/views/profile/Deploy.vue'
import IFrame from '@/views/IFrame.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/profile',
    name: 'Profile',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '@/views/Profile.vue'),
  },
  {
    path: '/iframe',
    name: 'EIP1559',
    component: IFrame,
  },
  {
    path: '/profiles',
    component: Profile,
    redirect: '/profiles/upload',
    children: [
      {
        path: 'upload',
        component: ProfileUpload,
      },
      {
        path: ':address',
        name: 'profile-detail',
        component: Detail,
      },
      {
        path: 'deploy',
        component: ProfileDeploy,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
