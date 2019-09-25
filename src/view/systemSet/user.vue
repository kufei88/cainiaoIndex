<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入查询账号"
      style="width:300px;margin-bottom:10px;float:left;"
      @on-search="search_Btn"
      v-model="searchData"
    />
    <!-- 删除用户按钮 -->
    <Button
      type="error"
      @click="handleDelete"
      style="float:right;margin-left:10px"
    >删除</Button>
    <!-- 修改用户按钮 -->
    <Button
      type="warning"
      @click="updateButton"
      style="float:right;margin-left:10px"
    >修改</Button>
    <!-- 新增用户按钮 -->
    <Button
      type="primary"
      @click="isAddNewData = true"
      style="float:right;margin-left:10px"
    >新增</Button>

    <div style="clear:both"></div>

    <!-- 新增弹窗 -->

    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增用户信息填写"
    >
      <!-- 表单填写 -->
      <Form
        ref="insertForm"
        :model="insertFormData"
        :rules="insertRuleForm"
        :label-width="80"
      >
        <FormItem
          label="账号"
          prop="account"
        >
          <Input
            clearable
            v-model="insertFormData.account"
          />
        </FormItem>

        <FormItem
          label="密码"
          prop="password"
        >
          <Input
            clearable
            v-model="insertFormData.password"
          />
        </FormItem>

        <FormItem
          label="用户名"
          prop="userName"
        >
          <Input
            clearable
            v-model="insertFormData.userName"
          />
        </FormItem>

        <FormItem
          label="性别"
          prop="sex"
        >
          <RadioGroup v-model="insertFormData.sex">
            <Radio label="男">男</Radio>
            <Radio label="女">女</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem
          label="联系电话"
          prop="telephone"
        >

          <Input
            clearable
            v-model="insertFormData.telephone"
          />
        </FormItem>

        <FormItem
          label="所属部门"
          prop="department"
        >
          <Input
            clearable
            v-model="insertFormData.department"
          />
        </FormItem>

      </Form>
      <!-- 页脚 -->
      <div slot="footer">
        <Button
          type="text"
          size="large"
          @click="handleReset('insertForm')"
        >取消</Button>
        <Button
          type="primary"
          size="large"
          @click="handleSubmit('insertForm')"
        >确定</Button>
      </div>
    </Modal>

    <!-- 修改弹窗 -->
    <Modal
      :closable="false"
      v-model="isUpdateData"
      :mask-closable="false"
      title="修改用户信息"
    >
      <!-- 表单填写 -->
      <Form
        ref="updateForm"
        :model="updateFormData"
        :rules="insertRuleForm"
        :label-width="80"
      >
        <FormItem
          label="账号"
          prop="account"
        >
          <Input
            v-model="updateFormData.account"
            readonly
          />
        </FormItem>

        <FormItem
          label="密码"
          prop="password"
        >
          <Input
            clearable
            v-model="updateFormData.password"
          />
        </FormItem>

        <FormItem
          label="用户名"
          prop="userName"
        >
          <Input
            clearable
            v-model="updateFormData.userName"
          />
        </FormItem>

        <FormItem
          label="性别"
          prop="sex"
        >
          <RadioGroup v-model="updateFormData.sex">
            <Radio label="男">男</Radio>
            <Radio label="女">女</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem
          label="联系电话"
          prop="telephone"
        >
          <Input
            clearable
            v-model="updateFormData.telephone"
          />
        </FormItem>

        <FormItem
          label="所属部门"
          prop="department"
        >
          <Input
            clearable
            v-model="updateFormData.department"
          />
        </FormItem>

      </Form>
      <!-- 页脚 -->
      <div slot="footer">
        <Button
          type="text"
          size="large"
          @click="handleReset('updateForm')"
        >取消</Button>
        <Button
          type="primary"
          size="large"
          @click="handleSubmit('updateForm')"
        >确定</Button>
      </div>
    </Modal>

    <!-- 用户表格显示 -->
    <Table
      border
      highlight-row
      :columns="dataColumns"
      :data="pageData"
      ref="currentRowTable"
      height="522"
      @on-current-change="currentChange"
    >

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
export default {
  data() {
    return {
      isSelectRow: false, // 是否选择表格的某一行
      // 修改表单填写
      updateFormData: {
        account: "",
        password: "",
        userName: "",
        sex: "",
        telephone: "",
        department: "",
        insertTime: "",
        updateTime: ""
      },
      // 表单验证规则
      insertRuleForm: {
        account: [
          {
            required: true,
            message: "账号不得为空",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "密码不得为空",
            trigger: "blur"
          }
        ],
        userName: [
          {
            required: true,
            message: "用户名不得为空",
            trigger: "blur"
          }
        ],
        sex: [
          {
            required: true,
            message: "性别不得为空",
            trigger: "blur"
          }
        ],
        telephone: [
          {
            required: true,
            message: "请填写正确的联系方式",
            trigger: "blur",
            transform(value) {
              var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
              if (!myreg.test(value)) {
                return false;
              } else {
                return String(value);
              }
            }
          }
        ],
        department: [
          {
            required: true,
            message: "所属部门不得为空",
            trigger: "blur"
          }
        ]
      },

      // 新增表单填写
      insertFormData: {
        account: "",
        password: "",
        userName: "",
        sex: "",
        telephone: "",
        department: "",
        insertTime: "",
        updateTime: ""
      },
      isUpdateData: false, //是否修改数据
      searchData: "", //查询内容
      isAddNewData: false, //是否新增数据

      historyData: [], //从后台读取的表格数据

      pageCurrent: 1, // 当前页数
      pageStart: 0, // 记录开始位置
      dataCount: 0, // 后台读取的总记录长度
      pageSize: 10, // 每页显示多少条
      pageData: [], // table绑定的数据

      // 表格显示的列名数据
      dataColumns: [
        {
          title: "账号",
          key: "account"
        },
        {
          title: "密码",
          key: "password"
        },
        {
          title: "用户名",
          key: "userName",
          width: 100
        },
        {
          title: "性别",
          key: "sex",
          width: 80
        },
        {
          title: "联系电话",
          key: "telephone"
        },
        {
          title: "所属部门",
          key: "department"
        },
        {
          title: "添加时间",
          key: "insertTime"
        },
        {
          title: "修改时间",
          key: "updateTime"
        }
      ]
    };
  },
  methods: {
    // 删除记录
    handleDelete() {
      if (this.isSelectRow == true) {
        this.$Modal.confirm({
          title: "删除提示",
          content: "<p>是否确认删除该条记录？</p>",
          onOk: () => {
            let _this = this;
            let _data = this.updateFormData;
            axios
              .request({
                url: "/user/deleteUserInfo",
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
      } else {
        this.$Message.error("请先选择记录");
      }
    },
    // 修改按钮
    updateButton() {
      if (this.isSelectRow == true) {
        this.isUpdateData = true;
      } else {
        this.$Message.error("请先选择记录");
      }
    },
    // 对选中行的操作
    currentChange(currentRow, oldCurrentRow) {
      // 把选中行的数据赋值给修改表单
      this.updateFormData = currentRow;
      // 修改选中状态
      this.isSelectRow = true;
    },
    // 确认提交新增数据
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        // 通过表单验证
        if (valid) {
          let _this = this;
          switch (name) {
            case "insertForm":
              //处理数据，添加新增时间
              this.insertFormData.insertTime = this.getFormatDate();
              // 开始向后台发送数据
              axios
                .request({
                  url: "/user/insertUserInfo",
                  method: "post",
                  headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                  },
                  data: _this.insertFormData
                })
                .then(function(response) {
                  if (response.data == 1) {
                    _this.$Message.success("添加成功");
                    _this.getRequestData(_this.pageCurrent);
                  } else if (response.data == -1) {
                    _this.$Message.error("已有该账号存在");
                  } else {
                    _this.$Message.error("添加失败");
                  }
                })
                .then(function() {
                  _this.$refs[name].resetFields();
                });
              this.isAddNewData = false;
              break;
            case "updateForm":
              //处理数据，添加修改时间
              this.updateFormData.updateTime = this.getFormatDate();
              // 开始向后台发送数据
              axios
                .request({
                  url: "/user/updateUserInfo",
                  method: "post",
                  headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                  },
                  data: _this.updateFormData
                })
                .then(function(response) {
                  if (response.data == 1) {
                    _this.$Message.success("修改成功");
                    _this.getRequestData(_this.pageCurrent);
                  } else if (response.data == -1) {
                    _this.$Message.error("不存在该账号");
                  } else {
                    _this.$Message.error("修改失败");
                  }
                })
                .then(function() {
                  _this.$refs[name].resetFields();
                });
              this.isUpdateData = false;
              break;
            default:
              break;
          }
        }
      });
    },
    // 弹窗取消按钮
    handleReset(name) {
      switch (name) {
        case "insertForm":
          this.$refs[name].resetFields();
          this.isAddNewData = false;
          break;
        case "updateForm":
          // 关闭弹窗
          this.isUpdateData = false;
          break;
        default:
          break;
      }
    },
    // 查询数据
    search_Btn(value) {
      this.searchData = value;
      this.pageCurrent = 1;
      this.getRequestData(this.pageCurrent);
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
      // 获得当前页数，以及发送数据请求
      this.pageCurrent = index;
      this.getRequestData(index);
    },
    // 从后台查询数据
    getRequestData(index) {
      let _this = this;
      this.pageStart = (index - 1) * this.pageSize;
      axios
        .request({
          url: "/user/getUserList",
          method: "get",
          params: {
            search: this.searchData,
            dataStart: this.pageStart,
            dataEnd: this.pageSize
          }
        })
        .then(function(response) {
          _this.pageData = response.data.userList;
          _this.dataCount = response.data.dataCount;
          _this.isSelectRow = false;
        });
    },
    // 获取当前系统时间
    getFormatDate() {
      var date = new Date();
      var month = date.getMonth() + 1;
      var strDate = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      var currentDate =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        strDate +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds();
      return currentDate;
    }
  },
  mounted() {
    this.getRequestData(this.pageCurrent);
  }
};
</script>
<style lang="scss" scoped>
</style>