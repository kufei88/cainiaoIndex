<template>
  <div>
    <Button type="primary" @click="showadd()" ghost>新增合同</Button>
    <Button type="primary" @click="shownext()" ghost>合同详情</Button>
    <Button type="primary" @click="showRadd()" ghost>续租</Button>
    <Button type="primary" :loading="exportLoading" @click="exportExcel" ghost>导出</Button>
    <Button type="primary" :loading="exportLoading1" @click="exportExcel1" ghost>模板下载</Button>
    <Upload action :before-upload="handleBeforeUpload" accept=".xls, .xlsx">
      <Button
        icon="ios-cloud-upload-outline"
        :loading="uploadLoading"
        @click="handleUploadFile"
      >上传文件</Button>
    </Upload>

    <Modal v-model="modal2" title="合同详情">
      <div style="text-align:center">
        <h2>公司:{{ selectRowData.owner }}</h2>
      </div>
      <div>
        <h3>租赁宿舍:{{selectRowData.buildingName}}</h3>
        <span style="margin-right:20px">联系人:{{ ownerdata.enterprisePerson}}</span>

        <span>联系电话:{{ ownerdata.contactNumber}}</span>
      </div>
      <Table border :columns="renewalColumns" :data="rewData" ref="table" height="300">
        <template slot-scope="{ row, index }" slot="startDate">
          <span>{{ rewData[index].continueStartTime }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="endDate">
          <span>{{ rewData[index].continueEndTime }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="leasePeriod">
          <span>{{ rewData[index].continuePeriod }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="remark">
          <span>{{ rewData[index].totalCost }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="insertTime">
          <span>{{ rewData[index].insertTime }}</span>
        </template>
      </Table>
      <Button type="primary" @click="showfangjian()" ghost>查看租赁房号</Button>
    </Modal>

    <Modal v-model="modal5" title="租赁房号">
      <Table border :columns="fangjianColumns" :data="fangjianData" ref="table" height="300">
        <template slot-scope="{ row, index }" slot="roomNumber">
          <span>{{ fangjianData[index].roomNumber }}</span>
        </template>
      </Table>
      <span>共{{roomAll}}条</span>
      <Page :total="roomAll" :page-size="5" @on-change="roompage" />
      <div slot="footer">
        <Button type="text" size="large" @click="modal5=false">取消</Button>
        <Button type="primary" size="large" @click="modal5=false">确定</Button>
      </div>
    </Modal>

    <Modal v-model="modal1" title="新增合同">
      <Form ref="formCustom" :model="editDtae" :rules="ruleCustom" :label-width="80">
        <FormItem label="公司名称" prop="companyName">
          <Input type="text" v-model="editDtae.companyName" />
        </FormItem>
        <!-- <FormItem label="联系人" prop="contact">
          <Input type="text" v-model="editDtae.contact" />
        </FormItem>
        <FormItem label="联系电话" prop="contactNumber">
          <Input type="text" v-model="editDtae.contactNumber" number />
        </FormItem>-->
        <FormItem label="宿舍楼号" prop="dormitoryNum">
          <Select v-model="editDtae.dormitoryNum" style="width:200px">
            <Option
              v-for="item in dormitorydata"
              :value="item.buildingName"
              :key="item.id"
              @click.native="chioce(item.buildingName)"
            >{{ item.buildingName }}</Option>
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
      <Form ref="formCustoms" :model="xuzuData" :rules="ruleCustoms" :label-width="80">
        <FormItem label="租期" prop="leasePeriods">
          <Input type="text" v-model="xuzuData.continuePeriod" />
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
        <template slot-scope="{ row, index }" slot="roomNumber">
          <span>{{ dormsData[index].roomNumber }}</span>
        </template>
      </Table>
      <span>{{dormAll}}</span>
      <Page :total="dormAll" :page-size="5" @on-change="dormpage" />
      <div slot="footer">
        <Button type="text" size="large" @click="modal4=false">取消</Button>
        <Button type="primary" size="large" @click="savedorms()">确定</Button>
      </div>
    </Modal>
    <Modal v-model="modal6" title="提示">
      <p>是否确定删除</p>
      <div slot="footer">
        <Button type="text" size="large" @click="modal6=false">取消</Button>
        <Button type="primary" size="large" @click="deleterow()">确定</Button>
      </div>
    </Modal>

    <Input
      search
      enter-button
      placeholder="请输入公司名"
      @on-search="getNameCount()"
      v-model="cname.name"
      style="width: 300px"
    />

    <Table
      border
      :columns="accountColumns"
      :data="accountData"
      ref="table"
      height="520"
      highlight-row
      @on-current-change="rowSelect"
    >
      <template slot-scope="{ row, index }" slot="companyName">
        <!-- <Input type="text" v-model="accountData[index].owner" v-if="editIndex === index" /> -->
        <span>{{ accountData[index].owner }}</span>
      </template>

      <!-- <template slot-scope="{ row, index }" slot="contact">
        <Input type="text" v-model="accountData[index].contact" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contact }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="contactNumber">
        <Input type="text" v-model="accountData[index].contactNumber" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contactNumber }}</span>
      </template>-->

      <template slot-scope="{ row, index }" slot="dormitoryNum">
        <!-- <Input type="text" v-model="accountData[index].buildingName" v-if="editIndex === index" /> -->
        <span>{{ accountData[index].buildingName }}</span>
      </template>

      <!-- <template slot-scope="{ row, index }" slot="contractSigning">
        <span>{{ accountData[index].contractSigning }}</span>
      </template>-->

      <template slot-scope="{ row, index }" slot="startDate">
        <span>{{ accountData[index].startRentTime }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="endDate">
        <span>{{ accountData[index].endRentTime }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="totalLeasePeriod">
        <span>{{ accountData[index].totalPeriod }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="insertTime">
        <span>{{ accountData[index].insertTime }}</span>
      </template>

      <!-- <template slot-scope="{ row, index }" slot="remark">

        <span>{{ accountData[index].remark }}</span>
      </template>-->

      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button @click="save(row)">保存</Button>
          <Button @click="concel()">取消</Button>
        </div>
        <div v-else>
          <!-- <Button @click="show(index)">更新</Button> -->
          <Button @click="deleteaccount(row)">删除</Button>
        </div>
      </template>
    </Table>
    <span>共{{dormCounts}}条</span>
    <Page :total="dormCounts" show-sizer @on-change="handlePage" @on-page-size-change="pagesize" />
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
    var validateleasePeriods = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("租期不能为空"));
      } else {
        callback();
      }
    };
    return {
      ownerdata: {
        enterprisePerson:"",
        contactNumber:""
        },
      roomAll: 0,
      buttonflag: true,
      dormAll: 0,
      dormCounts: 0,
      pagenum: {
        startnum: 1,
        pagecount: 10
      },
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableData: [],
      tableTitle: [],
      tableLoading: false,
      fangjianColumns: [
        {
          title: "房间号",
          slot: "roomNumber",
          key: "roomNumber"
        }
      ],
      dormColumns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        { title: "房间号", slot: "roomNumber", key: "roomNumber" }
      ],
      renewalColumns: [
        { title: "起始日期", slot: "startDate", key: "startDate" },
        { title: "结束日期", slot: "endDate", key: "endDate" },
        { title: "租期", slot: "leasePeriod", key: "leasePeriod" },
        { title: "租金", slot: "remark", key: "remark" },
        { title: "插入日期", slot: "insertTime", key: "insertTime" }
      ],
      accountColumns: [
        { title: "公司名称", slot: "companyName", key: "companyName" },
        // { title: "联系人", slot: "contact", key: "contact" },
        // { title: "联系电话", slot: "contactNumber", key: "contactNumber" },
        { title: "租赁寝室楼栋", slot: "dormitoryNum", key: "dormitoryNum" },
        // {
        //   title: "租赁合同签署日期",
        //   slot: "contractSigning",
        //   key: "contractSigning"
        // },
        { title: "起始日期", slot: "startDate", key: "startDate" },
        { title: "结束日期", slot: "endDate", key: "endDate" },
        // { title: "租期", slot: "leasePeriod", key: "leasePeriod" },
        // { title: "租金", slot: "remark", key: "remark" },
        { title: "总租期", slot: "totalLeasePeriod", key: "totalLeasePeriod" },
        { title: "插入时间", slot: "insertTime", key: "insertTime" },
        {
          title: "操作",
          slot: "action",
          width: 150,
          align: "center"
        }
      ],
      accountData: [],
      editIndex: -1,
      cname: {
        name: "",
        spg: 1,
        spgsize: 10
      },
      ruleCustom: {
        companyName: [{ validator: validatecompanyName, trigger: "blur" }],
        contact: [{ validator: validatecontact, trigger: "blur" }],
        contactNumber: [{ validator: validatecontactNumber, trigger: "blur" }],
        dormitoryNum: [{ validator: validatevenueNumber, trigger: "onchange" }],
        startDate: [{ validator: validatestartDate, trigger: "blur" }],
        endDate: [{ validator: validateendDate, trigger: "blur" }],
        leasePeriod: [{ validator: validateleasePeriod, trigger: "blur" }]
      },
      ruleCustoms: {
        leasePeriods: [{ validator: validateleasePeriods, trigger: "blur" }]
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
        contractId: "",
        continueStartTime: "",
        continueEndTime: "",
        continuePeriod: "",
        totalCost: "",
        insertTime: "",
        unityPrice: ""
      },
      dorms: {
        buildingName: "",
        pagedom: 1
      },
      dormsData: [],
      fangjianData: [],
      rewData: [],
      editDtae: {
        companyName: "",
        // contact: "",
        // contactNumber: "",
        dormitoryNum: "",
        startDate: "",
        endDate: "",
        leasePeriod: "",
        remark: "",
        insertTime: "",
        selectdatas: []
      },
      flag: false,
      modal1: false,
      modal2: false,
      modal3: false,
      modal4: false,
      modal5: false,
      modal6: false,
      rt: "",
      monthmoney: "",
      dormitorydata: [],
      selectionData: [],
      selectionDatas: [],
      dmst: {
        owner: "",
        buildingName: "",
        startpage: 1
      },
      isSelectrow: false,
      selectRowData: "",
      deleterowdata: "",
      firstdata: {
        continueStartTime: "",
        continueEndTime: "",
        continuePeriod: "",
        totalCost: "",
        insertTime: ""
      },
      modelData: [{
        companyName: "请输入公司名称",
        buildingName: "输入寝室楼栋名字",
        startDate: "输入起租日期 如2019/9/9",
        leasePeriod: "请输入数字",
        remark: "请输入数字 如1000",
        roomNumber: "请输入数字 如101,102,103...."
      }],
      exportLoading: false,
      exportLoading1:false
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
    roompage(val) {
      this.dmst.startpage = val;
      this.selectDromData();
    },
    exportExcel1() {
      if (this.modelData.length) {
        this.exportLoading1 = true;
        const params = {
          title: [
            "公司名称",
            "租赁寝室楼",
            "起租时间",
            "租期",
            "总租金",
            "租赁房间号"
          ],
          key: [
            "companyName",
            "buildingName",
            "startDate",
            "leasePeriod",
            "remark",
            "roomNumber"
          ],
          data: this.modelData,
          autoWidth: true,
          filename: "模板下载"
        };
        excel.export_array_to_excel(params);
        this.exportLoading1 = false;
      } else {
        this.$Message.info("表格数据不能为空！");
      }
    },
    //导出excel
    exportExcel() {
      if (this.accountData.length) {
        this.exportLoading = true;
        const params = {
          title: [
            "公司名称",
            "起租日期",
            "结束日期",
            "租赁寝室楼栋",
            "租赁合同签署日期",
            "总租期"
          ],
          key: [
            "owner",
            "startRentTime",
            "endRentTime",
            "buildingName",
            "insertTime",
            "totalPeriod"
          ],
          data: this.accountData,
          autoWidth: true,
          filename: "合同导出"
        };
        excel.export_array_to_excel(params);
        this.exportLoading = false;
      } else {
        this.$Message.info("表格数据不能为空！");
      }
    },
    //展示房间页面
    showfangjian() {
      this.dmst.buildingName = this.selectRowData.buildingName;
      this.dmst.owner = this.selectRowData.owner;
      this.selectDromDataCount();
      this.selectDromData();

      this.modal5 = true;
    },
    //新增合同点击取消
    conceldata() {
      this.dorms.buildingName = "";
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
          }
        }
      }
    },
    cancelSelect(selection, row) {
      let _this = this;
      this.selectionData = selection;
      for (let i = 0; i < _this.dormsData.length; i++) {
        for (let j = 0; j < _this.selectionDatas.length; j++) {
          if (
            _this.dormsData[i].roomNumber == _this.selectionDatas[j].roomNumber
          ) {
            _this.selectionDatas.splice(j, 1);
          }
        }
      }
    },
    selectDrom(selection) {
      this.selectionData = selection;
    },
    getdormsCount(domid) {
      let _this = this;
      axios
        .request({
          url: "/Account/getRoomListCount",
          method: "get",
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

      this.selectionData = [];
      this.getdormsData(this.dorms);
    },
    showdorms() {
      this.getdormsData(this.dorms);

      this.getdormsCount(this.dorms);
      this.modal4 = true;
    },
    selectDromDataCount() {
      let _this = this;
      axios
        .request({
          url: "/Account/getRoomListCount2",
          method: "get",
          params: _this.dmst
        })
        .then(function(response) {
          _this.roomAll = response.data;
        });
    },
    selectDromData() {
      let _this = this;
      axios
        .request({
          url: "/Account/getRoomList2",
          method: "get",
          params: _this.dmst
        })
        .then(function(response) {
          _this.fangjianData = response.data;
        });
    },
    getdormsData(domid) {
      let _this = this;
      axios
        .request({
          url: "/Account/getRoomList",
          method: "get",
          params: domid
        })
        .then(function(response) {
          _this.dormsData = response.data;
          for (let i = 0; i < _this.dormsData.length; i++) {
            for (let j = 0; j < _this.selectionDatas.length; j++) {
              if (
                _this.dormsData[i].roomNumber ==
                _this.selectionDatas[j].roomNumber
              ) {
                _this.$set(_this.dormsData[i], "_checked", true);
              }
            }
          }
        });
    },
    pagesize(val) {
      let _this = this;
      this.pagenum.pagecount = val;
      this.cname.spgsize = val;
      if (_this.cname.name != "") {
        console.log(_this.cname);

        _this.getNameCount();
      } else {
        this.getdormCount();
      }
    },
    handlePage(val) {
      let _this = this;
      this.pagenum.startnum = val;
      this.cname.spg = val;
      if (_this.cname.name != "") {
        _this.getNameCount();
      } else {
        this.getdormCount();
      }
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
          _this.getaccountData(_this.pagenum);
        });
    },

    saveXuzu() {
      let _this = this;
      if (this.xuzuData.continuePeriod == "") {
        _this.$refs["formCustoms"].validate();
        return false;
      }
      this.xuzuData.totalCost =
        parseInt(this.xuzuData.continuePeriod) *
        parseInt(this.xuzuData.unityPrice);
      this.xuzuData.continueStartTime = this.rewData[0].continueEndTime;
      this.xuzuData.insertTime = this.getFormatDate();
      this.insertRenewal(this.xuzuData);
      this.modal3 = false;
    },
    insertRenewal(xuzudata) {
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
          if (response.data > 0) {
            _this.$Message.success("续租成功");
            _this.getaccountData(_this.pagenum);
          } else {
            _this.$Message.warning("续租失败");
          }
          _this.xuzuData.continuePeriod = "";
          _this.getRenwealCount(_this.renewalData);
        });
    },
    rowSelect(currentRow, oldCurrentRow) {
      this.isSelectrow = true;
      let _this = this;

      this.getRenwealCount(this.renewalData);

      this.selectRowData = currentRow;
      this.renewalData.nid = currentRow.id;

      this.xuzuData.contractId = parseInt(currentRow.id);

      this.xuzuData.unityPrice =
        parseInt(currentRow.totalCost) / parseInt(currentRow.rentPeriod);
    },
    dateChange(date) {
      this.editDtae.startDate = date;
      this.endChange(this.addMonth(date, parseInt(this.editDtae.leasePeriod)));
    },
    endChange(date) {
      this.editDtae.endDate = date.toString();
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
      _this.editDtae.remark = 0;

      for (item in _this.editDtae) {
        if (_this.editDtae[item] == "") {
          if (item.toString() == "remark") {
            for (let i = 0; i < _this.editDtae.selectdatas.length; i++) {
              _this.editDtae["remark"] +=
                _this.editDtae.selectdatas[i].monthRent *
                _this.editDtae.leasePeriod;
            }

            break;
          }
          _this.flag = true;
          break;
        }
      }
      if (_this.selectionDatas.length <= 0) {
        this.$Message.warning("请选择寝室房号");
        _this.flag = true;
      }

      if (_this.flag == true) {
        _this.$refs["formCustom"].validate();
        _this.flag = false;
        return false;
      } else {
        _this.editDtae.insertTime = _this.getFormatDate();
        _this.insert(_this.editDtae);
        _this.modal1 = false;
      }
    },
    showadd() {
      this.$refs["formCustom"].resetFields();
      let _this = this;

      for (let item in _this.editDtae) {
        _this.editDtae[item] = "";
      }
      this.modal1 = true;
    },
    showRadd() {
      this.xuzuData.continuePeriod = "";
      let _this = this;
      if (this.isSelectrow == false) {
        this.$Message.warning("请选择合同");
        return false;
      }
      if (_this.renewalData.count < 1) {
        _this.getdormitoryIdData(_this.renewalData);
      } else {
        _this.getdormitoryIdData2(_this.renewalData);
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
          _this.rewData = _this.rewData.concat(_this.firstdata);
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
      if (this.isSelectrow == false) {
        this.$Message.warning("请选择合同");
        return false;
      }

      if (_this.renewalData.count < 1) {
        this.getdormitoryIdData(_this.renewalData);
      } else {
        this.getdormitoryIdData2(_this.renewalData);
        this.getRenwealData(_this.renewalData);
      }
      axios
        .request({
          url: "/Account/getOwnerList",
          method: "get",
          params: {
            owner: _this.selectRowData.owner
          }
        })
        .then(function(response) {
          _this.ownerdata = response.data[0];

          _this.modal2 = true;
        });
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
          _this.firstdata.continueStartTime = response.data[0].startRentTime;
          _this.firstdata.continueEndTime = response.data[0].endRentTime;
          _this.firstdata.continuePeriod = response.data[0].rentPeriod;
          _this.firstdata.totalCost = response.data[0].totalCost;
          _this.firstdata.insertTime = response.data[0].insertTime;
          _this.rewData = _this.rewData.concat(_this.firstdata);
        });
    },

    getdormitoryIdData2(lid) {
      let _this = this;
      axios
        .request({
          url: "/Account/getIdList",
          method: "get",
          params: lid
        })
        .then(function(response) {
          _this.firstdata.continueStartTime = response.data[0].startRentTime;
          _this.firstdata.continueEndTime = response.data[0].endRentTime;
          _this.firstdata.continuePeriod = response.data[0].rentPeriod;
          _this.firstdata.totalCost = response.data[0].totalCost;
          _this.firstdata.insertTime = response.data[0].insertTime;
        });
    },

    show(index) {
      this.editIndex = index;
    },
    chioce(buildingName) {
      this.dorms.buildingName = buildingName;
      this.buttonflag = false;
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

      _this.getdormCount();

      this.editIndex = -1;
    },
    deleteaccount(row) {
      this.modal6 = true;
      this.deleterowdata = row;
    },
    deleterow() {
      let _this = this;
      axios
        .request({
          url: "/Account/deleteAccount",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: _this.deleterowdata
        })
        .then(function(response) {
          if (_this.dormCounts != 1) {
            if (_this.dormCounts % 10 == 1) {
              _this.pagenum.startnum -= 1;
            }
          }
          _this.getdormCount();
          if (response.data > 0) {
            _this.$Message.success("合同删除成功");
          }

          _this.modal6 = false;
        });
    },
    update(row) {
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
          if (response.data > 0) {
            _this.$Message.success("合同更新成功");
          }
          _this.getdormCount();
        });
    },

    insert(adddata) {
      let _this = this;

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
          if (response.data > 0) {
            _this.$Message.success("合同新增成功");
          } else {
            _this.$Message.warning("合同新增失败");
          }
          _this.getdormCount();
          _this.dorms.buildingName = "";
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
          url: "/Account/getBuildingList",
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
    getNameCount() {
      let _this = this;

      axios
        .request({
          url: "/Account/getNameCount",
          method: "get",
          params: _this.cname
        })
        .then(function(response) {
          _this.dormCounts = response.data;
          _this.getListByname();
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
      let _this = this;
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
        _this.uploadExcelData(this.tableData);
      };
    },
    uploadExcelData(excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      var exdata = [];
      for (var key in excelData) {
        excelData[key].companyName = excelData[key].公司名称;
        excelData[key].buildingName = excelData[key].租赁寝室楼;
        excelData[key].startDate = excelData[key].起租时间;
        excelData[key].leasePeriod = excelData[key].租期;
        excelData[key].remark = excelData[key].总租金;
        excelData[key].roomNumber = excelData[key].租赁房间号;
        excelData[key].insertTime = this.getFormatDate();
        delete excelData[key].公司名称;
        delete excelData[key].租赁寝室楼;
        delete excelData[key].起租时间;
        delete excelData[key].租期;
        delete excelData[key].总租金;
        delete excelData[key].租赁房间号;

        exdata = exdata.concat(excelData[key]);
      }
      let isDataEmpty = 0;

      for (var key in excelData) {
        excelData[key].companyName == undefined ||
        excelData[key].companyName == null ||
        excelData[key].companyName == "" ||
        excelData[key].buildingName == undefined ||
        excelData[key].buildingName == null ||
        excelData[key].buildingName == "" ||
        excelData[key].startDate == undefined ||
        excelData[key].startDate == null ||
        excelData[key].startDate == "" ||
        excelData[key].leasePeriod == undefined ||
        excelData[key].leasePeriod == null ||
        excelData[key].leasePeriod == "" ||
        excelData[key].remark == undefined ||
        excelData[key].remark == null ||
        excelData[key].remark == "" ||
        excelData[key].roomNumber == undefined ||
        excelData[key].roomNumber == null ||
        excelData[key].roomNumber == ""
          ? (isDataEmpty += 1)
          : (isDataEmpty += 0);
      }
      if (isDataEmpty == 0) {
        this.uploadf(exdata);
      } else {
        this.$Message.error("该表内有" + isDataEmpty + "行数据有空项");

        exdata = [];
        isDataEmpty = 0;
      }
    },
    uploadf(uploaddata) {
      let _this = this;
      axios
        .request({
          url: "/Account/uploadAccount",
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          data: uploaddata
        })
        .then(function(response) {
          if (response.data == 1) {
            _this.$Message.success("上传成功");
            _this.getdormCount();
          } else if (response.data == -1) {
            _this.$Message.error("表中存在已被出租的房间");
          } else if (response.data == -4) {
            _this.$Message.error("表中宿舍楼栋不存在");
          } else {
            _this.$Message.error("发生未知错误");
          }
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
  }
};
</script>
