<template>
  <div>
    <Button type="primary" @click="showadd()" ghost>新增合同</Button>
    <Button type="primary" @click="shownext()" ghost>合同详情</Button>
    <Button type="primary" @click="showRadd()" ghost>续租</Button>
    <Modal v-model="modal2" title="合同详情">
      <Table border :columns="renewalColumns" :data="rewData" ref="table">
        <template slot-scope="{ row, index }" slot="startDate">
          <span>{{ rewData[index].startDate }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="endDate">
          <span>{{ rewData[index].endDate }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="leasePeriod">
          <span>{{ rewData[index].leasePeriod }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="remark">
          <span>{{ rewData[index].remark }}</span>
        </template>
      </Table>
    </Modal>
    <Modal v-model="modal1" title="新增合同">
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
        <FormItem label="宿舍楼号" prop="dormitoryNum">
          <Select v-model="editDtae.dormitoryNum" style="width:200px">
            <Option
              v-for="item in dormitorydata"
              :value="item.dormitoryName"
              :key="item.id"
              @click.native="chioce(item.money,item.id)"
            >{{ item.dormitoryName }}</Option>
          </Select>
          <Button type="primary" @click="showdorms()" :disabled="buttonflag" ghost>选择寝室</Button>
        </FormItem>
        <FormItem label="租期" prop="leasePeriod">
          <Input type="text" v-model="editDtae.leasePeriod" />
        </FormItem>

        <FormItem label="开始日期" prop="startDate">
          <DatePicker
            type="datetime"
            format="yyyy-MM-dd"
            v-model="editDtae.startDate"
            @on-change="dateChange"
            style="width: 200px"
          ></DatePicker>
        </FormItem>

        <FormItem label="结束日期" prop="endDate">
          <DatePicker
            type="datetime"
            format="yyyy-MM-dd"
            v-model="editDtae.endDate"
            @on-change="endChange"
            style="width: 200px"
          ></DatePicker>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="conceldata()">取消</Button>
        <Button type="primary" size="large" @click="pushdata('formCustom')">确定</Button>
      </div>
    </Modal>

    <Modal v-model="modal3" title="续租合同">
      <Form ref="formCustom" :model="xuzuData" :rules="ruleCustom" :label-width="80">
        <FormItem label="租期" prop="leasePeriod">
          <Input type="text" v-model="xuzuData.leasePeriod" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal3=false">取消</Button>
        <Button type="primary" size="large" @click="saveXuzu()">确定</Button>
      </div>
    </Modal>

    <Modal v-model="modal4" title="选择房号">
      <Table
        border
        height="300"
        :columns="dormColumns"
        :data="dormsData"
        ref="table"
        @on-select-all="selectDrom"
        @on-select="selectDrom"
        @on-select-cancel="cancelSelect"
        @on-select-all-cancel="cancelAll"
      >
        <template slot-scope="{ row, index }" slot="dromNum">
          <span>{{ dormsData[index].dromNum }}</span>
        </template>
      </Table>
      <Page :total="dormAll" :page-size="5" @on-change="dormpage" />
      <div slot="footer">
        <Button type="text" size="large" @click="modal4=false">取消</Button>
        <Button type="primary" size="large" @click="savedorms()">确定</Button>
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
    <Table
      border
      :columns="accountColumns"
      :data="accountData"
      ref="table"
      style="height:600px"
      highlight-row
      @on-current-change="rowSelect"
    >
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

      <template slot-scope="{ row, index }" slot="startDate">
        <!-- <DatePicker
          type="datetime"
          format="yyyy-MM-dd"
          v-model="accountData[index].startDate"
          v-if="editIndex === index"
        ></DatePicker>-->
        <span>{{ accountData[index].startDate }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="endDate">
        <!-- <Input type="text" v-model="accountData[index].endDate" v-if="editIndex === index" /> -->
        <span>{{ accountData[index].endDate }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="leasePeriod">
        <!-- <Input type="text" v-model="accountData[index].leasePeriod" v-if="editIndex === index" /> -->
        <span>{{ accountData[index].leasePeriod }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="remark">
        <!-- <Input type="text" v-model="accountData[index].remark" v-if="editIndex === index" /> -->
        <span>{{ accountData[index].remark }}</span>
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

    <Page :total="dormCounts" @on-change="handlePage" />
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
    var validatestartDate = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("起始日期不能为空"));
      } else {
        callback();
      }
    };
    var validateendDate = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("结束日期不能为空"));
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
      buttonflag: true,
      dormAll: 0,
      dormCounts: 0,
      pagenum: {
        startnum: 1
      },
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableData: [],
      tableTitle: [],
      tableLoading: false,
      dormColumns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        { title: "房间号", slot: "dromNum", key: "dromNum" }
      ],
      renewalColumns: [
        { title: "起始日期", slot: "startDate", key: "startDate" },
        { title: "结束日期", slot: "endDate", key: "endDate" },
        { title: "租期", slot: "leasePeriod", key: "leasePeriod" },
        { title: "租金", slot: "remark", key: "remark" }
      ],
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
        { title: "起始日期", slot: "startDate", key: "startDate" },
        { title: "结束日期", slot: "endDate", key: "endDate" },
        { title: "租期", slot: "leasePeriod", key: "leasePeriod" },
        { title: "租金", slot: "remark", key: "remark" },
        {
          title: "操作",
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
        dormitoryNum: [{ validator: validatevenueNumber, trigger: "onchange" }],
        startDate: [{ validator: validatestartDate, trigger: "blur" }],
        endDate: [{ validator: validateendDate, trigger: "blur" }],
        leasePeriod: [{ validator: validateleasePeriod, trigger: "blur" }]
      },
      tagname: {
        companyName: "公司名称",
        contact: "联系人",
        contactNumber: "联系电话",
        dormitoryNum: "租赁寝室",
        leasePeriod: "租期",
        remark: "租金"
      },
      renewalData: {
        nid: "",
        startDate: "",
        endDate: "",
        leasePeriod: "",
        remark: "",
        count: ""
      },
      xuzuData: {
        dormitoryMid: "",
        startDate: "",
        endDate: "",
        leasePeriod: "",
        remark: ""
      },
      dorms: {
        dormid: "",
        pagedom: 1
      },
      dormsData: [],
      rewData: [],
      editDtae: {
        companyName: "",
        contact: "",
        contactNumber: "",
        dormitoryNum: "",
        startDate: "",
        endDate: "",
        leasePeriod: "",
        remark: "",
        selectdatas: [],
        unityPrice: ""
      },
      flag: false,
      modal1: false,
      modal2: false,
      modal3: false,
      modal4: false,
      rt: "",
      monthmoney: "",
      dormitorydata: [],
      selectionData: [],
      selectionDatas: [],
      dmst: {
        sid: "",
        htname: "",
        dornum: ""
      },
      dmst1: []
    };
  },
  components: {},

  computed: {},

  mounted() {
    this.getaccountData0();
    this.getdormitoryData();
    this.getdormCount();
  },

  methods: {
    conceldata() {
      this.dorms.dormid = "";
      this.dorms.pagedom = 1;
      this.selectionDatas = [];
      this.modal1 = false;
      this.buttonflag = true;
    },
    savedorms() {
      this.selectionDatas = this.selectionDatas.concat(this.selectionData);
      this.modal4 = false;
      this.editDtae.selectdatas = this.selectionDatas;

      this.selectionData = [];
    },
    cancelAll(selection) {
      let _this = this;
      for (let i = 0; i < _this.dormsData.length; i++) {
        for (let j = 0; j < _this.selectionDatas.length; j++) {
          if (_this.dormsData[i].id == _this.selectionDatas[j].id) {
            _this.selectionDatas.splice(j, 1);
            //console.log(_this.selectionDatas);
          }
        }
      }
    },
    cancelSelect(selection, row) {
      let _this = this;
      this.selectionData = selection;
      for (let i = 0; i < _this.dormsData.length; i++) {
        for (let j = 0; j < _this.selectionDatas.length; j++) {
          if (_this.dormsData[i].id == _this.selectionDatas[j].id) {
            _this.selectionDatas.splice(j, 1);
            //console.log(_this.selectionDatas);
          }
        }
      }
      //console.log(row);
    },
    selectDrom(selection) {
      this.selectionData = selection;
      //console.log(this.selectionData);
    },
    getdormsCount(domid) {
      let _this = this;
      axios
        .request({
          url: "/Dorms/getDormsCount",
          method: "post",
          params: domid
        })
        .then(function(response) {
          _this.dormAll = response.data;
        });
    },
    dormpage(val) {
      let _this = this;
      this.dorms.pagedom = val;
      this.selectionDatas = this.selectionDatas.concat(this.selectionData);
      //console.log(this.selectionDatas);
      this.selectionData = [];
      this.getdormsData(this.dorms);
    },
    showdorms() {
      this.getdormsData(this.dorms);

      this.getdormsCount(this.dorms);
      this.modal4 = true;
    },
    getdormsData(domid) {
      let _this = this;
      axios
        .request({
          url: "/Dorms/getDormsData",
          method: "post",
          params: domid
        })
        .then(function(response) {
          _this.dormsData = response.data;
          for (let i = 0; i < _this.dormsData.length; i++) {
            for (let j = 0; j < _this.selectionDatas.length; j++) {
              if (_this.dormsData[i].id == _this.selectionDatas[j].id) {
                _this.$set(_this.dormsData[i], "_checked", true);
                //console.log(_this.dormsData[i]);
              }
            }
          }
        });
    },
    handlePage(val) {
      let _this = this;
      this.pagenum.startnum = val;
      //console.log(this.pagenum.startnum);
      this.getaccountData(_this.pagenum);
    },
    getdormCount() {
      let _this = this;
      axios
        .request({
          url: "/Account/getAccountCount",
          method: "post"
        })
        .then(function(response) {
          _this.dormCounts = response.data;
          //console.log(_this.dormCounts);
        });
    },
    exportData() {
      this.$refs.table.exportCsv({
        filename: "宿舍",
        columns: this.accountColumns.filter((col, index) => index < 6)
      });
    },

    saveXuzu() {
      this.xuzuData.remark = (
        parseInt(this.xuzuData.leasePeriod) * parseInt(this.xuzuData.unityPrice)
      ).toString();
      this.xuzuData.startDate = this.rewData[0].endDate;
      this.insertRenewal(this.xuzuData);
      this.modal3 = false;
    },
    insertRenewal(xuzudata) {
      console.log(xuzudata.leasePeriod);
      let _this = this;
      axios
        .request({
          url: "/Renewal/insertRenewals",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: xuzudata
        })
        .then(function(response) {
          _this.xuzuData.leasePeriod = "";
          this.getRenwealCount(this.renewalData);
        });
    },
    rowSelect(currentRow, oldCurrentRow) {
      let _this = this;

      this.getRenwealCount(this.renewalData);

      //console.log(currentRow);
      this.renewalData.nid = currentRow.id;
      this.xuzuData.dormitoryMid = parseInt(currentRow.id);
      this.xuzuData.unityPrice = (
        parseInt(currentRow.remark) / parseInt(currentRow.leasePeriod)
      ).toString();

      //console.log(this.xuzuData);
    },
    dateChange(date) {
      this.editDtae.startDate = date;
      this.endChange(this.addMonth(date, parseInt(this.editDtae.leasePeriod)));
    },
    endChange(date) {
      this.editDtae.endDate = date.toString();
      //console.log(this.editDtae.endDate);
    },
    addMonth(stratTime, n) {
      var s = stratTime.split("-");
      var yy = parseInt(s[0]);
      var mm = parseInt(s[1] - 1);
      var dd = parseInt(s[2]);

      var dt = new Date(yy, mm, dd);
      dt.setMonth(dt.getMonth() + n);

      if (dt.getFullYear() * 12 + dt.getMonth() > yy * 12 + mm + n) {
        dt = new Date(dt.getFullYear(), dt.getMonth(), 0);
      }
      var year = dt.getFullYear();

      var month = dt.getMonth() + 1;
      var days = dt.getDate();
      var dd1 = year + "-" + month + "-" + days;
      return dd1;
    },

    pushdata(name) {
      let _this = this;
      let item;

      for (item in _this.editDtae) {
        if (_this.editDtae[item] == "") {
          if (item.toString() == "remark") {
            _this.editDtae["remark"] =
              parseInt(_this.editDtae["leasePeriod"]) *
              parseInt(_this.monthmoney) *
              parseInt(_this.selectionDatas.length);
            //console.log(_this.editDtae["remark"]);
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
      }
    },
    updateDorms(drdata) {
      axios.request({
        url: "/Dorms/updateDromData",
        method: "post",
        params: drdata
      });
    },
    showadd() {
      let _this = this;
      for (let item in _this.editDtae) {
        _this.editDtae[item] = "";
      }
      this.modal1 = true;
    },
    showRadd() {
      let _this = this;

      if (_this.renewalData.count < 1) {
        _this.getdormitoryIdData(_this.renewalData);
      } else {
        _this.getRenwealData(_this.renewalData);
      }

      this.modal3 = true;
    },
    getRenwealData(redata) {
      let _this = this;
      axios
        .request({
          url: "/Renewal/getRenewalList",
          method: "get",
          params: redata
        })
        .then(function(response) {
          _this.rewData = response.data;
        });
    },
    getRenwealCount(renewalData) {
      let _this = this;
      axios
        .request({
          url: "/Renewal/getCount",
          method: "get",
          params: renewalData
        })
        .then(function(response) {
          _this.renewalData.count = response.data;
        });
    },
    shownext() {
      let _this = this;

      //console.log(this.renewalData.count);
      if (this.renewalData.count < 1) {
        this.getdormitoryIdData(_this.renewalData);
      } else {
        this.getRenwealData(_this.renewalData);
      }

      this.modal2 = true;
    },
    getdormitoryIdData(lid) {
      let _this = this;
      axios
        .request({
          url: "/Account/getIdList",
          method: "get",
          params: lid
        })
        .then(function(response) {
          _this.rewData = response.data;
        });
    },

    show(index) {
      this.editIndex = index;
    },
    chioce(money, itemid) {
      this.monthmoney = money;
      //console.log(this.monthmoney);
      this.dorms.dormid = itemid;
      this.buttonflag = false;
      //console.log(this.dorms.dormid);
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
      this.editIndex = -1;
    },
    concel() {
      let _this = this;

      _this.getaccountData(_this.pagenum);

      this.editIndex = -1;
    },
    deleteaccount(row) {
      this.deleterow(row);
    },
    deleterow(row) {
      let _this = this;
      axios
        .request({
          url: "/Account/deleteAccount",
          method: "get",
          params: row
        })
        .then(function(response) {
          _this.getaccountData(_this.pagenum);
        });
    },
    update(row) {
      //console.log(row);
      // console.log(this.accountData[index]);
      // console.log(JSON.stringify(row));
      let _this = this;
      axios
        .request({
          url: "/Account/updateAccount",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: row
        })
        .then(function(response) {
          _this.getaccountData(_this.pagenum);
        });
    },

    insert(adddata) {
      let _this = this;
      console.log(adddata);
      axios
        .request({
          url: "/Account/insertAccount",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: adddata
        })
        .then(function(response) {
          _this.getaccountData(_this.pagenum);
          _this.dorms.dormid = "";
          _this.dorms.pagedom = 1;
          _this.selectionDatas = [];
          _this.buttonflag = true;
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

    getaccountData0() {
      let _this = this;
      axios
        .request({
          url: "/Account/getAccountList0",
          method: "get"
        })
        .then(function(response) {
          _this.accountData = response.data;
        });
    },

    getaccountData(startnum) {
      let _this = this;
      axios
        .request({
          url: "/Account/getAccountList",
          method: "get",
          params: startnum
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
        this.getaccountData(_this.pagenum);
      };
    }
  }
};
</script>
