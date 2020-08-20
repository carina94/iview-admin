<!--
 * @Author: your name
 * @Date: 2019-12-12 18:34:16
 * @LastEditTime: 2020-08-20 20:04:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \iview-admin\src\components\main\components\header-bar\sider-trigger\sider-trigger.vue

让侧边栏关闭打开的icon

-->

<template>
  <a @click="handleChange" type="text" :class="['sider-trigger-a', collapsed ? 'collapsed' : '']">
    <Icon :type="icon" :size="size" /></a>
</template>
<script>
export default {
  name: 'siderTrigger',
  props: {
    collapsed: Boolean, // 从父级一级一级向下传递
    icon: {
      type: String,
      default: 'navicon-round'
    },
    size: {
      type: Number,
      default: 50
    }
  },
  methods: {
    // 最底层子组件控制，点击切换按钮，改变this.collapsed的值
    handleChange () {
      this.$emit('on-change', !this.collapsed)
    }
  }
}
</script>
<style lang="less">
@import "./sider-trigger.less";
</style>
