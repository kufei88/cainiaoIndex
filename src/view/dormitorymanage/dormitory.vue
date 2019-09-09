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
        <Button type="text" size="large" @click="model1=false">取消</Button>
        <Button type="primary" @click="pushDormitory('DormCustom')" size="large">确定</Button>
      </div>
    </Modal>
    <Modal v-model="model2" title="提示">
        <p>是否确定删除</p>
        <div slot="footer">
        <Button type="text" size="large" @click="model2=false">取消</Button>
        <Button type="primary" size="large" @click="deleterow()" >确定</Button>
      </div>
    </Modal>
    <Table :columns="dormitoryColumns" :data="dormitoryData" height='520'>
      <template slot-scope="{ row, index }" slot="id">
        <!-- <Input type="text" v-model="dormitoryData[index].id" v-if="editIndex === index" /> -->
        <span>{{ dormitoryData[index].id }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="dormitoryName">
        <!-- <Input type="text" v-model="dormitoryData[index].dormitoryName" v-if="editIndex === index" /> -->
        <span>{{ dormitoryData[index].dormitoryName }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="money">
        <Input type="text" v-model="dormitoryData[index].money" v-if="editIndex === index" />
        <span v-else>{{ dormitoryData[index].money }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button @click="save(row)">保存</Button>
          <Button @click="concel()">取消</Button>
        </div>
        <div v-else>
          <Button @click="clk(index)">修改</Button>
          <Button @click="showdelete(row)">删除</Button>
        </div>
      </template>
    </Table>
    <span>共{{dormitoryNums}}条</span>
    <Page :total="dormitoryNums" show-sizer @on-change="handlePage" @on-page-size-change="pagesize"/>
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
        { title: "每月租金", slot: "money", key: "money" },
        {
          title: "修改",
          slot: "action",
          width: 150,
          align: "center",
        }
      ],
      editIndex: -1,
      model1: false,
      model2:false,
      deleteRowData:"",
      dormitoryNums:0,
      page:{
        startpage:1,
        pagecount:10
      },
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
      editdata:{
        money:""
      },
      tagname:{
        money:"每月租金"
      },
      isempity: false
    };
  },

  components: {},

  computed: {},

  mounted() {
    this.getDormitoryCount();

  },

  methods: {
    handlePage(val){
      
      this.page.startpage=val;

      this.getDormitoryCount();
    },
    pagesize(val){
      this.page.pagecount=val;
      this.getDormitoryCount();
    },
    //删除提示
    showdelete(row){
      this.model2=true;
      this.deleteRowData=row;
    },
    //新增对话框显示
    showadd() {
      this.$refs["DormCustom"].resetFields();
      let _this = this;
      for (let item in _this.dormAddData) {
        _this.dormAddData[item] = "";
      }
      this.model1 = true;
    },
    //提交新增信息并验证
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
    clk(index) {
      this.editIndex=index;
    },
    //新增宿舍楼
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
          _this.getDormitoryCount();
        });
    },
    //新增宿舍房间
    insertDorms(selectData) {
      let _this=this;
      axios
        .request({
          url: "/Dormitory/insertDorms",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: selectData
        }).then(function(request){
          if(request.data==1){
            _this.$Message.success("插入成功")
          }
          else{
            _this.$Message.error("插入失败")
          }
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
    //获取寝室信息
    getdormitoryData(page) {
      let _this = this;
      axios
        .request({
          url: "/Dormitory/getDormitoryList",
          method: "get",
          params:page
        })
        .then(function(response) {
          _this.dormitoryData = response.data;
        });
    },
    getdormitoryData0() {
      let _this = this;
      axios
        .request({
          url: "/Dormitory/getDormitoryList0",
          method: "get",
        })
        .then(function(response) {
          _this.dormitoryData = response.data;
        });
    },
  
    save(row){
      let _this = this;
      for (let item in row) {
        if (row[item] == "") {
          this.$Message.error(_this.tagname[item] + "不能为空");
          return false;
          break;
        }
      }
      this.update(row);
      
    },
    //取消保存
    concel() {
      let _this = this;

      _this.getDormitoryCount();

      this.editIndex = -1;
    },
    //更新数据库
    update(row){
      let _this=this;
      axios
      .request({
        url:"/Dormitory/updateDormistory",
        method:"post",
        headers: {
            "Content-Type": "application/json", //设置请求头请求格式为JSON
          },
        data:row
      }).then(function(response){
        if(response.data==1){
          _this.$Message.success("修改成功")
          _this.editIndex = -1;
          _this.getDormitoryCount();
        }
        else{
          this.$Message.error("修改失败")
        }
      })
    },
    //删除数据
    deleterow(){
      let _this=this;
      axios
      .request({
        url:"/Dormitory/deleteRow",
        method:"post",
        headers: {
            "Content-Type": "application/json", //设置请求头请求格式为JSON
          },
        data:_this.deleteRowData
      }).then(function(response){
        if(response.data==1){
          _this.$Message.success("删除成功")
          _this.getDormitoryCount();
        }
        else{
          _this.$Message.error("删除失败")
        }
        _this.model2=false;
      })
    },
    //获取总条数
    getDormitoryCount(){
      let _this=this;
      axios
      .request({
        url:"/Dormitory/getDormitoryCount",
        method:"get"
      })
      .then(function(response){
        _this.dormitoryNums=response.data;
        _this.getdormitoryData(_this.page);
      })
    }
  }
};
</script>