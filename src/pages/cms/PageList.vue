<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :options.sync="options"
      :server-items-length="totalDesserts"
      :loading="loading"
      @input="onPageChange"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.pageName }}</td>
        <td class="text-xs-center">{{ props.item.pagePath }}</td>
        <td class="text-xs-center">{{props.item.pagePsyPath}}</td>
        <td class="text-xs-center">{{ props.item.createdTime }}</td>
    </template >

    </v-data-table>
  </div>
</template>

<script>

export default {
  data() {
    return {
      headers: [
        {text: '页面名称', align: 'center', sortable: false, value: 'pageName'},
        {text: '访问路径', align: 'center', sortable: false, value: 'pagePath'},
        {text: '物理路径', align: 'center', sortable: false, value: 'pagePsyPath'},
        {text: '创建时间', align: 'center', value: 'createdTime', sortable: true,},
      ],
      totalDesserts: 0,  //服务器提供的总项目数
      desserts: [],      //当前页需要展示的数据数组
      options: {
        page: 0,
        rowsPerPageItems: 10,
      }, // 分页配置
      loading: true, // 是否在加载中
    }
  },


  //页面上已经挂载了 分页需要的参数才进行调用(created这个时候还没有进行挂载)
  mounted() {
    this.getPageList();
  },
  watch: {
    options: {
      deep: true,
      handler() {
        this.getPageList()
      },
    },
  },
  methods: {
    getPageList() {
      console.log(this.options.page)
      console.log(this.options.itemsPerPage)
      this.$http.post("/manager/cmsPage/pageList", {
        pageNo: this.options.page,// 当前页
        pageSize: this.options.rowsPerPageItems,// 每页大小
      }).then(resp => {
        // 然后赋值给brands
        this.desserts = resp.data.data.records;
        //设置总数
        this.totalBrands = resp.data.data.total;
        this.loading = false;
      })
    },
    onPageChange(){
      this.page = page;
       this.getData();
    }

  }

}
</script>
<style>

</style>
