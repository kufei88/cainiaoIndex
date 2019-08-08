<template>
  <div>
    <Card title="导入EXCEL" style="width:400px;float:left">
      <Row>
        <Upload action :before-upload="handleBeforeUpload" accept=".xls, .xlsx">
          <Button
            icon="ios-cloud-upload-outline"
            :loading="uploadLoading"
            @click="handleUploadFile"
          >上传文件</Button>
        </Upload>
      </Row>
      <Row>
        <div class="ivu-upload-list-file" v-if="file !== null">
          <Icon type="ios-stats"></Icon>
          {{ file.name }}
          <Icon
            v-show="showRemoveFile"
            type="ios-close"
            class="ivu-upload-list-remove"
            @click.native="handleRemove()"
          ></Icon>
        </div>
      </Row>
      <Row>
        <transition name="fade">
          <Progress v-if="showProgress" :percent="progressPercent" :stroke-width="2">
            <div v-if="progressPercent == 100">
              <Icon type="ios-checkmark-circle"></Icon>
              <span>成功</span>
            </div>
          </Progress>
        </transition>
      </Row>
    </Card>
    <Card title="导出EXCEL" style="width:400px;float:left">
      <Row style="padding-bottom: 8px;">
        <Button icon="md-download" :loading="exportLoading" @click="exportExcel">导出文件</Button>
      </Row>
    </Card>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    
    
    <Button style="float:left;margin-right:20px" @click="add()">新增数据</Button>
    <br />
    <br />

    <Table :columns="columns" :data="data" :loading="tableLoading">
      <template slot-scope="{ row, index }" slot="waterNumber">
        <Input type="text" v-model="editWaterNumber" v-if="editIndex === index" />
        <span v-else>{{ row.waterNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="electricityNumber">
        <Input type="text" v-model="editElectricityNumber" v-if="editIndex === index" />
        <span v-else>{{ row.electricityNumber }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button @click="handleSave(index)">保存</Button>
          <Button @click="editIndex = -1">取消</Button>
        </div>
        <div v-else>
          <Button @click="handleEdit(row,index)">修改</Button>
          <Button @click="remove(index)">删除</Button>
        </div>
      </template>
    </Table>
  </div>
</template>
<script>
import excel from "@/libs/excel";
import axios from "@/libs/api.request";
export default {
  data() {
    return {
      columns: [
        {
          title: "水表读数",
          slot: "waterNumber",
          key: "waterNumber"
        },
        {
          title: "电表读数",
          slot: "electricityNumber",
          key: "electricityNumber"
        },
        {
          title: "操作",
          slot: "action"
        }
      ],
      data: [],
      editIndex: -1, // 当前聚焦的输入框的行数
      editWaterNumber: "", // 第一列输入框，当然聚焦的输入框的输入内容，与 data 分离避免重构的闪烁
      editElectricityNumber: "", // 第二列输入框
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableLoading: false,
      exportLoading: false
    };
  },
  mounted() {
    this.getPaymentData();
  },
  methods: {
    handleEdit(row, index) {
      this.editWaterNumber = row.waterNumber;
      this.editElectricityNumber = row.electricityNumber;
      this.editIndex = index;
    },
    handleSave(index) {
      this.data[index].waterNumber = this.editWaterNumber;
      this.data[index].electricityNumber = this.editElectricityNumber;
      this.editIndex = -1;
      axios.request({
        url: "/payment/setPaymentData",
        method: "post",
        params: {
          id: this.data[index].id,
          waterNumber: this.data[index].waterNumber,
          electricityNumber: this.data[index].electricityNumber
        }
      });
    },
    getPaymentData() {
      let _this = this;
      axios
        .request({
          url: "/payment/getPaymentList",
          method: "get"
        })
        .then(function(response) {
          _this.data = response.data;
        });
    },
    remove(index) {
      axios.request({
        url: "/payment/deletePaymentData",
        method: "post",
        params: {
          id: this.data[index].id
        }
      });
      this.data.splice(index, 1);
    },
    add() {
      this.data.push({ waterNumber: "", electricityNumber: "" });
      this.editIndex = this.data.length - 1;
    },
    exportExcel() {
      if (this.data.length) {
        this.exportLoading = true;
        const params = {
          data: this.data,
          title: ["水表读数", "电表读数"],
          key: ["waterNumber", "electricityNubmer"],
          autoWidth: true,
          filename: "缴费管理"
        };
        excel.export_array_to_excel(params);
        this.exportLoading = false;
      } else {
        this.$Message.info("表格数据不能为空！");
      }
    },
    initUpload() {
      this.file = null;
      this.showProgress = false;
      this.loadingProgress = 0;
      this.data = [];
      this.columns = [];
    },
    handleUploadFile() {
      this.initUpload();
    },
    handleRemove() {
      this.initUpload();
      this.$Message.info("上传的文件已删除！");
    },
    handleBeforeUpload(file) {
      const fileExt = file.name
        .split(".")
        .pop()
        .toLocaleLowerCase();
      if (fileExt === "xlsx" || fileExt === "xls") {
        this.readFile(file);
        this.file = file;
      } else {
        this.$Notice.warning({
          title: "文件类型错误",
          desc:
            "文件：" +
            file.name +
            "不是EXCEL文件，请选择后缀为.xlsx或者.xls的EXCEL文件。"
        });
      }
      return false;
    },
    // 读取文件
    readFile(file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadstart = e => {
        this.uploadLoading = true;
        this.tableLoading = true;
        this.showProgress = true;
      };
      reader.onprogress = e => {
        this.progressPercent = Math.round((e.loaded / e.total) * 100);
      };
      reader.onerror = e => {
        this.$Message.error("文件读取出错");
      };
      reader.onload = e => {
        let i;
        let j;
        this.$Message.info("文件读取成功");
        const readerData = e.target.result;
        const { header, results } = excel.read(readerData, "array");
        const tableTitle = header.map(item => { return { title: item, key: item } })
        this.data = results
        this.columns = tableTitle
        // for(i = 0;i<results.length;i++){
        //   // console.log(results[i][header[0]])
        //   // console.log(results[i][header[1]])
        //   // console.log("-------------------")
          
        //   this.data.push({ waterNumber: results[i][header[0]], electricityNumber: results[i][header[1]]});
        // }
        
        this.uploadLoading = false;
        this.tableLoading = false;
        this.showRemoveFile = true;
      };
    }
  }
};
</script>