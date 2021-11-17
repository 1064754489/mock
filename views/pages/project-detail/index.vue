<template>
  <div class="em-proj-detail">
    <em-header
      icon="cube"
      :title="project.name"
      :description="page.description"
      :nav="nav"
      v-model="pageName">
    </em-header>
    <div v-shortkey="['tab']" @shortkey="handleKeyTab()"></div>
    <em-keyboard-short v-model="keyboards"></em-keyboard-short>
    <Back-top>
      <em-add icon="arrow-up-c" :bottom="90"></em-add>
    </Back-top>
    <transition name="fade" mode="out-in">
      <project v-if="pageName === $t('p.detail.nav[1]')" key="a" :project-data="project"></project>
      <div
        class="em-container"
        v-if="pageAnimated && pageName === $t('p.detail.nav[0]')"
        key="b">
        <div class="em-proj-detail__info">
          <Row>
            <Col span="19">
              <em-spots :size="6"></em-spots>
              {{project.description}}
              <p class="tag">
                <span>Base URL</span>
                {{baseUrl}}
              </p>
              <p class="tag">
                <span>Project ID</span>
                {{project._id}}
              </p>
            </Col>
            <Col span="5">
              <div>
                <img :src="group ? '/public/images/group-default.png' :project.user.head_img" />
                <p class="author">{{group ? group.name : project.user.nick_name}}</p>
              </div>
            </Col>
          </Row>
        </div>
        <div class="em-proj-detail__switcher">
          <ul>
            <li @click="openEditor()" v-shortkey="['ctrl', 'n']" @shortkey="openEditor()">
              <Icon type="plus-round"></Icon> {{$t('p.detail.create.action')}}
            </li>
            <li @click="handleWorkbench" v-shortkey="['ctrl', 'w']" @shortkey="handleWorkbench">
              <transition name="zoom" mode="out-in">
                <Icon :type="project.extend.is_workbench ? 'android-star' : 'android-star-outline'"
                  :key="project.extend.is_workbench"></Icon>
              </transition>
              {{$t('p.detail.workbench')}}
            </li>
            <li @click="updateBySwagger" v-shortkey="['ctrl', 's']" @shortkey="updateBySwagger">
              <Icon type="loop"></Icon> {{$t('p.detail.syncSwagger.action')}}
            </li>
            <li @click="download"><Icon type="code-download"></Icon> {{$tc('p.detail.download', 1)}}</li>
          </ul>
        </div>
        <div class="em-proj-detail__members" v-if="project.members.length">
          <em-spots :size="6"></em-spots>
          <h2><Icon type="person-stalker"></Icon> {{$t('p.detail.member')}}</h2>
          <Row :gutter="20">
            <Col span="2" v-for="(item, index) in project.members" :key="index">
              <img :src="item.head_img" :title="item.nick_name"/>
            </Col>
          </Row>
        </div>
        <div class="detail-nav-container">
          <div class="classify-box">
            <div class="classify-header">
              <p>接口分类</p>
              <Icon type="android-add-circle" class="add-classify" size="20" @click.native="addClassifyDialog = true"></Icon>
            </div>
            <Tree class="classify-tree" :data="classifyData" :render="renderContent" @on-select-change="handleClassifyChange"></Tree>
          </div>
          <Table
          border
          :columns="columns"
          :data="list"
          @on-selection-change="selectionChange"
          :highlight-row="true"
          />
        </div>
        <Modal
          v-model="addClassifyDialog" 
          title="新增分类"
          @on-ok="handleAddClassify"
          @on-cancel="addClassifyDialog = false"
        >
          <Form :model="form" :label-width="80">
            <Form-item label="分类名">
              <Input v-model="form.name" placeholder="请输入"></Input>
            </Form-item>
          </Form>
      </Modal>
      </div>
    </transition>
  </div>
</template>

<style>
@import './index.css';
</style>

<script>
import Clipboard from 'clipboard'
import debounce from 'lodash/debounce'

import * as api from '../../api'
import Project from '../new/project'
import MockExpand from './mock-expand'

import TreeRender from './classify-tree/tree-render.vue'

