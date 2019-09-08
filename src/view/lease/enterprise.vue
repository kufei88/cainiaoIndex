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

    <!-- 新增园区企业按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewData = true"
      style="float:right"
    >新增</Button>

    <!-- 清除浮动 -->

    <div style="clear:both"></div>

    <!-- 新增园区企业弹窗 -->

    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增园区企业信息填写"
    >

      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
      >

        <FormItem
          label="公司名称"
          prop="enterpriseName"
        >

          <Input v-model="formValidate.enterpriseName" />

        </FormItem>

        <FormItem
          label="联系人"
          prop="enterprisePerson"
        >

          <Input v-model="formValidate.enterprisePerson" />

        </FormItem>

        <FormItem
          label="联系电话"
          prop="enterpriseTelphone"
        >

          <Input v-model="formValidate.enterpriseTelphone" />

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

    <!-- 企业园区表格显示 -->

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
        slot="enterpriseName"
      >
        <Input
          type="text"
          v-model="editEnterpriseName"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.enterpriseName }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="enterprisePerson"
      >
        <Input
          type="text"
          v-model="editEnterprisePerson"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.enterprisePerson }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="enterpriseTelphone"
      >
        <Input
          type="text"
          v-model="editEnterpriseTelphone"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.enterpriseTelphone }}</span>
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
        if (field == "enterpriseName") {
          if (value == thisVue._data.historyData[key].enterpriseName) {
            isDataSame = true;
          }
        }
        if (field == "enterprisePerson") {
          if (value == thisVue._data.historyData[key].enterprisePerson) {
            isDataSame = true;
          }
        }
        if (field == "enterpriseTelphone") {
          if (value == thisVue._data.historyData[key].enterprisePerson) {
            isDataSame = true;
          }
        }
      }
      return isDataSame;
    };
    // 字符串字段验证规则
    var strDataRule = function(rule, value, callback) {
      if (value == null || value == undefined || value == "") {
        switch (rule.field) {
          case "enterpriseName":
            return callback(new Error("公司名称不得为空"));
            break;
          case "enterprisePerson":
            return callback(new Error("联系人不得为空"));
            break;
          default:
            break;
        }
      } else if (!checkSpecialKey(value)) {
        return callback(new Error("不得含有特殊字符"));
      } else if (isCurrentDataSame(rule.field, value) == true) {
        switch (rule.field) {
          case "enterpriseName":
            return callback(new Error("已有该公司名称"));
            break;
          case "enterprisePerson":
            return callback(new Error("已有该联系人"));
            break;
          default:
            break;
        }
      } else {
        callback();
      }
    };
    // 数字字段验证
    var numDataRule = function(rule, value, callback) {
      let isBuildingNumber = /^[0-9]+$/;

      // 1.是否为空
      if (value == null || value == undefined || value == "") {
        switch (rule.field) {
          case "enterpriseTelphone":
            return callback(new Error("联系人电话不得为空"));
            break;
          default:
            break;
        }
      }
      // 2.是否是大于0的数字
      else if (!isBuildingNumber.test(value)) {
        switch (rule.field) {
          case "enterpriseTelphone":
            return callback(new Error("联系人电话格式有误"));
            break;
          default:
            break;
        }
      }
      // 3.是否与旧数据重复
      else if (isCurrentDataSame(rule.field, value) == true) {
        switch (rule.field) {
          case "enterpriseTelphone":
            return callback(new Error("已有该联系人电话"));
            break;
          default:
            break;
        }
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

      pageCurrent: 1, // 当前页数
      pageStart: 0,
      pageEnd: 0,
      dataCount: 0, // 从后台读取的总记录条数
      pageSize: 10, // 每页显示多少条
      pageData: [], // table绑定的数据

      editIndex: -1, // 当前聚焦的输入框的行数
      editEnterpriseId: "", // 编辑的企业id
      editEnterpriseName: "", // 编辑的企业名称
      editEnterprisePerson: "", // 编辑的企业联系人
      editEnterpriseTelphone: "", // 编辑的企业联系电话

      isAddNewData: false, //是否新增数据
      // 表格显示的列名数据
      dataColumns: [
        {
          title: "公司名称",
          key: "enterpriseName",
          slot: "enterpriseName"
        },
        {
          title: "联系人",
          key: "enterprisePerson",
          slot: "enterprisePerson"
        },
        {
          title: "联系电话",
          key: "enterpriseTelphone",
          slot: "enterpriseTelphone"
        },
        {
          title: "操作",
          slot: "action",
          width: 200,
          align: "center"
        }
      ],
      historyData: [], // 从后台读取的表格数据
      // excel模板数据格式
      historyDataSaveModel: [
        {
          enterpriseName: "例如：某某有限公司",
          enterprisePerson: "填写公司主要负责人名称",
          enterpriseTelphone: "填写负责人电话"
        }
      ],
      // 修改时原数据暂存
      historyDataSave: {
        enterpriseName: "",
        enterprisePerson: "",
        enterpriseTelphone: ""
      },
      // 表单数据设置
      formValidate: {
        enterpriseName: "",
        enterprisePerson: "",
        enterpriseTelphone: ""
      },
      // 表单数据验证设置
      ruleValidate: {
        enterpriseName: [
          {
            required: true,
            message: "公司名称不得为空",
            trigger: "blur",
          }
        ],
        enterprisePerson: [
          {
            required: true,
            message: "联系人不得为空",
            trigger: "blur",
          }
        ],
        enterpriseTelphone: [
          {
            required: true,
            message: "联系电话不得为空",
            trigger: "blur",
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
    // Excel导入数据
    uploadExcelData(excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        excelData[key].enterpriseName = excelData[key].公司名称;
        excelData[key].enterprisePerson = excelData[key].联系人;
        excelData[key].enterpriseTelphone = excelData[key].联系电话;
        delete excelData[key].公司名称;
        delete excelData[key].联系人;
        delete excelData[key].联系电话;
      }

      // 验证空数据
      let isDataEmpty = 0;
      for (var key in excelData) {
        excelData[key].enterpriseName == undefined ||
        excelData[key].enterpriseName == null ||
        excelData[key].enterpriseName == "" ||
        excelData[key].enterprisePerson == "" ||
        excelData[key].enterprisePerson == null ||
        excelData[key].enterprisePerson == undefined ||
        excelData[key].enterpriseTelphone == "" ||
        excelData[key].enterpriseTelphone == null ||
        excelData[key].enterpriseTelphone == undefined
          ? (isDataEmpty += 1)
          : (isDataEmpty += 0);
      }
      // 2.1 验证成功，上传后台数据库
      if (isDataEmpty == 0) {
        let _this = this;
        axios
          .request({
            url: "/enterprise/uploadEnterpriseList",
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
          title: ["公司名称", "联系人", "联系电话"],
          key: ["enterpriseName", "enterprisePerson", "enterpriseTelphone"],
          data: this.historyDataSaveModel,
          autoWidth: true,
          filename: "园区企业管理模板"
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
          title: ["公司名称", "联系人", "联系电话"],
          key: ["enterpriseName", "enterprisePerson", "enterpriseTelphone"],
          data: this.historyData,
          autoWidth: true,
          filename: "园区企业管理"
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
              url: "/enterprise/deleteEnterpriseList",
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
      this.editEnterpriseId = row.id;
      this.editEnterpriseName = row.enterpriseName;
      this.editEnterprisePerson = row.enterprisePerson;
      this.editEnterpriseTelphone = row.enterpriseTelphone;
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
      this.historyData[index].id = this.editEnterpriseId;
      this.historyData[index].enterpriseName = this.editEnterpriseName;
      this.historyData[index].enterprisePerson = this.editEnterprisePerson;
      this.historyData[index].enterpriseTelphone = this.editEnterpriseTelphone;
      if (this.historyData[index].enterpriseName == undefined ||
        this.historyData[index].enterpriseName == null ||
        this.historyData[index].enterpriseName == "" ||
        this.historyData[index].enterprisePerson == "" ||
        this.historyData[index].enterprisePerson == null ||
        this.historyData[index].enterprisePerson == undefined ||
        this.historyData[index].enterpriseTelphone == "" ||
        this.historyData[index].enterpriseTelphone == null ||
        this.historyData[index].enterpriseTelphone == undefined
        ) {
        this.$Message.error("有内容未填写");
      } else {
        _data = this.historyData[index];

      axios
        .request({
          url: "/enterprise/updateEnterpriseList",
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
            _this.$Message.error("已有该企业");
            _this.historyData[index].id = _this.editEnterpriseId;
            _this.historyData[index].enterpriseName = _this.editEnterpriseName;
            _this.historyData[index].enterprisePerson =
              _this.editEnterprisePerson;
            _this.historyData[index].enterpriseTelphone =
              _this.editEnterpriseTelphone;
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
              url: "/enterprise/insertEnterpriseList",
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
                _this.$Message.error("已有该企业存在");
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
          url: "/enterprise/getSearchList",
          method: "get",
          params: {
            search: this.searchBuildingName,
            dataStart: this.pageStart,
            dataEnd: this.pageEnd
          }
        })
        .then(function(response) {
          _this.historyData = response.data.enterpriseList;
          _this.pageData = _this.historyData;
          _this.dataCount = response.data.dataCount;
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

<style lang="scss" scoped>
</style>
