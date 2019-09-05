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
        <Button class="btn" @click="value3 = true" type="primary">新增数据</Button>
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
      <Form :model="formData">
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="水表读数" label-position="top">
              <Input v-model="formData.waterNumber" placeholder="请输入水表读数" clearable />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="电表读数" label-position="top">
              <Input v-model="formData.electricityNumber" placeholder="请输入电表读数" clearable />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="企业" label-position="top">
              <Input v-model="formData.enterpriseNumber" placeholder="请输入企业" clearable />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="32">
          <Col span="18">
            <FormItem label="房号" label-position="top">
              <Input v-model="formData.roomNumber" placeholder="请输入房号" clearable />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div class="demo-drawer-footer">
        <Button style="margin-right: 8px" @click="value3 = false">取消</Button>
        <Button type="primary" @click="add">确定</Button>
      </div>
    </Drawer>
    <!-- 数据展示 -->
    <Row>
      <Col span="10">
        <Card shadow>
          <p slot="title">上期数据</p>
          <!-- 数据列表展示 上期数据-->
          <Table :columns="previousColumns" :data="previousData">
            <template slot-scope="{ row }" slot="waterNumber">
              <span>{{ row.waterNumber }}</span>
            </template>

            <template slot-scope="{ row }" slot="electricityNumber">
              <span>{{ row.electricityNumber }}</span>
            </template>

            <template slot-scope="{ row }" slot="enterpriseNumber">
              <span>{{ row.enterpriseNumber }}</span>
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
      <Col span="14" offset>
        <Card shadow>
          <p slot="title">本期数据</p>
          <Table :columns="columns" :data="data" :loading="tableLoading">
            <template slot-scope="{ row, index }" slot="waterNumber">
              <Input type="text" clearable v-model="editWaterNumber" v-if="editIndex === index" />
              <span border:true v-else>{{ row.waterNumber }}</span>
            </template>

            <template slot-scope="{ row, index }" slot="electricityNumber">
              <Input
                type="text"
                clearable
                v-model="editElectricityNumber"
                v-if="editIndex === index"
              />
              <span v-else>{{ row.electricityNumber }}</span>
            </template>

            <template slot-scope="{ row }" slot="enterpriseNumber">
              <span>{{ row.enterpriseNumber }}</span>
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
                  placement="left"
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
        <example
          style="height: 310px;"
          v-bind:exampleData="exampleData"
          v-if="value4 && value5 && value6"
        />
        <div slot="title">
          <p>水电使用数据报表</p>
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
    return {
      exampleData: {
        timeData: [],
        waterData: [],
        electricityData: []
      },
      columns: [
        {
          title: "水表读数",
          slot: "waterNumber",
          key: "waterNumber"
        },
        {
          title: "电表读数",
          slot: "electricityNumber",
          key: "electricityNumber"
        },
        {
          title: "企业",
          slot: "enterpriseNumber",
          key: "enterpriseNumber"
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
      previousColumns: [
        {
          title: "水表读数",
          slot: "waterNumber"
        },
        {
          title: "电表读数",
          slot: "electricityNumber"
        },
        {
          title: "企业",
          slot: "enterpriseNumber"
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
        enterpriseNumber: ""
      },
      timeText: "",
      value4: true, //时间数据状态
      value5: true, //水费数据状态
      value6: true, //电费数据状态
      visible: false,
      pageCurrent: 1, //当前页数
      pageStart: 0,
      pageEnd: 0,
      dataCount: 0, //后台数据的总记录
      pageSize: 10, //每页显示多少条
      pageCurrentPrevious: 1, //当前页数
      pageStartPrevious: 0,
      pageEndPrevious: 0,
      dataCountPrevious: 0, //后台数据的总记录
      pageSizePrevious: 10 //每页显示多少条
    };
  },
  mounted() {
    this.getPaymentDataPage(this.pageCurrent);
    this.getPaymentPreviousData(this.pageCurrentPrevious);
    this.year();
  },
  methods: {
    handleEdit(row, index) {
      this.editWaterNumber = row.waterNumber;
      this.editElectricityNumber = row.electricityNumber;
      this.editEnterpriseNumber = row.enterpriseNumber;
      this.editIndex = index;
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
                this.getPaymentDataPage(this.pageCurrent);
                this.getPaymentPreviousData(this.pageCurrent);
                this.$Message.success("修改成功！");
              } else {
                this.$Message.error("修改失败！");
              }
            });
        }
      } else {
        this.$Message.error("存在空数据！请重新修改！");
      }
    },
    //得到上期数据
    getPaymentPreviousData(index) {
      this.pageNumPrevious = index;
      this.pageStartPrevious = (index - 1) * this.pageSizePrevious;
      this.pageEndPrevious = index * this.pageSizePrevious;
      axios
        .request({
          url: "/payment/getPreviousPaymentList",
          method: "get",
          params: {
            dataStart: this.pageStartPrevious,
            dataEnd: this.pageEndPrevious
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
          this.getPaymentDataPage();
          if (response.data == 1) {
            this.$Message.success("已删除当前行！");
          } else {
            this.$Message.error("删除失败！");
          }
        });
      this.data.splice(index, 1);
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
    //添加数据
    add() {
      this.value3 = false;
      if (
        this.formData.waterNumber != "" &&
        this.formData.electricityNumber != "" &&
        this.formData.enterpriseNumber != "" &&
        this.formData.roomNumber != ""
      ) {
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
              enterpriseNumber: this.formData.enterpriseNumber,
              roomNumber: this.formData.roomNumber
            }
          })
          .then(response => {
            this.getPaymentDataPage();
            if (response.data == 1) {
              this.$Message.success("添加成功！");
            } else {
              this.$Message.error("添加失败！");
            }
          });
      } else {
        this.$Message.error("存在空数据！请输入数据！");
      }
    },
    //导出excel
    exportExcel() {
      this.value2 = false;
      if (this.data.length) {
        this.exportLoading = true;
        const params = {
          data: this.data,
          title: ["水表读数", "电表读数", "企业", "房号"],
          key: [
            "waterNumber",
            "electricityNumber",
            "enterpriseNumber",
            "roomNumber"
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
        data: this.data,
        title: ["水表读数", "电表读数", "企业", "房号"],
        key: [],
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
        let i;
        this.$Message.info("文件读取成功");
        const readerData = e.target.result;
        const { header, results } = excel.read(readerData, "array");
        const tableTitle = header.map(item => {
          return { title: item, key: item };
        });
        for (i = 0; i < results.length; i++) {
          this.data.push({
            waterNumber: results[i][header[0]],
            electricityNumber: results[i][header[1]],
            enterpriseNumber: results[i][header[2]],
            roomNumber: results[i][header[3]]
          });
          this.editIndex = this.data.length;
          if (
            results[i][header[0]] != "" &&
            results[i][header[1]] != "" &&
            results[i][header[2]] != "" &&
            results[i][header[3]] != ""
          ) {
            axios.request({
              url: "/payment/insertPaymentData",
              method: "post",
              params: {
                waterNumber: results[i][header[0]],
                electricityNumber: results[i][header[1]],
                enterpriseNumber: results[i][header[2]],
                roomNumber: results[i][header[3]]
              }
            });
            if (i == results.length - 1) {
              this.$Message.success("添加成功！");
              this.value2 = false;
            }
          } else {
            this.$Message.error("存在空数据！请输入数据！");
          }
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
      this.pageEnd = index * this.pageSize;
      axios
        .request({
          url: "/payment/getPaymentList",
          method: "get",
          params: {
            dataStart: this.pageStart,
            dataEnd: this.pageEnd
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
              console.log(response.data);
              this.exampleData.waterData = response.data;
              this.value5 = true;
            });
          axios
            .request({
              url: "/payment/getYearsElectricityCostList",
              method: "get"
            })
            .then(response => {
              console.log(response.data);
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
              console.log(response.data);
              this.exampleData.waterData = response.data;
              this.value5 = true;
            });
          axios
            .request({
              url: "/payment/getMonthElectricityCostList",
              method: "get"
            })
            .then(response => {
              console.log(response.data);
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
              console.log(response.data);
              this.exampleData.waterData = response.data;
              this.value5 = true;
            });
          axios
            .request({
              url: "/payment/getQuarterElectricityCostList",
              method: "get"
            })
            .then(response => {
              console.log(response.data);
              this.exampleData.electricityData = response.data;
              this.value6 = true;
            });
        });
      this.visible = false;
    }
  }
};
</script>