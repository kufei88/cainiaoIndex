<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入查询关键字"
      style="width:300px;margin-bottom:10px;float:left;"
      @on-search="searchButton"
      v-model="searchData"
    />
    <!-- 缴费按钮 -->
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

    <!-- 缴费按钮 -->
    <Button
      type="primary"
      @click="isPayRent=true"
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
          <Select
            v-model="payFormData.buildingName"
            style="width:200px"
            transfer:true
          >
            <Option
              v-for="item in payBuildingData"
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
          </Select>
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
          />
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
      :columns="dataColumns"
      :data="pageData"
      ref="currentRowTable"
      height="522"
      @on-current-change="currentChange"
      @on-row-dblclick="showContract"
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
        insertTime: ""
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
            message: "租期不得为空",
            trigger: "blur"
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
            message: "合同保证金不得为空",
            trigger: "blur"
          }
        ],
        rentPeriod: [
          {
            required: true,
            message: "租期不得为空",
            trigger: "blur"
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
            message: "租金单价不得为空",
            trigger: "blur"
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
    currentChange(currentRow, oldCurrentRow) {
      // 把选中行的数据赋值给【退租】表单
      this.deleteFormData = currentRow;
      // 把选中行的数据赋值给【合同变更】表单
      this.changeFormData = currentRow;
      // 修改选中状态
      this.isSelectRow = true;
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
                  } else if (response.data == -1) {
                    _this.$Message.error("缴费租期超出未缴费租期");
                  } else {
                    _this.$Message.error("缴费失败");
                  }
                })
                .then(function() {
                  _this.$refs[name].resetFields();
                });
              this.isPayRent = false;
            }
          });
          break;
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
                    _this.getRequestData(_this.pageCurrent);
                  } else if (response.data == -1) {
                    _this.$Message.error("该公司未登记");
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
                    _this.getRequestData(_this.pageCurrent);
                  } else if (response.data == -1) {
                    _this.$Message.error("被转让合同所属人未登记");
                  } else {
                    _this.$Message.error("修改失败");
                  }
                })
                .then(function() {
                  _this.$refs[name].resetFields();
                });
              this.isChangeOwner = false;
            }
          });
          break;
        case "showTable":
          this.isDetailed = false;
          break;
        default:
          break;
      }
    },

    // 加月
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
      var dd = year + "-" + month + "-" + days;
      return dd;
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

    // 双击某一行的点击事件（显示合同详情）
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
          // 开启合同详情弹窗
          _this.isDetailed = true;
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
<style lang="scss" scoped>
</style>