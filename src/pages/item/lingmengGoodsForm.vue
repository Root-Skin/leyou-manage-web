<template>
  <v-card>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1">基本信息</v-stepper-step>
        <v-divider/>
        <v-stepper-step :complete="step > 2" step="2">商品描述</v-stepper-step>
        <v-divider/>
        <v-stepper-step :complete="step > 3" step="3">规格参数</v-stepper-step>
        <v-divider/>
        <v-stepper-step step="4">SKU属性</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-cascader
            url="/manager/category/list"
            required
            showAllLevels
            v-model="goods.categories"
            label="请选择商品分类"/>
          <!--品牌   设计到组件的使用-->
          <v-select
            :items="brandOptions"
            item-text="brandName"
            item-value="id"
            label="所属品牌"
            v-model="goods.brandId"
            required
            autocomplete
            clearable
            dense chips
          />
          <v-text-field label="商品标题" v-model="goods.title" :counter="200" required/>
          <v-text-field label="商品卖点" v-model="goods.subTitle" :counter="200"/>
          <v-text-field label="包装清单" v-model="goods.spuDetail.packageList" :counter="1000" multi-line :rows="3"/>
          <v-text-field label="售后服务" v-model="goods.spuDetail.afterSalesService" :counter="1000" multi-line :rows="3"/>

        </v-stepper-content>
        <v-stepper-content step="2">
          <v-editor v-model="goods.spuDetail.description" upload-url="/manager/pic/upload"/>
        </v-stepper-content>
        <!--3、规格参数-->
        <v-stepper-content step="3">
          <v-flex class="xs10 mx-auto px-3">
            <!--遍历整个规格参数-->
            <v-card class="my-2">
              <v-container grid-list-md fluid>
                <v-layout wrap row justify-space-between class="px-5">
                  <v-flex xs12 sm5 v-for="param in specifications" :key="param.name">

                    <v-text-field :label="param.name" v-model="param.v" :suffix="param.unit || ''"
                    />
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
        </v-stepper-content>
        <v-stepper-content step="4">
          <v-flex class="mx-auto">
            <!--遍历特有规格参数-->
            <v-card flat v-for="spec of specialSpecs" :key="spec.name">
              <!--特有参数的标题-->
              <div class="subheading">{{ spec.name }}:</div>
              <!--特有参数的待选项，需要判断是否有options，如果没有，展示文本框，让用户自己输入-->
              <v-card-text class="px-5">
                <div v-for="i in spec.options.length+1" :key="i" class="layout row px-5">
                  <v-text-field :placeholder="'新的' + spec.name + ':'" class="flex xs10" auto-grow
                                v-model="spec.options[i-1]" v-bind:value="i" single-line hide-details/>
                  <v-btn @click="spec.options.splice(i-1,1)" v-if="i <= spec.options.length" icon>
                    <i class="el-icon-delete"/>
                  </v-btn>
                </div>
              </v-card-text>


            </v-card>
            <v-card class="elevation-0">
              <!--标题-->
              <div class="subheading py-3">SKU列表:</div>
              <v-divider/>
              <!--SKU表格，hide-actions因此分页等工具条-->
              <v-data-table :items="skus" :headers="headers" hide-actions item-key="indexes" class="elevation-0">
                <template slot="items" slot-scope="props">
                  <tr @click="props.expanded = !props.expanded">
                    <!--价格和库存展示为文本框-->
                    <td v-for="(v,k) in props.item" :key="k" v-if="['price', 'stock'].includes(k)"
                        class="text-xs-center">
                      <v-text-field single-line v-model="props.item[k]" @click.stop=""/>
                    </td>
                    <!--enable展示为checkbox-->
                    <td class="text-xs-center" v-else-if="k === 'enable'">
                      <v-checkbox v-model="props.item[k]"/>
                    </td>
                    <!--indexes和images不展示，其它展示为普通文本-->
                    <td class="text-xs-center" v-else-if="k !== 'images' && k !== 'indexes'">{{ v.v }}</td>
                  </tr>
                </template>
                <!--点击表格后展开-->
                <template slot="expand" slot-scope="props">
                  <v-card class="elevation-2 flex xs11 mx-auto my-2">
                    <!--图片上传组件-->
                    <v-upload v-model="props.item.images" url="/manager/pic/upload"/>
                  </v-card>
                </template>
              </v-data-table>
            </v-card>
          </v-flex>
          <!--提交按钮-->
          <v-flex xs3 offset-xs9>
            <v-btn color="info" @click="submit">保存商品信息</v-btn>
          </v-flex>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

  </v-card>
