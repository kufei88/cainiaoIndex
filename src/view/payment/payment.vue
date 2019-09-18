<style lang="less">
@import "./payment.less";
</style>
<template>
  <div>
    <div>
      <Tooltip content="EXCEL导入导出" placement="top">
        <Button class="btn" @click="value2 = true" type="primary">EXCEL</Button>
      </Tooltip>
      <Tooltip content="添加新数据" placement="top">
        <Button class="btn" @click="addList" type="primary">新增数据</Button>
      </Tooltip>
      <!-- <Tooltip content="删除所有数据" placement="top">
        <Button class="btn" @click="removeAll" type="primary">删除所有数据</Button>
      </Tooltip>-->
    </div>
    <!-- EXCEL导入导出 -->
    <Drawer title="EXCEL" placement="left" :closable="false" v-model="value2">
      <Card title="导入EXCEL">
        <Row>
          <Upload action :before-upload="handleBeforeUpload" accept=".xls, .xlsx">
            <Button
              type="primary"
              icon="ios-cloud-upload-outline"
              :loading="uploadLoading"
              @click="handleUploadFile"
            >上传文件</Button>
          </Upload>
        </Row>
        <Row>
          <div class="ivu-upload-list-file" v-if="file !== null">
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
            <Progress v-if="showProgress" :percent="progressPercent" :stroke-width="2">
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
    <Drawer title="新增数据" v-model="value3" width="360" :mask-closable="false" :styles="styles">
      <Form ref="formData" :model="formData" :rules="ruleformData">
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="楼栋" label-position="top">
              <Select v-model="formData.buildingName" @on-change="building">
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
            <FormItem label="房号" label-position="top">
              <Select v-model="formData.roomNumber" @on-change="room">
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
            <FormItem label="企业 " label-position="top">
              <h4>
                :
                <span>{{formData.owner}}</span>
              </h4>
            </FormItem>
          </Col>
        </Row>

        <Row :gutter="32">
          <Col span="18">
            <FormItem label="水表读数" label-position="top" prop="waterNumber">
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
            <FormItem label="电表读数" label-position="top" prop="electricityNumber">
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
            <FormItem label="开始时间" label-position="top" prop="startTime">
              <DatePicker v-model="formData.startTime" type="month" placeholder="选择开始时间"></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="结束时间" label-position="top" prop="endTime">
              <DatePicker v-model="formData.endTime" type="month" placeholder="选择结束时间"></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <!-- <Row>
          <Col span="18">
            <FormItem label="缴费" label-position="top" prop="pay">
              <RadioGroup v-model="formData.pay">
                <Radio label="已缴">已缴</Radio>
                <Radio label="未缴">未缴</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
        </Row>-->
      </Form>
      <div class="demo-drawer-footer">
        <Button style="margin-right: 8px" @click="value3 = false">取消</Button>
        <Button type="primary" @click="add('formData')">确定</Button>
      </div>
    </Drawer>
    <!-- 数据展示 -->
    <Row>
      <Col span="9">
        <Card shadow>
          <p slot="title">
            上期数据
            <span>{{dateTextPrevious}}</span>
          </p>
          <!-- 数据列表展示 上期数据-->
          <Table height="520" :columns="previousColumns" :data="previousData">
            <template slot-scope="{ row }" slot="waterNumber">
              <span>{{ row.waterNumber }}</span>
            </template>

            <template slot-scope="{ row }" slot="electricityNumber">
              <span>{{ row.electricityNumber }}</span>
            </template>

            <template slot-scope="{ row }" slot="owner">
              <span>{{ row.owner }}</span>
            </template>

            <template slot-scope="{ row }" slot="buildingName">
              <span>{{ row.buildingName }}</span>
            </template>

            <template slot-scope="{ row }" slot="roomNumber">
              <span>{{ row.roomNumber }}</span>
            </template>
          </Table>
          <!-- 分页-->

          <Page
            :total="dataCountPrevious"
            show-total
            show-sizer
            :page-size="pageSizePrevious"
            :page-size-opts="[10,20,50,100]"
            :current="pageCurrentPrevious"
            @on-change="changePreviousPage"
            @on-page-size-change="changePreviousPageNumber"
            class="margin-top-10"
          />
        </Card>
      </Col>
      <Col span="15" offset>
        <Card shadow>
          <p slot="title">
            本期数据
            <span>{{dateText}}</span>
          </p>

          <Table height="520" :columns="columns" :data="data" :loading="tableLoading">
            <template slot-scope="{ row, index }" slot="waterNumber">
              <Input
                clearable
                precision="2"
                :maxlength="15"
                v-model="editWaterNumber"
                v-if="editIndex === index"
              />
              <span border:true v-else>{{ row.waterNumber }}</span>
            </template>

            <template slot-scope="{ row, index }" slot="electricityNumber">
              <Input
                clearable
                v-model="editElectricityNumber"
                v-if="editIndex === index"
                precision="2"
                :maxlength="15"
              />
              <span v-else>{{ row.electricityNumber }}</span>
            </template>

            <template slot-scope="{ row }" slot="owner">
              <span>{{ row.owner }}</span>
            </template>

            <template slot-scope="{ row }" slot="buildingName">
              <span>{{ row.buildingName }}</span>
            </template>

            <template slot-scope="{ row }" slot="roomNumber">
              <span>{{ row.roomNumber }}</span>
            </template>

            <template slot-scope="{ row, index }" slot="action">
              <div v-if="editIndex === index">
                <Button type="info" @click="handleSave(index)" class="btn" size="small">保存</Button>
                <Button @click="editIndex = -1" size="small">取消</Button>
              </div>

              <div v-else>
                <Button type="info" @click="handleEdit(row,index)" class="btn" size="small">修改</Button>
                <Poptip
                  confirm
                  title="是否要删除该行?"
                  @on-ok="remove(index)"
                  @on-cancel="cancel"
                  placement="left-end"
                >
                  <Button type="error" size="small">删除</Button>
                </Poptip>
              </div>
            </template>
          </Table>
          <!-- 分页-->
          <Page
            :total="dataCount"
            show-total
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
          v-if="value4 && value5 && value6"
        />
        <div slot="title">
          <p>水电费使用数据报表</p>
          <Poptip title="时间线" class="text-center a" v-model="visible">
            <a href="#">
              <Icon type="ios-funnel"></Icon>
              选择时间线{{timeText}}
            </a>

            <div slot="content" style="height:90px">
              <Divider size="small">
                <a href="#" @click="year">年</a>
              </Divider>
              <Divider size="small">
                <a href="#" @click="quarter">季</a>
              </Divider>
              <Divider size="small">
                <a href="#" @click="month">月</a>
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
        if (!Number.isInteger(value)) {
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
          title: "水表读数（吨）",
          slot: "waterNumber",
          key: "waterNumber"
        },
        {
          title: "电表读数（度）",
          slot: "electricityNumber",
          key: "electricityNumber"
        },
        {
          title: "企业",
          slot: "owner",
          key: "owner"
        },
        {
          title: "楼栋名",
          slot: "buildingName",
          key: "buildingName"
        },
        {
          title: "房号",
          slot: "roomNumber",
          key: "roomNumber"
        },

        {
          title: "操作",
          slot: "action"
        }
      ],
      // {
      //     title: "缴费",
      //     slot: "pay",
      //     key: "pay"
      //   },
      previousColumns: [
        {
          title: "水表读数（吨）",
          slot: "waterNumber"
        },
        {
          title: "电表读数（度）",
          slot: "electricityNumber"
        },
        {
          title: "企业",
          slot: "owner"
        },
        {
          title: "楼栋名",
          slot: "buildingName"
        },
        {
          title: "房号",
          slot: "roomNumber"
        }
      ],
      data: [], //本期数据
      previousData: [], //上期数据
      editIndex: -1, // 当前聚焦的输入框的行数
      editWaterNumber: "", // 水表输入框，当然聚焦的输入框的输入内容，与 data 分离避免重构的闪烁
      editElectricityNumber: "", // 电表列输入框
      uploadLoading: false, //上传状态
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableLoading: false,
      exportLoading: false,
      exportLoadingTemplate: false,
      value2: false, //左抽屉
      value3: false, //右抽屉
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static"
      },
      formData: {
        waterNumber: "",
        electricityNumber: "",
        owner: "",
        buildingName: "",
        roomNumber: "",
        startTime: "",
        endTime: "",
        buildingList: [], //楼栋表
        roomList: [], //房间表
        pay: ""
      },
      ruleformData: {
        buildingName: [
          {
            required: true,
            message: "请选择楼栋",
            trigger: "change"
          }
        ],
        roomNumber: [
          {
            required: true,
            message: "请选择房号",
            trigger: "change"
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
      dateText: "",
      dateTextPrevious: "",
      value4: true, //时间数据状态
      value5: true, //水费数据状态
      value6: true, //电费数据状态
      visible: false,
      pageCurrent: 1, //当前页数
      pageStart: 0,
      dataCount: 0, //后台数据的总记录
      pageSize: 10, //每页显示多少条
      pageCurrentPrevious: 1, //当前页数
      pageStartPrevious: 0,
      dataCountPrevious: 0, //后台数据的总记录
      pageSizePrevious: 10, //每页显示多少条
      errorCount: 0 // excel 导入错误几条记录
    };
  },
  mounted() {
    this.getPaymentDataPage(this.pageCurrent);
    this.getPaymentPreviousData(this.pageCurrentPrevious);
    this.year();
    this.timeNow();
  },
  methods: {
    addList() {
      this.value3 = true;
      this.getBuilding();
      this.addTime();
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
          url: "/payment/getBuildingList",
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
          url: "/payment/getRoomList",
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
          url: "/payment/getEnterpriseNumber",
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
    handleEdit(row, index) {
      this.editWaterNumber = row.waterNumber;
      this.editElectricityNumber = row.electricityNumber;
      this.editEnterpriseNumber = row.enterpriseNumber;
      this.editIndex = index;
    },
    //删除所有数据
    removeAll() {
      let i,
        _this = this;
      axios
        .request({
          url: "/payment/deletePaymentDataAll",
          method: "post"
        })
        .then(function(response) {
          _this.data = response.data;
        });
      this.$Message.success("已删除所有数据！");
    },
    //保存数据
    handleSave(index) {
      if (this.editWaterNumber != "" && this.editElectricityNumber != "") {
        this.data[index].waterNumber = this.editWaterNumber;
        this.data[index].electricityNumber = this.editElectricityNumber;
        this.editIndex = -1;
        if (
          this.data[index].waterNumber != "" &&
          this.data[index].electricityNumber != ""
        ) {
          //修改
          axios
            .request({
              url: "/payment/updatePaymentData",
              method: "post",
              headers: {
                "Content-Type": "application/json" //设置请求头请求格式为JSON
              },
              data: {
                id: this.data[index].id,
                waterNumber: this.data[index].waterNumber,
                electricityNumber: this.data[index].electricityNumber
              }
            })
            .then(response => {
              if (response.data == 1) {
                this.$Message.success("修改成功！");
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
              }
            })
            .catch(error => {
              if (error) {
                this.$Message.error("修改失败！");
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
              }
            });
        }
      } else {
        this.$Message.error("存在空数据或者中英文！请重新修改数据！");
      }
    },
    //得到上期数据
    getPaymentPreviousData(index) {
      this.pageNumPrevious = index;
      this.pageStartPrevious = (index - 1) * this.pageSizePrevious;
      axios
        .request({
          url: "/payment/getPreviousPaymentList",
          method: "get",
          params: {
            dataStart: this.pageStartPrevious,
            dataEnd: this.pageSizePrevious
          }
        })
        .then(response => {
          this.previousData = response.data.paymentInfos;
          this.dataCountPrevious = response.data.dataCount;
        });
    },
    // 改变上期数据每页条数
    changePreviousPageNumber(index) {
      this.pageSizePrevious = index;
      if (this.pageCurrentPrevious === 1) {
        this.changePreviousPage(this.pageCurrentPrevious);
      }
    },
    // 上期数据分页
    changePreviousPage(index) {
      // 获得当前页数，以及发送数据请求
      this.pageCurrentPrevious = index;
      this.getPaymentPreviousData(index);
    },
    //删除数据
    remove(index) {
      //删除
      axios
        .request({
          url: "/payment/deletePaymentData",
          method: "post",
          headers: {
            "Content-Type": "application/json" //设置请求头请求格式为JSON
          },
          data: {
            id: this.data[index].id
          }
        })
        .then(response => {
          if (response.data == 1) {
            this.$Message.success("已删除当前行！");
            this.getPaymentDataPage(this.pageCurrent);
            this.getPaymentPreviousData(this.pageCurrentPrevious);
          } else {
            this.$Message.error("删除失败！");
          }
        });
    },
    //添加数据
    add(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.value3 = false;
          //增加
          axios
            .request({
              url: "/payment/insertPaymentData",
              method: "post",
              headers: {
                "Content-Type": "application/json" //设置请求头请求格式为JSON
              },
              data: {
                waterNumber: this.formData.waterNumber,
                electricityNumber: this.formData.electricityNumber,
                owner: this.formData.owner,
                buildingName: this.formData.buildingName,
                roomNumber: this.formData.roomNumber,
                startTime: this.formData.startTime,
                endTime: this.formData.endTime
              }
            })
            .then(response => {
              if (response.data == 1) {
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
                this.$Message.success("添加成功！");
              }
              if (response.data == 2) {
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
                this.$Message.error("数据已存在！");
              }
            })
            .catch(error => {
              if (error) {
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
                this.$Message.error("添加失败！");
              }
            });
        } else {
          this.$Message.error("存在空数据或者中英文！请重新输入数据!");
        }
      });
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
            "水表读数",
            "电表读数",
            "开始时间",
            "结束时间"
          ],
          key: [
            "buildingName",
            "roomNumber",
            "owner",
            "waterNumber",
            "electricityNumber",
            "startTime",
            "endTime"
          ],
          autoWidth: true,
          filename: "缴费管理"
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
            startTimeTemplate: "2019/9/8",
            endTimeTemplate: "2019/10/8"
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
          axios
            .request({
              url: "/payment/insertPaymentDataExcel",
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
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
                this.value2 = false;
              }
              if (response.data.excelFlag == 0) {
                this.$Message.error(
                  "上传失败," + response.data.errorCount + "条数据！"
                );
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
                this.value2 = false;
              }
              if (response.data.excelFlag == 2) {
                this.$Message.error(
                  "上传失败,存在重复数据！已删除本次上传的" +
                    response.data.errorCount +
                    "条重复数据！"
                );
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
                this.value2 = false;
              }
            })
            .catch(error => {
              if (error) {
                this.$Message.error("上传失败！");
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrentPrevious);
                this.year();
                this.value2 = false;
              }
            });
        }

        this.uploadLoading = false;
        this.tableLoading = false;
        this.showRemoveFile = true;
      };
    },
    //得到本期数据及条数
    getPaymentDataPage(index) {
      this.pageNum = index;
      this.pageStart = (index - 1) * this.pageSize;
      axios
        .request({
          url: "/payment/getPaymentList",
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
    // 本期数据改变每页条数
    changePageNumber(index) {
      this.pageSize = index;
      if (this.pageCurrent === 1) {
        this.changePage(this.pageCurrent);
      }
    },
    // 本期数据分页
    changePage(index) {
      // 获得当前页数，以及发送数据请求
      this.pageCurrent = index;
      this.getPaymentDataPage(index);
    },
    //年份
    year() {
      this.timeText = " > 年";
      this.value4 = false;
      this.value5 = false;
      this.value6 = false;
      let i;
      axios
        .request({
          url: "/payment/getYearsList",
          method: "get"
        })
        .then(response => {
          this.exampleData.timeData = response.data;
          axios
            .request({
              url: "/payment/getYearsWaterCostList",
              method: "get"
            })
            .then(response => {
              this.exampleData.waterData = response.data;
              this.value5 = true;
            });
          axios
            .request({
              url: "/payment/getYearsElectricityCostList",
              method: "get"
            })
            .then(response => {
              this.exampleData.electricityData = response.data;
              this.value6 = true;
            });

          this.value4 = true;
        });
      this.visible = false;
    },
    //月份
    month() {
      this.timeText = " > 月";
      this.value4 = false;
      this.value5 = false;
      this.value6 = false;
      axios
        .request({
          url: "/payment/getMonthList",
          method: "get"
        })
        .then(response => {
          this.exampleData.timeData = response.data;
          this.value4 = true;
          axios
            .request({
              url: "/payment/getMonthWaterCostList",
              method: "get"
            })
            .then(response => {
              this.exampleData.waterData = response.data;
              this.value5 = true;
            });
          axios
            .request({
              url: "/payment/getMonthElectricityCostList",
              method: "get"
            })
            .then(response => {
              this.exampleData.electricityData = response.data;
              this.value6 = true;
            });
        });
      this.visible = false;
    },
    //季度
    quarter() {
      this.timeText = " > 季";
      this.value4 = false;
      this.value5 = false;
      this.value6 = false;
      axios
        .request({
          url: "/payment/getQuarterList",
          method: "get"
        })
        .then(response => {
          this.exampleData.timeData = response.data;
          this.value4 = true;
          axios
            .request({
              url: "/payment/getQuarterWaterCostList",
              method: "get"
            })
            .then(response => {
              this.exampleData.waterData = response.data;
              this.value5 = true;
            });
          axios
            .request({
              url: "/payment/getQuarterElectricityCostList",
              method: "get"
            })
            .then(response => {
              this.exampleData.electricityData = response.data;
              this.value6 = true;
            });
        });
      this.visible = false;
    },
    //取消
    cancel() {},
    //时间
    timeNow() {
      this.dateText = new Date().getFullYear() + "/" + new Date().getMonth();
      this.dateTextPrevious =
        new Date().getFullYear() + "/" + (new Date().getMonth() - 1);
    },
    //新增数据的显示时间
    addTime() {
      this.formData.startTime =
        new Date().getFullYear() + "/" + (new Date().getMonth() + 1);
      this.formData.endTime =
        new Date().getFullYear() + "/" + (new Date().getMonth() + 2);
    }
  }
};
</script>