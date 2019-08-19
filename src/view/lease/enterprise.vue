<template>
  <div>

    <!-- 新增园区企业按钮 -->

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

    <!-- 新增园区企业弹窗 -->

    <Modal
      :closable="false"
      v-model="isAddNewData"
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
      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储

      exportLoading: false, // 是否导出Excel成功
      isChangeEdit: false, // 是否修改记录

      pageCurrent: 1, // 当前页数
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
          title: "#id",
          key: "id",
          slot: "id"
        },
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
            // message: "公司名称不得为空",
            trigger: "blur",
            validator: strDataRule
          }
        ],
        enterprisePerson: [
          {
            required: true,
            // message: "联系人不得为空",
            trigger: "blur",
            validator: strDataRule
          }
        ],
        enterpriseTelphone: [
          {
            required: true,
            // message: "联系电话不得为空",
            trigger: "blur",
            validator: numDataRule
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
        excelData[key].enterpriseName = excelData[key].公司名称;
        excelData[key].enterprisePerson = excelData[key].联系人;
        excelData[key].enterpriseTelphone = excelData[key].联系电话;
        delete excelData[key].公司名称;
        delete excelData[key].联系人;
        delete excelData[key].联系电话;
      }
      console.log(excelData);
      // 2.验证数据
      let isDataSame = false; // 判断是否数据重复

      for (var key1 in excelData) {
        for (var key2 in this.historyData) {
          if (
            excelData[key1].enterpriseName ==
              this.historyData[key2].enterpriseName ||
            excelData[key1].enterprisePerson ==
              this.historyData[key2].enterprisePerson ||
            excelData[key1].enterpriseTelphone ==
              this.historyData[key2].enterpriseTelphone
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
            url: "/enterprise/uploadEnterpriseList",
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
          this.$Message.success("删除成功!");
          let _this = this;
          let _data = this.historyData[index + (this.pageCurrent - 1) * 10];
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
              _this.historyData = response.data;
              // 是否使页码总数减少
              if (
                _this.historyData.length / _this.pageSize <
                _this.pageCurrent
              ) {
                _this.changePage(_this.pageCurrent - 1);
              } else {
                _this.changePage(_this.pageCurrent);
              }
              _this.dataCount = _this.historyData.length;
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
      this.editBuildingNumber = this.historyData[
        index + (this.pageCurrent - 1) * 10
      ].buildingNumber;
      this.editBuildingName = this.historyData[
        index + (this.pageCurrent - 1) * 10
      ].buildingName;
      this.editIndex = -1;
    },

    // 保存数据
    handleSave(index) {
      // 标识数据重复的位置
      const isWhereSame = [
        {
          title: "公司名称",
          isDataSame: false // 数据重复标识
        },
        {
          title: "联系人",
          isDataSame: false // 数据重复标识
        },
        {
          title: "联系人电话",
          isDataSame: false // 数据重复标识
        }
      ];
      let isDataEmpty = false; //是否有数据为空

      this.historyDataSave.enterpriseName = this.editEnterpriseName;
      this.historyDataSave.enterprisePerson = this.editEnterprisePerson;
      this.historyDataSave.enterpriseTelphone = this.editEnterpriseTelphone;

      let _this = this;
      let _data = this.historyDataSave;
      // 验证数据是否合法
      // 1.楼号、名称是否为空
      if (
        _data.enterpriseName == null ||
        _data.enterpriseName == undefined ||
        _data.enterpriseName == "" ||
        _data.enterprisePerson == null ||
        _data.enterprisePerson == undefined ||
        _data.enterprisePerson == "" ||
        _data.enterpriseTelphone == null ||
        _data.enterpriseTelphone == undefined ||
        _data.enterpriseTelphone == ""
      ) {
        isDataEmpty = true;
      }
      // 2.数据为空处理
      if (isDataEmpty == true) {
        this.$Message.error("数据不能为空！");
      } else {
        // 3.判断数据是否合法
        if (
          this.checkSpecialKey(_data.enterpriseName) == false ||
          this.checkSpecialKey(_data.enterprisePerson) == false
        ) {
          this.$Message.error("不能有特殊字符！");
        } else {
          // 4.判断数据是否重复
          for (var i in this.historyData) {
            if (i != index + (this.pageCurrent - 1) * 10) {
              // 公司名称是否重复
              if (this.historyData[i].enterpriseName == _data.enterpriseName) {
                isWhereSame[0].isDataSame = true;
              }
              // 联系人是否重复
              if (
                this.historyData[i].enterprisePerson == _data.enterprisePerson
              ) {
                isWhereSame[1].isDataSame = true;
              }
              // 联系人电话是否重复
              if (
                this.historyData[i].enterpriseTelphone ==
                _data.enterpriseTelphone
              ) {
                isWhereSame[2].isDataSame = true;
              }
              if (
                isWhereSame[0].isDataSame == true ||
                isWhereSame[1].isDataSame == true ||
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
            this.$Message.success("保存成功！");
            // 向后台发送数据
            this.historyData[
              index + (this.pageCurrent - 1) * 10
            ].id = this.editEnterpriseId;
            this.historyData[
              index + (this.pageCurrent - 1) * 10
            ].enterpriseName = this.editEnterpriseName;
            this.historyData[
              index + (this.pageCurrent - 1) * 10
            ].enterprisePerson = this.editEnterprisePerson;
            this.historyData[
              index + (this.pageCurrent - 1) * 10
            ].enterpriseTelphone = this.editEnterpriseTelphone;

            _data = this.historyData[index + (this.pageCurrent - 1) * 10];

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
        if (valid) {
          this.$Message.success("操作成功!");
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
              _this.historyData = response.data;
              // 是否使页码数新增
              if (
                _this.historyData.length / _this.pageSize >
                _this.pageCurrent
              ) {
                _this.changePage(_this.pageCurrent + 1);
              } else {
                _this.changePage(_this.pageCurrent);
              }
              _this.dataCount = _this.historyData.length;
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
    gethistoryData() {
      let _this = this;
      axios
        .request({
          url: "/enterprise/getEnterpriseList",
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

<style lang="scss" scoped>
</style>
