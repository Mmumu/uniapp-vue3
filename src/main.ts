import { createSSRApp } from "vue";
import App from "./App.vue";
// import Store from "./store/index"
import Custom from './components/custom/Custom.vue'
import uma from './plugins/uma'
import Global from './plugins/global'
import Methods from './plugins/methods'
import globalMixin from './mixin/globalMixin'
export function createApp() {
  const app = createSSRApp(App);
  // app.use(Store)
  app.use(Global)
  app.use(Methods)
  app.use(uma)
  app.component('custom', Custom)
  app.mixin(globalMixin)
  return {
    app,
  };
}
