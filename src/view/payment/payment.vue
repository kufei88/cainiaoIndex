<style lang="less">
@import "./payment.less";
</style>
<template>
  <div>
    <div>
      <Tooltip
        content="EXCEL导入导出"
        placement="top"
      >
        <Button
          class="btn"
          @click="value2 = true"
          type="primary"
        >EXCEL</Button>
      </Tooltip>
      <Tooltip
        content="添加新数据"
        placement="top"
      >
        <Button
          class="btn"
          @click="addForm"
          type="primary"
        >新增数据</Button>
      </Tooltip>
    </div>
    <!-- EXCEL导入导出 -->
    <Drawer
      title="EXCEL"
      placement="left"
      :closable="false"
      v-model="value2"
    >
      <Card title="导入EXCEL">
        <Row>
          <Upload
            action
            :before-upload="handleBeforeUpload"
            accept=".xls, .xlsx"
          >
            <Button
              type="primary"
              icon="ios-cloud-upload-outline"
              :loading="uploadLoading"
              @click="handleUploadFile"
            >上传文件</Button>
          </Upload>
        </Row>
        <Row>
          <div
            class="ivu-upload-list-file"
            v-if="file !== null"
          >
            <Icon type="ios-stats"></Icon>
            {{ file.name }}
            <Icon
              v-show="showRemoveFile"
              type="ios-close"
              class="ivu-upload-list-remove"
              @click.native="handleRemove()"
            ></Icon>
          </div>
        </Row>
        <Row>
          <transition name="fade">
            <Progress
              v-if="showProgress"
              :percent="progressPercent"
              :stroke-width="2"
            >
              <div v-if="progressPercent == 100">
                <Icon type="ios-checkmark-circle"></Icon>
                <span>成功</span>
              </div>
            </Progress>
          </transition>
        </Row>
      </Card>

      <Card title="导出EXCEL">
        <Row style="padding-bottom: 8px;">
          <Button
            type="primary"
            icon="md-download"
            :loading="exportLoading"
            @click="exportExcel"
          >导出文件</Button>
        </Row>
      </Card>

      <Card title="导出EXCEL模板">
        <Row style="padding-bottom: 8px;">
          <Button
            type="primary"
            icon="md-download"
            :loading="exportLoadingTemplate"
            @click="exportExcelTemplate"
          >导出文件</Button>
        </Row>
      </Card>
    </Drawer>
    <!-- 新增数据 -->
    <Drawer
      title="新增数据"
      v-model="value3"
      width="360"
      :mask-closable="false"
      :styles="styles"
    >
      <Form
        ref="formData"
        :model="formData"
        :rules="ruleformData"
      >
        <Row :gutter="32">
          <Col span="18">
          <FormItem
            label="楼栋"
            label-position="top"
          >
            <Select
              v-model="formData.buildingName"
              @on-change="building"
            >
              <Option
                v-for="item in formData.buildingList"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
          <FormItem
            label="房号"
            label-position="top"
          >
            <Select
              v-model="formData.roomNumber"
              @on-change="room"
            >
              <Option
                v-for="item in formData.roomList"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
          <FormItem
            label="企业 "
            label-position="top"
          >
            <h4>
              :
              <span>{{formData.owner}}</span>
            </h4>
          </FormItem>
          </Col>
        </Row>

        <Row :gutter="32">
          <Col span="18">
          <FormItem
            label="水表读数"
            label-position="top"
            prop="waterNumber"
          >
            <Input
              v-model="formData.waterNumber"
              placeholder="请输入水表读数，必须为数字"
              clearable
              precision="2"
              number
              :maxlength="15"
            />
          </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
          <FormItem
            label="电表读数"
            label-position="top"
            prop="electricityNumber"
          >
            <Input
              v-model="formData.electricityNumber"
              placeholder="请输入电表读数，必须为数字"
              clearable
              precision="2"
              number
              :maxlength="15"
            />
          </FormItem>
          </Col>
        </Row>

        <Row :gutter="32">
          <Col span="18">
          <FormItem
            label="开始时间"
            label-position="top"
            prop="startTime"
          >
            <DatePicker
              v-model="formData.startTime"
              type="month"
              placeholder="选择开始时间"
            ></DatePicker>
          </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
          <FormItem
            label="结束时间"
            label-position="top"
            prop="endTime"
          >
            <DatePicker
              v-model="formData.endTime"
              type="month"
              placeholder="选择结束时间"
            ></DatePicker>
          </FormItem>
          </Col>
        </Row>
      </Form>
      <div class="demo-drawer-footer">
        <Button
          style="margin-right: 8px"
          @click="value3 = false"
        >取消</Button>
        <Button
          type="primary"
          @click="add('formData')"
        >确定</Button>
      </div>
    </Drawer>
    <!-- 数据展示 -->
    <Row>
      <Col offset>
      <Card shadow>
        <p slot="title">数据展示</p>
        <Input
          v-model="searchValue"
          class="searchInput"
          placeholder="请输入关键字"
        >
        <Select
          v-model="selectValue"
          slot="prepend"
          style="width: 80px"
        >
          <Option value="企业">企业</Option>
          <Option value="房号">房号</Option>
        </Select>
        <Button
          slot="append"
          icon="ios-search"
          @click="search(pageCurrent)"
        ></Button>
        </Input>
        <Table
          height="520"
          :columns="columns"
          :data="data"
          :loading="tableLoading"
        >
          <template
            slot-scope="{ row }"
            slot="buildingName"
          >
            <span>{{ row.buildingName }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="roomNumber"
          >
            <span>{{ row.roomNumber }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="owner"
          >
            <span>{{ row.owner }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="waterNumber"
          >
            <span>{{ row.waterNumber }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="waterNumberPrevious"
          >
            <span>{{ row.waterNumberPrevious }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="waterDifference"
          >
            <span>{{ row.waterDifference }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="waterCost"
          >
            <span>{{ row.waterCost }}</span>
          </template>

          <template
            slot-scope="{ row}"
            slot="electricityNumber"
          >
            <span>{{ row.electricityNumber }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="electricityNumberPrevious"
          >
            <span>{{ row.electricityNumberPrevious }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="electricityDifference"
          >
            <span>{{ row.electricityDifference }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="electricityCost"
          >
            <span>{{ row.electricityCost }}</span>
          </template>

          <template
            slot-scope="{ row }"
            slot="total"
          >
            <span>{{ row.total }}</span>
          </template>
        </Table>
        <!-- 分页-->
        <span>记录总共 {{this.dataCount}} 条</span>
        <Page
          :total="dataCount"
          show-sizer
          :page-size="pageSize"
          :page-size-opts="[10,20,50,100]"
          :current="pageCurrent"
          @on-change="changePage"
          @on-page-size-change="changePageNumber"
          class="margin-top-10"
        />
      </Card>
      </Col>
    </Row>
    <Row>
      <Card shadow>
        单位：元
        <example
          style="height: 310px;"
          v-bind:exampleData="exampleData"
          v-if="value4"
        />
        <div slot="title">
          <p>水电费使用数据报表</p>
          <Poptip
            title="时间线"
            class="text-center a"
            v-model="visible"
          >
            <a href="#">
              <Icon type="ios-funnel"></Icon>
              选择时间线{{timeText}}
            </a>
            <div
              slot="content"
              style="height:90px"
            >
              <Divider size="small">
                <a
                  href="#"
                  @click="getReport(1)"
                >年</a>
              </Divider>
              <Divider size="small">
                <a
                  href="#"
                  @click="getReport(2)"
                >季</a>
              </Divider>
              <Divider size="small">
                <a
                  href="#"
                  @click="getReport(3)"
                >月</a>
              </Divider>
            </div>
          </Poptip>
        </div>
      </Card>
    </Row>
  </div>
</template>
<script>
import excel from "@/libs/excel";
import axios from "@/libs/api.request";
import Example from "./example.vue";
export default {
  components: {
    Example
  },
  data() {
    const validateNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入数字！"));
      }
      // 模拟异步验证效果
      setTimeout(() => {
        if (Number.isNaN(value)) {
          callback(new Error("存在中英文，请重新输入数字！"));
        } else {
          callback();
        }
      }, 100);
    };
    return {
      exampleData: {
        timeData: [],
        waterData: [],
        electricityData: []
      },
      columns: [
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "楼栋名",
          slot: "buildingName",
          key: "buildingName",
          align: "center"
        },
        {
          title: "房号",
          slot: "roomNumber",
          key: "roomNumber",
          align: "center"
        },
        {
          title: "企业",
          slot: "owner",
          key: "owner",
          align: "center"
        },
        {
          title: "上期水表读数（吨）",
          slot: "waterNumberPrevious",
          key: "waterNumberPrevious",
          align: "center"
        },
        {
          title: "本期水表读数（吨）",
          slot: "waterNumber",
          key: "waterNumber",
          align: "center"
        },
        {
          title: "水表读数差值（吨）",
          slot: "waterDifference",
          key: "waterDifference",
          align: "center"
        },
        {
          title: "水费（元）",
          slot: "waterCost",
          key: "waterCost",
          align: "center"
        },
        {
          title: "上期电表读数（度）",
          slot: "electricityNumberPrevious",
          key: "electricityNumberPrevious",
          align: "center"
        },
        {
          title: "本期电表读数（度）",
          slot: "electricityNumber",
          key: "electricityNumber",
          align: "center"
        },
        {
          title: "电表读数差值（度）",
          slot: "electricityDifference",
          key: "electricityDifference",
          align: "center"
        },
        {
          title: "电费（元）",
          slot: "electricityCost",
          key: "electricityCost",
          align: "center"
        },
        {
          title: "水电费总金额（元）",
          slot: "total",
          key: "total",
          align: "center"
        }
      ],
      data: [], //数据
      uploadLoading: false, //上传状态
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false, //文件删除状态
      file: null, //文件状态
      tableLoading: false, //列表状态
      exportLoading: false, //导出状态
      exportLoadingTemplate: false, //导出模板状态
      value2: false, //左抽屉
      value3: false, //右抽屉
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static"
      },
      formData: {
        waterNumber: "", //水表读数
        electricityNumber: "", //电表读数
        owner: "", //企业
        buildingName: "", //楼栋
        roomNumber: "", //房号
        startTime: "", //开始时间
        endTime: "", //结束时间
        buildingList: [], //楼栋表
        roomList: [] //房间表
      },
      ruleformData: {
        buildingName: [
          {
            required: true,
            message: "请选择楼栋",
            trigger: "blur"
          }
        ],
        roomNumber: [
          {
            required: true,
            message: "请选择房号",
            trigger: "blur"
          }
        ],
        waterNumber: [
          {
            required: true,
            validator: validateNumber,
            trigger: "blur"
          }
        ],
        electricityNumber: [
          {
            required: true,
            validator: validateNumber,
            trigger: "blur"
          }
        ],
        startTime: [
          {
            required: true,
            type: "date",
            message: "选择开始时间",
            trigger: "blur"
          }
        ],
        endTime: [
          {
            required: true,
            type: "date",
            message: "选择结束时间",
            trigger: "blur"
          }
        ]
      },
      timeText: "",
      value4: true, //报表展示状态
      visible: false,
      pageCurrent: 1, //当前页数
      pageStart: 0,
      dataCount: 0, //后台数据的总记录
      pageSize: 10, //每页显示多少条
      errorCount: 0, // excel 导入错误几条记录
      excelLoading: 1, // excel 等待
      searchValue: "", //搜索值
      selectValue: "企业", //搜索选择状态
      select: false
    };
  },
  mounted() {
    this.getPaymentDataPage(this.pageCurrent);
    this.getReport(1);
  },
  methods: {
    //搜索
    search(index) {
      if (this.searchValue != "") {
        this.select = true;
        this.pageNum = index;
        this.pageStart = (index - 1) * this.pageSize;
        axios
          .request({
            url: "payment/getSearchList",
            method: "get",
            params: {
              searchValue: this.searchValue,
              selectValue: this.selectValue,
              dataStart: this.pageStart,
              dataEnd: this.pageSize
            }
          })
          .then(response => {
            this.data = response.data.paymentInfos;
            this.dataCount = response.data.dataCount;
          });
      }
      if (this.searchValue == "") {
        this.select = false;
        this.getPaymentDataPage(1);
      }
    },
    //初始新增表单
    initAddForm() {
      this.formData.owner = "";
      this.formData.roomNumber = "";
    },
    //加载表单
    addForm() {
      this.value3 = true;
      this.getBuilding();
      this.initAddForm();
    },
    //选择的楼栋数据
    building() {
      this.getRoomList();
      this.formData.owner = "";
      this.formData.roomNumber = "";
    },
    //选择的房间数据
    room() {
      this.getEnterpriseNumber();
    },
    //得到楼栋数据
    getBuilding() {
      axios
        .request({
          url: "payment/getBuildingList",
          method: "get"
        })
        .then(response => {
          const building = response.data;
          const option = building.map(item => {
            return { value: item, label: item };
          });
          this.formData.buildingList = option;
        });
    },
    //得到房间数据
    getRoomList() {
      axios
        .request({
          url: "payment/getRoomList",
          method: "get",
          params: {
            building: this.formData.buildingName
          }
        })
        .then(response => {
          const room = response.data;
          const option = room.map(item => {
            return { value: item, label: item };
          });
          this.formData.roomList = option;
        });
    },
    //得到企业
    getEnterpriseNumber() {
      axios
        .request({
          url: "payment/getEnterpriseNumber",
          method: "get",
          params: {
            building: this.formData.buildingName,
            room: this.formData.roomNumber
          }
        })
        .then(response => {
          this.formData.owner = response.data;
        });
    },
    //添加数据
    add(name) {
      if (this.formData.owner != "") {
        this.$refs[name].validate(valid => {
          if (valid) {
            
            //增加
            axios
              .request({
                url: "payment/insertPaymentData",
                method: "post",
                headers: {
                  "Content-Type": "application/json" //设置请求头请求格式为JSON
                },
                data: this.formData
              })
              .then(response => {
                if (response.data == 1) {
                  this.getPaymentDataPage(this.pageCurrent);
                  this.getReport(1);
                  this.value3 = false;
                  this.$Message.success("添加成功！");
                 
                }
                if (response.data == 0) {
                  this.getPaymentDataPage(this.pageCurrent);
                  this.getReport(1);
                  this.$Message.error("添加失败！数据小于上期数据！");
                }
              })
              .catch(error => {
                if (error) {
                  this.getPaymentDataPage(this.pageCurrent);
                  this.getReport(1);
                  this.value3 = false;
                  this.$Message.error("添加失败，服务器错误！");
                }
              });
          }
        });
      } else {
        this.$Message.error("楼栋或者房号未选择");
      }
    },
    //导出excel
    exportExcel() {
      this.value2 = false;
      if (this.data.length) {
        this.exportLoading = true;
        const params = {
          data: this.data,
          title: [
            "楼栋",
            "房号",
            "企业",
            "上期水表读数（吨）",
            "本期水表读数（吨）",
            "水表读数差值（吨）",
            "水费（元）",
            "上期电表读数（度）",
            "本期电表读数（度）",
            "电表读数差值（度）",
            "电费（元）",
            "水电总金额（元）",
            "开始时间",
            "结束时间"
          ],
          key: [
            "buildingName",
            "roomNumber",
            "owner",
            "waterNumberPrevious",
            "waterNumber",
            "waterDifference",
            "waterCost",
            "electricityNumberPrevious",
            "electricityNumber",
            "electricityDifference",
            "electricityCost",
            "total",
            "startTime",
            "endTime"
          ],
          autoWidth: true,
          filename: "缴费管理数据总汇"
        };
        excel.export_array_to_excel(params);
        this.exportLoading = false;
        this.$Message.info("excel已导出！");
      } else {
        this.$Message.error("表格数据不能为空！");
      }
    },
    //导出excel模板
    exportExcelTemplate() {
      this.value2 = false;
      this.exportLoadingTemplate = true;
      const params = {
        data: [
          {
            buildingTemplate: "1号楼",
            roomTemplate: "101",
            ownerTemplate: "钉钉",
            waterNumberTemplate: "15",
            electricityNumberTemplate: "20",
            startTimeTemplate: "2018-09-08",
            endTimeTemplate: "2018-10-08"
          },
          {
            buildingTemplate: "2号楼",
            roomTemplate: "101",
            ownerTemplate: "钉钉",
            waterNumberTemplate: "15",
            electricityNumberTemplate: "20",
            startTimeTemplate: "2019-09-08",
            endTimeTemplate: "2019-10-08"
          }
        ],
        title: [
          "楼栋",
          "房号",
          "企业",
          "水表读数",
          "电表读数",
          "开始时间",
          "结束时间"
        ],
        key: [
          "buildingTemplate",
          "roomTemplate",
          "ownerTemplate",
          "waterNumberTemplate",
          "electricityNumberTemplate",
          "startTimeTemplate",
          "endTimeTemplate"
        ],
        autoWidth: true,
        filename: "缴费管理模板"
      };
      excel.export_array_to_excel(params);
      this.exportLoadingTemplate = false;
      this.$Message.success("excel模板已导出！");
    },
    //初始化
    initUpload() {
      this.file = null;
      this.showProgress = false;
      this.loadingProgress = 0;
    },
    handleUploadFile() {
      this.initUpload();
    },
    //删除文件
    handleRemove() {
      this.initUpload();
      this.$Message.success("上传的文件已删除！");
    },
    //判断文件类型
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
        const readerData = e.target.result;
        const { header, results } = excel.read(readerData, "array");
        this.excelLoading = results.length;
        for (var key in results) {
          results[key].waterNumber = results[key].水表读数;
          results[key].electricityNumber = results[key].电表读数;
          results[key].owner = results[key].企业;
          results[key].buildingName = results[key].楼栋;
          results[key].roomNumber = results[key].房号;
          results[key].startTime = results[key].开始时间;
          results[key].endTime = results[key].结束时间;
        }

        if (
          results[key].waterNumber != "" &&
          results[key].electricityNumber != "" &&
          results[key].owner != "" &&
          results[key].buildingName != "" &&
          results[key].roomNumber != "" &&
          results[key].startTime != "" &&
          results[key].endTime != ""
        ) {
          this.handleSpinCustom();
          this.value2 = false;
          axios
            .request({
              url: "payment/insertPaymentDataExcel",
              method: "post",
              headers: {
                "Content-Type": "application/json" //设置请求头请求格式为JSON
              },
              data: results
            })
            .then(response => {
              if (response.data.excelFlag == 1) {
                this.$Message.success("上传成功！");
                this.getPaymentDataPage(this.pageCurrent);
                this.getReport(1);
              }
              if (response.data.excelFlag == 0) {
                this.$Message.error(
                  "上传失败，excel中存在本期期数据小于上期数据!"
                );
                this.getPaymentDataPage(this.pageCurrent);
                this.getReport(1);
              }
            })
            .catch(error => {
              if (error) {
                this.$Message.error("上传失败,服务器错误！");
                this.getPaymentDataPage(this.pageCurrent);
                this.getReport(1);
                this.value2 = false;
              }
            });
        }
        this.uploadLoading = false;
        this.tableLoading = false;
        this.showRemoveFile = true;
      };
    },
    //等待
    handleSpinCustom() {
      let time = 115 * this.excelLoading;
      this.$Spin.show({
        render: h => {
          return h("div", [
            h("Icon", {
              class: "demo-spin-icon-load",
              props: {
                type: "ios-loading",
                size: 28
              }
            }),
            h("div", "Loading")
          ]);
        }
      });
      setTimeout(() => {
        this.$Spin.hide();
      }, time);
    },
    //得到数据及条数
    getPaymentDataPage(index) {
      this.pageNum = index;
      this.pageStart = (index - 1) * this.pageSize;
      axios
        .request({
          url: "payment/getPaymentList",
          method: "get",
          params: {
            dataStart: this.pageStart,
            dataEnd: this.pageSize
          }
        })
        .then(response => {
          this.data = response.data.paymentInfos;
          this.dataCount = response.data.dataCount;
        });
    },
    // 数据改变每页条数
    changePageNumber(index) {
      this.pageSize = index;
      if (this.pageCurrent === 1) {
        this.changePage(this.pageCurrent);
      }
    },
    // 数据分页
    changePage(index) {
      // 获得当前页数，以及发送数据请求
      this.pageCurrent = index;
      if (this.select == false) {
        this.getPaymentDataPage(index);
      }
      if (this.select == true) {
        this.search(index);
      }
    },
    //得到报表数据
    getReport(reportState) {
      if (reportState == 1) {
        this.timeText = " > 年";
      } else if (reportState == 2) {
        this.timeText = " > 季";
      } else if (reportState == 3) {
        this.timeText = " > 月";
      }
      this.value4 = false;
      axios
        .request({
          url: "payment/getReportList",
          method: "get",
          params: {
            reportState: reportState
          }
        })
        .then(response => {
          this.exampleData.timeData = response.data.timeList;
          this.exampleData.waterData = response.data.waterList;
          this.exampleData.electricityData = response.data.electricityList;
          this.value4 = true;
        });
      this.visible = false;
    },
    //取消
    cancel() {}
  }
};
</script>
