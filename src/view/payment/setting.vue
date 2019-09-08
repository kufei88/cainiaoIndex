<style lang="less">
@import "./payment.less";
</style>
<template>
  <div>
    <!-- 更改数据 -->
    <Button class="btn-bottom" @click="value3 = true" type="primary">修改</Button>
    <Drawer title="修改" v-model="value3" width="360" :mask-closable="false" :styles="styles">
      <Form ref="formData" :model="formData" :rules="ruleformData">
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="水费" label-position="top" prop="water">
              <Input
                v-model="formData.water"
                placeholder="请输入水费，必须为数字"
                clearable
                precision="2"
                number
              />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="电费" label-position="top" prop="electricity">
              <Input
                v-model="formData.electricity"
                placeholder="请输入电费，必须为数字"
                clearable
                precision="2"
                number
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div class="demo-drawer-footer">
        <Button style="margin-right: 8px" @click="value3 = false">取消</Button>
        <Button type="primary" @click="alter('formData')">确定</Button>
      </div>
    </Drawer>
    <!-- 数据展示 -->
    <Row>
      <Col span="11">
        <Card>
          <p slot="title">水费/电费</p>
          <Table :columns="columns" :data="data">
            <template slot-scope="{ row }" slot="water">
              <span>{{ row.water }}</span>
            </template>
            <template slot-scope="{ row }" slot="electricity">
              <span>{{ row.electricity }}</span>
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
        if (!Number.isInteger(value)) {
          callback(new Error("存在中英文，请重新输入！"));
        } else {
          callback();
        }
      }, 1000);
    };
    return {
      columns: [
        {
          title: "水费",
          slot: "water"
        },
        {
          title: "电费",
          slot: "electricity"
        }
      ],
      data: [],
      value3: false,
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static"
      },
      formData: {
        water: "",
        electricity: ""
      },
      ruleformData: {
        water: [
          {
            required: true,
            validator: validateAge,
            trigger: "blur"
          }
        ],
        electricity: [
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
          url: "/payment/getHydropowerPaymentList",
          method: "get"
        })
        .then(response => {
          this.data = response.data;
        });
    },
    alter(name) {
      //修改
      this.$refs[name].validate(valid => {
        if (valid) {
          axios
            .request({
              url: "/payment/updateHydropowerPaymentData",
              method: "post",
              headers: {
                "Content-Type": "application/json" //设置请求头请求格式为JSON
              },
              data: {
                water: this.formData.water,
                electricity: this.formData.electricity
              }
            })
            .then(response => {
              if (response.data == 1) {
                this.$Message.success("修改成功！");
                axios
                  .request({
                    url: "/payment/getHydropowerPaymentList",
                    method: "get"
                  })
                  .then(response => {
                    this.data = response.data;
                  });
              } else {
                this.$Message.error("修改失败！");
              }
            });
        } else {
          this.$Message.error("存在空数据或者中英文！请重新输入数据！");
        }
      });
      this.value3 = false;
      
    }
  }
};
</script>