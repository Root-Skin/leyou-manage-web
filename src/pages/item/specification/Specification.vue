<template>
  <v-card>
    <v-layout row>
      <!-- 商品分类 -->
      <v-flex xs3>
        <v-card>
          <v-card-title>选择分类，查看规格参数模板：</v-card-title>
          <v-divider/>
          <v-tree url="/manager/category"
                  :isEdit="false"
                  @handleClick="handleClick"
          />
<!--          <v-dialog v-model="dialog" width="660px" scrollable persistent></v-dialog>-->
        </v-card>
      </v-flex>
      <!-- 规格参数 -->
      <v-flex xs9 class="px-1">
        <v-card class="elevation-0" v-show="currentNode.id">
          <v-card-title v-if="!currentNode.path">
            请先选择一个分类
          </v-card-title>
          <v-breadcrumbs dense v-else>
            <v-icon slot="divider">chevron_right</v-icon>
            <v-breadcrumbs-item
              v-for="(item,i) in items"
              :key="i"
            >
              <span v-if="i === 2" @click="back">{{ item }}</span>
              <span v-else>{{ item }}</span>
            </v-breadcrumbs-item>
          </v-breadcrumbs>
          <v-divider/>
          <v-card-text>
            <spec-group :cid="currentNode.id" v-show="showGroup" @select="selectGroup"/>
            <spec-param :group="group" v-show="!showGroup" />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>

export default {
  name: "v-spec",
  data() {
    return {
      specifications:[], //当前分类参数
      oldSpec:[],    //修改前的分类参数
      dialog:false,  //是否弹出对话框
      isInsert:false,  //判断接下来是新增还是修改
      currentNode: {}, // 当前被选中的商品分类节点  #定义为对象的原因,我们列表上展示的就是一个对象{},node
      group:{}, // 被选中的分组
      showGroup:true, // 是否展示分组
    };
  },
  methods: {
    // 分类点击后的弹窗 node 未定义,默认是选中的对象{}
    handleClick(node) {
      // 判断点击的节点是否是父节点（只有点击到叶子节点才会展示规格）
      if (!node.isParent) {
        // 如果是叶子节点，那么就发起ajax请求，去后台查询商品规格数据。
        this.$http.get("/manager/specification/getByCateId?cateId=" + node.id)
          .then(resp => {
            if(resp.data.code==10000){
              // 查询成功后，把响应结果赋值给specifications属性，Vue会进行自动渲染。
              this.specifications = resp.data.data.groupName;
              // 记录下此时的规格数据，当页面撤销修改时，用来恢复原始数据
              this.oldSpec = resp.data.data.groupName;
              // 打开弹窗
              this.dialog = true;
              // 标记此时要进行修改操作
              this.isInsert = false;
            }else if(resp.data.code==99999){
              // 如果没有查询成功，那么询问是否添加规格
              this.$message.confirm('该分类还没有规格参数，是否添加?')
                .then(() => {
                  // 如果要添加，则将specifications初始化为空
                  this.specifications = [{
                    group: '',
                    params: []
                  }];
                  // 打开弹窗
                  this.dialog = true;
                  // 标记为新增
                  this.isInsert = true;
                })
            }
          })
        // 把当前点击的节点记录下来
        this.currentNode = node;
        console.log(111);
        console.log(this.currentNode);
        // 显示规格组
        this.showGroup = true;
        // 记录选中的规格组，默认为空
        this.group = {};
      }
    },
    selectGroup(group){
      // 记录选中的分组
      this.group = group;
      // 不再显示分组，而是显示规格参数
      this.showGroup = false;
    },
    back(){
      this.showGroup = true;
      this.group = {};
    }
  },
  components:{
    SpecGroup: () => import('./SpecGroup.vue'),
    SpecParam: () => import('./SpecParam.vue'),
  },
  computed:{
    items(){
      const items = this.currentNode.path;
      if(this.group.name){
        items[3] = this.group.name;
      }
      return items;
    }
  }
};
</script>

<style scoped>
</style>
