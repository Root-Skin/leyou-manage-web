<template>
  <div>
    <v-list-tile
      @click="toggle" class="level1 py-0 my-0" :class="{'selected':isSelected}">
      <!-- 这里的selected  来自最后的样式,(这里isSelected ==true 就会加载颜色上去)-->


      <v-list-tile-avatar class="px-1">
        <v-icon v-if="model.isParent">{{ open ? 'folder_open' : 'folder' }}</v-icon>
        <v-icon v-if="!model.isParent">insert_drive_file</v-icon>
      </v-list-tile-avatar>


      <!-- @click.stop="" 在其中的作用是 阻止传播点击事件到 上层@click="toggle"-->
      <v-list-tile-content>
        <v-list-tile-title v-show="!beginEdit">
          <span>{{ model.categoryName }}</span>
        </v-list-tile-title>
        <!-- 可以实时编辑分类名称-->
        <input v-show="beginEdit" @click.stop="" :ref="model.id" v-model="model.categoryName"
               @blur="afterEdit" @keydown.enter="afterEdit"/>
      </v-list-tile-content>

      <!-- 添加子类  isEdit为true的时候才被渲染-->
      <v-list-tile-action v-if="isEdit">
        <v-btn icon @mouseover="c1='primary'" @mouseout="c1=''" :color="c1" @click.stop="addChild">
          <i class="el-icon-plus"/>
        </v-btn>
      </v-list-tile-action>

      <v-list-tile-action v-if="isEdit">
        <v-btn icon @mouseover="c2='success'" @mouseout="c2=''" :color="c2" @click.stop="editChild">
          <i class="el-icon-edit"/>
        </v-btn>
      </v-list-tile-action>

      <v-list-tile-action v-if="isEdit">
        <v-btn icon @mouseover="c3='error'" @mouseout="c3=''" :color="c3" @click.stop="deleteChild">
          <i class="el-icon-delete"/>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>

    <v-list v-if="isFolder" v-show="open" class="ml-4 pt-0 pb-0" dense transition="scale-transition">
      <tree-item
        class="item"
        v-for="(model, index) in model.children"
        :key="index"
        :model="model"
        :url="url"
        :isEdit="isEdit"
        :nodes="nodes"
        :parentState="open"
        @handleAdd="handleAdd"
        @handleEdit="handleEdit"
        @handleDelete="handleDelete"
        @handleClick="handleClick"
      >
      </tree-item>
    </v-list>
  </div>
</template>

<script>

import Vue from 'vue'

