<template>
  <div>
    <!-- 搜索 -->
    <Input
      search
      enter-button
      placeholder="请输入公司名"
      @on-search="getNameCount0()"
      v-model="cname.name"
      style="width: 300px;float:left"
    />
    <!-- 导出按钮 -->
    <Button
      type="primary"
      :loading="exportLoading"
      @click="exportExcel"
      ghost
      style="float:right"
    >导出</Button>
    <!-- 合同变更按钮 -->
    <Button type="primary" @click="showChange()" ghost style="float:right">合同变更</Button>
    <!-- 续租按钮 -->
    <Button type="primary" @click="showRadd()" ghost style="float:right">续租</Button>
    <!-- 合同详情按钮 -->
    <Button type="primary" @click="shownext()" ghost style="float:right">合同详情</Button>
    <!-- 新增合同按钮 -->
    <Button type="primary" @click="showadd()" ghost style="float:right">新增合同</Button>
    <!-- 过期合同按钮 -->
    <Button type="primary" @click="getDeleteCount()" ghost style="float:right">到期合同</Button>
    <!-- 未到期合同 -->
    <Button type="primary" @click="getBeforCount()" ghost style="float:right">未到期合同</Button>
    <div style="clear:both"></div>

    <!-- <Button type="primary" :loading="exportLoading1" @click="exportExcel1" ghost>模板下载</Button> -->
    <!-- <Upload action :before-upload="handleBeforeUpload" accept=".xls, .xlsx">
      <Button
        icon="ios-cloud-upload-outline"
        :loading="uploadLoading"
        @click="handleUploadFile"
      >上传文件</Button>
    </Upload>-->

    <!-- 合同变更弹窗 -->
    <Modal v-model="modal7" title="变更合同">
      <Form ref="changeData" :model="changeData" :rules="changeDatarules" :label-width="80">
        <FormItem label="变更业主名" prop="owner">
          <Input type="text" v-model="changeData.owner" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="modal7=false">取消</Button>
        <Button type="primary" size="large" @click="changeContract()">确定</Button>
      </div>
    </Modal>

    <Modal v-model="modal2" title="合同详情" width="800">
      <div style="text-align:center">
        <h2>公司:{{ selectRowData.owner }}</h2>
      </div>
      <div>
        <h3>
          租赁宿舍:{{selectRowData.buildingName}}
          <span>租赁房间号:{{selectRowData.roomNumber}}</span>
          <span>房间类型:{{rt}}</span>
        </h3>

        <span style="margin-right:20px">联系人:{{ ownerdata.enterprisePerson}}</span>

        <span>联系电话:{{ ownerdata.contactNumber}}</span>
      </div>
      <Table border :columns="renewalColumns" :data="rewData" ref="table" height="300">
        <template slot-scope="{ row, index }" slot="owner">
          <span>{{ rewData[index].owner }}</span>
        </template>

        <template slot-scope="{ row, index }" slot="contractType">
          <span>{{ rewData[index].contractType }}</span>
        </template>

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
    </Modal>

    <Modal v-model="modal1" title="新增合同" :mask-closable="false" @on-cancel="conceldata()">
      <Form ref="formCustom" :model="editDtae" :rules="ruleCustom" :label-width="100">
        <FormItem label="公司名称" prop="companyName">
          <Select
            v-model="editDtae.companyName"
            style="width:300px"
            filterable
            clearable
            @on-query-change="getcompanyData"
          >
            <Option
              v-for="item in companyData"
              :value="item.enterpriseName"
              :key="item.id"
            >{{ item.enterpriseName }}</Option>
          </Select>
        </FormItem>

        <FormItem label="所属宿舍楼" prop="buildingName">
          <Select v-model="editDtae.buildingName" style="width:200px" transfer:true>
            <Option
              v-for="item in dormitorydata"
              :value="item.buildingName"
              :key="item.buildingName"
            >{{ item.buildingName }}</Option>
          </Select>
        </FormItem>

        <FormItem label="房间类型" prop="roomType">
          <Select v-model="editDtae.roomType" style="width:200px">
            <Option
              v-for="item in roomTypeData"
              :value="item.roomType"
              :key="item.id"
              @click.native="chioce(item)"
            >{{ item.roomType }}</Option>
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
            :readonly="true"
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
      <Form ref="xuzuData" :model="xuzuData" :rules="xuzuDatarules" :label-width="80">
        <FormItem label="租期" prop="continuePeriod">
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
      <span>共{{dormAll}}条</span>
      <Page :total="dormAll" :page-size="5" @on-change="dormpage" />
      <div slot="footer">
        <Button type="text" size="large" @click="modal4=false">取消</Button>
        <Button type="primary" size="large" @click="savedorms()">确定</Button>
      </div>
    </Modal>
    <Modal v-model="modal6" title="提示">
      <p>合同是否确定到期</p>
      <div slot="footer">
        <Button type="text" size="large" @click="modal6=false">取消</Button>
        <Button type="primary" size="large" @click="deleterow()">确定</Button>
      </div>
    </Modal>

    <!-- 合同总信息展示表格 -->
    <Table
      border
      :row-class-name="rowClassName"
      :columns="accountColumns"
      :data="accountData"
      ref="currentRowTable"
      height="520"
      highlight-row
      @on-row-click="rowSelect"
    >
      <template slot-scope="{ row, index }" slot="companyName">
        <span>{{ accountData[index].owner }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="roomNumber">
        <span>{{ accountData[index].roomNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="startDate">
        <span>{{ accountData[index].startRentTime }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="endDate">
        <span>{{ accountData[index].endRentTime }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="totalLeasePeriod">
        <span>{{ accountData[index].totalPeriod }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="totalCost">
        <span>{{ accountData[index].totalCost }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="insertTime">
        <span>{{ accountData[index].insertTime }}</span>
      </template>

      <template slot-scope="{ row }" slot="action">
        <div v-if="row.delete===false">
          <Button @click="deleteaccount(row)">到期</Button>
        </div>
      </template>
    </Table>
    <span>记录总共 {{dormCounts}} 条</span>
    <Page
      :total="dormCounts"
      show-sizer
      @on-change="handlePage"
      @on-page-size-change="pagesize"
      :page-size-opts="[10,20,50,100]"
      :current="pagenum.startnum"
      align="center"
    />
  </div>
</template>

<style>
.ivu-table .demo-table-error-row td {
  background-color: #ff6600;
  color: #000000;
}
</style>
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
    var validateowner = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("业主不能为空"));
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
    var tel = /^[0-9]*$/;
    var validateleasePeriod = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("租期不能为空"));
      } else if (!tel.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    };
    var validatecontinuePeriod = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("续租租期不能为空"));
      } else {
        callback();
      }
    };
    return {
      showIndex: -1, // 被选中的行数据序号

      ownerdata: {
        enterprisePerson: "",
        contactNumber: ""
      },
      roomAll: 0,
      buttonflag: true,
      dormAll: 0,
      dormCounts: 0,
      pagenum: {
        isDelete: false,
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
        {
          type: "index",
          width: 60,
          align: "center",
          render: (h, params) => {
            return h("span", params.index + 1);
          }
        },
        { title: "业主", slot: "owner", key: "owner" },
        { title: "合同类型", slot: "contractType", key: "contractType" },
        { title: "起始日期", slot: "startDate", key: "startDate" },
        { title: "结束日期", slot: "endDate", key: "endDate" },
        { title: "租期", slot: "leasePeriod", key: "leasePeriod" },
        { title: "租金", slot: "remark", key: "remark" },
        { title: "创建日期", slot: "insertTime", key: "insertTime" }
      ],
      accountColumns: [
        {
          type: "index",
          width: 60,
          align: "center",

          indexMethod(row) {
            return row._index + 1 + (row.pageCurrent - 1) * row.pageSize;
          }
        },
        { title: "公司名称", slot: "companyName", key: "companyName" },

        { title: "寝室房间号", slot: "roomNumber", key: "roomNumber" },

        { title: "起始日期", slot: "startDate", key: "startDate" },
        { title: "结束日期", slot: "endDate", key: "endDate" },

        { title: "总租期", slot: "totalLeasePeriod", key: "totalLeasePeriod" },
        { title: "总租金", slot: "totalCost", key: "totalCost" },
        { title: "创建时间", slot: "insertTime", key: "insertTime" },
        {
          title: "操作",
          slot: "action",
          width: 150,
          align: "center"
        }
      ],
      accountData: [],
      companyData: [],
      editIndex: -1,
      cname: {
        name: "",
        spg: 1,
        spgsize: 10,
        isDelete: false
      },
      ruleCustom: {
        companyName: [{ validator: validatecompanyName, trigger: "blur" }],
        contact: [{ validator: validatecontact, trigger: "blur" }],
        contactNumber: [{ validator: validatecontactNumber, trigger: "blur" }],
        roomType: [{ validator: validatevenueNumber, trigger: "onchange" }],
        startDate: [{ validator: validatestartDate, trigger: "blur" }],
        leasePeriod: [{ validator: validateleasePeriod, trigger: "blur" }]
      },
      changeDatarules: {
        owner: [{ validator: validateowner, trigger: "blur" }]
      },
      xuzuDatarules: {
        continuePeriod: [{ validator: validatecontinuePeriod, trigger: "blur" }]
      },
      tagname: {
        companyName: "公司名称",
        contact: "联系人",
        contactNumber: "联系电话",
        roomType: "房间类型",
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
        owner: "",
        contractId: "",
        contractType: "",
        continueStartTime: "",
        continueEndTime: "",
        continuePeriod: "",
        totalCost: "",
        insertTime: "",
        unityPrice: ""
      },
      changeData: {
        owner: "",
        contractId: "",
        contractType: "",
        continueStartTime: "",
        continueEndTime: "",
        continuePeriod: "",
        totalCost: "",
        insertTime: ""
      },
      rooms: {
        buildingName: "",
        roomtype: "",
        pagedom: 1
      },
      dormsData: [],
      fangjianData: [],
      rewData: [],
      editDtae: {
        companyName: "",
        buildingName: "",
        roomType: "",
        startDate: "",
        endDate: "",
        leasePeriod: "",
        remark: "",
        insertTime: "",
        selectdatas: []
      },
      flag: false,
      roomTypeData: [],
      modal1: false,
      modal2: false,
      modal3: false,
      modal4: false,
      // modal5: false,
      modal6: false,
      modal7: false,
      rt: "",
      monthmoney: "",
      dormitorydata: [],
      selectionData: [],
      selectionDatas: [],
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
      modelData: [
        {
          companyName: "请输入公司名称",
          buildingName: "输入寝室楼栋名字",
          startDate: "输入起租日期 如2019/9/9",
          leasePeriod: "请输入数字",
          remark: "请输入数字 如1000",
          roomNumber: "请输入数字 如101,102,103...."
        }
      ],
      exportLoading: false,
      exportLoading1: false,
      year: "",
      month: "",
      day: ""
    };
  },
  components: {},

  computed: {},

  mounted() {
    this.getdormCount();

    this.getRoomType();
  },

  methods: {
    // 获取未到期合同信息
    getBeforCount() {
      this.ResetSelect();
      this.pagenum.startnum = 1;
      this.pagenum.isDelete = false;
      this.cname.isDelete = false;
      this.getdormCount();
    },
    // 获取到期期合同信息
    getDeleteCount() {
      this.ResetSelect();
      let _this = this;
      axios
        .request({
          url: "Account/getDeleteCount",
          method: "post"
        })
        .then(function(response) {
          _this.dormCounts = response.data;
          _this.pagenum.isDelete = true;
          _this.cname.isDelete = true;
          _this.pagenum.startnum = 1;
          _this.getaccountData(_this.pagenum);
        });
    },
    // 获取公司数据
    getcompanyData(query) {
      let _this = this;
      if (query != "" && query != undefined && query != null) {
        axios
          .request({
            url: "Account/getAllCompany",
            method: "get",

            params: {
              companyName: query
            }
          })
          .then(function(response) {
            _this.companyData = response.data;
          });
      }
    },
    // 为即将到期的合同添加颜色作为提醒
    rowClassName(row, index) {
      this.getFormatDate();
      var datearr = row.endRentTime.toString().split("-");
      var eyear = parseInt(datearr[0]) * 360;
      var emonth = parseInt(datearr[1]) * 30;
      var eday = parseInt(datearr[2]);

      var d = (
        eyear -
        this.year +
        emonth -
        this.month +
        eday -
        this.day
      ).toString();

      if (d <= 30) {
        if (this.showIndex == index) {
          return "";
        } else {
          return "demo-table-error-row";
        }
      }
      return "";
    },
    // 获取房间类型信息（包括房间租金）
    getRoomType() {
      let _this = this;
      axios
        .request({
          url: "RoomType/getRoomTypes",
          method: "get"
        })
        .then(function(response) {
          _this.roomTypeData = response.data;
        });
    },

    // 模板导出
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
    // 导出excel
    exportExcel() {
      if (this.accountData.length) {
        this.exportLoading = true;
        const params = {
          title: [
            "公司名称",
            "起租日期",
            "结束日期",
            "租赁寝室楼栋",
            "房间号",
            "租赁合同签署日期",
            "总租期",
            "总租金"
          ],
          key: [
            "owner",
            "startRentTime",
            "endRentTime",
            "buildingName",
            "roomNumber",
            "insertTime",
            "totalPeriod",
            "totalCost"
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

    // 新增合同点击取消
    conceldata() {
      this.rooms.roomtype = "";
      this.rooms.pagedom = 1;
      this.selectionDatas = [];
      this.modal1 = false;
      this.buttonflag = true;
    },
    // 保存选择好的房间号
    savedorms() {
      this.selectionDatas = this.selectionDatas.concat(this.selectionData);
      this.modal4 = false;
      this.editDtae.selectdatas = this.selectionDatas;

      this.selectionData = [];
    },
    // 选择的房号全部取消
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
    // 取消选择的房号
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
    // 选择房号后将房号保存至selectionData
    selectDrom(selection) {
      this.selectionData = selection;
      console.log(selection);
    },
    // 获取总共有多少房间
    getdormsCount(domid) {
      let _this = this;
      axios
        .request({
          url: "Account/getRoomListCount",
          method: "get",
          params: domid
        })
        .then(function(response) {
          _this.dormAll = response.data;
        });
    },
    // 设置弹出的能够租赁的房间页面跳转时的起始页数
    dormpage(val) {
      let _this = this;
      this.rooms.pagedom = val;
      this.selectionDatas = this.selectionDatas.concat(this.selectionData);

      this.selectionData = [];
      this.getdormsData(this.rooms);
    },
    // 弹出展示当前所选房型的全部空闲房间的对话框
    showdorms() {
      this.getdormsData(this.rooms);

      this.getdormsCount(this.rooms);
      this.modal4 = true;
    },
    // 获取所选房型全部房间信息
    getdormsData(domid) {
      let _this = this;
      axios
        .request({
          url: "Account/getRoomList",
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
    // 分页每页显示条数
    pagesize(val) {
      this.ResetSelect();
      let _this = this;
      this.pagenum.pagecount = val;
      this.cname.spgsize = val;
      if (_this.cname.name != "") {
        _this.getNameCount();
      } else if (_this.pagenum.isDelete == true) {
        _this.getaccountData(_this.pagenum);
      } else {
        _this.getdormCount();
      }
    },
    // 合同页面的选择下一页或其他页
    handlePage(val) {
      this.ResetSelect();
      let _this = this;
      this.pagenum.startnum = val;
      this.cname.spg = val;
      if (_this.cname.name != "") {
        _this.getNameCount();
      } else if (_this.pagenum.isDelete == true) {
        _this.getaccountData(_this.pagenum);
      } else {
        _this.getdormCount();
      }
    },
    // 获取全部宿舍合同的信息
    getdormCount() {
      let _this = this;
      axios
        .request({
          url: "Account/getAccountCount",
          method: "post"
        })
        .then(function(response) {
          _this.dormCounts = response.data;
          _this.getaccountData(_this.pagenum);
        });
    },
    // 确定续租
    saveXuzu() {
      let _this = this;

      _this.$refs["xuzuData"].validate(valid => {
        if (valid) {
          this.xuzuData.contractType = "续租";
          this.xuzuData.totalCost =
            parseInt(this.xuzuData.continuePeriod) * this.xuzuData.unityPrice;
          this.xuzuData.continueStartTime = this.rewData[0].continueEndTime;
          this.xuzuData.insertTime = this.getFormatDate();
          this.insertRenewal(this.xuzuData);
          this.modal3 = false;
        }
      });
    },
    // 合同续租
    insertRenewal(xuzudata) {
      let _this = this;
      axios
        .request({
          url: "Renewal/insertRenewals",
          method: "post",
          headers: {
            "Content-Type": "application/json" // 设置请求头请求格式为JSON
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
        });
    },
    // 单选合同
    rowSelect(currentRow, index) {
      this.showIndex = index;
      this.isSelectrow = true;
      let _this = this;
      this.selectRowData = currentRow;
      for (var key in currentRow) {
        if (currentRow[key] == null && key.toString() != "updateTime") {
          return false;
        }
      }
      axios
        .request({
          url: "Account/getRoomType",
          method: "post",
          headers: {
            "Content-Type": "application/json" // 设置请求头请求格式为JSON
          },
          data: currentRow
        })
        .then(function(response) {
          _this.rt = response.data;
          _this.getRoomMonthRent(response.data);
        });
      this.renewalData.nid = currentRow.contractId;
      this.changeData.contractId = currentRow.contractId;
      this.changeData.totalCost = currentRow.totalCost;
      this.changeData.continueStartTime = currentRow.startRentTime;
      this.changeData.continueEndTime = currentRow.endRentTime;
      this.changeData.continuePeriod = currentRow.totalPeriod;
      this.xuzuData.owner = currentRow.owner;
      this.xuzuData.contractId = currentRow.contractId;
    },
    // 获取每月租金
    getRoomMonthRent(roomTp) {
      let _this = this;
      axios
        .request({
          url: "RoomType/getMonthRent",
          method: "post",
          headers: {
            "Content-Type": "application/json" // 设置请求头请求格式为JSON
          },
          data: {
            roomType: roomTp
          }
        })
        .then(function(response) {
          _this.xuzuData.unityPrice = response.data;
        });
    },
    // 计算结束时间
    dateChange(date) {
      this.editDtae.startDate = date;
      this.endChange(this.addMonth(date, parseInt(this.editDtae.leasePeriod)));
    },
    // 结束时间格式转换
    endChange(date) {
      this.editDtae.endDate = date.toString();
    },
    // 月份增加
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
    // 提交新增合同数据
    pushdata(name) {
      let _this = this;
      _this.editDtae.remark = 0;
      _this.$refs["formCustom"].validate(valid => {
        if (valid) {
          _this.editDtae.remark = _this.monthmoney * _this.editDtae.leasePeriod;
          _this.editDtae.insertTime = _this.getFormatDate();

          if (_this.selectionDatas.length <= 0) {
            this.$Message.warning("请选择寝室房号");
            return false;
          }
          axios
            .request({
              url: "Account/getCompanyName",
              method: "get",
              params: {
                companyName: _this.editDtae.companyName
              }
            })
            .then(function(response) {
              if (response.data == 1) {
                _this.insert(_this.editDtae);
                _this.modal1 = false;
              } else if (response.data == 0) {
                _this.$Message.error("该公司不存在");
              }
            });
        }
      });
    },
    // 合同续租
    showadd() {
      this.$refs["formCustom"].resetFields();
      this.getdormitoryData();
      let _this = this;

      for (let item in _this.editDtae) {
        _this.editDtae[item] = "";
      }
      this.modal1 = true;
    },
    // 合同变更窗口弹出
    showChange() {
      if (this.pagenum.isDelete == true) {
        this.$Message.warning("到期合同无法变更业主");
        return false;
      }
      if (this.isSelectrow == false) {
        this.$Message.warning("请选择合同");
        return false;
      }
      this.$refs["changeData"].resetFields();
      this.changeData.owner = "";
      this.modal7 = true;
    },
    // 验证变更合同时公司是否存在
    changeContract() {
      let _this = this;
      this.$refs["changeData"].validate(valid => {
        if (valid) {
          axios
            .request({
              url: "Account/getCompanyName",
              method: "get",
              params: {
                companyName: _this.changeData.owner
              }
            })
            .then(function(response) {
              if (response.data == 1) {
                _this.insertRenewal2();
                _this.modal7 = false;
              } else if (response.data == 0) {
                _this.$Message.error("该公司不存在");
              }
            });
        }
      });
    },
    // 合同变更
    insertRenewal2() {
      let _this = this;
      _this.changeData.insertTime = _this.getFormatDate();
      _this.changeData.contractType = "变更";
      axios
        .request({
          url: "Renewal/insertRenewals2",
          method: "post",
          headers: {
            "Content-Type": "application/json" // 设置请求头请求格式为JSON
          },
          data: _this.changeData
        })
        .then(function(response) {
          if (response.data == 1) {
            _this.$Message.success("合同变更成功");
            axios.request({
              url: "Renewal/updateRoom",
              method: "post",
              headers: {
                "Content-Type": "application/json" // 设置请求头请求格式为JSON
              },
              data: {
                owner: _this.changeData.owner,
                buildingName: _this.selectRowData.buildingName,
                roomNumber: _this.selectRowData.roomNumber
              }
            });
          } else {
            _this.$Message.error("合同变更失败");
          }
          _this.getdormCount();
          _this.modal7 = false;
        });
    },
    // 续租窗口弹出
    showRadd() {
      this.$refs["xuzuData"].resetFields();
      this.xuzuData.continuePeriod = "";
      let _this = this;
      if (this.pagenum.isDelete == true) {
        this.$Message.warning("到期合同无法续租");
        return false;
      }
      if (this.isSelectrow == false) {
        this.$Message.warning("请选择合同");
        return false;
      }

      _this.getRenwealData(_this.renewalData);

      this.modal3 = true;
    },
    // 获取合同详细信息
    getRenwealData(redata) {
      let _this = this;
      axios
        .request({
          url: "Renewal/getRenewalList",
          method: "get",
          params: redata
        })
        .then(function(response) {
          _this.rewData = response.data;
        });
    },
    // 获取详细信息总条数
    getRenwealCount(renewalData) {
      let _this = this;
      axios
        .request({
          url: "Renewal/getCount",
          method: "get",
          params: renewalData
        })
        .then(function(response) {
          _this.renewalData.count = response.data;
        });
    },
    // 合同详情对话框弹出
    shownext() {
      let _this = this;
      if (this.isSelectrow == false) {
        this.$Message.warning("请选择合同");
        return false;
      }

      this.getRenwealData(_this.renewalData);
      this.getOwnerList();
    },
    // 获取所选合同的业主信息
    getOwnerList() {
      let _this = this;
      axios
        .request({
          url: "Account/getOwnerList",
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
    // 房型选择
    chioce(room) {
      this.rooms.roomtype = room.roomType;
      this.rooms.buildingName = this.editDtae.buildingName;
      this.buttonflag = false;
      this.monthmoney = room.monthRent;
    },
    // 保存修改
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
    // 取消
    concel() {
      let _this = this;

      _this.getdormCount();

      this.editIndex = -1;
    },
    // 合同点选到期按钮
    deleteaccount(row) {
      this.modal6 = true;
      this.deleterowdata = row;
    },
    // 合同设置为到期状态
    deleterow() {
      let _this = this;
      axios
        .request({
          url: "Account/deleteAccount",
          method: "post",
          headers: {
            "Content-Type": "application/json" // 设置请求头请求格式为JSON
          },
          data: _this.deleterowdata
        })
        .then(function(response) {
          if (_this.dormCounts != 1 && _this.pagenum.startnum != 1) {
            if (
              _this.dormCounts % _this.pagenum.pagecount == 1 &&
              _this.deleterowdata._index == 0
            ) {
              _this.pagenum.startnum -= 1;
            }
          }
          _this.getdormCount();
          if (response.data > 0) {
            _this.$Message.success("合同已设置到期");
          }

          _this.modal6 = false;
          _this.ResetSelect();
        });
    },
    // 合同更新
    update(row) {
      let _this = this;
      axios
        .request({
          url: "Account/updateAccount",
          method: "post",
          headers: {
            "Content-Type": "application/json" // 设置请求头请求格式为JSON
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

    // 合同插入
    insert(adddata) {
      let _this = this;
      axios
        .request({
          url: "Account/insertAccount",
          method: "post",
          headers: {
            "Content-Type": "application/json" // 设置请求头请求格式为JSON
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
          _this.rooms.roomtype = "";
          _this.rooms.pagedom = 1;
          _this.selectionDatas = [];
          _this.buttonflag = true;
        });
    },

    // uploader(tdata) {
    //   axios.request({
    //     url: "Account/uploadAccount",
    //     method: "post",
    //     params: tdata
    //   });
    // },

    // 获取
    getdormitoryData() {
      let _this = this;
      axios
        .request({
          url: "Account/getBuildingList",
          method: "get"
        })
        .then(function(response) {
          _this.dormitorydata = response.data;
          _this.editDtae.buildingName = response.data[0].buildingName;
        });
    },

    // 获取合同总信息
    getaccountData(startnum) {
      let _this = this;
      axios
        .request({
          url: "Account/getAccountList",
          method: "get",
          params: startnum
        })
        .then(function(response) {
          _this.accountData = response.data;
          _this.addPageCurrentAndPageSize(_this.accountData);
        });
    },
    // 按公司名搜索
    getListByname() {
      let _this = this;
      axios
        .request({
          url: "Account/getNameList",
          method: "get",
          params: _this.cname
        })
        .then(function(response) {
          _this.accountData = response.data;
          _this.addPageCurrentAndPageSize(_this.accountData);
        });
    },
    // 返回第一页
    getNameCount0() {
      this.pagenum.startnum = 1;
      this.cname.spg = 1;
      this.getNameCount();
    },
    // 获取搜索结果的总条数
    getNameCount() {
      this.ResetSelect();
      let _this = this;
      axios
        .request({
          url: "Account/getNameCount",
          method: "get",
          params: _this.cname
        })
        .then(function(response) {
          _this.dormCounts = response.data;
          _this.getListByname();
        });
    },
    // 上传
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
          url: "Account/uploadAccount",
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
      this.year = date.getFullYear() * 360;
      var month = date.getMonth() + 1;
      this.month = month * 30;
      var strDate = date.getDate();
      this.day = date.getDate();
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
    },
    addPageCurrentAndPageSize(updatePageData) {
      for (var key in updatePageData) {
        updatePageData[key].pageCurrent = this.pagenum.startnum;
        updatePageData[key].pageSize = this.pagenum.pagecount;
      }
    },
    // 清除选择
    ResetSelect() {
      this.$refs.currentRowTable.clearCurrentRow();
      this.showIndex = -1;
      this.isSelectrow = false;
    }
  }
};
</script>
