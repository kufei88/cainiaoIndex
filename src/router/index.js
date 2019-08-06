import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
import {
  getToken,
  canTurnTo
} from '@/libs/util'

Vue.use(Router)
const router = new Router({
  routes,
  mode: 'hash'
})
const LOGIN_PAGE_NAME = 'login'

const turnTo = (to, access, next) => {
  if (canTurnTo(to.name, access, routes)) next() // 有权限，可访问
<<<<<<< HEAD
  else next({
    replace: true,
    name: 'error_401'
  }) // 无权限，重定向到401页面
=======
  else {
    next({
      replace: true,
      name: 'error_401'
    })
  } // 无权限，重定向到401页面
>>>>>>> 07ca980a457ca035edd06c0ac871d22c1ff4677d
}

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const token = getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
<<<<<<< HEAD
    //  name: LOGIN_PAGE_NAME // 跳转到登录页
=======

      // name: LOGIN_PAGE_NAME // 跳转到登录页
>>>>>>> 07ca980a457ca035edd06c0ac871d22c1ff4677d
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: 'home' // 跳转到home页
    })
  } else {
<<<<<<< HEAD
    next();
    
    // if (store.state.user.hasGetInfo) {
    //   turnTo(to, store.state.user.access, next)
    // } else {

    //   store.dispatch('getUserInfo').then(user => {
    //     // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
    //     turnTo(to, user.access, next)
    //   }).catch(() => {
    //     next({
    //       name: 'login'
    //     })
    //   })

    // }
    
    
=======
    next()
    /*
        if (store.state.user.hasGetInfo) {
          turnTo(to, store.state.user.access, next)
        } else {

          store.dispatch('getUserInfo').then(user => {
            // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
            turnTo(to, user.access, next)
          }).catch(() => {
            next({
              name: 'login'
            })
          })

        }
        */
>>>>>>> 07ca980a457ca035edd06c0ac871d22c1ff4677d
  }
})

router.afterEach(to => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
