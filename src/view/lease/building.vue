<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入查询内容"
      style="width:300px;margin-bottom:10px;float:left;"
      @on-search="searchData"
      v-model="searchBuildingName"
    />
    <!-- Excel模板下载按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcelModel"
      style="float:right"
    >模板下载</Button>
    <!-- Excel导出按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcel"
      style="float:right"
    >导出文件</Button>
    
    <!-- Excel导入按钮 -->
    <Upload
      action=""
      :before-upload="handleBeforeUpload"
      accept=".xls, .xlsx"
      style="float:right"
    >
      <Button
        icon="ios-cloud-upload-outline"
        :loading="uploadLoading"
        @click="handleUploadFile"
      >上传文件</Button>
    </Upload>
    
    <!-- 新增办公楼按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewData = true"
      style="float:right"
    >新增</Button>
    
    <div style="clear:both"></div>

    <!-- 新增办公楼弹窗 -->
    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增办公楼信息填写"
    >

      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
      >

        <FormItem
          label="办公楼号"
          prop="buildingNumber"
        >
          <Input
            clearable
            v-model="formValidate.buildingNumber"
          />
        </FormItem>

        <FormItem
          label="办公楼名称"
          prop="buildingName"
        >
          <Input
            clearable
            v-model="formValidate.buildingName"
          />
        </FormItem>

      </Form>

      <div slot="footer">

        <Button
          type="text"
          size="large"
          @click="handleReset('formValidate')"
        >取消</Button>

        <Button
          type="primary"
          size="large"
          @click="handleSubmit('formValidate')"
        >确定</Button>

      </div>

    </Modal>

    <!-- 办公楼数据显示表格 -->

    <Table
      border
      :columns="dataColumns"
      :data="pageData"
      ref="table"
      height="522"
    >

      <template
        slot-scope="{ row, index }"
        slot="buildingNumber"
      >

        <Input
          type="text"
          v-model="editBuildingNumber"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.buildingNumber }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="buildingName"
      >
        <Input
          type="text"
          v-model="editBuildingName"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.buildingName }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="action"
      >
        <div v-if="editIndex === index">

          <Button
            type="primary"
            style="margin-right: 5px"
            @click="handleSave(index)"
          >保存</Button>

          <Button
            type="error"
            @click="handleCancel(index)"
          >取消</Button>

        </div>

        <div v-else>

          <Button
            type="primary"
            style="margin-right: 5px"
            @click="handleEdit(row, index)"
          >修改</Button>

          <Button
            type="error"
            @click="handleDelete(index)"
          >删除</Button>

        </div>
      </template>

    </Table>
    <!-- 分页功能 -->
    <span>记录总共 {{this.dataCount}} 条</span>
    <Page
      :total="dataCount"
      @on-change="changePage"
      show-sizer
      :current="pageCurrent"
      @on-page-size-change="changePageNumber"
      :page-size-opts="[10,20,50,100]"
      align="center"
    />
  </div>
</template>

