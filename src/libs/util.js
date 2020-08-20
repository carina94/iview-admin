import Cookies from 'js-cookie'
// cookie保存的天数
import config from '@/config'
import {
  forEach,
  hasOneOf,
  objEqual
} from '@/libs/tools'
const {
  title,
  cookieExpires,
  useI18n
} = config

export const TOKEN_KEY = 'token'

export const setToken = token => {
  console.log('libs页面-util-将token存入cookies中')
  Cookies.set(TOKEN_KEY, token, {
    expires: cookieExpires || 1
  })
}

export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY)
  if (token) return token
  else return false
}
// 某一路由菜单是否有children
export const hasChild = item => {
  return item.children && item.children.length !== 0
}

// item  某一路由菜单
// access  后端返回的权限数组
// 判断某路由菜单权限是否和后台返回的权限数组有重合的地方
// 并且默认如果该路由菜单没有item.meta.access时，默认为有权限
const showThisMenuEle = (item, access) => {
  if (item.meta && item.meta.access && item.meta.access.length) {
    // 某一路由菜单是否有item.meta.access
    if (hasOneOf(item.meta.access, access)) {
      // 该路由菜单和后台返回的权限数组 数据有重合的地方
      return true
    } else {
      // 未匹配到重合的地方
      return false
    }
  } else {
    // 没有item.meta.access的 默认给他权限，即拥有所有菜单路由的权限
    return true
  }
}
/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @returns {Array}
 */
// list  前端整个静态路由列表
// access  后台通过用户信息接口返回的权限登录角色  为数组  即['super_admin']
// 将前端静态路由列表通过此方法过滤一遍，并整理成首页需要展示的菜单列表，然后返回
// item.meta.showAlways   用处？？、
export const getMenuByRouter = (list, access) => {
  let res = []
  forEach(list, item => {
    // 没有item.meta 的
    // 有item.meta并且item.meta.hideInMenu为false的(即不隐藏此路由)
    if (!item.meta || (item.meta && !item.meta.hideInMenu)) {
      // 将此路由重新组装成一个新的对象obj
      let obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: item.meta
      }
      // item.meta.showAlways   ！！！
      // 有item.children的并且该路由的权限和后台返回的权限数组有重合的地方  即该菜单可查看到
      // 有item.meta.showAlways为true的并且该路由的权限和后台返回的权限数组有重合的地方  即该菜单可查看到
      if (
        (hasChild(item) || (item.meta && item.meta.showAlways)) &&
        showThisMenuEle(item, access)
      ) {
        // 判断二级三级菜单等路由，递归调用该方法
        obj.children = getMenuByRouter(item.children, access)
      }
      // 将存在item.meta.href的加入obj对象中
      if (item.meta && item.meta.href) {
        obj.href = item.meta.href
      }
      // 判断一级菜单的路由，该路由的权限和后台返回的权限数组有重合的地方  即该菜单可查看到
      if (showThisMenuEle(item, access)) {
        res.push(obj)
      }
    }
  })
  /**
   *  obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: item.meta,
        href: item.meta.href
      }
   *组装之后的新对象
  */
  return res
}

/**
 * @param {Array} routeMetched 当前路由metched
 * @returns {Array}
 */
export const getBreadCrumbList = (route, homeRoute) => {
  let homeItem = {
    ...homeRoute,
    icon: homeRoute.meta.icon
  }
  let routeMetched = route.matched
  if (routeMetched.some(item => item.name === homeRoute.name)) {
    return [homeItem]
  }
  let res = routeMetched
    .filter(item => {
      return item.meta === undefined || !item.meta.hideInBread
    })
    .map(item => {
      let meta = {
        ...item.meta
      }
      if (meta.title && typeof meta.title === 'function') {
        meta.__titleIsFunction__ = true
        meta.title = meta.title(route)
      }
      let obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: meta
      }
      return obj
    })
  res = res.filter(item => {
    return !item.meta.hideInMenu
  })
  return [{
    ...homeItem,
    to: homeRoute.path
  }, ...res]
}

export const getRouteTitleHandled = route => {
  let router = {
    ...route
  }
  let meta = {
    ...route.meta
  }
  let title = ''
  if (meta.title) {
    if (typeof meta.title === 'function') {
      meta.__titleIsFunction__ = true
      title = meta.title(router)
    } else title = meta.title
  }
  meta.title = title
  router.meta = meta
  return router
}

