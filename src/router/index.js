import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

function route (path, file, name, children) {
  return {
    exact: true,
    path,
    name,
    children,
    component: () => import('../pages' + file)
  }
}
//创建VueRouter对象,并且导出
export default new Router({
  routes: [    //编写路由规则
    route("/login",'/Login',"Login"),// /login路径，路由到登录组件
    {
      path:"/", // 根路径，路由到 Layout组件
      component: () => import('../pages/Layout'),  //路由到 Layout组件
      redirect:"/index/dashboard",
      children:[ // 其它所有组件都是 Layout的子组件
        route("/index/dashboard","/Dashboard","Dashboard"),
        route("/item/category",'/item/Category',"Category"),
        route("/item/brand",'/item/lingmengBrand',"lingmengBrand"), // 自定义brand(品牌)
        route("/item/list",'/item/lingmengGoods',"lingmengGoods"), // 自定义商品vue

        route("/item/list",'/item/Goods',"Goods"),
        route("/item/specification",'/item/specification/Specification',"Specification"),
        route("/user/statistics",'/item/Statistics',"Statistics"),
        route("/trade/promotion",'/trade/Promotion',"Promotion"),

        route("/cms/PageList",'/cms/PageList',"Cms站点管理"),  // 站点管理
        route("/skin/label",'/skin/label',"Label"), //标签管理
      ]
    }
  ]
})
