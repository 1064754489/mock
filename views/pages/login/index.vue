<template>
  <div class="em-index">
    <transition name="zoom">
      <div class="em-index__login" v-if="page === 0">
        <!-- <img src="/public/images/easy-mock.png"> -->
        <h1>mock</h1>
        <!-- <p>{{$tc('p.login.description', 1)}}</p>
        <p>{{$tc('p.login.description', 2)}}</p> -->
        <transition name="fadeUp" mode="out-in">
          <!-- <i-button type="primary" long @click.stop="start" v-if="!isLogin" key="start">{{$tc('p.login.form.button', 1)}}</i-button> -->
        </transition>
        <transition name="fadeLeft">
          <div v-show="!isLogin" class="login-form" v-click-outside="onClickOutside">
            <i-input size="large"
              v-if="ldap"
              :placeholder="$tc('p.login.form.placeholder', 2)"
              ref="user" v-model="userName" @on-enter="login"></i-input>
            <i-input size="large"
              v-if="!ldap"
              :placeholder="$tc('p.login.form.placeholder', 1)"
              ref="user" v-model="userName" @on-enter="login"></i-input>
            <i-input size="large"
              :placeholder="$t('p.login.form.password')"
              type="password" v-model="password" @on-enter="login"></i-input>
          </div>
        </transition>
          <i-button type="ghost" icon="log-in" @click.stop="login"  key="login"></i-button>
      </div>
    </transition>

    <div class="em-index__section em-index__section--login" style="z-index: 6"
      :class="{'is-old': page > 0}">
      <transition name="fade">
        <div
          class="fullscreen"
          :class="{'is-login': isLogin}"
          ref="wallpaper"
          v-show="wallpaperVisible"></div>
      </transition>
    </div>

    

  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import config from 'config'
import Cookies from 'universal-cookie'
import * as api from '../../api'

export default {
  name: 'index',
  data () {
    return {
      ldap: config.ldap,
      isLogin: false,
      page: 0,
      userName: this.$ls.get('last-user'),
      password: '',
      copyright: config.copyright,
      featureVisible: false,
      wallpaperVisible: false
    }
  },
  asyncData ({ store }) {
    return store.dispatch('wallpaper/FETCH')
  },
  mounted () {
    const img = new Image()
    img.src = this.$store.state.wallpaper.url
    img.onload = () => {
      this.wallpaperVisible = true
      this.$nextTick(() => {
        this.$refs.wallpaper.style.background = `url(${img.src})`
        this.$refs.wallpaper.style.backgroundSize = 'cover'
        this.$refs.wallpaper.style.backgroundPosition = '50% 50%'
      })
    }
  },
  computed: {
    wallpaperCopyright () {
      return this.$store.state.wallpaper.copyright
    }
  },
  watch: {
  },
  methods: {
    onClickOutside () {
      this.isLogin = false
    },
    start () {
      this.isLogin = true
      this.$nextTick(() => {
        this.$refs.user.focus()
      })
    },
    login () {
      const cookies = new Cookies()
      api.u.login({
        messageUnless: ['用户不存在'],
        data: {
          name: this.userName,
          password: this.password
        }
      }).then(res => {
        const body = res.data
        if (body.success) {
          this.$store.commit('user/SET_VALUE', body.data)
          this.$ls.set('user', body.data)
          this.$ls.set('last-user', this.userName)
          cookies.set(
            config.storageNamespace + 'token',
            body.data.token,
            {
              path: '/',
              maxAge: 60 * 60 * 24 * 31
            }
          )
          this.$router.push('/')
        }
      }).catch((res) => {
        if (res.data.message === '用户不存在') {
          this.$Modal.confirm({
            title: this.$t('confirm.title'),
            content: this.$t('p.login.confirm.register.content'),
            onOk: () => {
              this.register()
            }
          })
        }
      })
    },
    register () {
      api.u.register({
        data: {
          name: this.userName,
          password: this.password
        }
      }).then((res) => {
        if (res.data.success) {
          this.$Message.success(this.$t('p.login.confirm.register.success'))
          this.login()
        }
      })
    }
  }
}
</script>