export const showTitle = (item, vm) => {
  let {
    title,
    __titleIsFunction__
  } = item.meta
  if (!title) return
  if (useI18n) {
    if (title.includes('{{') && title.includes('}}') && useI18n) {
      title = title.replace(/({{[\s\S]+?}})/, (m, str) =>
        str.replace(/{{([\s\S]*)}}/, (m, _) => vm.$t(_.trim()))
      )
    } else if (__titleIsFunction__) title = item.meta.title
    else title = vm.$t(item.name)
  } else title = (item.meta && item.meta.title) || item.name
  return title
}

/**
 * @description 本地存储和获取标签导航列表
 */
export const setTagNavListInLocalstorage = list => {
  localStorage.tagNaveList = JSON.stringify(list)
}
/**
 * @returns {Array} 其中的每个元素只包含路由原信息中的name, path, meta三项
 */
export const getTagNavListFromLocalstorage = () => {
  const list = localStorage.tagNaveList
  return list ? JSON.parse(list) : []
}

/**
 * @param {Array} routers 路由列表数组
 * @description 用于找到路由列表中name为home的对象
 */
export const getHomeRoute = (routers, homeName = 'home') => {
  let i = -1
  let len = routers.length
  let homeRoute = {}
  while (++i < len) {
    let item = routers[i]
    if (item.children && item.children.length) {
      let res = getHomeRoute(item.children, homeName)
      if (res.name) return res
    } else {
      if (item.name === homeName) homeRoute = item
    }
  }
  return homeRoute
}

/**
 * @param {*} list 现有标签导航列表
 * @param {*} newRoute 新添加的路由原信息对象
 * @description 如果该newRoute已经存在则不再添加
 */
export const getNewTagList = (list, newRoute) => {
  const {
    name,
    path,
    meta
  } = newRoute
  let newList = [...list]
  if (newList.findIndex(item => item.name === name) >= 0) return newList
  else {
    newList.push({
      name,
      path,
      meta
    })
  }
  return newList
}

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
  // * @param {*} access 用户权限数组      后台返回的角色登录权限
  // * @param {*} routes  某个路由菜单     前端定义的要进入的某个路由菜单
  //   前端某个路由菜单如下定义
  // {
  //   path: 'level_2_2',
  //   name: 'level_2_2',
  //   meta: {
  //     access: ['super_admin'], //前端定义该路由访问权限
  //     icon: 'md-funnel',
  //     showAlways: true,
  //     title: '二级-2(super_admin才可访问)'
  //   },
  //   component: parentView,
  // }
  console.log('libs页面-util-hasAccess方法内部')
  if (route.meta && route.meta.access) {
    // 路由中含有判断权限菜单的参数时
    return hasOneOf(access, route.meta.access)
    // 返回true或false
  } else {
    //  路由中没有判断权限菜单的参数时  默认返回true
    return true
  }
}

/**
 * 权鉴
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组    后台返回的角色登录权限
 * @param {*} routes 路由列表     前端定义的整个路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
  console.log('libs页面-util-canTurnTo方法内部-判断用户是否可跳转到该页')
  const routePermissionJudge = list => {
    console.log('libs页面-util-canTurnTo方法内部-routePermissionJudge方法-传入整个前端路由表')
    return list.some(item => {
      // some
      // 如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测。如果没有满足条件的元素，则返回false。
      // 点击要进入的页面名称 name 和前端路由表list 中的每个路由名称 item.name 一个个比对
      if (item.children && item.children.length) {
        //
        return routePermissionJudge(item.children)
      } else if (item.name === name) {
        //  找到一致的路由
        return hasAccess(access, item)
        // 返回true或false
      }
    })
  }

  return routePermissionJudge(routes)
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
  const keyValueArr = url.split('?')[1].split('&')
  let paramObj = {}
  keyValueArr.forEach(item => {
    const keyValue = item.split('=')
    paramObj[keyValue[0]] = keyValue[1]
  })
  return paramObj
}

/**
 * @param {Array} list 标签列表
 * @param {String} name 当前关闭的标签的name
 */
export const getNextRoute = (list, route) => {
  let res = {}
  if (list.length === 2) {
    res = getHomeRoute(list)
  } else {
    const index = list.findIndex(item => routeEqual(item, route))
    if (index === list.length - 1) res = list[list.length - 2]
    else res = list[index + 1]
  }
  return res
}

/**
 * @param {Number} times 回调函数需要执行的次数
 * @param {Function} callback 回调函数
 */
export const doCustomTimes = (times, callback) => {
  let i = -1
  while (++i < times) {
    callback(i)
  }
}

/**
 * @param {Object} file 从上传组件得到的文件对象
 * @returns {Promise} resolve参数是解析后的二维数组
 * @description 从Csv文件中解析出表格，解析成二维数组
 */
