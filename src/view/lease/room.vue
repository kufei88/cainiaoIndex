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

    <!-- 新增办公室按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewData = true"
      style="float:right"
    >新增</Button>

    <!-- 清除浮动 -->
    <div style="clear:both"></div>

    <!-- 新增办公室弹窗 -->
    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增办公室信息填写"
    >
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
      >

        <FormItem
          label="所属办公楼"
          prop="buildingName"
        >
          <Select
            v-model="formValidate.buildingName"
            style="width:200px"
            transfer:true
          >
            <Option
              v-for="item in buildingData"
              :value="item.buildingName"
              :key="item.buildingName"
            >{{ item.buildingName }}</Option>
          </Select>
        </FormItem>

        <FormItem
          label="房号"
          prop="roomNumber"
        >
          <Input
            clearable
            v-model="formValidate.roomNumber"
          />
        </FormItem>

        <FormItem
          label="计租面积"
          prop="rentArea"
        >
          <Input
            clearable
            v-model="formValidate.rentArea"
            placeholder="单位(㎡)"
          />
        </FormItem>

        <FormItem
          label="建筑面积"
          prop="builtUpArea"
        >
          <Input
            clearable
            v-model="formValidate.builtUpArea"
            placeholder="单位(㎡)"
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

    <!-- 办公室表格显示 -->
    <Table
      border
      :columns="dataColumns"
      :data="pageData"
      ref="table"
      height="522"
    >
      <template
        slot-scope="{ row }"
        slot="id"
      >
        <span>{{ row.id }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="buildingName"
      >
        <Select
          v-model="editBuildingName"
          v-if="editIndex === index"
          transfer:true
        >
          <Option
            v-for="item in buildingData"
            :value="item.buildingName"
            :key="item.buildingName"
          >{{ item.buildingName }}</Option>
        </Select>
        <span v-else>{{ row.buildingName }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="roomNumber"
      >
        <Input
          type="text"
          v-model="editRoomNumber"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.roomNumber }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentArea"
      >
        <Input
          type="text"
          v-model="editRentArea"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentArea }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="builtUpArea"
      >
        <Input
          type="text"
          v-model="editBuiltUpArea"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.builtUpArea }}</span>
      </template>

      <template
        slot-scope="{ row }"
        slot="owner"
      >
        <span>{{ row.owner }}</span>
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
    // 是否当前字段重复
    var isCurrentDataSame = function(field, value) {
      let isDataSame = false;
      for (var key in thisVue._data.historyData) {
        // 房间号是否重复
        if (field == "roomNumber") {
          if (
            value == thisVue._data.historyData[key].roomNumber &&
            thisVue._data.formValidate.buildingName ==
              thisVue._data.historyData[key].buildingName
          ) {
            isDataSame = true;
          }
        }
      }
      return isDataSame;
    };
    // 房间号验证规则
    var roomNumberRule = function(rule, value, callback) {
      let isBuildingNumber = /^[0-9]+$/;
      // 1.验证数据是否为空
      if (value == null || value == undefined || value == "") {
        return callback(new Error("房号不得为空"));
      }
      // 2.验证是否含有特殊字符
      else if (!checkSpecialKey(value)) {
        return callback(new Error("不得含有特殊字符"));
      }
      // 3.验证是否格式错误
      else if (!isBuildingNumber.test(value)) {
        return callback(new Error("格式有误，必须由数字组成"));
      }
      // 4.验证是否数据重复
      else if (isCurrentDataSame(rule.field, value) == true) {
        return callback(new Error("已有该房号"));
      } else {
        callback();
      }
    };
    // 数字类型字段验证
    var numDataRule = function(rule, value, callback) {
      let isBuildingNumber = /^[0-9]+$/;

      // 1.是否为空
      if (value == null || value == undefined || value == "") {
        switch (rule.field) {
          case "rentArea":
            return callback(new Error("计租面积不得为空"));
            break;
          case "builtUpArea":
            return callback(new Error("建筑面积不得为空"));
            break;
          default:
            break;
        }
      }
      // 2.验证是否含有特殊字符
      else if (!checkSpecialKey(value)) {
        return callback(new Error("不得含有特殊字符"));
      }
      // 3.是否是大于0的数字
      else if (!isBuildingNumber.test(value)) {
        return callback(new Error("格式有误，必须是数字"));
      } else {
        callback();
      }
    };
    return {
      searchBuildingName: "", // 查询的办公楼名称
      searchHistoryData: [], //搜索时备份的历史数据

      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储

      exportLoading: false, // 是否导出Excel成功
      isChangeEdit: false, // 是否修改记录

      pageCurrent: 1, //当前页数
      pageStart: 0,
      pageEnd: 0,
      dataCount: 0, //后台数据的总记录
      pageSize: 10, //每页显示多少条
      pageData: [], //table绑定的数据

      editIndex: -1, // 当前聚焦的输入框的行数
      editRoomId: "", // 编辑的办公室id
      editRoomNumber: "", // 编辑的办公室房号
      editBuildingName: "", // 编辑的办公楼名称
      editRentArea: "", // 编辑的计租面积
      editBuiltUpArea: "", // 编辑的建筑面积
      editOwner: "", // 编辑的业主

      isFormData: false,

      isAddNewData: false, //是否新增数据
      // 表格显示的列名数据
      dataColumns: [
        {
          title: "所属办公楼",
          key: "buildingName",
          slot: "buildingName"
        },
        {
          title: "房号",
          key: "roomNumber",
          slot: "roomNumber"
        },
        {
          title: "计租面积(㎡)",
          key: "rentArea",
          slot: "rentArea"
        },
        {
          title: "建筑面积(㎡)",
          key: "builtUpArea",
          slot: "builtUpArea"
        },
        {
          title: "业主",
          key: "owner",
          slot: "owner"
        },
        {
          title: "操作",
          width: 200,
          align: "center",
          slot: "action"
        }
      ],
      buildingData: [], // 从后台获取的办公楼数据
      historyData: [], // 从后台读取的表格数据

      // excel模板数据格式
      historyDataSaveModel: [
        {
          roomNumber: "必须是数字，，例如:101",
          buildingName: "必须是办公楼管理里存在的名称",
          rentArea: "必须是数字，单位(㎡)",
          builtUpArea: "必须是数字，单位(㎡)"
        }
      ],
      // 修改时原数据暂存
      historyDataSave: {
        roomNumber: "",
        buildingName: "",
        rentArea: "",
        builtUpArea: ""
      },
      // 表单数据设置
      formValidate: {
        roomNumber: "",
        buildingName: "",
        rentArea: "",
        builtUpArea: ""
      },
      // 表单数据验证设置
      ruleValidate: {
        roomNumber: [
          {
            required: true,
            message: "房号不得为空",
            trigger: "blur",
          }
        ],
        buildingName: [
          {
            required: true,
            message: "所属办公楼不得为空",
            trigger: "change"
          }
        ],
        rentArea: [
          {
            type: "number",
            required: true,
            message: "计租面积不得为空",
            trigger: "blur",
          }
        ],
        builtUpArea: [
          {
            type: "number",
            required: true,
            message: "建筑面积不得为空",
            trigger: "blur",
          }
        ]
      }
    };
  },
  mounted() {
    this.getRequestData(this.pageCurrent);
    this.getBuildingData();
  },
  methods: {
    // 查询数据***
    searchData(value) {
      this.searchBuildingName = value;
      this.pageCurrent = 1;
      this.getRequestData(this.pageCurrent);
    },
    // Excel导入数据
    uploadExcelData(excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        excelData[key].roomNumber = excelData[key].房号;
        excelData[key].buildingName = excelData[key].办公楼名称;
        excelData[key].rentArea = excelData[key].计租面积;
        excelData[key].builtUpArea = excelData[key].建筑面积;
        delete excelData[key].房号;
        delete excelData[key].办公楼名称;
        delete excelData[key].计租面积;
        delete excelData[key].建筑面积;
      }
      // 验证空数据
      let isDataEmpty = 0;
      for (var key in excelData) {
        excelData[key].roomNumber == "" ||
        excelData[key].roomNumber == null ||
        excelData[key].roomNumber == undefined ||
        excelData[key].buildingName == "" ||
        excelData[key].buildingName == null ||
        excelData[key].buildingName == undefined ||
        excelData[key].rentArea == "" ||
        excelData[key].rentArea == null ||
        excelData[key].rentArea == undefined ||
        excelData[key].builtUpArea == "" ||
        excelData[key].builtUpArea == null ||
        excelData[key].builtUpArea == undefined
          ? (isDataEmpty += 1)
          : (isDataEmpty += 0);
      }
      // 2.1 验证成功，上传后台数据库
      if (isDataEmpty == 0) {
        let _this = this;
        axios
          .request({
            url: "/room/uploadRoomList",
            method: "post",
            headers: {
              "Content-Type": "application/json;charset=UTF-8"
            },
            data: excelData
          })
          .then(function(response) {
            if (response.data == 0) {
              _this.$Message.error("未知原因，导入失败");
            } else if (response.data == -1) {
              _this.$Message.error("导入失败，表内无数据");
            } else if (response.data == -2) {
              _this.$Message.error("导入失败，数据全部存在");
            } else {
              if (response.data == excelData.length) {
                _this.$Message.success("导入成功");
              } else if (response.data < excelData.length) {
                let num = excelData.length - response.data;
                _this.$Message.info(num + "条数据因重复而未导入");
              }
              _this.getRequestData(_this.pageCurrent);
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

    // Excel模板下载
    exportExcelModel() {
      if (this.historyDataSaveModel.length) {
        this.exportLoading = true;
        const params = {
          title: ["房号", "办公楼名称", "计租面积", "建筑面积"],
          key: ["roomNumber", "buildingName", "rentArea", "builtUpArea"],
          data: this.historyDataSaveModel,
          autoWidth: true,
          filename: "办公室管理模板"
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
          title: ["房号", "办公楼名称", "计租面积", "建筑面积"],
          key: ["roomNumber", "buildingName", "rentArea", "builtUpArea"],
          data: this.historyData,
          autoWidth: true,
          filename: "办公室管理"
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
      this.getRequestData(index);
    },
    // 删除记录
    handleDelete(index) {
      this.$Modal.confirm({
        title: "删除提示",
        content: "<p>是否确认删除该条记录？</p>",
        onOk: () => {
          let _this = this;
          let _data = this.historyData[index];
          axios
            .request({
              url: "/room/deleteRoomList",
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
    // 编辑修改记录
    handleEdit(row, index) {
      this.editRoomId = row.id;
      this.editRoomNumber = row.roomNumber;
      this.editBuildingName = row.buildingName;
      this.editRentArea = row.rentArea;
      this.editBuiltUpArea = row.builtUpArea;
      this.editOwner = row.owner;
      this.editIndex = index;
    },
    // 取消修改记录
    handleCancel(index) {
      // 数据恢复
      this.editBuildingNumber = this.historyData[index].buildingNumber;
      this.editBuildingName = this.historyData[index].buildingName;
      this.editIndex = -1;
    },

    // 保存数据
    handleSave(index) {
      let _this = this;
      let _data = this.historyDataSave;

      // 向后台发送数据
      this.historyData[index].id = this.editRoomId;
      this.historyData[index].roomNumber = this.editRoomNumber;
      this.historyData[index].buildingName = this.editBuildingName;
      this.historyData[index].rentArea = this.editRentArea;
      this.historyData[index].builtUpArea = this.editBuiltUpArea;
      this.historyData[index].owner = this.editOwner;
      // 判断是否为空，内容有空值就不发送
      if (
        this.historyData[index].roomNumber == "" ||
        this.historyData[index].roomNumber == null ||
        this.historyData[index].roomNumber == undefined ||
        this.historyData[index].buildingName == "" ||
        this.historyData[index].buildingName == null ||
        this.historyData[index].buildingName == undefined ||
        this.historyData[index].rentArea == "" ||
        this.historyData[index].rentArea == null ||
        this.historyData[index].rentArea == undefined ||
        this.historyData[index].builtUpArea == "" ||
        this.historyData[index].builtUpArea == null ||
        this.historyData[index].builtUpArea == undefined
      ) {
        this.$Message.error("有内容未填写");
      } else {
        _data = this.historyData[index];

        axios
          .request({
            url: "/room/updateRoomList",
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
              _this.$Message.error("该楼已有该房号");
              _this.historyData[index].id = _this.editRoomId;
              _this.historyData[index].roomNumber = _this.editRoomNumber;
              _this.historyData[index].buildingName = _this.editBuildingName;
              _this.historyData[index].rentArea = _this.editRentArea;
              _this.historyData[index].builtUpArea = _this.editBuiltUpArea;
              _this.historyData[index].owner = _this.editOwner;
            } else {
              _this.$Message.error("保存失败");
            }
          })
          .then(function() {
            _this.changePage(_this.pageCurrent);
          });
        this.editIndex = -1;
      }
    },
    // 确认提交新增数据
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 开始向后台发送数据
          let _this = this;
          let _data = this.formValidate;
          axios
            .request({
              url: "/room/insertRoomList",
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
                _this.$Message.error("已有该办公室存在");
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
    // 新增页面点击取消
    handleReset(name) {
      this.$refs[name].resetFields();
      this.isAddNewData = false;
    },
    // 从后台获取表格数据
    getRequestData(index) {
      let _this = this;
      this.pageStart = (index - 1) * this.pageSize;
      this.pageEnd = this.pageSize;
      axios
        .request({
          url: "/room/getSearchList",
          method: "get",
          params: {
            search: this.searchBuildingName,
            dataStart: this.pageStart,
            dataEnd: this.pageEnd
          }
        })
        .then(function(response) {
          _this.historyData = response.data.roomList;
          _this.pageData = _this.historyData;
          _this.dataCount = response.data.dataCount;
        });
    },
    // 从后台获取办公楼数据
    getBuildingData() {
      let _this = this;
      axios
        .request({
          url: "/building/getBuildingList",
          method: "get"
        })
        .then(function(response) {
          _this.buildingData = response.data;
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
    },
    // 数字格式验证
    checkNumberKey(str) {
      let isBuildingNumber = /^[0-9]+$/;
      let isDataOk = false;
      if (isBuildingNumber.test(str) == true) {
        isDataOk = true;
      }
      return isDataOk;
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
