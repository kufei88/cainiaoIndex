<style lang="less">
@import "./payment.less";
</style>
<template>
  <div>
    <!-- 新增数据 -->
    <Drawer title="新增" v-model="value2" width="360" :mask-closable="false" :styles="styles">
      <Form ref="formData" :model="formData" :rules="ruleformData">
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="水单价" label-position="top" prop="waterUnitPrice">
              <Input
                v-model="formData.waterUnitPrice"
                placeholder="请输入水单价"
                clearable
                precision="2"
                number
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="电单价" label-position="top" prop="electricityUnitPrice">
              <Input
                v-model="formData.electricityUnitPrice"
                placeholder="请输入电单价"
                clearable
                precision="2"
                number
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="管理单价" label-position="top" prop="leaseUnitPrice">
              <Input
                v-model="formData.leaseUnitPrice"
                placeholder="请输入管理单价"
                clearable
                precision="2"
                number
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="能耗公摊单价" label-position="top" prop="energySharingPrice">
              <Input
                v-model="formData.energySharingPrice"
                placeholder="请输入能耗公摊单价"
                clearable
                precision="2"
                number
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div class="demo-drawer-footer">
        <Button style="margin-right: 8px" @click="value2 = false">取消</Button>
        <Button type="primary" @click="add('formData')">确定</Button>
      </div>
    </Drawer>
    <!-- 数据展示 -->
    <Row>
      <Col span="15">
        <Card class="div-center">
          <div slot="title">
            <div>
              <Button
                class="btn-bottom btn"
                @click="value2 = true"
                type="primary"
                size="small"
                v-if="valueBtn"
              >新增</Button>
            </div>
            <p>收费项目</p>
          </div>
          <Table :columns="columns" :data="data">
            <template slot-scope="{ row, index }" slot="waterUnitPrice">
              <Input type="text" v-model="editWater" v-if="editIndex === index" />
              <span v-else>{{ row.waterUnitPrice }}</span>
            </template>

            <template slot-scope="{ row, index }" slot="electricityUnitPrice">
              <Input type="text" v-model="editElectricity" v-if="editIndex === index" />
              <span v-else>{{ row.electricityUnitPrice }}</span>
            </template>

            <template slot-scope="{ row, index }" slot="leaseUnitPrice">
              <Input type="text" v-model="editLease" v-if="editIndex === index" />
              <span v-else>{{ row.leaseUnitPrice }}</span>
            </template>

            <template slot-scope="{ row, index }" slot="energySharingPrice">
              <Input type="text" v-model="editEnergySharingPrice" v-if="editIndex === index" />
              <span v-else>{{ row.energySharingPrice }}</span>
            </template>

            <template slot-scope="{ row, index }" slot="action">
              <div v-if="editIndex === index">
                <Button @click="handleSave(index)">保存</Button>
                <Button @click="editIndex = -1">取消</Button>
              </div>
              <div v-else>
                <Button @click="handleEdit(row, index)">修改</Button>
              </div>
            </template>
          </Table>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
import axios from "@/libs/api.request";
export default {
  data() {
    const validateAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("存在空值，请输入数字！"));
      }
      // 模拟异步验证效果
      setTimeout(() => {
        if (Number.isNaN(value)) {
          callback(new Error("存在中英文，请重新输入！"));
        } else {
          callback();
        }
      }, 100);
    };
    return {
      columns: [
        {
          title: "水单价（元/吨）",
          slot: "waterUnitPrice"
        },
        {
          title: "电单价（元/度）",
          slot: "electricityUnitPrice"
        },
        {
          title: "管理单价（元/月/平米）",
          slot: "leaseUnitPrice"
        },
        {
          title: "能耗公摊单价（元）",
          slot: "energySharingPrice"
        },
        {
          title: "操作",
          slot: "action"
        }
      ],
      data: [],
      valueBtn: false,
      value2: false,
      editIndex: -1, // 当前聚焦的输入框的行数
      editWater: "",
      editElectricity: "",
      editLease: "",
      editEnergySharingPrice: "",
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static"
      },
      formData: {
        waterUnitPrice: "",
        electricityUnitPrice: "",
        leaseUnitPrice: "",
        energySharingPrice: ""
      },
      ruleformData: {
        waterUnitPrice: [
          {
            required: true,
            validator: validateAge,
            trigger: "blur"
          }
        ],
        electricityUnitPrice: [
          {
            required: true,
            validator: validateAge,
            trigger: "blur"
          }
        ],
        leaseUnitPrice: [
          {
            required: true,
            validator: validateAge,
            trigger: "blur"
          }
        ],
        energySharingPrice: [
          {
            required: true,
            validator: validateAge,
            trigger: "blur"
          }
        ]
      }
    };
  },
  mounted() {
    this.getHydropowerData();
  },
  methods: {
    //得到数据
    getHydropowerData() {
      axios
        .request({
          url: "/payment/getSystemInfoList",
          method: "get"
        })
        .then(response => {
          if (response.data) {
            this.data = response.data;
          }
        });
      axios
        .request({
          url: "/payment/systemInfoIsNull",
          method: "get"
        })
        .then(response => {
          if (response.data < 1) {
            this.valueBtn = true;
          }
        });
    },
    //修改
    alter(index) {
      axios
        .request({
          url: "/payment/updateSystemInfo",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: {
            waterUnitPrice: this.data[index].waterUnitPrice,
            electricityUnitPrice: this.data[index].electricityUnitPrice,
            leaseUnitPrice: this.data[index].leaseUnitPrice,
            energySharingPrice: this.data[index].energySharingPrice
          }
        })
        .then(response => {
          if (response.data == 1) {
            this.$Message.success("修改成功！");
            axios
              .request({
                url: "/payment/getSystemInfoList",
                method: "get"
              })
              .then(response => {
                this.data = response.data;
              });
          } else {
            this.$Message.error("修改失败！");
          }
        });
    },
    //新增
    add(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          axios
            .request({
              url: "/payment/addSystemInfo",
              method: "post",
              headers: {
                "Content-Type": "application/json" //设置请求头请求格式为JSON
              },
              data: this.formData
            })
            .then(response => {
              if (response.data == 1) {
                this.$Message.success("添加成功！");
                axios
                  .request({
                    url: "/payment/getSystemInfoList",
                    method: "get"
                  })
                  .then(response => {
                    this.data = response.data;
                    this.value2 = false;
                    this.valueBtn = false;
                  });
              } else {
                this.$Message.error("添加失败！");
                this.value2 = false;
              }
            });
        }
      });
    },
    handleEdit(row, index) {
      this.editWater = row.waterUnitPrice;
      this.editElectricity = row.electricityUnitPrice;
      this.editLease = row.leaseUnitPrice;
      this.editEnergySharingPrice = row.energySharingPrice;
      this.editIndex = index;
    },
    handleSave(index) {
      this.data[index].waterUnitPrice = this.editWater;
      this.data[index].electricityUnitPrice = this.editElectricity;
      this.data[index].leaseUnitPrice = this.editLease;
      this.data[index].energySharingPrice = this.editEnergySharingPrice;
      this.alter(index);
      this.editIndex = -1;
    }
  }
};
</script>