</template>

<script>
export default {
  name: "lingmeng-goods-form",
  props: {
    oldGoods: {
      type: Object
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    step: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      step: 1, // 当前的步骤数，默认为1
      //新增商品的对象
      goods: {
        categories: [], // 商品3级分类数组信息
        brandId: 0,// 品牌id信息
        title: '',// 标题
        subTitle: '',// 子标题
        spuDetail: {
          packageList: '',// 包装列表
          afterSalesService: '',// 售后服务
          description: "",// 商品描述
          specifications: []
        },
      },
      brandOptions: [],   //品牌列表
      specifications: [], //规格列表
      specialSpecs: []   //特殊的规格模版
    }
  },
  methods: {

    //保存商品方法
    submit: function () {
      console.log(this.goods.brandId)
      console.log(this.goods.id)
      const {categories: [{id: cid1}, {id: cid2}], ...goodsParams} = this.goods;

      // 处理规格参数
      console.log(this.specifications)

      // 处理特有规格参数模板
      const uniqueSpecification = {};
      console.log(this.specialSpecs);
      this.specialSpecs.forEach(({name, options}) => {
        uniqueSpecification[name] = options;
      });

      // 处理sku
      console.log(this.skus);

      const skus = this.skus.filter(s => s.enable).map(({id,price, stock, enable, images, indexes, ...rest}) => {
        // 标题，在spu的title基础上，拼接特有规格属性值
        console.log(rest);
        let title = goodsParams.title;
        for(var i in rest){
           title = title + " " + rest[i].v;
        }
        console.log(title);
        return {
          price: this.$format(price + ""), enable, indexes, title,id,// 基本属性
          stock: parseInt(stock),
          images: !images ? '' : images.join(","), // 图片
          ownSpec: JSON.stringify(rest), // 特有规格参数
        }
      });
      console.log(skus)
      Object.assign(goodsParams, {
        cid1, cid2, // 商品分类
        skus, // sku列表
      })
      console.log(goodsParams);
      goodsParams.spuDetail.specifications = JSON.stringify(this.specifications);
      goodsParams.spuDetail.uniqueSpecification = JSON.stringify(uniqueSpecification);

      this.$http.post("/manager/good/addNewGood", goodsParams)
        .then(() => {
          // 成功，关闭窗口
          this.$emit('close');
          // 提示成功
          this.$message.success("保存成功了 :)")
        })
        .catch(() => {
          this.$message.error("保存失败！");
        });
    }
  },
  watch: {
    oldGoods: {
      //深度监听
      deep: true,
      // handler(val)  == oldGoods(val,oldvalue)
      handler(val) {
        if (!this.isEdit) {
          Object.assign(this.goods, {
            categories: null, // 商品分类信息
            brandId: 0, // 品牌id信息
            title: "", // 标题
            subTitle: "", // 子标题
            spuDetail: {
              packageList: "", // 包装列表
              afterSalesService: "", // 售后服务
              description: "" // 商品描述
            }
          });
          this.specifications = [];
          this.specialSpecs = [];


        } else {

          this.goods = Object.deepCopy(val);
          const names = val.categoryName.split("/");
          // 组织商品分类数据
          this.goods.categories = [
            {id: val.cid1, categoryName: names[0]},
            {id: val.cid2, categoryName: names[1]}
          ];
          // 将skus处理成map
          //将String 转换为数组
          this.specifications = JSON.parse(this.goods.spuDetail.specifications);

          const skuMap = new Map();
          this.goods.skus.forEach(s => {
            skuMap.set(s.indexes, s);
          });
          this.goods.skus = skuMap;
        }
      }
    },

    //在进入编辑页面的时候 这里应该进行停用
    'goods.categories': {
      deep: true,
      handler(val) {
        // 判断商品分类是否存在，存在才查询
        if (val && val.length > 0) {
          // 根据分类查询品牌
          //目前先只是做到 第二级分类上面
          this.$http.get("/manager/good/getBrandsNameByCateId?cateId=" + this.goods.categories[1].id)
            .then(resp => {
              this.brandOptions = resp.data.data;
            });
          //根据分类查询规格参数
          this.$http.get("/manager/specification/getByCateId?cateId=" + this.goods.categories[1].id)
            .then(resp => {
              let specifications = [];
              let template = [];
              let param = [];
              //编辑状态 需要回显
              if (this.isEdit) {
                specifications = JSON.parse(this.goods.spuDetail.specifications);
                console.log(specifications);
                template = JSON.parse(this.goods.spuDetail.uniqueSpecification);
              }
              // 对特有规格进行筛选
              const arr1 = [];
              const arr2 = [];
              resp.data.data.groupName.forEach(s => {
                console.log(s);
                s.param.forEach(f => {
                    //通用设置
                    if (f.isGeneral) {
                      const o = {};
                      Object.assign(o, f);
                      console.log(o)
                      //如果是编辑状态-->数据回显
                      if (this.isEdit) {
                        //这里扩展新的v属性用于,用于页面上进行展示
                        //specifications 表示的是数组对象,这里我们需要增加遍历过滤除来v的值
                        for (var i of specifications) {
                          console.log(i);
                          for (var k in i) {
                            console.log(k);
                            if (k === "isGeneral") {
                              if (i[k] == true) {
                                o.v = i.v;
                              }

                            }
                          }
                        }
                      }
                    console.log(o)
                      arr1.push(o)
                    } else {
                      //处理特殊规格模版
                      if (this.isEdit && arr2.length == 0) {
                        console.log(template)
                        // o.options = template[id];
                        for (var i in template) {
                          var o = {id: '', name: '', options: []};
                          o.name = i;
                          console.log(o.name);
                          o.options = template[i]
                          console.log(o.options);
                          arr2.push(o)

                        }
                      } else if (!this.isEdit) {
                        var special = {}
                        Object.assign(special, f);
                        console.log(special)
                        arr2.push(special)
                        console.log(arr2);
                      }
                    }
                  }
                )


              });
              this.specifications = arr1;// 通用规格
              this.specialSpecs = arr2;// 特有规格
              console.log(this.specialSpecs);

              // for (var spec of this.specifications) {
              //   console.log(this.specialSpecs);
              //   console.log(spec);
              //   console.log(spec.param);
              // }
            });
        }
      }
    }
  },
  //根据页面选中 求笛卡尔积
  computed: {
    //// 计算属性本质是一个方法，但是必须返回结果--->只要用户在页面上选中发生了变化,compute 重新计算.不在使用缓存值
    skus() {
      // 过滤掉用户没有填写数据的规格参数

      const arr = this.specialSpecs.filter(s => s.options.length > 0);
      // 通过reduce进行累加笛卡尔积
      return arr.reduce(
        (last, spec, index) => {
          const result = [];
          last.forEach(o => {
            spec.options.forEach((option, i) => {
              const obj = JSON.parse(JSON.stringify(o));
              obj[spec.name] = {v: option, id: spec.id};
              obj.indexes = (obj.indexes || '') + '_' + i
              if (index === arr.length - 1) {
                obj.indexes = obj.indexes.substring(1);
                // 如果发现是最后一组，则添加价格、库存等字段
                Object.assign(obj, {
                  price: 0,
                  stock: 0,
                  enable: false,
                  images: []
                });
                if (this.isEdit) {
                  // 如果是编辑，则回填sku信息
                  const sku = this.goods.skus.get(obj.indexes);
                  if (sku != null) {
                    console.log(sku);
                    const {id,price, stock, enable, images} = sku;
                    Object.assign(obj, {
                      id,
                      price: this.$format(price),
                      stock,
                      enable,
                      images: images ? images.split(",") : [],
                    });
                    console.log(obj);
                  }
                }
              }
              result.push(obj);
            });
          });
          return result;
        },
        [{}]
      );
    },
    headers() {
      if (this.skus.length <= 0) {
        return []
      }
      const headers = [];
      // 获取skus中的任意一个，获取key，然后遍历其属性
      Object.keys(this.skus[0]).forEach(k => {
        let value = k;
        if (k === 'price') {
          // enable，表头要翻译成“价格”
          k = '价格'
        } else if (k === 'stock') {
          // enable，表头要翻译成“库存”
          k = '库存';
        } else if (k === 'enable') {
          // enable，表头要翻译成“是否启用”
          k = '是否启用'
        } else if (k === 'indexes' || k === 'images') {
          // 图片和索引不在表格中展示
          return;
        }
        headers.push({
          text: k,
          align: 'center',
          sortable: false,
          value
        })
      })
      return headers;
    }
  }

}
</script>

<style scoped>

</style>
