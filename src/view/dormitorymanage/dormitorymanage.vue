<template>
  <div>
    <Button type="primary" @click="showadd()" ghost>新增</Button>
    <Modal v-model="modal1" title="新增">
      <Form ref="formCustom" :model="editDtae" :rules="ruleCustom" :label-width="80">
        <FormItem label="公司名称" prop="companyName">
          <Input type="text" v-model="editDtae.companyName" />
        </FormItem>
        <FormItem label="联系人" prop="contact">
          <Input type="text" v-model="editDtae.contact" />
        </FormItem>
        <FormItem label="联系电话" prop="contactNumber">
          <Input type="text" v-model="editDtae.contactNumber" number />
        </FormItem>
        <FormItem label="宿舍号" prop="dormitoryNum">
          <Select v-model="editDtae.dormitoryNum" style="width:200px">
            <Option
              v-for="item in dormitorydata"
              :value="item.dormitoryName"
              :key="item.id"
              @click.native="chioce(item.money)"
            >{{ item.dormitoryName }}</Option>
          </Select>
        </FormItem>
        <FormItem label="租期" prop="leasePeriod">
          <Input type="text" v-model="editDtae.leasePeriod" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal1=false">取消</Button>
        <Button type="primary" size="large" @click="pushdata('formCustom')">确定</Button>
      </div>
    </Modal>

    <Button type="primary" @click="exportData()" ghost>导出</Button>
    <Input search enter-button @on-search="getListByname()" v-model="cname.name" />

    <Upload action :before-upload="handleBeforeUpload" accept=".xls, .xlsx">
      <Button
        icon="ios-cloud-upload-outline"
        :loading="uploadLoading"
        @click="handleUploadFile"
      >上传文件</Button>
    </Upload>
    <Table border :columns="accountColumns" :data="accountData" ref="table">
      <template slot-scope="{ row, index }" slot="companyName">
        <Input type="text" v-model="accountData[index].companyName" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].companyName }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="contact">
        <Input type="text" v-model="accountData[index].contact" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contact }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="contactNumber">
        <Input type="text" v-model="accountData[index].contactNumber" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contactNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="dormitoryNum">
        <Input type="text" v-model="accountData[index].dormitoryNum" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].dormitoryNum }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="contractSigning">
        <Input type="text" v-model="accountData[index].contractSigning" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contractSigning }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="leasePeriod">
        <Input type="text" v-model="accountData[index].leasePeriod" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].leasePeriod }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="remark">
        <Input type="text" v-model="accountData[index].remark" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].remark }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button @click="save(row)">保存</Button>
          <Button @click="concel()">取消</Button>
        </div>
        <div v-else>
          <Button @click="show(index)">更新</Button>
          <Button @click="deleteaccount(row)">删除</Button>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