export default {
  name: "tree-item",
  props: {
    model: Object,
    url: String,
    isEdit: {
      type: Boolean,
      default: false
    },
    nodes: Object,
    parentState: Boolean
  },
  created() {
  },
  //这里的data是一个函数的作用是,每次创建对象都有一个全新的副本(而非共享相同的对象)
  data: function () {
    return {
      c1: '',
      c2: '',
      c3: '',
      isSelected: false,
      open: false,
      beginEdit: false   //这里绑定的是v-show的展示
    }
  },
  watch: {
    parentState(val) {
      if (!val) {
        this.open = val;
      }
    }
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length > 0
    }
  },
  methods: {
    //展示当前项是否存在子节点
    toggle: function () {
      //[1.2.3 构成循环]
      // 1.将其它被选中项取消选中(主要通过将父组件中的)
      this.nodes.selected.isSelected = false;
      // 2.当前项被选中(加载颜色.class)
      this.isSelected = true;
      // 3.保存当前选中项(this指的是当前的用户点击的实例)-->这里的作用将原来selected:{isSelected:false}保存的数据转换为新的对象-->下次点击回到1去就是取消这个选择项
      this.nodes.selected = this

      // 客户自己的点击事件回调
      this.handleClick(this.model);

      // 判断是否为顶级节点，顶级节点需要记录和替换(从返回的数据获取parentID)
      if (this.model.parentId == 0) {
        // 判断打开节点是否是自己(this.nodes.opened第一次是null)
        if (this.nodes.opened && this != this.nodes.opened) {
          // 不是，则关闭原来的节点
          this.nodes.opened.open = false;
        }
        // 将自己记录为打开的节点
        this.nodes.opened = this;
      }
      // 切换开闭状态
      //(关闭)true-->false  下面的!this.open就是true了
      this.open = !this.open;
      // 如果已经是叶子节点,或者自己是关闭的，或者自己已经有儿子了，结束
      //***这里很重要的是第一次进来的时候 this.model.children中的children还没有加载出来,this.isFolder==undefine**
      //这里移除了(|| this.isFolder) 保证每次点击打开的时候进行刷新--不然修改不成功,页面不刷新,错误的信息显示在页面上
      if (!this.model.isParent  || !this.open) {
        return;
      }
      // 展开后查询子节点
      this.$http.get(this.url + '/list', {params: {pid: this.model.id}})
        .then(resp => {
          Vue.set(this.model, 'children', resp.data.data);
          // 封装当前节点的路径
          this.model.children.forEach(n => {
            n['path'] = [];
            //这里的path 是tree组件传递进来的是categoryName-->每一个父选项下都是独一无二的path
            this.model.path.forEach(p => {
              n['path'].push(p)
            });
            //在path上添加当前点击的分类名称
            n['path'].push(n.categoryName);
          });
        }).catch(e => {
        console.log(e);
      });
    },
    addChild: function () {
      let child = {
        // id: '',
        categoryName: 'new point',
        parentId: this.model.id,
        isParent: false,
        //设置优先级
        sort: this.model.children ? this.model.children.length + 1 : 1
      }
      //如果不是父组件
      console.log(this.model.isParent);
      if (!this.model.isParent) {
        Vue.set(this.model, 'children', [child]);
        this.model.isParent = true;
        this.open = true;
      } else {
        //如果是父组件,目前子组件还是null,(并未点击,而是直接点击'+'号)-->所有这里请求了一次接口
        if (!this.isFolder) {
          this.$http.get(this.url + '/list', {params: {pid: this.model.id}}).then(resp => {
            Vue.set(this.model, 'children', resp.data.data);
            //数组采用.push 方法添加新的数据
            this.model.children.push(child);
            this.open = true;
            // this.handleAdd(child);
          });
        } else {
          this.model.children.push(child);
          this.open = true;
          // this.handleAdd(child);
        }
      }
      //数据组装完成 在走这一步
      this.$http.post(this.url + '/add', child).then(res => {
        if (res.data.code === 10000) {
          this.$message.info('新增成功');
          this.handleAdd(child);
        } else {
          this.$message.info('新增失败');
        }
      })
    },
    //这里删除节点,我们需要同步到数据库中
    deleteChild: function () {
      this.$message.confirm('此操作将永久删除数据，是否继续?', '提示', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.get(this.url + '/del', {params: {cateId: this.model.id}}).then(res => {
          if (res.data.code === 10000) {
            this.$message.info('删除成功');
            this.handleDelete(this.model.id);
          } else {
            this.$message.info('删除失败');
          }
        })

      }).catch(() => {
        this.$message.info('已取消删除');
      })

    },
    //在数据变化后要执行的某个操作，而这个操作需要使用随数据改变而改变的DOM结构的时候，这个操作都应该放进Vue.nextTick()的回调函数中。
    editChild:function () {
      console.log("test");
      this.beginEdit = true;
      this.$nextTick(() => this.$refs[this.model.id].focus());
    },
    //这个函数使用了@blur注解-->表示失去焦点的时候触发
    // @keydown.enter 并且使他在按下enter的时候触发
    //after编辑之后应该保存
    afterEdit() {
      //遇见的问题,this.model.beginEdit在model 中不存在这个变量,原有代码上是错误的
      console.log(this.beginEdit);
      if (this.beginEdit) {
        this.beginEdit = false;
        let newInfo = {
          categoryName: this.model.categoryName,
          id: this.model.id
        }
        this.$http.post(this.url + '/update', newInfo).then(res => {
          if (res.data.code === 10000) {
            this.$message.info('编辑成功');
            this.handleEdit(this.model.id, this.model.categoryName);
          } else {
            this.$message.info(res.data.message);
            this.editChild();
          }
        })
      }
    },
    handleAdd(node) {
      //$emit()——把事件沿着作用域链向上派送。（触发事件）！！--传递给tree.vue
      this.$emit("handleAdd", node);
    },
    handleDelete(id) {
      this.$emit("handleDelete", id);
    },
    handleEdit(id, name) {
      this.$emit("handleEdit", id, name)
    },
    handleClick(node) {
      this.$emit("handleClick", node);
    }
  }
}
</script>

<style scoped>
.level1 {
  height: 40px;
}

.selected {
  background-color: #A35E47;
}

.material-icons {
  line-height: 1.7
}
</style>
