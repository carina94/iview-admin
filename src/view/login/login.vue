<!--
 * @Author: your name
 * @Date: 2019-12-12 18:34:16
 * @LastEditTime: 2020-08-20 13:51:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \iview-admin\src\view\login\login.vue
-->
<style lang="less">
@import "./login.less";
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip">输入任意用户名和密码即可</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions(['handleLogin', 'getUserInfo']),
    handleSubmit ({ userName, password }) {
      console.log('login页面-vuex-handleLogin方法调用')
      this.handleLogin({ userName, password }).then(res => {
        console.log('login页面-接受到vuex抛出的resolve的res信息')
        console.log('login页面-vuex-getUserInfo方法调用')
        this.getUserInfo().then(res => {
          console.log('login页面-登录页进入首页跳转')
          console.log('login页面-进入router导航守卫')
          this.$router.push({
            name: this.$config.homeName
          })
        })
      })
    }
  }
}
</script>

<style>
</style>