import axios from "@/libs/api.request";
import excel from "@/libs/excel";
export default {
  data() {
    var validatecompanyName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("公司名称不能为空"));
      } else {
        callback();
      }
    };
    var validatecontact = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("联系人不能为空"));
      } else {
        callback();
      }
    };
    var validatecontactNumber = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("联系电话不能为空"));
      } else {
        callback();
      }
    };
    var validatevenueNumber = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("宿舍号不能为空"));
      } else {
        callback();
      }
    };
    var validateleasePeriod = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("租期不能为空"));
      } else {
        callback();
      }
    };
    return {
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableData: [],
      tableTitle: [],
      tableLoading: false,

      accountColumns: [
        { title: "公司名称", slot: "companyName", key: "companyName" },
        { title: "联系人", slot: "contact", key: "contact" },
        { title: "联系电话", slot: "contactNumber", key: "contactNumber" },
        { title: "租赁寝室", slot: "dormitoryNum", key: "dormitoryNum" },
        {
          title: "租赁合同签署日期",
          slot: "contractSigning",
          key: "contractSigning"
        },
        { title: "租期", slot: "leasePeriod", key: "leasePeriod" },
        { title: "租金", slot: "remark", key: "remark" },
        {
          title: "Action",
          slot: "action",
          width: 150,
          align: "center"
        }
      ],
      accountData: [],
      editIndex: -1,
      cname: { name: "" },
      ruleCustom: {
        companyName: [{ validator: validatecompanyName, trigger: "blur" }],
        contact: [{ validator: validatecontact, trigger: "blur" }],
        contactNumber: [{ validator: validatecontactNumber, trigger: "blur" }],
        dormitoryNum: [{ validator: validatevenueNumber, trigger: "blur" }],
        leasePeriod: [{ validator: validateleasePeriod, trigger: "blur" }]
      },
      tagname:{
        companyName: "公司名称",
        contact: "联系人",
        contactNumber: "联系电话",
        dormitoryNum: "租赁寝室",
        leasePeriod: "租期",
        remark: "租金"
      },
      editDtae: {
        companyName: "",
        contact: "",
        contactNumber: "",
        dormitoryNum: "",
        leasePeriod: "",
        remark: ""
      },
      flag: false,
      modal1: false,
      rt: "",
      monthmoney: "",
      dormitorydata: []
    };
  },
  components: {},

  computed: {},

  mounted() {
    this.getaccountData();
    this.getdormitoryData();
  },

  methods: {
    exportData() {
      this.$refs.table.exportCsv({
        filename: "宿舍",
        columns: this.accountColumns.filter((col, index) => index < 6)
      });
    },
    pushdata(name) {
      let _this = this;
      let item;
      for (item in _this.editDtae) {
        if (_this.editDtae[item] == "") {
          if (item.toString() == "remark") {
            _this.editDtae["remark"] =
              _this.editDtae["leasePeriod"] * _this.monthmoney;
            console.log(_this.editDtae["remark"]);
            break;
          }
          _this.flag = true;
          break;
        }
      }
      if (_this.flag) {
        this.$refs[name].validate();
        _this.flag = false;
        return false;
      } else {
        _this.modal1 = false;
        //console.log(_this.editDtae);
        _this.insert(_this.editDtae);
        setTimeout(() => {
          _this.getaccountData();
        }, 100);
      }
    },
    showadd() {
      let _this = this;
      for (let item in _this.editDtae) {
        _this.editDtae[item] = "";
      }
      this.modal1 = true;
    },

    show(index) {
      this.editIndex = index;
    },
    chioce(money) {
      this.monthmoney = money;
      console.log(this.monthmoney);
    },
    save(row) {
      let _this = this;
      for (let item in row) {
        if (row[item] == "") {
          this.$Message.error(_this.tagname[item] + "不能为空");
          return false;
          break;
        }
      }

      this.update(row);

      setTimeout(() => {
        _this.getaccountData();
      }, 100);
      this.editIndex = -1;
    },
    concel() {
      let _this = this;
      setTimeout(() => {
        _this.getaccountData();
      }, 100);
      this.editIndex = -1;
    },
    deleteaccount(row) {
      let _this = this;
      this.deleterow(row),
        setTimeout(() => {
          _this.getaccountData();
        }, 100);
    },
    deleterow(row) {
      axios.request({
        url: "/Account/deleteAccount",
        method: "post",
        params: row
      });
    },
    update(row) {
      //console.log(row);
      // console.log(this.accountData[index]);
      // console.log(JSON.stringify(row));
      axios.request({
        url: "/Account/updateAccount",
        method: "post",
        params: row
      });
    },

    insert(adddata) {
      //let _this = this;
      //console.log(_this.editDtae);
      axios.request({
        url: "/Account/insertAccount",
        method: "post",
        params: adddata
      });
    },

    uploader(tdata) {
      axios.request({
        url: "/Account/uploadAccount",
        method: "post",
        params: tdata
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
          _this.dormitorydata = response.data;
        });
    },

    getaccountData() {
      let _this = this;
      axios
        .request({
          url: "/Account/getAccountList",
          method: "get"
        })
        .then(function(response) {
          _this.accountData = response.data;
        });
    },
    getListByname() {
      let _this = this;
      axios
        .request({
          url: "/Account/getNameList",
          method: "get",
          params: _this.cname
        })
        .then(function(response) {
          _this.accountData = response.data;
        });
    },

    initUpload() {
      this.file = null;
      this.showProgress = false;
      this.loadingProgress = 0;
      this.tableData = [];
      this.tableTitle = [];
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
        let _this = this;
        this.$Message.info("文件读取成功");
        const data = e.target.result;
        const { header, results } = excel.read(data, "array");
        const tableTitle = header.map(item => {
          return { title: item, key: item };
        });
        this.tableData = results;
        this.tableTitle = tableTitle;
        this.uploadLoading = false;
        this.tableLoading = false;
        this.showRemoveFile = true;
        for (let i = 0; i < this.tableData.length; i++) {
          _this.uploader(this.tableData[i]);
        }
        this.getaccountData();
      };
    }
  }
};
</script>