<script>
import axios from "@/libs/api.request";
import excel from "@/libs/excel";
export default {
  data() {
    // 获取vue对象
    let thisVue = this;
    // 是否有特殊字符
    var checkSpecialKey = function(str) {
      var specialKey =
        "[`~!#$^&*()=|{}':;'\\[\\].<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]‘'";
      for (var i = 0; i < str.length; i++) {
        if (specialKey.indexOf(str.substr(i, 1)) != -1) {
          return false;
        }
      }
      return true;
    };
    // 办公楼号验证
    var isBuildingNumber = function(rule, value, callback) {
      let isBuildingNumber = /^[0-9]+$/;
      let isDataSame = false;

      if (value == null || value == undefined || value == "") {
        return callback(new Error("办公楼号不得为空"));
      } else if (!isBuildingNumber.test(value)) {
        return callback(new Error("办公楼号格式有误，必须是数字"));
      } else if (isDataSame != false) {
        return callback(new Error("已有该办公楼号"));
      } else {
        callback();
      }
    };
    // 办公楼名称验证
    var isBuildingName = function(rule, value, callback) {
      let isDataSame = false;
      for (var key in thisVue._data.historyData) {
        if (value == thisVue._data.historyData[key].buildingName) {
          isDataSame = true;
        }
      }
      if (value == null || value == undefined || value == "") {
        return callback(new Error("办公楼名称不得为空"));
      } else if (!checkSpecialKey(value)) {
        return callback(new Error("不得含有特殊字符"));
      } else if (isDataSame != false) {
        return callback(new Error("已有该办公楼名称"));
      } else {
        callback();
      }
    };
    return {
      isSearching: false, // 是否在查询状态
      searchBuildingName: "", // 查询的办公楼名称
      searchHistoryData: [], //搜索时备份的历史数据

      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储

      exportLoading: false, // 是否导出Excel成功
      isChangeEdit: false, // 是否修改记录

      pageCurrent: 1, // 当前页数
      pageStart: 0,
      pageEnd: 0,
      dataCount: 0, // 后台读取的总记录长度
      pageSize: 10, // 每页显示多少条
      pageData: [], // table绑定的数据

      editIndex: -1, // 当前聚焦的输入框的行数
      editBuildingNumber: "", // 编辑的楼号
      editBuildingName: "", // 编辑的名称

      isAddNewData: false, //是否新增数据
      // 表格显示的列名数据
      dataColumns: [
        {
          title: "楼号#",
          key: "buildingNumber",
          slot: "buildingNumber"
        },
        {
          title: "名称",
          key: "buildingName",
          slot: "buildingName"
        },
        {
          title: "操作",
          slot: "action",
          width: 200,
          align: "center"
        }
      ],
      historyData: [], //从后台读取的表格数据
      // excel模板数据格式
      historyDataSaveModel: [
        {
          buildingNumber: "只能是数字且不得为空，例如：1",
          buildingName: "不能有特殊字符且不得为空，例如：1号楼"
        }
      ],
      // 修改时原数据暂存
      historyDataSave: {
        buildingNumber: "",
        buildingName: ""
      },
      // 表单数据设置
      formValidate: {
        buildingNumber: "",
        buildingName: ""
      },
      // 表单数据验证设置
      ruleValidate: {
        buildingNumber: [
          {
            required: true,
            message: "办公楼号不得为空",
            trigger: "blur"
          }
        ],
        buildingName: [
          {
            required: true,
            message: "办公楼名称不得为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  mounted() {
    this.getRequestData(this.pageCurrent);
  },
  methods: {
    // 查询数据***
    searchData(value) {
      this.searchBuildingName = value;
      this.pageCurrent = 1;
      this.getRequestData(this.pageCurrent);
    },
    // Excel导入数据***
    uploadExcelData(excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        excelData[key].buildingNumber = excelData[key].楼号;
        excelData[key].buildingName = excelData[key].名称;
        delete excelData[key].楼号;
        delete excelData[key].名称;
      }
      // 验证空数据
      let isDataEmpty = 0;
      console.log(excelData);
      for (var key in excelData) {
        console.log(excelData[key].buildingNumber);
        excelData[key].buildingNumber == undefined ||
        excelData[key].buildingNumber == null ||
        excelData[key].buildingNumber == "" ||
        excelData[key].buildingName == "" ||
        excelData[key].buildingName == null ||
        excelData[key].buildingName == undefined
          ? (isDataEmpty += 1)
          : (isDataEmpty += 0);
      }
      // 2.1 验证成功，上传后台数据库
      if (isDataEmpty == 0) {
        let _this = this;
        axios
          .request({
            url: "/building/uploadBuildingList",
            method: "post",
            headers: {
              "Content-Type": "application/json;charset=UTF-8"
            },
            data: excelData
          })
          .then(function(response) {
            if (response.data != 0) {
              _this.$Message.success("导入成功");
              _this.getRequestData(_this.pageCurrent);
            } else {
              _this.$Message.error("表内无数据，导入失败");
            }
          });
      }
      // 2.2 验证失败，提示信息
      else {
        this.$Message.error("该表内有" + isDataEmpty + "行数据有空项");
        isDataEmpty = 0;
      }
    },
    // 对上传的数据初始化
    initUpload() {
      this.file = null;
      this.uploadTableData = [];
    },
    // 点击上传按钮
    handleUploadFile() {
      this.initUpload();
    },
    // 上传前读取并验证数据
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
      };
      reader.onprogress = e => {
        this.progressPercent = Math.round((e.loaded / e.total) * 100);
      };
      reader.onerror = e => {
        this.$Message.error("文件读取出错");
      };
      reader.onload = e => {
        const data = e.target.result;
        const { header, results } = excel.read(data, "array");
        this.uploadTableData = results;
        this.uploadLoading = false;
        // 上传数据到后台
        this.uploadExcelData(this.uploadTableData);
      };
    },
    // Excel模板下载***
    exportExcelModel() {
      if (this.historyDataSaveModel.length) {
        this.exportLoading = true;
        const params = {
          title: ["楼号", "名称"],
          key: ["buildingNumber", "buildingName"],
          data: this.historyDataSaveModel,
          autoWidth: true,
          filename: "办公楼管理模板"
        };
        excel.export_array_to_excel(params);
        this.exportLoading = false;
      } else {
        this.$Message.info("表格数据不能为空！");
      }
    },
    // Excel导出
    exportExcel() {
      if (this.historyData.length) {
        this.exportLoading = true;
        const params = {
          title: ["楼号", "名称"],
          key: ["buildingNumber", "buildingName"],
          data: this.historyData,
          autoWidth: true,
          filename: "办公楼管理"
        };
        excel.export_array_to_excel(params);
        this.exportLoading = false;
      } else {
        this.$Message.info("表格数据不能为空！");
      }
    },
    // 改变每页条数***
    changePageNumber(index) {
      this.pageSize = index;
      if (this.pageCurrent === 1) {
        this.changePage(this.pageCurrent);
      }
    },
    // 分页***
    changePage(index) {
      // 获得当前页数，以及发送数据请求
      this.pageCurrent = index;
      console.log("请求前历史数据:");
      console.log(this.historyData);
      this.getRequestData(index);
    },
    // 删除记录***
    handleDelete(index) {
      this.$Modal.confirm({
        title: "删除提示",
        content: "<p>是否确认删除该条记录？</p>",
        onOk: () => {
          let _this = this;
          let _data = this.historyData[index];
          axios
            .request({
              url: "/building/deleteBuildingList",
              method: "post",
              headers: {
                "Content-Type": "application/json;charset=UTF-8"
              },
              data: _data
            })
            .then(function(response) {
              if (response.data == 1) {
                _this.$Message.success("删除成功");
                // 判断是否pageData的数据长度<=1,是则页数减1;
                if (_this.pageData.length <= 1) {
                  _this.getRequestData(_this.pageCurrent - 1);
                } else {
                  _this.getRequestData(_this.pageCurrent);
                }
              } else {
                _this.$Message.error("删除失败");
              }
            });
        },
        onCancel: () => {}
      });

      this.editIndex = -1;
    },
    // 编辑修改记录***
    handleEdit(row, index) {
      this.editBuildingNumber = row.buildingNumber;
      this.editBuildingName = row.buildingName;
      this.editIndex = index;
    },
    // 取消修改记录***
    handleCancel(index) {
      // 数据恢复
      this.editBuildingNumber = this.historyData[index].buildingNumber;
      this.editBuildingName = this.historyData[index].buildingName;
      this.editIndex = -1;
    },
    // 保存记录***
    handleSave(index) {
      let _this = this;
      let _data = this.historyDataSave;
      // 向后台发送数据
      this.historyData[index].buildingNumber = this.editBuildingNumber;
      this.historyData[index].buildingName = this.editBuildingName;
      _data = this.historyData[index];

      axios
        .request({
          url: "/building/updateBuildingList",
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          data: _data
        })
        .then(function(response) {
          if (response.data == 1) {
            _this.$Message.success("保存成功");
            _this.getRequestData(_this.pageCurrent);
          } else if (response.data == -1) {
            _this.$Message.error("已有该楼号或办公楼名称");
            _this.historyData[index].buildingNumber = _this.editBuildingNumber;
            _this.historyData[index].buildingName = _this.editBuildingName;
          } else {
            _this.$Message.error("保存失败");
          }
        })
        .then(function() {
          console.log(_this.pageCurrent);
          _this.changePage(_this.pageCurrent);
        });
      this.editIndex = -1;
    },
    // 确认提交新增数据***
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        // 通过表单验证
        if (valid) {
          // 开始向后台发送数据
          let _this = this;
          let _data = this.formValidate;
          axios
            .request({
              url: "/building/insertBuildingList",
              method: "post",
              headers: {
                "Content-Type": "application/json;charset=UTF-8"
              },
              data: _data
            })
            .then(function(response) {
              if (response.data == 1) {
                _this.$Message.success("添加成功");
                _this.getRequestData(_this.pageCurrent);
              } else if (response.data == -1) {
                _this.$Message.error("已有该办公楼存在");
              } else {
                _this.$Message.error("添加失败");
              }
            })
            .then(function() {
              _this.$refs[name].resetFields();
            });
          this.isAddNewData = false;
        }
      });
    },
    // 新增页面点击取消***
    handleReset(name) {
      this.$refs[name].resetFields();
      this.isAddNewData = false;
    },
    // 从后台查询数据***
    getRequestData(index) {
      let _this = this;
      this.pageStart = (index - 1) * this.pageSize;
      this.pageEnd = index * this.pageSize;
      axios
        .request({
          url: "/building/getSearchList",
          method: "get",
          params: {
            search: this.searchBuildingName,
            dataStart: this.pageStart,
            dataEnd: this.pageEnd
          }
        })
        .then(function(response) {
          _this.historyData = response.data.buildingList;
          _this.pageData = _this.historyData;
          _this.dataCount = response.data.dataCount;
          console.log("数据请求:");
          console.log(_this.historyData);
        });
    },

    // 特殊字符验证
    checkSpecialKey(str) {
      var specialKey =
        "[`~!#$^&*()=|{}':;'\\[\\].<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]‘'";
      for (var i = 0; i < str.length; i++) {
        if (specialKey.indexOf(str.substr(i, 1)) != -1) {
          return false;
        }
      }
      return true;
    }
  }
};
</script>

<style lang='scss' scoped>
</style>
