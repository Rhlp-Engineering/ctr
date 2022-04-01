import Vue from "vue"
import VueRouter from "vue-router";
import VueGtag from "vue-gtag";

import App from "./App.vue"
import api from "./api";
import appStore from "./appStore";
import { User } from "./appStore";
import routes from "./routes";
import socket from "./socket";
import "./assets/index.scss";

Vue.config.productionTip = false

const router = new VueRouter({ routes });

Vue.use(VueRouter);

Vue.use(VueGtag, {
  config: { id: "G-BCMREM3LDH" },
}, router);



Vue.prototype.$http = api;
Vue.prototype.$store = appStore;
Vue.prototype.$socket = socket;

document.querySelector("html").classList.add("dark")

//todo, this
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + " - Cybertown";
  } else {
    document.title = "Cybertown";
  }

  if (!["login", "logout", "signup", "forgot", "password_reset","about"].includes(to.name)) {
    api.get<{ user: User }>("/member/session").then(response => {
      const { user } = response.data;
      appStore.data.user = { ...appStore.data.user, ...user };
      appStore.data.isUser = true;
      next();
    }).catch(() => {
      appStore.methods.destroySession();
      if (to.name !== "home") {
        next({
          name: "login",
          query: { redirect: to.fullPath }
        });
      } else {
        next();
      }
    })
  } else {
    next();
  }
});

new Vue({
  router,
  render: h => h(App),
}).$mount("#app")
