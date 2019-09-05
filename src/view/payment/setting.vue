<template>
  <div>
    <!-- 更改数据 -->
    <Button class="btn-bottom" @click="value3 = true" type="primary">修改</Button>
    <Drawer title="修改" v-model="value3" width="360" :mask-closable="false" :styles="styles">
      <Form :model="formData">
        <Row :gutter="32">
          <Col span="12">
            <FormItem label="水费" label-position="top">
              <Input v-model="formData.water" placeholder="请输入水费" clearable />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="12">
            <FormItem label="电费" label-position="top">
              <Input v-model="formData.electricity" placeholder="请输入电费" clearable />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div class="demo-drawer-footer">
        <Button style="margin-right: 8px" @click="value3 = false">取消</Button>
        <Button type="primary" @click="alter">确定</Button>
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
          if (response.data == 1) {
            this.$Message.success("修改成功！");
          } else {
            this.$Message.error("修改失败！");
          }
        });
    },
    alter(row) {
      this.value3 = false;
      //修改
      if (this.formData.water != "" && this.formData.electricity != "") {
        row.water = this.formData.water;
        row.electricity = this.formData.electricity;
        let _this = this;
        axios
          .request({
            url: "/payment/updateHydropowerPaymentData",
            method: "post",
            params: {
              water: this.formData.water,
              electricity: this.formData.electricity
            }
          })
          .then(function(response) {
            axios
              .request({
                url: "/payment/getHydropowerPaymentList",
                method: "get"
              })
              .then(response => {
                this.data = response.data;
                if (response.data == 1) {
                  this.$Message.success("修改成功！");
                } else {
                  this.$Message.error("修改失败！");
                }
              });
          });
      } else {
        this.$Message.error("存在空数据！请重新输入数据！");
      }
    }
  }
};
</script>