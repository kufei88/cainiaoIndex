<template>
  <div>

    <!-- 新增办公楼按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewData = true"
      style="float:left"
    >新增</Button>

    <!-- Excel导入按钮 -->
    <Upload
      action=""
      :before-upload="handleBeforeUpload"
      accept=".xls, .xlsx"
      style="float:left"
    >
      <Button
        icon="ios-cloud-upload-outline"
        :loading="uploadLoading"
        @click="handleUploadFile"
      >上传文件</Button>
    </Upload>
    <!-- Excel导出按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcel"
      style="float:left"
    >导出文件</Button>
    <!-- Excel模板下载按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcelModel"
      style="float:left"
    >模板下载</Button>
    <!-- 清除浮动 -->
    <div style="clear:both"></div>
    <!-- 自定义查询模块 -->

    <!-- 新增办公楼弹窗 -->
    <Modal
      :closable="false"
      v-model="isAddNewData"
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
      let isBuildingNumber = /^[1-9]+$/;
      if (value == null || value == undefined || value == "") {
        return callback(new Error("办公楼号不得为空"));
      } else if (!isBuildingNumber.test(value)) {
        return callback(new Error("办公楼号必须是大于0的数字"));
      } else {
        callback();
      }
    };
    // 办公楼名称验证
    var isBuildingName = function(rule, value, callback) {
      if (value == null || value == undefined || value == "") {
        return callback(new Error("办公楼名称不得为空"));
      } else if (!checkSpecialKey(value)) {
        return callback(new Error("不得含有特殊字符"));
      } else {
        callback();
      }
    };
    return {
      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储

      exportLoading: false, // 是否导出Excel成功
      isChangeEdit: false, // 是否修改记录

      pageCurrent: 1, // 当前页数
      dataCount: 0, // 后台读取的总记录长度
      pageSize: 10, // 每页显示多少条
      pageData: [], // table绑定的数据

      editIndex: -1, // 当前聚焦的输入框的行数
      editBuildingNumber: "", // 编辑的楼号
      editBuildingName: "", // 编辑的名称
      isFormData: false, //表单数据是否重复

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
            type: "number",
            required: true,
            // message: "办公楼号不得为空",
            trigger: "blur",
            validator: isBuildingNumber
          }
        ],
        buildingName: [
          {
            required: true,
            // message: "办公楼名称不得为空",
            trigger: "blur",
            validator: isBuildingName
          }
        ]
      }
    };
  },
  mounted() {
    this.gethistoryData();
  },
  methods: {
    // 上传数据到后台
    uploadExcelData(excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        excelData[key].buildingNumber = excelData[key].楼号;
        excelData[key].buildingName = excelData[key].名称;
        delete excelData[key].楼号;
        delete excelData[key].名称;
      }
      console.log(excelData);
      // 2.验证数据
      let isDataSame = false; // 判断是否数据重复

      for (var key1 in excelData) {
        for (var key2 in this.historyData) {
          if (
            excelData[key1].buildingNumber ==
              this.historyData[key2].buildingNumber ||
            excelData[key1].buildingName == this.historyData[key2].buildingName
          ) {
            isDataSame = true;
            break;
          }
        }
        if (isDataSame == true) {
          break;
        }
      }
      // 2.1 验证成功，上传后台数据库
      if (isDataSame == false) {
        this.$Message.success("导入成功！");
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
            _this.historyData = response.data;
            _this.changePage(_this.pageCurrent);
          });
      }
      // 2.2 验证失败，提示信息
      else {
        this.$Message.error("导入失败！");
        isDataSame = false;
      }
    },
    // 对上传的数据初始化
    initUpload() {
      this.file = null;
      this.uploadTableData = [];
    },
    // 点击按钮
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
    // Excel模板下载
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
    // 改变每页条数
    changePageNumber(index) {
      this.pageSize = index;
      if (this.pageCurrent === 1) {
        this.changePage(this.pageCurrent);
      }
    },
    // 分页
    changePage(index) {
      let _start = (index - 1) * this.pageSize;
      let _end = index * this.pageSize;
      this.pageData = this.historyData.slice(_start, _end);
      this.pageCurrent = index;
    },
    // 删除记录
    handleDelete(index) {
      this.$Modal.confirm({
        title: "删除提示",
        content: "<p>是否确认删除该条记录？</p>",
        onOk: () => {
          this.$Message.success("操作成功!");
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
              _this.historyData = response.data;
              _this.changePage(_this.pageCurrent);
            });
        },
        onCancel: () => {}
      });

      this.editIndex = -1;
    },
    // 编辑修改记录
    handleEdit(row, index) {
      this.editBuildingNumber = row.buildingNumber;
      this.editBuildingName = row.buildingName;
      this.editIndex = index;
    },
    // 取消修改记录
    handleCancel(index) {
      // 数据恢复
      this.editBuildingNumber = this.historyData[
        index + (this.pageCurrent - 1) * 10
      ].buildingNumber;
      this.editBuildingName = this.historyData[
        index + (this.pageCurrent - 1) * 10
      ].buildingName;
      this.editIndex = -1;
    },
    // 保存记录
    handleSave(index) {
      // 标识数据重复的位置
      const isWhereSame = [
        {
          title: "楼号",
          isDataSame: false // 数据重复标识
        },
        {
          title: "名称",
          isDataSame: false // 数据重复标识
        }
      ];

      let isDataEmpty = false; //是否有数据为空

      this.historyDataSave.buildingNumber = this.editBuildingNumber;
      this.historyDataSave.buildingName = this.editBuildingName;

      let _this = this;
      let _data = this.historyDataSave;
      // 验证数据是否合法
      // 1.楼号、名称是否为空
      if (
        _data.buildingNumber == null ||
        _data.buildingNumber == undefined ||
        _data.buildingNumber == "" ||
        _data.buildingName == null ||
        _data.buildingName == undefined ||
        _data.buildingName == ""
      ) {
        isDataEmpty = true;
      }
      // 2.数据为空处理
      if (isDataEmpty == true) {
        this.$Message.error("数据不能为空！");
      } else {
        // 3.判断数据是否合法
        if (this.checkSpecialKey(_data.buildingName) == false) {
          this.$Message.error("名称不能有特殊字符！");
        } else {
          // 4.判断数据是否重复
          for (var i in this.historyData) {
            if (i != index + (this.pageCurrent - 1) * 10) {
              // 楼号是否重复
              if (this.historyData[i].buildingNumber == _data.buildingNumber) {
                isWhereSame[0].isDataSame = true;
              }
              // 名称是否重复
              if (this.historyData[i].buildingName == _data.buildingName) {
                isWhereSame[1].isDataSame = true;
              }
              if (
                isWhereSame[0].isDataSame == true ||
                isWhereSame[1].isDataSame == true
              ) {
                break;
              }
            }
          }
          // 5.数据重复处理
          let errorStr = ""; // 错误信息集合
          for (var i in isWhereSame) {
            if (isWhereSame[i].isDataSame == true) {
              errorStr += isWhereSame[i].title;
              errorStr += "、";
            }
          }
          // 6.去除最后一个“、”号
          errorStr = errorStr.substring(0, errorStr.lastIndexOf("、"));
          // 7.是否修改成功处理
          if (errorStr === "") {
            // 修改成功
            this.$Message.success("操作成功！");
            // 向后台发送数据
            this.historyData[
              index + (this.pageCurrent - 1) * 10
            ].buildingNumber = this.editBuildingNumber;
            this.historyData[
              index + (this.pageCurrent - 1) * 10
            ].buildingName = this.editBuildingName;
            _data = this.historyData[index + (this.pageCurrent - 1) * 10];

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
                _this.historyData = response.data;
                _this.changePage(_this.pageCurrent);
              });
            this.editIndex = -1;
          }
          // 修改失败,提示信息
          else {
            errorStr = "已有该" + errorStr + "！";
            this.$Message.error({
              content: errorStr,
              duration: 3
            });
          }
        }
      }
    },
    // 确认提交新增数据
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        // 通过表单验证
        if (valid) {
          // 验证数据的合法性
          this.historyData.forEach(element => {
            // 楼号不得重复
            if (element.buildingNumber == this.formValidate.buildingNumber) {
              this.isFormData = true;
            }
            // 楼名称不得重复
          });
          if (this.isFormData == false) {
            this.$Message.success("操作成功!");
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
                _this.historyData = response.data;
                _this.changePage(_this.pageCurrent);
              })
              .then(function() {
                _this.$refs[name].resetFields();
              });
            this.isAddNewData = false;
          } else {
            this.$Message.error("已有办公楼楼号，请重新填写！");
            this.isFormData = false;
            // 重置填写错误的楼号
            this.$refs[name].fields.forEach(function(e) {
              if (e.prop == "buildingNumber") {
                e.resetField();
              }
            });
            // this.$refs[name].resetFields();
          }
        } else {
          // 表单验证没有通过
        }
      });
    },
    // 新增页面点击取消
    handleReset(name) {
      this.$refs[name].resetFields();
      this.isAddNewData = false;
    },
    // 从后台获取表格数据
    gethistoryData() {
      let _this = this;
      axios
        .request({
          url: "/building/getBuildingList",
          method: "get"
        })
        .then(function(response) {
          _this.historyData = response.data;
        })
        .then(function() {
          _this.dataCount = _this.historyData.length;
          _this.pageData = _this.historyData.slice(0, _this.pageSize);
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
