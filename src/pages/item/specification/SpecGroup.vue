<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="groups"
      hide-actions
      class="elevation-0"
    >
      <template slot="items" slot-scope="props">
        <tr @click="selectGroup(props.item)">
          <td class="text-xs-center">{{ props.item.id }}</td>
          <td class="text-xs-center">{{ props.item.name}}</td>
          <td class="justify-center layout px-0">
            <v-btn icon @click.stop="editGroup(props.item)">
              <i class="el-icon-edit"/>
            </v-btn>
            <v-btn icon @click.stop="deleteGroup(props.item.id)">
              <i class="el-icon-delete"/>
            </v-btn>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        该分类下暂无规格组或尚未选择分类
      </template>
    </v-data-table>

    <v-btn color='primary' @click="addGroup">新增分组</v-btn>
    <v-dialog v-model="show" width="300" height="200">
      <v-card>
        <v-card-text>
          <v-text-field label="分组名称：" v-model="group.groupName"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="blue darken-1" flat @click.native="show=false">取消</v-btn>
          <v-btn color="blue darken-1" flat @click.native="save">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "spec-group",
  //只从上一层传递一个参数cid
  props: {
    cid: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      groups: [],
      headers: [
        {text: "id", value: "id", align: "center", sortable: false},
        {text: "组名", value: "name", align: "center", sortable: false},
        {text: "操作", align: "center", sortable: false}
      ],
      show: false, // 是否打开编辑窗口
      group: {groupName: ''},
      isEdit: false, // 是否是编辑
    };
  },
  watch: {
    cid() {
      this.loadData();
    }
  },
  methods: {
    //监控 刷新加载数据
    loadData() {
      this.$http.get("/manager/specification/cateGroupList?cateId=" + this.cid)
        .then(resp => {
          //success 返回数据
          if (resp.data.code == 10000) {
            this.groups = resp.data.data;
          } else {
            this.groups = [];
          }
        })
    },
    //编辑分组
    editGroup(group) {
      //Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象 source 复制到目标对象。
      // 它将返回目标对象 target 。 Object.assign 方法的第一个参数是目标对象，后面的参数都是源对象。
      // 注意：如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。
      Object.assign(this.group, group);
      this.show = true;
      this.isEdit = true;
    },
    //手动添加分组
    addGroup() {
      //将上层传递进来的分类ID
      this.group = {categoryId: this.cid};
      //打开新增,关闭编辑
      this.show = true;
      this.isEdit = false;
    },
    //分组保存接口
    save() {
      if (this.isEdit) {
        //编辑节点
        this.$http.post("/manager/specification/editGroup", this.group)
          .then(resp => {
            this.show = false;
            this.$message.success("保存成功！");
            this.loadData();
          })
      } else {
        //新增节点
        this.$http.post("/manager/specification/addGroup", this.group)
          .then(resp => {
            this.show = false;
            this.$message.success("保存成功！");
            this.loadData();
          })
      }
    },
    deleteGroup(id) {
      this.$message.confirm("确认要删除分组吗？")
        .then(() => {
          this.$http.delete("/item/spec/group/" + id)
            .then(() => {
              this.$message.success("删除成功");
              this.loadData();
            })
        })
    },
    selectGroup(group) {
      this.$emit("select", group);
    }
  }
};
</script>
