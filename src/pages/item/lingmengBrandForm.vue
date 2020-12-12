<template>
  <div>
    <v-form v-model="valid" ref="lingmengBrandForm">
      <v-text-field v-model="brand.brandName" label="Brand name" />
      <v-text-field v-model="brand.brandLetter" label="Brand initials" />
      <v-cascader
        url="/manager/category/list"
        multiple
        required
        v-model="brand.categories"
        label="Brand classification"/>
      <v-layout row>
        <v-flex xs3>
          <span style="font-size: 16px; color: #444">Logo</span>
        </v-flex>
        <v-flex>
          <v-upload
            v-model="brand.brandPic"
            url="/manager/pic/upload"
            :multiple="false"
            :pic-width="250"
            :pic-height="90"
          />
        </v-flex>
      </v-layout>
      <v-layout class="my-4" row>
        <v-spacer/>
        <v-btn @click="submit" color="primary">提交</v-btn>
        <v-btn @click="clear">重置</v-btn>
      </v-layout>
    </v-form>
  </div>
</template>

<script>
export default {
  name: "lingmeng-brand-form",
  //接受从上一级传递进来的编辑数据,用于回显
  props:{
    oldBrand:{
      type:Object
    },
    isEdit:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {
      valid: false, // 表单校验结果标记
      brand: {
        brandName: '', // 品牌名称
        brandLetter: '', // 品牌首字母
        brandPic: '',// 品牌logo
        categories: [], // 品牌所属的商品分类数组
      },
      nameRules:[
        v => !!v || "品牌名称不能为空",
        v => v.length > 1 || "品牌名称至少2位"
      ],
      letterRules:[
        v => !!v || "首字母不能为空",
        v => /^[A-Z]{1}$/.test(v) || "品牌字母只能是A~Z的大写字母"
      ]
    }

  },
  watch: {
    oldBrand: {// 监控oldBrand的变化
      handler(val) {
        if(val){
          // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
          this.brand =  Object.deepCopy(val)
          console.log( this.brand);
        }else{
          // 为空，初始化brand
          this.brand = {
            brandName: '',
            brandLetter: '',
            brandPic: '',
            categories: [],
          }
        }
      },
      deep: true
    }
  },
  methods: {
    submit() {
      if (this.$refs.lingmengBrandForm.validate()) {
        // 2、定义一个请求参数对象，通过解构表达式来获取brand中的属性
        const {categories,brandLetter ,brandName,brandPic,...params} = this.brand;
        // 3、数据库中只要保存分类的id即可，因此我们对categories的值进行处理,只保留id，并转为字符串
        console.log(categories.map(c => c.id))
        params.categories = categories.map(c => c.id);
        // 4、将字母都处理为大写
        params.brandLetter = brandLetter.toUpperCase();
        params.brandName = brandName;
        params.brandPic = brandPic;
        // 5、将数据提交到后台
        if(this.isEdit){
          this.$http.post('/manager/brand/update', params)
            .then(() => {
              // 6、弹出提示
              this.$emit("close");
              this.$message.success("修改成功！");
            })
            .catch(() => {
              this.$message.error("修改失败！");
            });
        }else{
          this.$http.post('/manager/brand/add', params)
            .then(() => {
              // 6、弹出提示
              this.$emit("close");
              this.$message.success("保存成功！");
            })
            .catch(() => {
              this.$message.error("保存失败！");
            });
        }

      }
    },
    clear() {
      // 重置表单
      this.$refs.lingmengBrandForm.reset();
      // 需要手动清空商品分类
      this.categories = [];
    }
  },
}
</script>
