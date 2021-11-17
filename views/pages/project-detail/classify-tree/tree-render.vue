<!-- TreeRender -->
<template>
  <span>
    <span v-if="isEdit">
      <input size="small" v-model="treeData.title" autofocus
      @blur="nodeEditPass(treeRoot,treeNode,treeData)"/>
    </span>
     <template v-else>
         <span class="tree-title" :title="treeData.title" :class="{ selected: selected === treeData.nodeKey}" @click="handleClick(treeData)">{{treeData.title}}</span>
        <span class="more-icon-box" v-if="treeData.id" v-show="!isEdit">
          <Poptip placement="right" trigger="hover">
            <Icon class="more-icon" type="more" ></Icon>
            <div class="click-box" slot="content">
              <i-button type="text" size="small" icon="md-create" @click="nodeEdit(treeRoot,treeNode,treeData)">修改</i-button>
              <i-button class="delete" type="text" size="small" icon="md-close" @click="nodeDel(treeRoot,treeNode,treeData)">删除</i-button>
            </div>
        </Poptip>
        </span>
    </template>
  </span>
</template>

<script>
export default {
  name: 'TreeRender',
  components: {},
  data () {
    return {
      isEdit: false
    }
  },
  props: {
    // 树的根节点
    treeRoot: {
      type: Array
    },
    // 当前节点
    treeNode: {
      type: Object
    },
    // 当前节点的数据
    treeData: {
      type: Object
    },
    selected: {
      type: [String, Number]
    }
  },
  computed: {},
  methods: {
    handleClick (d) {
      this.$emit('handleClick', d)
    },
    nodeEdit (r, n, d) {
      this.isEdit = true
      d.isEdit = this.isEdit
      d.title = this.treeData.title
      this.$set(d, 'isEdit', d.isEdit)
      this.$set(d, 'title', d.title)
      this.$emit('nodeEdit', r, n, d)
    },
    nodeEditPass (r, n, d) { // 编辑完成
      this.isEdit = false
      d.isEdit = this.isEdit
      d.title = this.treeData.title
      this.$set(d, 'isEdit', d.isEdit)
      this.$set(d, 'title', d.title)
      this.$emit('nodeAfterEdit', r, n, d)
    },
    nodeDel (r, n, d) {
      this.$emit('nodeDel', r, n, d)
    }
  },
  watch: {},
  created () {},
  mounted () {
  }
}
</script>

<style lang="postcss" scoped>
.more-icon-box {
  float: right;
}
.more-icon:hover {
  color: #327fe0;
  cursor: pointer;
}
.tree-title:hover {
  color: #327fe0;
  cursor: pointer;
}
.selected {
  color: #327fe0;
}
.delete {
  color: red;
}
</style>