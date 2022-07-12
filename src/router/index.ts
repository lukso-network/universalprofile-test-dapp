import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Profile from "../views/Profile.vue";
import ProfileUpload from "../views/profile/Upload.vue";
// import ProfileUpload from "../components/profile/profile-upload/ProfileUpload.vue";
import ProfileDetail from "../components/profile/profile-detail/ProfileDetail.vue";
import ProfileDeploy from "../components/profile/profile-deploy/ProfileDeploy.vue";
import ProfileEdit from "../components/profile/profile-edit/ProfileEdit.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/profile",
    name: "Profile",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Profile.vue"),
  },
  {
    path: "/profiles",
    component: Profile,
    children: [
      {
        path: "upload",
        component: ProfileUpload,
      },
      {
        path: ":address/edit",
        name: "profile-edit",
        component: ProfileEdit,
      },
      {
        path: ":address",
        name: "profile-detail",
        component: ProfileDetail,
      },
      {
        path: "deploy",
        component: ProfileDeploy,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
