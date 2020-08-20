/*
 * @Author: your name
 * @Date: 2019-12-12 18:34:16
 * @LastEditTime: 2020-08-20 16:02:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \iview-admin\src\router\index.js
 */
import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
import {
  setToken,
  getToken,
  canTurnTo,
  setTitle
} from '@/libs/util'
import config from '@/config'
const {
  homeName
} = config

Vue.use(Router)
const router = new Router({
  routes,
  mode: 'history'
})
const LOGIN_PAGE_NAME = 'login'

// 判断要进入的路由菜单是否有权限进入
const turnTo = (to, access, next) => {
  console.log('router页面-index-turnTo方法内部')
  if (canTurnTo(to.name, access, routes)) {
    // routes  前端定义的静态路由列表
    console.log('router页面-index-canTurnTo方法返回true，要进入的菜单有权限，可访问')
    next() // 有权限，可访问，流入下一个菜单
  } else {
    console.log('router页面-index-canTurnTo方法返回false，要进入的菜单没有有权限，进入401页面')
    next({
      replace: true,
      name: 'error_401'
    }) // 无权限，重定向到401页面
  }
}
/***
 *  {
        path: 'level_2_2',
        name: 'level_2_2',
        meta: {
          access: ['super_admin'],
          icon: 'md-funnel',
          showAlways: true,
          title: '二级-2'
        },
        component: parentView,
    }
     access: ['super_admin'],
 * 这种权限登录方式是判断登录的角色
 * 如：超级管理员 可看到所有路由菜单
 * 普通管理员  可看到某些路由菜单
 * 后端通过登录角色判断是 'super_admin' 或'admin'，并返回当前登录的角色'super_admin' 并且是个数组形式的
 * 前端静态路由列表中设置每个路由的权限查看， access: ['super_admin','admin'], access: ['super_admin'],
 *最后路由跳转的时候，通过'libs-tools-hasOneOf方法'前端后端做比对，
 */
console.log('router页面-index-')
router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const token = getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    console.log('router页面-index- 未登录且要跳转的页面不是登录页，跳转到登录页')
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    console.log('router页面-index-未登陆且要跳转的页面是登录页,跳转到登录页')
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    console.log('router页面-index- 已登录且要跳转的页面是登录页，跳转到homeName页')
    next({
      name: homeName // 跳转到homeName页
    })
  } else {
    // 已登录且要跳转的页面不是登录页
    console.log('router页面-index-获得store.state.user.hasGetInfo')
    console.log('登录成功之后，每次路由跳转都要走这条判断？？')
    if (store.state.user.hasGetInfo) {
      // 得到用户信息了
      console.log('router页面-index-store.state.user.hasGetInfo为true，已经成功获取用户信息')
      console.log('router页面-index-turnTo方法')
      turnTo(to, store.state.user.access, next)
    } else {
      // 没有得到用户信息
      console.log('router页面-index-store.state.user.hasGetInfo为false，获取用户信息接口失败')
      console.log('router页面-index-再次执行vuex中获取用户信息的方法getUserInfo')
      store.dispatch('getUserInfo').then(user => {
        // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
        console.log("router页面-index-第二次获取用户信息成功，得到要跳转的路由菜单的进入权限，access为数组例如['super_admin', 'admin']")
        turnTo(to, user.access, next)
      }).catch(() => {
        setToken('')
        next({
          name: 'login'
        })
      })
    }
  }
})

router.afterEach(to => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
