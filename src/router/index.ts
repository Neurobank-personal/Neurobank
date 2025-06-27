import { createRouter, createWebHistory } from "vue-router";

import HomePage from "../views/HomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import NotFoundPage from "../views/NotFoundPage.vue";

const routes = [
    {
        path: "/",
        redirect: "/loginpage"
    },
    {
        path: "/homepage",
        component: HomePage,
    },
    {
        path: "/loginpage",
        component: LoginPage
    },
    {
        path: "/registerpage",
        component: RegisterPage
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: NotFoundPage
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;