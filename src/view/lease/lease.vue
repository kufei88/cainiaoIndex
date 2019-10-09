<template>
  <div>

    <!-- 自定义查询模块 -->

    <Input
      search
      enter-button="查询"
      placeholder="请输入查询关键字,如公司名称、楼栋名称、房间号"
      style="width:350px;margin-bottom:10px;float:left;"
      @on-search="searchButton"
      v-model="searchData"
    />

    <!-- 退租按钮 -->

    <Button
      type="error"
      @click="handleDelete"
      style="float:right;margin-left:10px"
    >退租</Button>

    <!-- 合同变更按钮 -->

    <Button
      type="warning"
      @click="handleChange"
      style="float:right;margin-left:10px"
    >合同变更</Button>

    <!-- 合同详情按钮 -->

    <Button
      type="primary"
      @click="handleDetailed"
      style="float:right;margin-left:10px"
    >合同详情</Button>

    <!-- 缴费按钮 -->

    <Button
      type="primary"
      @click="handlePay"
      style="float:right;margin-left:10px"
    >合同缴费</Button>

    <!-- 新增按钮 -->

    <Button
      type="primary"
      @click="isAddNewData = true"
      style="float:right;margin-left:10px"
    >新增合同</Button>

    <!-- 清除浮动 -->

    <div style="clear:both"></div>

    <!-- 合同详情弹窗 -->

    <Modal
      :closable="false"
      v-model="isDetailed"
      :mask-closable="false"
      :scrollable="true"
      width="70"
      title="合同详情信息"
    >

      <p style="margin-top:10px;margin-bottom:10px;display:flex">

        <span style="font-size:14px;flex:1"><strong>所属楼栋:</strong> {{selectContract.buildingName}}</span>

        <span style="font-size:14px;margin-left:35px;flex:1"><strong>房间号:</strong> {{selectContract.roomNumber}}</span>

        <span style="font-size:14px;margin-left:35px;flex:2"><strong>公司名称:</strong> {{selectContract.owner}}</span>

      </p>

      <p style="margin-top:10px;margin-bottom:10px;display:flex">

        <span style="font-size:14px;flex:1"><strong>租金单价:</strong> {{selectContract.depositOnContracts}} 元/月/㎡</span>

        <span style="font-size:14px;margin-left:35px;flex:1"><strong>合同保证金:</strong> {{selectContract.depositOnContracts}} 元</span>

        <span style="font-size:14px;margin-left:35px;flex:1"><strong>签订时间:</strong> {{selectContract.insertTime}}</span>

        <span
          v-if="selectContract.noPayPeriod!=0"
          style="font-size:14px;margin-left:35px;flex:1"
        ><strong>剩余未缴费租期:</strong> {{selectContract.noPayPeriod}} 月</span>

        <span
          v-else
          style="font-size:14px;margin-left:35px;flex:1"
        ><strong>合同费用:</strong> 已缴清</span>

      </p>

      <Table
        border
        highlight-row
        :columns="showColumns"
        :data="showTableData"
        ref="showTable"
        height="400"
      >

      </Table>

      <!-- 确定取消框 -->

      <div slot="footer">

        <Button
          type="primary"
          size="large"
          @click="handleSubmit('showTable')"
        >确定</Button>

      </div>

    </Modal>

    <!-- 合同变更弹窗 -->

    <Modal
      :closable="false"
      v-model="isChangeOwner"
      :mask-closable="false"
      :scrollable="true"
      title="合同所属人变更"
    >

      <!-- 表单填写 -->

      <Form
        ref="changeForm"
        :model="changeFormData"
        :rules="changeFormRule"
        :label-width="100"
        @submit.native.prevent
      >

        <FormItem
          label="合同所属人:"
          prop="owner"
        >

          <Input
            clearable
            v-model="changeFormData.owner"
          />

        </FormItem>

      </Form>

      <!-- 确定取消框 -->

      <div slot="footer">

        <Button
          type="text"
          size="large"
          @click="handleReset('changeForm')"
        >取消</Button>

        <Button
          type="primary"
          size="large"
          @click="handleSubmit('changeForm')"
        >确定</Button>

      </div>

    </Modal>

    <!-- 合同缴费弹窗 -->

    <Modal
      :closable="false"
      v-model="isPayRent"
      :mask-closable="false"
      :scrollable="true"
      title="缴费业务"
    >

      <Form
        ref="payForm"
        :model="payFormData"
        :rules="payFormRule"
        :label-width="130"
      >

        <FormItem
          label="所属楼栋:"
          prop="buildingName"
        >
          <Input
            readonly
            v-model="payFormData.buildingName"
            style="width:200px"
          />
          <!-- <Select
            v-model="payFormData.buildingName"
            style="width:200px"
            transfer:true
          >

            <Option
              v-for="item in payBuildingData"
              :value="item.buildingName"
              :key="item.buildingName"
            >{{ item.buildingName }}</Option>

          </Select> -->

        </FormItem>

        <FormItem
          label="房号:"
          prop="roomNumber"
        >
          <Input
            readonly
            v-model="payFormData.roomNumber"
            style="width:200px"
          />
          <!-- <Select
            v-model="payFormData.roomNumber"
            style="width:200px"
            transfer:true
            @on-change="getPayUnitPrice"
          >

            <Option
              v-for="item in selectRoomNumber(payRoomData,payFormData)"
              :value="item.roomNumber"
              :key="item.roomNumber"
            >{{ item.roomNumber }}</Option>

          </Select> -->

        </FormItem>

        <FormItem
          label="业主:"
          prop="owner"
        >

          <p>{{payFormData.owner=showOwner(payFormData.buildingName,payFormData.roomNumber)}}</p>

        </FormItem>

        <FormItem
          label="租期周期(月):"
          prop="period"
        >

          <Input
            clearable
            v-model="payFormData.period"
            style="width:200px"
            @on-change="selectEndDate(payFormData.startPayTime)"
          />

        </FormItem>

        <FormItem
          label="缴费起始租期:"
          prop="startPayTime"
        >

          <DatePicker
            type="date"
            format="yyyy-MM-dd"
            v-model="payFormData.startPayTime"
            readonly
          ></DatePicker>

        </FormItem>

        <FormItem
          label="缴费终止租期:"
          prop="endPayTime"
        >

          <DatePicker
            type="date"
            format="yyyy-MM-dd"
            readonly
            v-model="payFormData.endPayTime"
          ></DatePicker>

        </FormItem>

        <FormItem
          label="租金单价:"
          prop="unitPrice"
        >

          <p v-if="payFormData.unitPrice==''"> 0 (元/月/平米)</p>

          <p v-else> {{payFormData.unitPrice}} (元/月/平米)</p>

        </FormItem>

        <FormItem
          label="租金费用:"
          prop="rentCost"
        >

          <p>{{payFormData.rentCost=getRentCost(payFormData.period,payFormData.unitPrice,payRoomData,payFormData)}} 元</p>

        </FormItem>

        <FormItem
          label="物业费用:"
          prop="propertyFee"
        >

          <p>{{payFormData.propertyFee=getPropertyFee(payFormData.period,settingData,payRoomData,payFormData)}} 元</p>

        </FormItem>

        <FormItem
          label="能耗公摊:"
          prop="energySharing"
        >

          <p>{{payFormData.energySharing=getPropertyFee(payFormData.period,energySharingPrice,payRoomData,payFormData)}} 元</p>

        </FormItem>

        <FormItem
          label="费用总计:"
          prop="totalCost"
        >

          <p>{{payFormData.totalCost=getTotalCost(payFormData.rentCost,payFormData.propertyFee,payFormData.energySharing,"payForm")}} 元</p>

        </FormItem>

      </Form>

      <!-- 确定取消框 -->

      <div slot="footer">

        <Button
          type="text"
          size="large"
          @click="handleReset('payForm')"
        >取消</Button>

        <Button
          type="primary"
          size="large"
          @click="handleSubmit('payForm')"
        >确定</Button>

      </div>

    </Modal>

    <!-- 新增租赁合同弹窗 -->

    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      :scrollable="true"
      title="租赁合同信息"
    >

      <!-- 表单填写 -->

      <Form
        ref="addForm"
        :model="addFormData"
        :rules="addFormRule"
        :label-width="100"
      >

        <FormItem
          label="所属楼栋:"
          prop="buildingName"
        >

          <Select
            v-model="addFormData.buildingName"
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
          label="房号:"
          prop="roomNumber"
        >

          <Select
            v-model="addFormData.roomNumber"
            style="width:200px"
            transfer:true
          >

            <Option
              v-for="item in selectRoomNumber(roomData,addFormData)"
              :value="item.roomNumber"
              :key="item.roomNumber"
            >{{ item.roomNumber }}</Option>

          </Select>

        </FormItem>

        <FormItem
          label="业主:"
          prop="owner"
        >

          <Input
            clearable
            v-model="addFormData.owner"
          />

        </FormItem>

        <FormItem
          label="合同保证金:"
          prop="depositOnContracts"
        >

          <Input
            clearable
            v-model="addFormData.depositOnContracts"
          />

        </FormItem>

        <FormItem
          label="租金单价(元/月/平米):"
          prop="unitPrice"
        >

          <Input
            clearable
            v-model="addFormData.unitPrice"
          />

        </FormItem>

        <FormItem
          label="租期(月):"
          prop="rentPeriod"
        >

          <Input
            clearable
            v-model="addFormData.rentPeriod"
          />

        </FormItem>

        <FormItem
          label="起租期:"
          prop="startRentTime"
        >

          <DatePicker
            type="date"
            placeholder="请选择日期"
            format="yyyy-MM-dd"
            v-model="addFormData.startRentTime"
            @on-change="selectStartDate"
          ></DatePicker>

        </FormItem>

        <FormItem
          label="终止期:"
          prop="endRentTime"
        >

          <DatePicker
            type="date"
            placeholder="请选择日期"
            format="yyyy-MM-dd"
            readonly
            v-model="addFormData.endRentTime"
          ></DatePicker>

        </FormItem>

        <FormItem
          label="租金费用:"
          prop="rentCost"
        >

          <p>{{addFormData.rentCost=getRentCost(addFormData.rentPeriod,addFormData.unitPrice,roomData,addFormData)}} 元</p>

        </FormItem>

        <FormItem
          label="物业费用:"
          prop="propertyFee"
        >

          <p>{{addFormData.propertyFee=getPropertyFee(addFormData.rentPeriod,settingData,roomData,addFormData)}} 元</p>

        </FormItem>

        <FormItem
          label="能耗公摊:"
          prop="energySharing"
        >

          <p>{{addFormData.energySharing=getPropertyFee(addFormData.rentPeriod,energySharingPrice,roomData,addFormData)}} 元</p>

        </FormItem>

        <FormItem
          label="费用总计:"
          prop="totalCost"
        >

          <p>{{addFormData.totalRent=getTotalCost(addFormData.rentCost,addFormData.propertyFee,addFormData.energySharing,"addForm")}} 元</p>

        </FormItem>

      </Form>

      <!-- 确定取消框 -->

      <div slot="footer">

        <Button
          type="text"
          size="large"
          @click="handleReset('addForm')"
        >取消</Button>

        <Button
          type="primary"
          size="large"
          @click="handleSubmit('addForm')"
        >确定</Button>

      </div>

    </Modal>

    <!-- 租赁表格显示 -->

    <Table
      border
      highlight-row
      :row-class-name="rowClassName"
      :columns="dataColumns"
      :data="pageData"
      ref="currentRowTable"
      height="522"
      @on-row-click="currentChange"
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
      showIndex: -1, // 被选中的行数据序号
      selectContract: {}, // 被选择的合同数据

      // 合同详情表格列名
      showColumns: [
        {
          type: "index",
          width: 60,
          align: "center",
          indexMethod(row) {
            return row._index + 1 + (row.pageCurrent - 1) * row.pageSize;
          }
        },
        {
          title: "合同所属人",
          key: "owner",
          align: "center"
        },
        {
          title: "缴费租期",
          key: "period",
          align: "center"
        },
        {
          title: "缴费金额",
          key: "totalCost",
          align: "center"
        },
        {
          title: "缴费起始租期",
          key: "startPayTime",
          align: "center"
        },
        {
          title: "缴费终止租期",
          key: "endPayTime",
          align: "center"
        },
        {
          title: "缴费时间",
          key: "insertTime",
          align: "center"
        },
        {
          title: "变更时间",
          key: "updateTime",
          align: "center"
        },
        {
          title: "合同变更",
          key: "isChangeOwner",
          align: "center"
        }
      ],

      showTableData: [], // 合同详情表格数据

      isDetailed: false, //是否开启合同详情弹窗

      // 合同变更的表单验证
      changeFormRule: {
        owner: [
          {
            required: true,
            message: "合同所属人不得为空",
            trigger: "blur"
          }
        ]
      },

      // 合同变更的表单数据
      changeFormData: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        depositOnContracts: "",
        rentPeriod: "",
        startRentTime: "",
        endRentTime: "",
        insertTime: ""
      },

      isChangeOwner: false, // 是否开启【合同变更】的弹窗

      settingData: "", // 后台设置数据，主要获取管理单价
      energySharingPrice: "", // 后台设置数据，主要获取能耗公摊单价

      payBuildingData: [], // 合同缴费的所属楼栋
      payRoomData: [], // 合同缴费的房间数据

      // 合同缴费的表单数据
      payFormData: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        unitPrice: "",
        period: "",
        rentCost: "",
        propertyFee: "",
        energySharing: "",
        totalCost: "",
        insertTime: "",
        startPayTime: "",
        endPayTime: ""
      },

      // 合同缴费的表单验证规则
      payFormRule: {
        roomNumber: [
          {
            required: true,
            message: "房号不得为空",
            trigger: "change"
          }
        ],
        buildingName: [
          {
            required: true,
            message: "所属楼栋不得为空",
            trigger: "change"
          }
        ],
        period: [
          {
            required: true,
            message: "请输入正确的租期",
            trigger: "blur",
            transform(value) {
              var posPattern = /^\d+$/;
              if (!posPattern.test(value)) {
                return false;
              } else {
                return String(value);
              }
            }
          }
        ]
      },

      isSelectRow: false, // 是否选中单行

      // 删除合同的表单数据
      deleteFormData: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        depositOnContracts: "",
        rentPeriod: "",
        startRentTime: "",
        endRentTime: "",
        insertTime: ""
      },

      // 新增合同的表单数据
      addFormData: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        depositOnContracts: "",
        rentPeriod: "",
        startRentTime: "",
        endRentTime: "",
        unitPrice: "",
        rentCost: "",
        propertyFee: "",
        energySharing: "",
        totalCost: "",
        insertTime: ""
      },

      // 新增合同的验证规则
      addFormRule: {
        roomNumber: [
          {
            required: true,
            message: "房号不得为空",
            trigger: "change"
          }
        ],
        buildingName: [
          {
            required: true,
            message: "所属楼栋不得为空",
            trigger: "change"
          }
        ],
        owner: [
          {
            required: true,
            message: "业主不得为空",
            trigger: "blur"
          }
        ],
        depositOnContracts: [
          {
            required: true,
            message: "请输入正确的数额",
            trigger: "blur",
            transform(value) {
              var posPattern = /^\d*\.?\d+$/;
              if (!posPattern.test(value)) {
                return false;
              } else {
                return String(value);
              }
            }
          }
        ],
        rentPeriod: [
          {
            required: true,
            message: "请输入正确的租期",
            trigger: "blur",
            transform(value) {
              var posPattern = /^\d+$/;
              if (!posPattern.test(value)) {
                return false;
              } else {
                return String(value);
              }
            }
          }
        ],
        startRentTime: [
          {
            required: true,
            message: "起租期不得为空",
            trigger: "blur"
          }
        ],
        unitPrice: [
          {
            required: true,
            message: "请输入正确的数额",
            trigger: "blur",
            transform(value) {
              var posPattern = /^\d*\.?\d+$/;
              if (!posPattern.test(value)) {
                return false;
              } else {
                return String(value);
              }
            }
          }
        ]
      },

      isPayRent: false, // 是否显示缴费弹窗
      isAddNewData: false, // 是否显示新增弹窗

      searchData: "", //查询框内容

      pageCurrent: 1, // 当前页数
      pageStart: 0, // 记录开始位置
      dataCount: 0, // 后台读取的总记录长度
      pageSize: 10, // 每页显示多少条
      pageData: [], // table绑定的数据

      roomData: [], // 新增合同，获取空闲状态的办公、仓办房间
      buildingData: [], // 新增合同，获取所有的办公、仓办楼栋信息

      // 表格显示的列名数据
      dataColumns: [
        {
          type: "index",
          width: 60,
          align: "center",
          indexMethod(row) {
            return row._index + 1 + (row.pageCurrent - 1) * row.pageSize;
          }
        },
        {
          title: "公司",
          key: "owner",
          align: "center"
        },
        {
          title: "所属楼栋",
          key: "buildingName",
          align: "center"
        },
        {
          title: "房间号",
          key: "roomNumber",
          align: "center",
          width: 100
        },
        {
          title: "租期",
          key: "rentPeriod",
          align: "center",
          width: 80
        },
        {
          title: "起租期",
          key: "startRentTime",
          align: "center"
        },
        {
          title: "终止期",
          key: "endRentTime",
          align: "center"
        },
        {
          title: "租金总计",
          key: "totalRent",
          align: "center"
        },
        {
          title: "首期租金",
          key: "firstRent",
          align: "center"
        },
        {
          title: "签订时间",
          key: "insertTime",
          align: "center"
        }
      ]
    };
  },

  methods: {
    // 使合同到期天数小于30天的记录，渲染特定样式
    rowClassName(row, index) {
      // 获取系统时间
      var currentDate = this.getFormatDate();
      // 获取当前行的记录到期时间
      var rowDate = row.endRentTime.toString();

      // 计算相差月份是否小于等于30天
      var range = 0;
      range = this.getDaterange(currentDate, rowDate);

      if (range <= 30) {
        if (this.showIndex == index) {
          return "";
        } else {
          return "demo-table-error-row";
        }
      }
      return "";
    },

    // 计算时间差距-天数
    getDaterange(stratTime, endTime) {
      var t1 = stratTime.split("-");
      var t2 = endTime.split("-");
      var y1 = parseInt(t1[0]);
      var y2 = parseInt(t2[0]);
      var m1 = parseInt(t1[1]);
      var m2 = parseInt(t2[1]);
      var d1 = parseInt(t1[2]);
      var d2 = parseInt(t2[2]);
      var range = 0; //返回的相差的天数,32表示超过一个月以上
      var dt1 = new Date(y1, m1, 0);

      if (y2 * 12 + m2 - y1 * 12 - m1 < 2) {
        range = dt1.getDate() - d1 + d2;
      } else {
        range = 32;
      }

      return range;
    },

    // 获取租金单价
    getPayUnitPrice() {
      let _this = this;
      let _data = this.payFormData;
      axios
        .request({
          url: "/lease/getPayUnitPrice",
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          data: _data
        })
        .then(function(response) {
          _this.payFormData.unitPrice = response.data;
        });
    },

    // 查询按钮点击事件
    searchButton(value) {
      this.searchData = value;
      this.pageCurrent = 1;
      this.getRequestData(this.pageCurrent);
    },

    // 合同详情
    handleDetailed() {
      if (this.isSelectRow == true) {
        // 开启【合同详情】弹窗
        this.isDetailed = true;
      } else {
        this.$Message.error("请先选择记录");
      }
    },

    // 合同缴费
    handlePay() {
      if (this.isSelectRow == true) {
        // 开启【合同缴费】弹窗
        this.isPayRent = true;
      } else {
        this.$Message.error("请先选择记录");
      }
    },

    // 合同变更
    handleChange() {
      if (this.isSelectRow == true) {
        // 开启【合同变更】弹窗
        this.isChangeOwner = true;
      } else {
        this.$Message.error("请先选择记录");
      }
    },

    // 合同缴费，自动显示业主
    showOwner(building, roomNumber) {
      var owner = "";
      for (var key in this.payRoomData) {
        if (
          this.payRoomData[key].buildingName == building &&
          this.payRoomData[key].roomNumber == roomNumber
        ) {
          owner = this.payRoomData[key].owner;
        }
      }
      return owner;
    },

    // 计算费用总计，租金+物业费+能耗公摊
    getTotalCost(rent, property, energy, part) {
      var sum = 0;
      if (
        rent != "" &&
        rent != null &&
        rent != undefined &&
        property != "" &&
        property != null &&
        property != undefined &&
        energy != "" &&
        energy != null &&
        energy != undefined
      ) {
        sum = parseFloat(rent) + parseFloat(property) + parseFloat(energy);
        if (part == "addForm") {
          if (
            this.addFormData.depositOnContracts != "" &&
            this.addFormData.depositOnContracts != null &&
            this.addFormData.depositOnContracts != undefined
          ) {
            sum = sum + parseFloat(this.addFormData.depositOnContracts);
          }
        }
      }

      return sum;
    },

    // 计算物业费或能耗公摊，周期*管理单价（能耗公摊单价）*面积
    getPropertyFee(time, price, roomData, formData) {
      var sum = 0;
      var area = "";
      for (var key in roomData) {
        if (
          roomData[key].buildingName == formData.buildingName &&
          roomData[key].roomNumber == formData.roomNumber
        ) {
          area = roomData[key].rentArea;
        }
      }
      if (
        time != "" &&
        time != null &&
        time != undefined &&
        price != "" &&
        price != null &&
        price != undefined &&
        area != "" &&
        area != null &&
        area != undefined
      ) {
        sum = parseFloat(time) * parseFloat(price) * parseFloat(area);
      }
      return sum;
    },

    // 计算租金，周期*单价*计租面积
    getRentCost(time, price, roomData, formData) {
      var sum = 0;
      var area = "";
      for (var key in roomData) {
        if (
          roomData[key].buildingName == formData.buildingName &&
          roomData[key].roomNumber == formData.roomNumber
        ) {
          area = roomData[key].rentArea;
        }
      }
      if (
        time != "" &&
        time != null &&
        time != undefined &&
        price != "" &&
        price != null &&
        price != undefined &&
        area != "" &&
        area != null &&
        area != undefined
      ) {
        sum = parseFloat(time) * parseFloat(price) * parseFloat(area);
      }
      return sum;
    },

    // 对选中行的操作
    currentChange(currentRow, index) {
      // 把选中行的序号暂存
      this.showIndex = index;
      // 【合同详情】的数据处理
      this.showContract(currentRow, index);
      // 把选中行的数据赋值给【合同缴费表单】
      this.payFormData = this.getPayForm(currentRow);
      // 把选中行的数据赋值给【退租】表单
      this.deleteFormData = currentRow;
      // 把选中行的数据赋值给【合同变更】表单
      this.changeFormData = currentRow;
      // 修改选中状态
      this.isSelectRow = true;
    },

    // 转换表单数据，赋值给payForm
    getPayForm(currentRow) {
      var newForm = {};
      newForm.owner = currentRow.owner;
      newForm.roomNumber = currentRow.roomNumber;
      newForm.buildingName = currentRow.buildingName;
      newForm.startPayTime = currentRow.lastPayTime;
      newForm.unitPrice = currentRow.unitPrice;
      return newForm;
    },

    // 删除记录
    handleDelete() {
      if (this.isSelectRow == true) {
        this.$Modal.confirm({
          title: "退租提示",
          content: "<p>是否确认将该房间退租？</p>",
          onOk: () => {
            let _this = this;
            let _data = this.deleteFormData;
            axios
              .request({
                url: "/lease/deleteLeaseList",
                method: "post",
                headers: {
                  "Content-Type": "application/json;charset=UTF-8"
                },
                data: _data
              })
              .then(function(response) {
                if (response.data == 1) {
                  _this.$Message.success("退租成功");
                  // 判断是否pageData的数据长度<=1,然后判断是否第1页,是则页数减1;
                  if (_this.pageData.length <= 1) {
                    if (_this.pageCurrent != 1) {
                      _this.pageCurrent = _this.pageCurrent - 1;
                    }
                  }
                  _this.getRequestData(_this.pageCurrent);
                } else if (response.data == -1) {
                  _this.$Message.error("合同未缴清费用");
                } else {
                  _this.$Message.error("退租失败");
                }
                _this.isSelectRow = false;
              });
          },
          onCancel: () => {}
        });
      } else {
        this.$Message.error("请先选择记录");
      }
    },

    // 级联选择房间号
    selectRoomNumber(roomData, buildingData) {
      let numberData = [];
      for (var key in roomData) {
        if (roomData[key].buildingName == buildingData.buildingName) {
          numberData.push(roomData[key]);
        }
      }
      return numberData;
    },

    // 弹窗确认按钮
    handleSubmit(name) {
      switch (name) {
        //合同缴费
        case "payForm":
          this.$refs[name].validate(valid => {
            if (valid) {
              // 开始向后台发送数据
              let _this = this;
              this.payFormData.insertTime = this.getFormatDate();
              let _data = this.payFormData;
              axios
                .request({
                  url: "/lease/insertLeaseCostInfo",
                  method: "post",
                  headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                  },
                  data: _data
                })
                .then(function(response) {
                  if (response.data == 1) {
                    _this.$Message.success("缴费成功");
                    _this.getRequestData(_this.pageCurrent);
                    _this.isPayRent = false;
                  } else if (response.data == -1) {
                    _this.$Message.error("缴费租期超出未缴费租期");
                  } else {
                    _this.$Message.error("缴费失败");
                    _this.isPayRent = false;
                  }
                })
                .then(function() {
                  if (_this.isPayRent == false) {
                    _this.$refs[name].resetFields();
                  }
                });
            }
          });
          break;
        //新增合同
        case "addForm":
          this.$refs[name].validate(valid => {
            if (valid) {
              // 开始向后台发送数据
              let _this = this;
              this.addFormData.insertTime = this.getFormatDate();
              let _data = this.addFormData;
              axios
                .request({
                  url: "/lease/insertLeaseList",
                  method: "post",
                  headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                  },
                  data: _data
                })
                .then(function(response) {
                  if (response.data == 1) {
                    _this.$Message.success("添加成功");
                    _this.isAddNewData = false;
                    _this.getRequestData(_this.pageCurrent);
                  } else if (response.data == -1) {
                    _this.$Message.error("该公司未登记");
                  } else {
                    _this.$Message.error("添加失败");
                    _this.isAddNewData = false;
                  }
                })
                .then(function() {
                  if (_this.isAddNewData == false) {
                    _this.$refs[name].resetFields();
                  }
                });
            }
          });
          break;
        case "changeForm":
          this.$refs[name].validate(valid => {
            if (valid) {
              // 开始向后台发送数据
              let _this = this;
              this.changeFormData.updateTime = this.getFormatDate();
              let _data = this.changeFormData;

              axios
                .request({
                  url: "/lease/changeLeaseContractInfo",
                  method: "post",
                  headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                  },
                  data: _data
                })
                .then(function(response) {
                  if (response.data == 1) {
                    _this.$Message.success("修改成功");
                    _this.isChangeOwner = false;
                    _this.getRequestData(_this.pageCurrent);
                  } else if (response.data == -1) {
                    _this.$Message.error("被转让合同所属人未登记");
                  } else {
                    _this.$Message.error("修改失败");
                    _this.isChangeOwner = false;
                  }
                })
                .then(function() {
                  if (_this.isChangeOwner == false) {
                    _this.$refs[name].resetFields();
                  }
                });
            }
          });
          break;
        case "showTable":
          // 清除高亮行
          this.$refs.currentRowTable.clearCurrentRow();
          // 关闭弹窗
          this.isDetailed = false;
          this.isSelectRow = false;
          break;
        default:
          break;
      }
    },

    // 加月
    addMonth(startTime, n) {
      var s = startTime.split("-");
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
      var dd = year + "-" + month + "-" + days;

      return dd;
    },

    // 填写缴费租期,计算缴费终止租期
    selectEndDate(date) {
      if (typeof date != "string") {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var days = date.getDate();
        var dd = year + "-" + month + "-" + days;
      } else {
        var dd = date;
      }

      if (
        this.payFormData.period != "" ||
        this.payFormData.period != null ||
        this.payFormData.period != undefined
      ) {
        this.payFormData.endPayTime = this.addMonth(
          dd,
          parseInt(this.payFormData.period)
        );
      }
    },

    // 选择起租期,租期不为空,计算终止期
    selectStartDate(date) {
      if (
        this.addFormData.rentPeriod != "" ||
        this.addFormData.rentPeriod != null ||
        this.addFormData.rentPeriod != undefined
      ) {
        this.addFormData.endRentTime = this.addMonth(
          date,
          parseInt(this.addFormData.rentPeriod)
        );
      }
      this.addFormData.startRentTime = date;
    },

    // 点击事件（显示合同详情）
    showContract(currentRow, index) {
      // 被选择数据赋值
      this.selectContract = currentRow;
      // 发送请求，获取所有缴费记录
      let _this = this;
      let _data = this.selectContract;
      axios
        .request({
          url: "/lease/getLeaseCostList",
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          data: _data
        })
        .then(function(response) {
          _this.showTableData = response.data;
          _this.addPageCurrentAndPageSize(_this.showTableData);
        });
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
          url: "/lease/getSearchList",
          method: "get",
          params: {
            search: this.searchData,
            start: this.pageStart,
            count: this.pageSize
          }
        })
        .then(function(response) {
          _this.pageData = response.data.leaseContractList;
          _this.dataCount = response.data.dataCount;
          _this.buildingData = response.data.buildingList;
          _this.roomData = response.data.roomList;
          _this.payBuildingData = response.data.payBuildingList;
          _this.payRoomData = response.data.payRoomList;
          _this.addPageCurrentAndPageSize(_this.pageData);
        });
    },

    // 弹窗取消按钮
    handleReset(name) {
      this.$refs[name].resetFields();
      this.$refs.currentRowTable.clearCurrentRow();
      this.isSelectRow = false;
      switch (name) {
        case "addForm":
          this.isAddNewData = false;
          break;
        case "payForm":
          this.isPayRent = false;
          break;
        case "changeForm":
          this.isChangeOwner = false;
          break;
        default:
          break;
      }
    },

    // 从后台获取管理单价数据
    getSettingData() {
      let _this = this;
      axios
        .request({
          url: "/lease/getSettingList",
          method: "get"
        })
        .then(function(response) {
          _this.settingData = response.data;
        });
    },

    // 从后台获取能耗公摊单价数据
    getEnergyPrice() {
      let _this = this;
      axios
        .request({
          url: "/lease/getEnergyPrice",
          method: "get"
        })
        .then(function(response) {
          _this.energySharingPrice = response.data;
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
    },

    // 添加当前页和页码数据
    addPageCurrentAndPageSize(updatePageData) {
      for (var key in updatePageData) {
        updatePageData[key].pageCurrent = this.pageCurrent;
        updatePageData[key].pageSize = this.pageSize;
      }
    }
  },
  mounted() {
    this.getRequestData(this.pageCurrent);
    this.getSettingData();
    this.getEnergyPrice();
  }
};
</script>

<style>
.ivu-table .demo-table-error-row td {
  background-color: #ff6600;
  color: #000000;
}
</style>