export const getArrayFromFile = file => {
  let nameSplit = file.name.split('.')
  let format = nameSplit[nameSplit.length - 1]
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsText(file) // 以文本格式读取
    let arr = []
    reader.onload = function (evt) {
      let data = evt.target.result // 读到的数据
      let pasteData = data.trim()
      arr = pasteData
        .split(/[\n\u0085\u2028\u2029]|\r\n?/g)
        .map(row => {
          return row.split('\t')
        })
        .map(item => {
          return item[0].split(',')
        })
      if (format === 'csv') resolve(arr)
      else reject(new Error('[Format Error]:你上传的不是Csv文件'))
    }
  })
}

/**
 * @param {Array} array 表格数据二维数组
 * @returns {Object} { columns, tableData }
 * @description 从二维数组中获取表头和表格数据，将第一行作为表头，用于在iView的表格中展示数据
 */
export const getTableDataFromArray = array => {
  let columns = []
  let tableData = []
  if (array.length > 1) {
    let titles = array.shift()
    columns = titles.map(item => {
      return {
        title: item,
        key: item
      }
    })
    tableData = array.map(item => {
      let res = {}
      item.forEach((col, i) => {
        res[titles[i]] = col
      })
      return res
    })
  }
  return {
    columns,
    tableData
  }
}

export const findNodeUpper = (ele, tag) => {
  if (ele.parentNode) {
    if (ele.parentNode.tagName === tag.toUpperCase()) {
      return ele.parentNode
    } else {
      return findNodeUpper(ele.parentNode, tag)
    }
  }
}

export const findNodeUpperByClasses = (ele, classes) => {
  let parentNode = ele.parentNode
  if (parentNode) {
    let classList = parentNode.classList
    if (
      classList &&
      classes.every(className => classList.contains(className))
    ) {
      return parentNode
    } else {
      return findNodeUpperByClasses(parentNode, classes)
    }
  }
}

export const findNodeDownward = (ele, tag) => {
  const tagName = tag.toUpperCase()
  if (ele.childNodes.length) {
    let i = -1
    let len = ele.childNodes.length
    while (++i < len) {
      let child = ele.childNodes[i]
      if (child.tagName === tagName) return child
      else return findNodeDownward(child, tag)
    }
  }
}

export const showByAccess = (access, canViewAccess) => {
  return hasOneOf(canViewAccess, access)
}

/**
 * @description 根据name/params/query判断两个路由对象是否相等
 * @param {*} route1 路由对象
 * @param {*} route2 路由对象
 */
export const routeEqual = (route1, route2) => {
  const params1 = route1.params || {}
  const params2 = route2.params || {}
  const query1 = route1.query || {}
  const query2 = route2.query || {}
  return (
    route1.name === route2.name &&
    objEqual(params1, params2) &&
    objEqual(query1, query2)
  )
}

/**
 * 判断打开的标签列表里是否已存在这个新添加的路由对象
 */
export const routeHasExist = (tagNavList, routeItem) => {
  let len = tagNavList.length
  let res = false
  doCustomTimes(len, index => {
    if (routeEqual(tagNavList[index], routeItem)) res = true
  })
  return res
}

export const localSave = (key, value) => {
  localStorage.setItem(key, value)
}

export const localRead = key => {
  return localStorage.getItem(key) || ''
}

// scrollTop animation
export const scrollTop = (el, from = 0, to, duration = 500, endCallback) => {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        return window.setTimeout(callback, 1000 / 60)
      }
  }
  const difference = Math.abs(from - to)
  const step = Math.ceil((difference / duration) * 50)

  const scroll = (start, end, step) => {
    if (start === end) {
      endCallback && endCallback()
      return
    }

    let d = start + step > end ? end : start + step
    if (start > end) {
      d = start - step < end ? end : start - step
    }

    if (el === window) {
      window.scrollTo(d, d)
    } else {
      el.scrollTop = d
    }
    window.requestAnimationFrame(() => scroll(d, end, step))
  }
  scroll(from, to, step)
}

/**
 * @description 根据当前跳转的路由设置显示在浏览器标签的title
 * @param {Object} routeItem 路由对象
 * @param {Object} vm Vue实例
 */
export const setTitle = (routeItem, vm) => {
  const handledRoute = getRouteTitleHandled(routeItem)
  const pageTitle = showTitle(handledRoute, vm)
  const resTitle = pageTitle ? `${title} - ${pageTitle}` : title
  window.document.title = resTitle
}
