<!--
 * @Author: your name
 * @Date: 2019-12-12 18:34:16
 * @LastEditTime: 2020-08-20 11:24:50
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \iview-admin\src\App.vue
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
    console.log('created')
  },
  mounted () {
    console.log('mounted')
  }
}
</script>

<style lang="less">
.size {
  width: 100%;
  height: 100%;
}
html,
body {
  .size;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  .size;
}
</style>
