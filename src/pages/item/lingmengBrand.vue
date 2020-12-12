<template>
  <div>
    <v-card-title>
      <v-btn dark small color="primary" @click="addBrand">
        Add new brand
      </v-btn>
      <v-spacer/>
      <v-text-field
        label="请输入关键字搜索"
        placeholder=""
        append-icon="youtube_searched_for"
        hide-details
        v-model.lazy="search"
      ></v-text-field>
    </v-card-title>

    <!--实现动态分页-->
    <v-data-table
      :headers="headers"
      :items="data"
      :search="search"
      :pagination.sync="pagination"
      :total-items="totalBrands"
      :loading="loading"
      class="elevation-1"
    >
      <!--server-items-length 表示总条数-->
      <!--items 对应组件上的 data[]数据组 -->
      <!--props的作用是将 items 获取items中的作用域 -->
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.brandName }}</td>
        <td class="text-xs-center">
          <img v-if="props.item.brandPic" :src="props.item.brandPic" width="130" height="40">
          <span v-else>无</span>
        </td>
        <td class="text-xs-center">{{ props.item.brandLetter }}</td>
        <td class="text-xs-center">
          <v-btn color="info" @click="editBrand(props.item) ">
            <v-icon>create</v-icon>
          </v-btn>
          <v-btn color="info" @click="delBrand(props.item.id)">
            <v-icon>delete_sweep</v-icon>
          </v-btn>

        </td>
      </template>
    </v-data-table>
    <!--弹出的对话框-->
    <v-dialog max-width="500" v-model="showDialog" persistent>
      <v-card>
        <!--对话框的标题-->
        <v-toolbar dense dark color="primary">
          <v-toolbar-title>{{ isEdit ? 'Edit' : 'Add' }} The new brand</v-toolbar-title>
          <v-spacer/>
          <v-btn icon @click="closeWindow">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <!--对话框的内容，表单 -->
        <!--`class=“px-5"`：vuetify的内置样式，含义是padding的x轴设置为5，这样表单内容会缩进一些，而不是顶着边框 -->
        <v-card-text class="px-5">
          <lingmeng-brand-form @close="closeWindow" :oldBrand="oldBrand" :isEdit="isEdit"></lingmeng-brand-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import lingmengBrandForm from './lingmengBrandForm';

export default {

  name: "lingmeng-brand",

  //引入我们在外部定义的自定义组件
  components: {
    lingmengBrandForm
  },

  data() {   //data()[es6写法]-->就是data:function(){}  --为了不让多处的组件共享同一data对象，只能返回函数。
    return {
      headers: [
        {text: '名称', align: 'center', value: 'brand_name', sortable: false},
        {text: 'LOGO', align: 'center', value: 'brand_pic', sortable: false},
        {text: '首字母', align: 'center', value: 'brand_letter', sortable: true},
        {text: '操作', align: 'center', value: 'id', sortable: false}
      ],
      data: [],  // 每一行的数据 使用数组包裹
      pagination: {},
      search: '',
      loading: true,
      totalBrands: 0,
      showDialog: false,  //默认不显示新增对话框
      oldBrand: {},
      isEdit: false
    }
  },
  mounted() {
    this.getFateDate()
  },
  //监控
  watch: {
    pagination: {
      deep: true,
      handler() {
        this.getFateDate()
      },
    },
  },
  //渲染
  search: { // 监视搜索字段
    handler() {
      this.getDataFromServer();
    }
  },
  methods: {
    getFateDate() {
        //请求数据
        this.$http.post("/manager/brand/list", {
          keyWords: this.search, // 搜索条件
          pageNo: this.pagination.page,// 当前页
          pageSize: this.pagination.rowsPerPage,// 每页大小
          sortBy: this.pagination.sortBy,// 排序字段
          desc: this.pagination.descending// 是否降序
        }).then(resp => {
          // 然后赋值给brands
          this.data = resp.data.data.records;
          //设置总数
          this.totalBrands = resp.data.data.total;
          this.loading = false;
        })
    },
    addBrand() {
      //控制新增品牌的窗口可见
      this.isEdit = false;
      this.showDialog = true;
      //清空编辑后的旧数据
      this.oldBrand = null;
    },
    closeWindow() {
      // 关闭窗口
      this.showDialog = false;
      this.getFateDate();
    },
    editBrand(oldBrand) {
      this.isEdit = true;
      this.$http.get("/manager/brand/getOneById/?brandId=" + oldBrand.id)
        .then(({data}) => {
          // 控制弹窗可见：
          console.log({data}.data.data);
          // 根据品牌信息查询商品分类
          this.showDialog = true;
          // 获取要编辑的brand
          this.oldBrand = oldBrand
          // 回显商品分类
          this.oldBrand.categories = {data}.data.data;
        })
    },
    delBrand(id) {
      this.$http.get("/manager/brand/del/?id=" + id)
        .then(({data}) => {
          this.$message.success("删除成功！");
          this.getFateDate();
        }).catch(() => {
        this.$message.error("删除失败！");
      });
    }
  }
}
</script>

<style scoped>

</style>
