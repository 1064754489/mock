<template>
  <div class="em-layout">
    <em-add @click.native="$router.push('/new')"></em-add>
    <div v-shortkey="['p']" @shortkey="$router.push('/')"></div>
    <div v-shortkey="['g']" @shortkey="$router.push('/group')"></div>
    <div v-shortkey="['w']" @shortkey="$router.push('/workbench')"></div>
    <div v-shortkey="['d']" @shortkey="$router.push('/docs')"></div>
    <div v-shortkey="['n']" @shortkey="$router.push('/new')"></div>
    <div v-shortkey="['s']" @shortkey="onSearch"></div>
    <!-- <Affix>
        <span class="demo-affix">固定在最顶部</span>
    </Affix> -->
    <Row type="flex">
      <i-col span="4" class="layout-menu-left">
        <transition ansition name="fade">
          <Affix class="layout-nav-affix">
            <div class="em-layout__nav" v-show="pageAnimated">
              <Menu theme="dark" :active-name="pageKey" :open-names="['1']">
                <div class="nav-logo" @click="$router.push('/')">
                  <!-- <img src="/public/images/easy-mock.png"> -->
                  <h2>Mock</h2>
                </div>
                <div class="nav-search">
                  <i-input v-model="searchValue" placeholder="Search Mock" ref="search"></i-input>
                </div>
                <Submenu name="1">
                  <template slot="title">
                    <Icon type="pound"></Icon> {{$t('c.layout.menu[0][0]')}}
                  </template>
                  <Menu-item
                    name="/"
                    @click.native="$router.push('/')">
                    <Icon type="person"></Icon> {{$t('c.layout.menu[0][1]')}}
                  </Menu-item>
                  <Menu-item
                    name="/group"
                    @click.native="$router.push('/group')">
                    <Icon type="person-stalker"></Icon> {{$t('c.layout.menu[0][2]')}}
                  </Menu-item>
                </Submenu>
                <Menu-item
                  name="/workbench"
                  @click.native="$router.push('/workbench')">
                  <Icon type="code-working"></Icon> {{$t('c.layout.menu[1]')}}
                </Menu-item>
                <Menu-item
                  name="/dashboard"
                  @click.native="$router.push('/dashboard')">
                  <Icon type="ios-speedometer"></Icon> {{$t('c.layout.menu[2]')}}
                </Menu-item>
                <!-- <Menu-item
                  name="/docs"
                  @click.native="$router.push('/docs')"
                > -->
                <Menu-item
                  name="/docs"
                >
                    <Icon type="ios-book"></Icon> {{$t('c.layout.menu[3]')}}
                </Menu-item>
                <Submenu name="100">
                  <template slot="title">
                    <Icon type="egg"></Icon> {{$t('c.layout.menu[4][0]')}}
                  </template>
                </Submenu>
                <Submenu name="5" class="nav-avatar" v-show="userHeadImg">
                  <template slot="title">
                    <img :src="userHeadImg" v-show="userHeadImg"/>
                  </template>
                  <Menu-item
                    name="/profile"
                    @click.native="$router.push('/profile')">
                    <Icon type="edit"></Icon> {{$t('c.layout.menu[5][0]')}}
                  </Menu-item>
                  <Menu-item
                    name="/log-out"
                    @click.native="logOut">
                    <Icon type="log-out"></Icon> {{$t('c.layout.menu[5][1]')}}
                  </Menu-item>
                </Submenu>
                <Menu-item
                  class="nav-avatar"
                  name="/login"
                  @click.native="$router.push('/login')"
                  v-show="!userHeadImg">
                  <Icon type="log-in"></Icon> {{$t('c.layout.menu[5][2]')}}
                </Menu-item>
              </Menu>
            </div>
          </Affix>
        </transition>
      </i-col>
      <i-col class="content-col-box" span="20">
        <div class="em-layout__content">
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </div>
      </i-col>
    </Row>
    <p class="em-layout__copyright" v-if="copyright && pageAnimated">{{copyright}}</p>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import config from 'config'
import Emitter from '../../mixins/emitter'

export default {
  name: 'EmLayout',
  mixins: [Emitter],
  data () {
    return {
      searchValue: '',
      pageKey: '',
      copyright: config.copyright
    }
  },
  computed: {
    userHeadImg () {
      return this.$store.state.user.headImg
    },
    readChangelog () {
      return this.$store.state.app.readChangelog
    }
  },
  mounted () {
    this.pageKey = this.$route.path
    this.show = true
  },
  watch: {
    '$route' (to) {
      this.pageKey = to.path
    },
    searchValue: function (value) {
      this.broadcast('group', 'query', value)
      this.broadcast('project', 'query', value)
      this.broadcast('projectDetail', 'query', value)
    }
  },
  methods: {
    open (url) {
      window.open(url)
    },
    logOut () {
      this.$router.push('/log-out')
    },
    onSearch () {
      this.$refs.search.focus()
    }
  }
}
</script>
