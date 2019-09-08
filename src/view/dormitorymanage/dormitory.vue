<template>
  <div>
    <Button type="primary" @click="showadd()" ghost>新增楼房</Button>
    <Modal v-model="model1" title="新增合同">
      <Form ref="DormCustom" :model="dormAddData" :rules="ruleCustom" :label-width="80">
        <FormItem label="楼名" prop="dormitoryName">
          <Input type="text" v-model="dormAddData.dormitoryName" />
        </FormItem>
        <FormItem label="楼层数量" prop="floorCount">
          <Input type="text" v-model="dormAddData.floorCount" />
        </FormItem>
        <FormItem label="每层房间数" prop="dormCount">
          <Input type="text" v-model="dormAddData.dormCount" />
        </FormItem>
        <FormItem label="租赁单价" prop="money">
          <Input type="text" v-model="dormAddData.money" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large">取消</Button>
        <Button type="primary" @click="pushDormitory('DormCustom')" size="large">确定</Button>
      </div>
    </Modal>
    <Table :columns="dormitoryColumns" :data="dormitoryData">
      <template slot-scope="{ row, index }" slot="id">
        <Input type="text" v-model="dormitoryData[index].id" v-if="editIndex === index" />
        <span v-else>{{ row.id }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="dormitoryName">
        <Input type="text" v-model="dormitoryData[index].dormitoryName" v-if="editIndex === index" />
        <span v-else>{{ row.dormitoryName }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="money">
        <Input type="text" v-model="dormitoryData[index].money" v-if="editIndex === index" />
        <span v-else>{{ row.money }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button>保存</Button>
          <Button>取消</Button>
        </div>
        <div v-else>
          <Button @click="clk()">操作</Button>
        </div>
      </template>
    </Table>
  </div>
</template>
<script>
import axios from "@/libs/api.request";
import Vue from "vue";
export default {
  data() {
    var DN = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入楼名"));
      } else {
        callback();
      }
    };
    var FC = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入楼层数"));
      } else {
        callback();
      }
    };
    var DC = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入每层房间数"));
      } else {
        callback();
      }
    };
    var MY = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入租赁单价"));
      } else {
        callback();
      }
    };
    return {
      dormitoryColumns: [
        { title: "楼号", slot: "id", key: "id" },
        { title: "名称", slot: "dormitoryName", key: "dormitoryName" },
        { title: "每月租金", slot: "money", key: "money" }
      ],
      editIndex: -1,
      model1: false,
      dormAddData: {
        dormitoryName: "",
        floorCount: "",
        dormCount: "",
        money: ""
      },
      dormitoryData: [],
      ruleCustom: {
        dormitoryName: [{ validator: DN, trigger: "blur" }],
        floorCount: [{ validator: FC, trigger: "blur" }],
        dormCount: [{ validator: DC, trigger: "blur" }],
        money: [{ validator: MY, trigger: "blur" }]
      },
      isempity: false
    };
  },

  components: {},

  computed: {},

  mounted() {
    this.getdormitoryData();
  },

  methods: {
    showadd() {
      this.$refs["DormCustom"].resetFields();
      let _this = this;
      for (let item in _this.dormAddData) {
        _this.dormAddData[item] = "";
      }
      this.model1 = true;
    },
    pushDormitory(name) {
      let _this = this;
      for (let item in _this.dormAddData) {
        if (_this.dormAddData[item] == "") {
          _this.isempity = true;
        }
        break;
      }

      if (_this.isempity == true) {
        this.$refs[name].validate();
        _this.isempity = false;
        return false;
      } else {
        _this.insertAddDormitory(_this.dormAddData);

        _this.model1 = false;
        //_this.insert(_this.editDtae);
      }
    },
    clk() {
      console.log(this.dormitoryData);
    },
    insertAddDormitory(addData) {
      let _this = this;
      axios
        .request({
          url: "/Dormitory/addNewDormitory",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: addData
        })
        .then(function(response) {
          if(response.data>0){
            _this.insertDorms(addData);
          }
          _this.getdormitoryData();
        });
    },
    insertDorms(selectData) {
      axios
        .request({
          url: "/Dormitory/insertDorms",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: selectData
        })
    },
    SelectDormitoryId(selectData) {
      axios
        .request({
          url: "/Dormitory/SelectDormitoryId",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: selectData
        })
        .then(function(response) {

        });
    },
    getdormitoryData() {
      let _this = this;
      axios
        .request({
          url: "/Dormitory/getDormitoryList",
          method: "get"
        })
        .then(function(response) {
          _this.dormitoryData = response.data;
        });
    }
  }
};
</script>