export default {
  name: 'projectDetail',
  data () {
    return {
      pageName: this.$t('p.detail.nav[0]'),
      selection: [],
      keywords: '',
      nav: [
        { title: this.$t('p.detail.nav[0]'), icon: 'android-list' },
        { title: this.$t('p.detail.nav[1]'), icon: 'gear-a' }
      ],
      keyboards: [
        {
          category: this.$t('p.detail.keyboards[0].category'),
          list: [
            {
              description: `${this.$t('p.detail.nav[0]')}/${this.$t('p.detail.nav[1]')}`,
              shorts: ['tab']
            }
          ]
        },
        {
          category: this.$t('p.detail.keyboards[1].category'),
          list: [
            { description: this.$t('p.detail.keyboards[1].list[0]'), shorts: ['ctrl', 'n'] },
            { description: this.$t('p.detail.keyboards[1].list[1]'), shorts: ['ctrl', 'w'] },
            { description: this.$t('p.detail.keyboards[1].list[2]'), shorts: ['ctrl', 's'] }
          ]
        }
      ],
      columns: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(MockExpand, {
              props: {
                mock: params.row
              }
            })
          }
        },
        { type: 'selection', width: 60, align: 'center' },
        { title: '名称', width: 120, ellipsis: true, key: 'name' },
        {
          title: 'Method',
          width: 110,
          key: 'method',
          filters: [
            { label: 'get', value: 'get' },
            { label: 'post', value: 'post' },
            { label: 'put', value: 'put' },
            { label: 'delete', value: 'delete' },
            { label: 'patch', value: 'patch' }
          ],
          filterMethod (value, row) {
            return row.method.indexOf(value) > -1
          },
          render: (h, params) => {
            const color = {
              get: 'blue',
              post: 'green',
              delete: 'red',
              put: 'yellow',
              patch: 'yellow'
            }
            return <tag class="method-tag" color={color[params.row.method]}>
              {params.row.method.toUpperCase()}
            </tag>
          }
        },
        { title: 'URL', width: 320, ellipsis: true, sortable: true, key: 'url' },
        // { title: this.$t('p.detail.columns[0]'), ellipsis: true, key: 'description' },
        {
          title: this.$t('p.detail.columns[1]'),
          key: 'action',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return (
              <div>
                <Button-group>
                  <i-button size="small" title={this.$t('p.detail.action[0]')} onClick={this.preview.bind(this, params.row)}><icon type="eye"></icon></i-button>
                  <i-button size="small" title={this.$t('p.detail.action[1]')} onClick={this.openEditor.bind(this, params.row)}><icon type="edit"></icon></i-button>
                  <i-button size="small" title={this.$t('p.detail.action[2]')} class="copy-url" onClick={this.clip.bind(this, params.row.url)}><icon type="link"></icon></i-button>
                </Button-group>
                <dropdown>
                  <i-button size="small"><icon type="more"></icon></i-button>
                  <dropdown-menu slot="list">
                    <dropdown-item nativeOnClick={this.clone.bind(this, params.row)}><icon type="ios-copy"></icon> {this.$t('p.detail.action[3]')}</dropdown-item>
                    <dropdown-item nativeOnClick={this.download.bind(this, params.row._id)}><icon type="ios-download"></icon> {this.$tc('p.detail.download', 2)}</dropdown-item>
                    <dropdown-item nativeOnClick={this.remove.bind(this, params.row._id)}><icon type="trash-b"></icon> {this.$t('p.detail.action[4]')}</dropdown-item>
                  </dropdown-menu>
                </dropdown>
              </div>
            )
          }
        }
      ],
      addClassifyDialog: false,
      form: {
        name: ''
      },
      selectedClassify: ''
    }
  },
  asyncData ({ store, route }) {
    store.commit('mock/INIT_REQUEST')
    return store.dispatch('mock/FETCH', {route})
  },
  mounted () {
    this.$on('query', debounce((keywords) => {
      this.keywords = keywords
    }, 500))

    // this.getClassifiesList()
    this.$store.dispatch('classify/FETCH', this.projectId)
  },
  computed: {
    project () {
      return this.$store.state.mock.project
    },
    list () {
      const list = this.$store.state.mock.list
      const reg = this.keywords && new RegExp(this.keywords, 'i')
      return reg
        ? list.filter(item => (
          reg.test(item.name) || reg.test(item.url) || reg.test(item.method)
        ))
        : list
    },
    page () {
      return {
        description: this.project.user
          ? this.$t('p.detail.header.description[0]')
          : this.$t('p.detail.header.description[1]')
      }
    },
    baseUrl () {
      const baseUrl = location.origin + '/mock/' + this.project._id
      return this.project.url === '/' ? baseUrl : baseUrl + this.project.url
    },
    group () {
      return this.project.group
    },
    projectId () {
      return this.$route.params.id
    },
    classifyData () {
      return this.$store.state.classify.list || []
    }
  },
  methods: {
    handleKeyTab () {
      this.pageName = this.pageName === this.$t('p.detail.nav[1]')
        ? this.$t('p.detail.nav[0]')
        : this.$t('p.detail.nav[1]')
    },
    clip (mockUrl) {
      const clipboard = new Clipboard('.copy-url', {
        text: () => {
          return this.baseUrl + mockUrl
        }
      })
      clipboard.on('success', (e) => {
        e.clearSelection()
        clipboard.destroy()
        this.$Message.success(this.$t('p.detail.copySuccess'))
      })
    },
    preview (mock) {
      window.open(this.baseUrl + mock.url + '#!method=' + mock.method)
    },
    selectionChange (selection) {
      this.selection = selection
    },
    download (mockId) {
      if (typeof mockId === 'string') {
        const ids = this.selection.length
          ? this.selection.map(item => item._id)
          : [mockId]
        api.mock.export(ids)
      } else {
        api.mock.export(this.project._id)
      }
    },
    updateBySwagger () {
      if (!this.project.swagger_url) {
        this.$Message.warning(this.$t('p.detail.syncSwagger.warning'))
        return
      }
      this.$Modal.confirm({
        title: this.$t('confirm.title'),
        content: this.$t('p.detail.syncSwagger.confirm'),
        onOk: () => {
          api.project.updateSwagger({
            data: { id: this.project._id }
          }).then((res) => {
            if (res.data.success) {
              const syncErrorURLs = res.data.data.syncErrorURLs
              if (syncErrorURLs.length) {
                this.$Notice.success({
                  title: this.$t('p.detail.syncSwagger.syncResult'),
                  desc: this.$t('p.detail.syncSwagger.success')
                })
                this.$Notice.warning({
                  title: this.$t('p.detail.syncSwagger.syncFailed.title'),
                  duration: 0,
                  desc: `${syncErrorURLs.join(', ')} ${this.$t('p.detail.syncSwagger.syncFailed.desc')}`
                })
              } else {
                this.$Message.success(this.$t('p.detail.syncSwagger.success'))
              }
              this.$store.commit('mock/SET_REQUEST_PARAMS', {pageIndex: 1})
              this.$store.dispatch('mock/FETCH', this.$route)
            }
            return res
          })
        }
      })
    },
    remove (mockId) {
      const ids = this.selection.length
        ? this.selection.map(item => item._id)
        : [mockId]
      this.$Modal.confirm({
        title: this.$t('confirm.title'),
        content: ids.length > 1 ? this.$t('p.detail.remove.confirm[0]') : this.$t('p.detail.remove.confirm[1]'),
        onOk: () => {
          api.mock.delete({
            data: { project_id: this.project._id, ids }
          }).then((res) => {
            if (res.data.success) {
              this.$Message.success(this.$t('p.detail.remove.success'))
              this.$store.commit('mock/SET_REQUEST_PARAMS', { pageIndex: 1 })
              this.$store.dispatch('mock/FETCH', this.$route)
            }
          })
        }
      })
    },
    handleWorkbench () {
      this.$store.dispatch('project/WORKBENCH', this.project.extend)
    },
    clone (mock) {
      console.log('mock', mock)
      this.$store.dispatch('mock/CREATE', {
        route: this.$route,
        ...mock,
        url: `${mock.url}_copy_${new Date().getTime()}`
      }).then(res => {
        if (res.data.success) {
          this.$Message.success(this.$t('p.detail.create.success'))
        }
      })
    },
    openEditor (mock) {
      if (mock) {
        this.$store.commit('mock/SET_EDITOR_DATA', {mock, baseUrl: this.baseUrl})
        this.$router.push(`/editor/${this.project._id}/${mock._id}`)
      } else {
        this.$router.push(`/editor/${this.project._id}`)
      }
    },
    handleClassifyChange (classify) {
      console.log('change-classify', classify)
    },
    renderContent (h, {root, node, data}) {
      let that = this
      return h(TreeRender, {
        props: {
          treeRoot: root,
          treeNode: node,
          treeData: data,
          selected: that.selectedClassify
        },
        on: {
          handleClick: (d) => that.handleClick(d),
          nodeEdit: (r, n, d) => that.handleEdit(r, n, d),
          nodeDel: (r, n, d) => that.handleDelete(r, n, d),
          nodeAfterEdit: (r, n, d) => that.handleAfterEdit(r, n, d)
        }
      })
    },
    handleClick (classify) {
      this.selectedClassify = classify.nodeKey
      this.$store.commit('mock/INIT_PAGEINDEX')
      this.$store.dispatch('mock/FETCH', {route: this.$route, classifyId: classify.id}).then(res => {
      })
    },
    // 编辑后，input框失去焦点
    handleAfterEdit (r, n, d) {
      console.log('change-after', d)
      this.$store.dispatch('classify/UPDATE', {newName: d.title || '未命名', projectId: this.projectId, id: d.id})
        .then(res => {
          if (res.data.success) {
            this.$Message.success('修改成功！')
          }
        })
    },
    // 编辑中，input框得到焦点
    handleEdit (r, n, d) {
      console.log('change-ing', d)
    },
    saveOrUpdateColumn (column) {
      this.axios.request('POST', '你的接口', column).then((response) => {
        let status = response.status
        if (status === 200) {
          // 完成增或者改操作后进行一次查询
          this.initTreeList()
        } else {
        // 提示错误
          let errorMsg = '[' + response.errorCode + ']:' + response.errorMsg
          this.$Notice.error({
            title: '错误',
            desc: errorMsg,
            duration: 5
          })
        }
      })
    },
    handleDelete (r, n, d) {
      console.log('delete', d)
      this.$store.dispatch('classify/DELETE', {id: d.id, projectId: this.projectId})
        .then(res => {
          if (res.data.success) {
            this.$Message.success('删除成功！')
          }
        })
    },
    handleAddClassify () {
      this.$store.dispatch('classify/CREATE', { name: this.form.name, projectId: this.projectId }).then(res => {
        if (res.data.success) {
          this.$Message.success('创建成功！')
          this.addClassifyDialog = false
        }
      })
    }
  },
  components: {
    Project
  }
}
</script>
<style lang="postcss">
  .classify-box {
    border: solid 1px#dddee1;
     li:hover {
      background-color: #eaf4fe;
    }
    .classify-tree {
      padding-right: 10px;
    }
  }
</style>