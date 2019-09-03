<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入办公楼名称"
      style="width:300px;margin-bottom:10px;float:left;"
      @on-search="searchData"
      v-model="searchBuildingName"
    />
    <!-- Excel模板下载按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcelModel"
      style="float:right"
    >模板下载</Button>
    <!-- Excel导出按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcel"
      style="float:right"
    >导出文件</Button>
    <!-- Excel导入按钮 -->
    <Upload
      action=""
      :before-upload="handleBeforeUpload"
      accept=".xls, .xlsx"
      style="float:right"
    >

      <Button
        icon="ios-cloud-upload-outline"
        :loading="uploadLoading"
        @click="handleUploadFile"
      >上传文件</Button>

    </Upload>

    <!-- 第n期租赁信息按钮 -->
    <Button
      icon="md-add"
      @click="isContinueRent = true"
      style="float:right"
    >续租</Button>

    <!-- 首期租赁信息按钮 -->
    <Button
      icon="md-add"
      @click="isFirstRent = true"
      style="float:right"
    >首租</Button>

    <!-- 清除浮动 -->
    <div style="clear:both"></div>

    <!-- 首期租赁信息弹窗 -->
    <Modal
      :closable="false"
      v-model="isFirstRent"
      :mask-closable="false"
      :scrollable="true"
      title="新增租赁信息填写"
    >
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="130"
      >

        <FormItem
          label="所属办公楼:"
          prop="buildingName"
        >
          <Select
            v-model="formValidate.buildingName"
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
            v-model="formValidate.roomNumber"
            style="width:200px"
            transfer:true
          >
            <Option
              v-for="item in selectRoomNumber(roomData)"
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
            v-model="formValidate.owner"
          />
        </FormItem>

        <FormItem
          label="合同保证金:"
          prop="depositOnContracts"
        >
          <Input
            clearable
            v-model="formValidate.depositOnContracts"
          />
        </FormItem>

        <FormItem
          label="租期(月):"
          prop="leaseTerm"
        >
          <Input
            clearable
            v-model="formValidate.leaseTerm"
          />
        </FormItem>

        <FormItem
          label="起租期:"
          prop="startingLeasePeriod"
        >
          <DatePicker
            type="date"
            placeholder="请选择日期"
            format="yyyy-MM-dd"
            v-model="formValidate.startingLeasePeriod"
            @on-change="selectStartDate"
          ></DatePicker>

        </FormItem>

        <FormItem
          label="终止期:"
          prop="terminationPeriod"
        >
          <DatePicker
            type="date"
            placeholder="请选择日期"
            format="yyyy-MM-dd"
            v-model="formValidate.terminationPeriod"
            @on-change="selectEndDate"
          ></DatePicker>

        </FormItem>

        <!-- 首期 -->
        <FormItem
          label="首期租金单价(元/月/平米):"
          prop="unitRentOne"
        >
          <Input
            clearable
            v-model="formValidate.unitRentOne"
          />
        </FormItem>

        <FormItem
          label="首期租期周期(月):"
          prop="leasePeriodOne"
        >
          <Input
            clearable
            v-model="formValidate.leasePeriodOne"
          />
        </FormItem>

        <FormItem
          label="首期租期应付总额:"
          prop="totalAmountOne"
        >
          <p>{{getTotalAmount(formValidate.unitRentOne,formValidate.leasePeriodOne,1)}}元</p>

        </FormItem>

        <FormItem
          label="首期租期应付物业费:"
          prop="propertyFeeOne"
        >

          <p>{{getPropertyFee(formValidate.leasePeriodOne,1)}}元</p>

        </FormItem>

        <FormItem
          label="首期能耗公摊(元):"
          prop="energySharingOne"
        >
          <Input
            clearable
            v-model="formValidate.energySharingOne"
          />
        </FormItem>

        <FormItem
          label="首期租费合计:"
          prop="totalRentOne"
        >
          <p>{{getTotalRent(formValidate.totalAmountOne,formValidate.propertyFeeOne,formValidate.energySharingOne,1)}}元</p>

        </FormItem>
        <!-- 其他 -->
        <FormItem
          label="保证金是否支付:"
          prop="isPayBond"
        >
          <RadioGroup v-model="formValidate.isPayBond">
            <Radio label="是">是</Radio>
            <Radio label="否">否</Radio>
          </RadioGroup>

        </FormItem>

        <FormItem
          label="首年租金是否支付:"
          prop="isPayFirstRent"
        >
          <RadioGroup v-model="formValidate.isPayFirstRent">
            <Radio label="是">是</Radio>
            <Radio label="否">否</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem
          label="第二年租金是否支付:"
          prop="isPaySecondRent"
        >
          <RadioGroup v-model="formValidate.isPaySecondRent">
            <Radio label="是">是</Radio>
            <Radio label="否">否</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem
          label="出租单元数:"
          prop="rentalUnits"
        >
          <Input
            clearable
            v-model="formValidate.rentalUnits"
          />
        </FormItem>

        <FormItem
          label="年成交额区间:"
          prop="annualTurnoverInterval"
        >
          <Input
            clearable
            v-model="formValidate.annualTurnoverInterval"
          />
        </FormItem>

        <FormItem
          label="日均单量区间:"
          prop="dailyQuantityInterval"
        >
          <Input
            clearable
            v-model="formValidate.dailyQuantityInterval"
          />
        </FormItem>

        <FormItem
          label="注册:"
          prop="register"
        >
          <Input
            clearable
            v-model="formValidate.register"
          />
        </FormItem>

      </Form>
      <!-- 确定取消框 -->
      <div slot="footer">
        <Button
          type="text"
          size="large"
          @click="handleResetFirst('formValidate')"
        >取消</Button>
        <Button
          type="primary"
          size="large"
          @click="handleSubmitFirst('formValidate')"
        >确定</Button>
      </div>
    </Modal>

    <!-- 租赁表格显示 -->
    <Table
      border
      :columns="dataColumns"
      :data="pageData"
      ref="table"
      height="522"
    >
      <template
        slot-scope="{ row, index }"
        slot="buildingName"
      >
        <Select
          v-model="editBuildingName"
          v-if="editIndex === index"
          transfer:true
        >
          <Option
            v-for="item in buildingData"
            :value="item.buildingName"
            :key="item.buildingName"
          >{{ item.buildingName }}</Option>
        </Select>
        <span v-else>{{ row.buildingName }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="roomNumber"
      >
        <Input
          type="text"
          v-model="editRoomNumber"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.roomNumber }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="owner"
      >
        <Input
          type="text"
          v-model="editOwner"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.owner }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="depositOnContracts"
      >
        <Input
          type="text"
          v-model="editDepositOnContracts"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.depositOnContracts }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="leaseTerm"
      >
        <Input
          type="text"
          v-model="editLeaseTerm"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.leaseTerm }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="startingLeasePeriod"
      >
        <Input
          type="text"
          v-model="editStartingLeasePeriod"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.startingLeasePeriod }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="terminationPeriod"
      >
        <Input
          type="text"
          v-model="editTerminationPeriod"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.terminationPeriod }}</span>
      </template>
      <!-- 首期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitRentOne"
      >
        <Input
          type="text"
          v-model="editUnitRentOne"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitRentOne }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="leasePeriodOne"
      >
        <Input
          type="text"
          v-model="editLeasePeriodOne"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.leasePeriodOne }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalAmountOne"
      >
        <Input
          type="text"
          v-model="editTotalAmountOne"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalAmountOne }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFeeOne"
      >
        <Input
          type="text"
          v-model="editPropertyFeeOne"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFeeOne }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharingOne"
      >
        <Input
          type="text"
          v-model="editEnergySharingOne"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharingOne }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalRentOne"
      >
        <Input
          type="text"
          v-model="editTotalRentOne"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalRentOne }}</span>
      </template>

      <!-- 第2期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitRentTwo"
      >
        <Input
          type="text"
          v-model="editUnitRentTwo"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitRentTwo }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="leasePeriodTwo"
      >
        <Input
          type="text"
          v-model="editLeasePeriodTwo"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.leasePeriodTwo }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalAmountTwo"
      >
        <Input
          type="text"
          v-model="editTotalAmountTwo"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalAmountTwo }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFeeTwo"
      >
        <Input
          type="text"
          v-model="editPropertyFeeTwo"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFeeTwo }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharingTwo"
      >
        <Input
          type="text"
          v-model="editEnergySharingTwo"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharingTwo }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalRentTwo"
      >
        <Input
          type="text"
          v-model="editTotalRentTwo"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalRentTwo }}</span>
      </template>

      <!-- 第3期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitRentThree"
      >
        <Input
          type="text"
          v-model="editUnitRentThree"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitRentThree }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="leasePeriodThree"
      >
        <Input
          type="text"
          v-model="editLeasePeriodThree"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.leasePeriodThree }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalAmountThree"
      >
        <Input
          type="text"
          v-model="editTotalAmountThree"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalAmountThree }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFeeThree"
      >
        <Input
          type="text"
          v-model="editPropertyFeeThree"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFeeThree }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharingThree"
      >
        <Input
          type="text"
          v-model="editEnergySharingThree"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharingThree }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalRentThree"
      >
        <Input
          type="text"
          v-model="editTotalRentThree"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalRentThree }}</span>
      </template>

      <!-- 第4期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitRentFour"
      >
        <Input
          type="text"
          v-model="editUnitRentFour"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitRentFour }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="leasePeriodFour"
      >
        <Input
          type="text"
          v-model="editLeasePeriodFour"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.leasePeriodFour }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalAmountFour"
      >
        <Input
          type="text"
          v-model="editTotalAmountFour"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalAmountFour }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFeeFour"
      >
        <Input
          type="text"
          v-model="editPropertyFeeFour"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFeeFour }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharingFour"
      >
        <Input
          type="text"
          v-model="editEnergySharingFour"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharingFour }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalRentFour"
      >
        <Input
          type="text"
          v-model="editTotalRentFour"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalRentFour }}</span>
      </template>

      <!-- 第5期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitRentFive"
      >
        <Input
          type="text"
          v-model="editUnitRentFive"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitRentFive }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="leasePeriodFive"
      >
        <Input
          type="text"
          v-model="editLeasePeriodFive"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.leasePeriodFive }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalAmountFive"
      >
        <Input
          type="text"
          v-model="editTotalAmountFive"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalAmountFive }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFeeFive"
      >
        <Input
          type="text"
          v-model="editPropertyFeeFive"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFeeFive }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharingFive"
      >
        <Input
          type="text"
          v-model="editEnergySharingFive"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharingFive }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalRentFive"
      >
        <Input
          type="text"
          v-model="editTotalRentFive"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalRentFive }}</span>
      </template>

      <!-- 第6期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitRentSix"
      >
        <Input
          type="text"
          v-model="editUnitRentSix"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitRentSix }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="leasePeriodSix"
      >
        <Input
          type="text"
          v-model="editLeasePeriodSix"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.leasePeriodSix }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalAmountSix"
      >
        <Input
          type="text"
          v-model="editTotalAmountSix"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalAmountSix }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFeeSix"
      >
        <Input
          type="text"
          v-model="editPropertyFeeSix"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFeeSix }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharingSix"
      >
        <Input
          type="text"
          v-model="editEnergySharingSix"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharingSix }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalRentSix"
      >
        <Input
          type="text"
          v-model="editTotalRentSix"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalRentSix }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="isPayBond"
      >
        <Input
          type="text"
          v-model="editIsPayBond"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.isPayBond }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="isPayFirstRent"
      >
        <Input
          type="text"
          v-model="editIsPayFirstRent"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.isPayFirstRent }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="isPaySecondRent"
      >
        <Input
          type="text"
          v-model="editIsPaySecondRent"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.isPaySecondRent }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentalUnits"
      >
        <Input
          type="text"
          v-model="editRentalUnits"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentalUnits }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="annualTurnoverInterval"
      >
        <Input
          type="text"
          v-model="editAnnualTurnoverInterval"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.annualTurnoverInterval }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="dailyQuantityInterval"
      >
        <Input
          type="text"
          v-model="editDailyQuantityInterval"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.dailyQuantityInterval }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="register"
      >
        <Input
          type="text"
          v-model="editRegister"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.register }}</span>
      </template>

      <!-- 操作 -->
      <template
        slot-scope="{ row, index }"
        slot="action"
      >
        <div v-if="editIndex === index">
          <Button
            type="primary"
            style="margin-right: 5px"
            @click="handleSave(index)"
          >保存</Button>
          <Button
            type="error"
            @click="handleCancel(index)"
          >取消</Button>
        </div>
        <div v-else>
          <Button
            type="primary"
            style="margin-right: 5px"
            @click="handleEdit(row, index)"
          >修改</Button>
          <Button
            type="error"
            @click="handleDelete(index)"
          >删除</Button>
        </div>
      </template>
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
import excel from "@/libs/excel";
export default {
  data() {
    let thisVue = this;
    // 是否有特殊字符
    var checkSpecialKey = function(str) {
      var specialKey =
        "[`~!#$^&*()=|{}':;'\\[\\].<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]‘'";
      for (var i = 0; i < str.length; i++) {
        if (specialKey.indexOf(str.substr(i, 1)) != -1) {
          return false;
        }
      }
      return true;
    };
    // 是否当前字段重复
    var isCurrentDataSame = function(field, value) {
      let isDataSame = false;
      for (var key in thisVue._data.historyData) {
        // 房间号是否重复
        if (field == "roomNumber") {
          if (
            value == thisVue._data.historyData[key].roomNumber &&
            thisVue._data.formValidate.buildingName ==
              thisVue._data.historyData[key].buildingName
          ) {
            isDataSame = true;
          }
        }
      }
      return isDataSame;
    };
    // 房间号验证规则
    var roomNumberRule = function(rule, value, callback) {
      let isBuildingNumber = /^[0-9]+$/;
      // 1.验证数据是否为空
      if (value == null || value == undefined || value == "") {
        return callback(new Error("房号不得为空"));
      }
      // 2.验证是否含有特殊字符
      else if (!checkSpecialKey(value)) {
        return callback(new Error("不得含有特殊字符"));
      }
      // 3.验证是否格式错误
      else if (!isBuildingNumber.test(value)) {
        return callback(new Error("格式有误，必须由数字组成"));
      }
      // 4.验证是否数据重复
      else if (isCurrentDataSame(rule.field, value) == true) {
        return callback(new Error("已有该房号"));
      } else {
        callback();
      }
    };
    // 数字类型字段验证
    var numDataRule = function(rule, value, callback) {
      let isBuildingNumber = /^[0-9]+$/;

      // 1.是否为空
      if (value == null || value == undefined || value == "") {
        switch (rule.field) {
          case "rentArea":
            return callback(new Error("计租面积不得为空"));
            break;
          case "builtUpArea":
            return callback(new Error("建筑面积不得为空"));
            break;
          default:
            break;
        }
      }
      // 2.验证是否含有特殊字符
      else if (!checkSpecialKey(value)) {
        return callback(new Error("不得含有特殊字符"));
      }
      // 3.是否是大于0的数字
      else if (!isBuildingNumber.test(value)) {
        return callback(new Error("格式有误，必须是数字"));
      } else {
        callback();
      }
    };
    return {

      isFirstRent: false, // 是否显示首租弹窗
      isContinueRent: false, // 是否显示续租弹窗

      searchBuildingName: "", // 查询的办公楼名称
      searchHistoryData: [], //搜索时备份的历史数据

      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储

      exportLoading: false, // 是否导出Excel成功
      isChangeEdit: false, // 是否修改记录

      pageCurrent: 1, //当前页数
      pageStart: 0,
      pageEnd: 0,
      dataCount: 0, //后台数据的总记录
      pageSize: 10, //每页显示多少条
      pageData: [], //table绑定的数据

      editIndex: -1, // 当前聚焦的输入框的行数
      editOwner: "",
      editRoomNumber: "",
      editBuildingName: "",
      editDepositOnContracts: "",
      editLeaseTerm: "",
      editStartingLeasePeriod: "",
      editTerminationPeriod: "",
      editUnitRentOne: "",
      editLeasePeriodOne: "",
      editTotalAmountOne: "",
      editPropertyFeeOne: "",
      editEnergySharingOne: "",
      editTotalRentOne: "",
      editUnitRentTwo: "",
      editLeasePeriodTwo: "",
      editTotalAmountTwo: "",
      editPropertyFeeTwo: "",
      editEnergySharingTwo: "",
      editTotalRentTwo: "",
      editUnitRentThree: "",
      editLeasePeriodThree: "",
      editTotalAmountThree: "",
      editPropertyFeeThree: "",
      editEnergySharingThree: "",
      editTotalRentThree: "",
      editUnitRentFour: "",
      editLeasePeriodFour: "",
      editTotalAmountFour: "",
      editPropertyFeeFour: "",
      editEnergySharingFour: "",
      editTotalRentFour: "",
      editUnitRentFive: "",
      editLeasePeriodFive: "",
      editTotalAmountFive: "",
      editPropertyFeeFive: "",
      editEnergySharingFive: "",
      editTotalRentFive: "",
      editUnitRentSix: "",
      editLeasePeriodSix: "",
      editTotalAmountSix: "",
      editPropertyFeeSix: "",
      editEnergySharingSix: "",
      editTotalRentSix: "",
      editIsPayBond: "",
      editIsPayFirstRent: "",
      editIsPaySecondRent: "",
      editRentalUnits: "",
      editAnnualTurnoverInterval: "",
      editDailyQuantityInterval: "",
      editRegister: "",

      isAddNewData: false, //是否新增数据
      // 表格显示的列名数据
      dataColumns: [
        {
          title: "所属办公楼",
          key: "buildingName",
          fixed: "left",
          width: 150,
          align: "center",
          slot: "buildingName"
        },
        {
          title: "房号",
          key: "roomNumber",
          fixed: "left",
          width: 100,
          align: "center",
          slot: "roomNumber"
        },
        {
          title: "业主",
          key: "owner",
          fixed: "left",
          width: 80,
          align: "center",
          slot: "owner"
        },

        {
          title: "合同保证金",
          key: "depositOnContracts",
          width: 165,
          align: "center",
          slot: "depositOnContracts"
        },

        {
          title: "租期",
          key: "leaseTerm",
          width: 165,
          align: "center",
          slot: "leaseTerm"
        },

        {
          title: "起租期",
          key: "startingLeasePeriod",
          width: 165,
          align: "center",
          slot: "startingLeasePeriod"
        },

        {
          title: "终止期",
          key: "terminationPeriod",
          width: 165,
          align: "center",
          slot: "terminationPeriod"
        },
        // 首期
        {
          title: "首期租金单价",
          key: "unitRentOne",
          width: 165,
          align: "center",
          slot: "unitRentOne"
        },
        {
          title: "首期租期周期",
          key: "leasePeriodOne",
          width: 165,
          align: "center",
          slot: "leasePeriodOne"
        },
        {
          title: "首期租期应付总额",
          key: "totalAmountOne",
          width: 165,
          align: "center",
          slot: "totalAmountOne"
        },
        {
          title: "首期租期应付物业费",
          key: "propertyFeeOne",
          width: 165,
          align: "center",
          slot: "propertyFeeOne"
        },
        {
          title: "首期能耗公摊",
          key: "energySharingOne",
          width: 165,
          align: "center",
          slot: "energySharingOne"
        },
        {
          title: "首期租费合计",
          key: "totalRentOne",
          width: 165,
          align: "center",
          slot: "totalRentOne"
        },
        // 第2期
        {
          title: "第2期租金单价",
          key: "unitRentTwo",
          width: 165,
          align: "center",
          slot: "unitRentTwo"
        },
        {
          title: "第2期租期周期",
          key: "leasePeriodTwo",
          width: 165,
          align: "center",
          slot: "leasePeriodTwo"
        },
        {
          title: "第2期租期应付总额",
          key: "totalAmountTwo",
          width: 165,
          align: "center",
          slot: "totalAmountTwo"
        },
        {
          title: "第2期租期应付物业费",
          key: "propertyFeeTwo",
          width: 165,
          align: "center",
          slot: "propertyFeeTwo"
        },
        {
          title: "第2期能耗公摊",
          key: "energySharingTwo",
          width: 165,
          align: "center",
          slot: "energySharingTwo"
        },
        {
          title: "第2期租费合计",
          key: "totalRentTwo",
          width: 165,
          align: "center",
          slot: "totalRentTwo"
        },
        // 第3期
        {
          title: "第3期租金单价",
          key: "unitRentThree",
          width: 165,
          align: "center",
          slot: "unitRentThree"
        },
        {
          title: "第3期租期周期",
          key: "leasePeriodThree",
          width: 165,
          align: "center",
          slot: "leasePeriodThree"
        },
        {
          title: "第3期租期应付总额",
          key: "totalAmountThree",
          width: 165,
          align: "center",
          slot: "totalAmountThree"
        },
        {
          title: "第3期租期应付物业费",
          key: "propertyFeeThree",
          width: 165,
          align: "center",
          slot: "propertyFeeThree"
        },
        {
          title: "第3期能耗公摊",
          key: "energySharingThree",
          width: 165,
          align: "center",
          slot: "energySharingThree"
        },
        {
          title: "第3期租费合计",
          key: "totalRentThree",
          width: 165,
          align: "center",
          slot: "totalRentThree"
        },
        // 第4期
        {
          title: "第4期租金单价",
          key: "unitRentFour",
          width: 165,
          align: "center",
          slot: "unitRentFour"
        },
        {
          title: "第4期租期周期",
          key: "leasePeriodFour",
          width: 165,
          align: "center",
          slot: "leasePeriodFour"
        },
        {
          title: "第4期租期应付总额",
          key: "totalAmountFour",
          width: 165,
          align: "center",
          slot: "totalAmountFour"
        },
        {
          title: "第4期租期应付物业费",
          key: "propertyFeeFour",
          width: 165,
          align: "center",
          slot: "propertyFeeFour"
        },
        {
          title: "第4期能耗公摊",
          key: "energySharingFour",
          width: 165,
          align: "center",
          slot: "energySharingFour"
        },
        {
          title: "第4期租费合计",
          key: "totalRentFour",
          width: 165,
          align: "center",
          slot: "totalRentFour"
        },
        // 第5期
        {
          title: "第5期租金单价",
          key: "unitRentFive",
          width: 165,
          align: "center",
          slot: "unitRentFive"
        },
        {
          title: "第5期租期周期",
          key: "leasePeriodFive",
          width: 165,
          align: "center",
          slot: "leasePeriodFive"
        },
        {
          title: "第5期租期应付总额",
          key: "totalAmountFive",
          width: 165,
          align: "center",
          slot: "totalAmountFive"
        },
        {
          title: "第5期租期应付物业费",
          key: "propertyFeeFive",
          width: 165,
          align: "center",
          slot: "propertyFeeFive"
        },
        {
          title: "第5期能耗公摊",
          key: "energySharingFive",
          width: 165,
          align: "center",
          slot: "energySharingFive"
        },
        {
          title: "第5期租费合计",
          key: "totalRentFive",
          width: 165,
          align: "center",
          slot: "totalRentFive"
        },
        // 第6期
        {
          title: "第6期租金单价",
          key: "unitRentSix",
          width: 165,
          align: "center",
          slot: "unitRentSix"
        },
        {
          title: "第6期租期周期",
          key: "leasePeriodSix",
          width: 165,
          align: "center",
          slot: "leasePeriodSix"
        },
        {
          title: "第6期租期应付总额",
          key: "totalAmountSix",
          width: 165,
          align: "center",
          slot: "totalAmountSix"
        },
        {
          title: "第6期租期应付物业费",
          key: "propertyFeeSix",
          width: 165,
          align: "center",
          slot: "propertyFeeSix"
        },
        {
          title: "第6期能耗公摊",
          key: "energySharingSix",
          width: 165,
          align: "center",
          slot: "energySharingSix"
        },
        {
          title: "第6期租费合计",
          key: "totalRentSix",
          width: 165,
          align: "center",
          slot: "totalRentSix"
        },

        {
          title: "保证金是否支付",
          key: "isPayBond",
          width: 165,
          align: "center",
          slot: "isPayBond"
        },
        {
          title: "首年租金是否支付",
          key: "isPayFirstRent",
          width: 165,
          align: "center",
          slot: "isPayFirstRent"
        },
        {
          title: "第二年租金是否支付",
          key: "isPaySecondRent",
          width: 165,
          align: "center",
          slot: "isPaySecondRent"
        },
        {
          title: "出租单元数",
          key: "rentalUnits",
          width: 165,
          align: "center",
          slot: "rentalUnits"
        },
        {
          title: "年成交额区间",
          key: "annualTurnoverInterval",
          width: 120,
          align: "center",
          slot: "annualTurnoverInterval"
        },
        {
          title: "日均单量区间",
          key: "dailyQuantityInterval",
          width: 165,
          align: "center",
          slot: "dailyQuantityInterval"
        },
        {
          title: "注册",
          key: "register",
          width: 165,
          align: "center",
          slot: "register"
        },

        {
          title: "操作",
          width: 200,
          align: "center",
          fixed: "right",
          slot: "action"
        }
      ],
      buildingData: [], // 从后台获取的办公楼数据
      roomData: [], // 从后台获取的办公室数据
      historyData: [], // 从后台读取的表格数据
      //后台获取的设置数据
      settingData: [],

      // excel模板数据格式
      historyDataSaveModel: [
        {
          owner: "",
          roomNumber: "",
          buildingName: "",
          depositOnContracts: "",
          leaseTerm: "",
          startingLeasePeriod: "",
          terminationPeriod: "",
          unitRentOne: "",
          leasePeriodOne: "",
          totalAmountOne: "",
          propertyFeeOne: "",
          energySharingOne: "",
          totalRentOne: "",
          unitRentTwo: "",
          leasePeriodTwo: "",
          totalAmountTwo: "",
          propertyFeeTwo: "",
          energySharingTwo: "",
          totalRentTwo: "",
          unitRentThree: "",
          leasePeriodThree: "",
          totalAmountThree: "",
          propertyFeeThree: "",
          energySharingThree: "",
          totalRentThree: "",
          unitRentFour: "",
          leasePeriodFour: "",
          totalAmountFour: "",
          propertyFeeFour: "",
          energySharingFour: "",
          totalRentFour: "",
          unitRentFive: "",
          leasePeriodFive: "",
          totalAmountFive: "",
          propertyFeeFive: "",
          energySharingFive: "",
          totalRentFive: "",
          unitRentSix: "",
          leasePeriodSix: "",
          totalAmountSix: "",
          propertyFeeSix: "",
          energySharingSix: "",
          totalRentSix: "",
          isPayBond: "",
          isPayFirstRent: "",
          isPaySecondRent: "",
          rentalUnits: "",
          annualTurnoverInterval: "",
          dailyQuantityInterval: "",
          register: ""
        }
      ],
      // 修改时原数据暂存
      historyDataSave: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        depositOnContracts: "",
        leaseTerm: "",
        startingLeasePeriod: "",
        terminationPeriod: "",
        unitRentOne: "",
        leasePeriodOne: "",
        totalAmountOne: "",
        propertyFeeOne: "",
        energySharingOne: "",
        totalRentOne: "",
        unitRentTwo: "",
        leasePeriodTwo: "",
        totalAmountTwo: "",
        propertyFeeTwo: "",
        energySharingTwo: "",
        totalRentTwo: "",
        unitRentThree: "",
        leasePeriodThree: "",
        totalAmountThree: "",
        propertyFeeThree: "",
        energySharingThree: "",
        totalRentThree: "",
        unitRentFour: "",
        leasePeriodFour: "",
        totalAmountFour: "",
        propertyFeeFour: "",
        energySharingFour: "",
        totalRentFour: "",
        unitRentFive: "",
        leasePeriodFive: "",
        totalAmountFive: "",
        propertyFeeFive: "",
        energySharingFive: "",
        totalRentFive: "",
        unitRentSix: "",
        leasePeriodSix: "",
        totalAmountSix: "",
        propertyFeeSix: "",
        energySharingSix: "",
        totalRentSix: "",
        isPayBond: "",
        isPayFirstRent: "",
        isPaySecondRent: "",
        rentalUnits: "",
        annualTurnoverInterval: "",
        dailyQuantityInterval: "",
        register: ""
      },
      // 表单数据设置
      formValidate: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        depositOnContracts: "",
        leaseTerm: "",
        startingLeasePeriod: "",
        terminationPeriod: "",
        unitRentOne: "",
        leasePeriodOne: "",
        totalAmountOne: "",
        propertyFeeOne: "",
        energySharingOne: "",
        totalRentOne: "",
        unitRentTwo: "",
        leasePeriodTwo: "",
        totalAmountTwo: "",
        propertyFeeTwo: "",
        energySharingTwo: "",
        totalRentTwo: "",
        unitRentThree: "",
        leasePeriodThree: "",
        totalAmountThree: "",
        propertyFeeThree: "",
        energySharingThree: "",
        totalRentThree: "",
        unitRentFour: "",
        leasePeriodFour: "",
        totalAmountFour: "",
        propertyFeeFour: "",
        energySharingFour: "",
        totalRentFour: "",
        unitRentFive: "",
        leasePeriodFive: "",
        totalAmountFive: "",
        propertyFeeFive: "",
        energySharingFive: "",
        totalRentFive: "",
        unitRentSix: "",
        leasePeriodSix: "",
        totalAmountSix: "",
        propertyFeeSix: "",
        energySharingSix: "",
        totalRentSix: "",
        isPayBond: "",
        isPayFirstRent: "",
        isPaySecondRent: "",
        rentalUnits: "",
        annualTurnoverInterval: "",
        dailyQuantityInterval: "",
        register: ""
      },
      // 表单数据验证设置
      ruleValidate: {
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
            message: "所属办公楼不得为空",
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
        leaseTerm: [
          {
            required: true,
            message: "租期不得为空",
            trigger: "blur"
          }
        ],
        startingLeasePeriod: [
          {
            required: true,
            message: "起租期不得为空",
            trigger: "blur"
          }
        ],
        terminationPeriod: [
          {
            required: true,
            message: "终止期不得为空",
            trigger: "blur"
          }
        ],
        // 六期填写不需要验证
        isPayBond: [
          {
            required: true,
            message: "请选择保证金是否支付",
            trigger: "blur"
          }
        ],
        isPayFirstRent: [
          {
            required: true,
            message: "请选择首年租金是否支付",
            trigger: "blur"
          }
        ],
        isPaySecondRent: [
          {
            required: true,
            message: "请选择第二年租金是否支付",
            trigger: "blur"
          }
        ],
        rentalUnits: [
          {
            required: true,
            message: "出租单元数不得为空",
            trigger: "blur"
          }
        ],
        annualTurnoverInterval: [
          {
            required: true,
            message: "年成交额区间不得为空",
            trigger: "blur"
          }
        ],
        dailyQuantityInterval: [
          {
            required: true,
            message: "日均单量区间不得为空",
            trigger: "blur"
          }
        ],
        register: [
          {
            required: true,
            message: "注册不得为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  mounted() {
    this.getRequestData(this.pageCurrent);
    this.getBuildingData();
    this.getRoomData();
    this.getSettingData();
  },

  methods: {
    // 查询数据***
    searchData(value) {
      this.searchBuildingName = value;
      this.pageCurrent = 1;
      this.getRequestData(this.pageCurrent);
    },
    // 数据显示
    showData(date) {
      this.$Message.info("数据显示：" + date);
    },
    // 房间号序列化
    sortRoomNumber(roomData) {
      // 1.将字符转化数字
      for (var key1 in roomData) {
        for (var key2 in roomData) {
          if (
            parseInt(roomData[key1].roomNumber) <
            parseInt(roomData[key2].roomNumber)
          ) {
            var exchange = null;
            exchange = roomData[key1];
            roomData[key1] = roomData[key2];
            roomData[key2] = exchange;
          }
        }
      }
      return roomData;
    },
    // 级联选择房间号
    selectRoomNumber(roomData) {
      let numberData = [];
      for (var key in roomData) {
        if (
          roomData[key].buildingName == this.formValidate.buildingName &&
          (roomData[key].owner == "" || roomData[key].owner == null)
        ) {
          numberData.push(roomData[key]);
        }
      }
      numberData = this.sortRoomNumber(numberData);
      return numberData;
    },
    // 时间差距
    getDaterange(stratTime, endTime) {
      var t1 = stratTime.split("-");
      var t2 = endTime.split("-");
      var y1 = parseInt(t1[0]);
      var y2 = parseInt(t2[0]);
      var m1 = parseInt(t1[1]);
      var m2 = parseInt(t2[1]);
      var d1 = parseInt(t1[2]);
      var d2 = parseInt(t2[2]);
      var range = 0;
      var moreDay = 15; // 超过的天数
      var dt1 = new Date(y1, m1, 0);
      if (d1 == d2) {
      } else if (d1 < d2) {
        if (d2 - d1 >= moreDay) {
          range += 1;
          console.log("2");
        }
      } else {
        if (dt1.getDate() - d1 + d2 >= moreDay) {
          range += 1;
          console.log("3");
        }
      }

      range += y2 * 12 + m2 - y1 * 12 - m1;
      return range;
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
        this.formValidate.leaseTerm != "" ||
        this.formValidate.leaseTerm != null ||
        this.formValidate.leaseTerm != undefined
      ) {
        this.formValidate.terminationPeriod = this.addMonth(
          date,
          parseInt(this.formValidate.leaseTerm)
        );
      }
      this.formValidate.startingLeasePeriod = date;
    },
    // 选择终止期,自动更新租期
    selectEndDate(date) {
      this.formValidate.leaseTerm = this.getDaterange(
        this.formValidate.startingLeasePeriod,
        date
      );
      this.formValidate.terminationPeriod = date;
    },
    // 计算租费合计，租费+物业费+能耗公摊
    getTotalRent(totalAmount, propertyFee, energySharing, num) {
      let sum = 0;

      if (totalAmount != "" && propertyFee != "" && energySharing != "") {
        let num1 = parseFloat(totalAmount);
        let num2 = parseFloat(propertyFee);
        let num3 = parseFloat(energySharing);
        sum = num1 + num2 + num3;
        switch (num) {
          case 1:
            this.formValidate.totalRentOne = sum;
            break;
          case 2:
            this.formValidate.totalRentTwo = sum;
            break;
          case 3:
            this.formValidate.totalRentThree = sum;
            break;
          case 4:
            this.formValidate.totalRentFour = sum;
            break;
          case 5:
            this.formValidate.totalRentFive = sum;
            break;
          case 6:
            this.formValidate.totalRentSix = sum;
            break;
          default:
            break;
        }
      }
      return sum;
    },
    // 计算租期应付物业费，周期*单价*计租面积
    getPropertyFee(leasePeriod, num) {
      let sum = 0;
      if (leasePeriod == "") {
      } else {
        // 1.找到Room的计租面积
        let rentArea = 0;
        for (var key in this.roomData) {
          if (
            this.roomData[key].roomNumber == this.formValidate.roomNumber &&
            this.roomData[key].buildingName == this.formValidate.buildingName
          ) {
            rentArea = this.roomData[key].rentArea;
          }
        }
        // 2.找到Setting的管理单价
        let money = parseFloat(this.settingData[0].manageExpense);
        // 3.当管理单价和计租面积都不为空时计算
        if (rentArea != 0 && money != 0) {
          sum = parseFloat(leasePeriod) * money * rentArea;
          switch (num) {
            case 1:
              this.formValidate.propertyFeeOne = sum;
              break;
            case 2:
              this.formValidate.propertyFeeTwo = sum;
              break;
            case 3:
              this.formValidate.propertyFeeThree = sum;
              break;
            case 4:
              this.formValidate.propertyFeeFour = sum;
              break;
            case 5:
              this.formValidate.propertyFeeFive = sum;
              break;
            case 6:
              this.formValidate.propertyFeeSix = sum;
              break;

            default:
              break;
          }
        }
      }

      return sum;
    },
    // 计算租期应付总额，周期*租金*计租面积
    getTotalAmount(unitRent, leasePeriod, num) {
      let sum = 0;
      if (unitRent == "" || leasePeriod == "") {
      } else {
        // 1.先找到Room的计租面积
        let rentArea = 0;
        for (var key in this.roomData) {
          if (
            this.roomData[key].roomNumber == this.formValidate.roomNumber &&
            this.roomData[key].buildingName == this.formValidate.buildingName
          ) {
            rentArea = this.roomData[key].rentArea;
          }
        }
        // 2.当计租面积不为空的时候才计算
        if (rentArea != 0) {
          sum = parseFloat(unitRent) * parseFloat(leasePeriod) * rentArea;
          switch (num) {
            case 1:
              this.formValidate.totalAmountOne = sum;
              break;
            case 2:
              this.formValidate.totalAmountTwo = sum;
              break;
            case 3:
              this.formValidate.totalAmountThree = sum;
              break;
            case 4:
              this.formValidate.totalAmountFour = sum;
              break;
            case 5:
              this.formValidate.totalAmountFive = sum;
              break;
            case 6:
              this.formValidate.totalAmountSix = sum;
              break;

            default:
              break;
          }
        }
      }
      return sum;
    },

    // 上传Excel数据到后台
    uploadExcelData(excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        // 替换数据
        excelData[key].roomNumber = excelData[key].房号;
        excelData[key].buildingName = excelData[key].所属办公楼;
        excelData[key].owner = excelData[key].业主;
        excelData[key].depositOnContracts = excelData[key].合同保证金;
        excelData[key].startingLeasePeriod = excelData[key].起租期;
        excelData[key].terminationPeriod = excelData[key].终止期;
        excelData[key].leaseTerm = excelData[key].租期;

        excelData[key].unitRentOne = excelData[key].首期租金单价;
        excelData[key].leasePeriodOne = excelData[key].首期租期周期;
        excelData[key].totalAmountOne = excelData[key].首期租期应付总额;
        excelData[key].propertyFeeOne = excelData[key].首期租期应付物业费;
        excelData[key].energySharingOne = excelData[key].首期能耗公摊;
        excelData[key].totalRentOne = excelData[key].首期租费合计;

        excelData[key].unitRentTwo = excelData[key].第2期租金单价;
        excelData[key].leasePeriodTwo = excelData[key].第2期租期周期;
        excelData[key].totalAmountTwo = excelData[key].第2期租期应付总额;
        excelData[key].propertyFeeTwo = excelData[key].第2期租期应付物业费;
        excelData[key].energySharingTwo = excelData[key].第2期能耗公摊;
        excelData[key].totalRentTwo = excelData[key].第2期租费合计;

        excelData[key].unitRentThree = excelData[key].第3期租金单价;
        excelData[key].leasePeriodThree = excelData[key].第3期租期周期;
        excelData[key].totalAmountThree = excelData[key].第3期租期应付总额;
        excelData[key].propertyFeeThree = excelData[key].第3期租期应付物业费;
        excelData[key].energySharingThree = excelData[key].第3期能耗公摊;
        excelData[key].totalRentThree = excelData[key].第3期租费合计;

        excelData[key].unitRentFour = excelData[key].第4期租金单价;
        excelData[key].leasePeriodFour = excelData[key].第4期租期周期;
        excelData[key].totalAmountFour = excelData[key].第4期租期应付总额;
        excelData[key].propertyFeeFour = excelData[key].第4期租期应付物业费;
        excelData[key].energySharingFour = excelData[key].第4期能耗公摊;
        excelData[key].totalRentFour = excelData[key].第4期租费合计;

        excelData[key].unitRentFive = excelData[key].第5期租金单价;
        excelData[key].leasePeriodFive = excelData[key].第5期租期周期;
        excelData[key].totalAmountFive = excelData[key].第5期租期应付总额;
        excelData[key].propertyFeeFive = excelData[key].第5期租期应付物业费;
        excelData[key].energySharingFive = excelData[key].第5期能耗公摊;
        excelData[key].totalRentFive = excelData[key].第5期租费合计;

        excelData[key].unitRentSix = excelData[key].第6期租金单价;
        excelData[key].leasePeriodSix = excelData[key].第6期租期周期;
        excelData[key].totalAmountSix = excelData[key].第6期租期应付总额;
        excelData[key].propertyFeeSix = excelData[key].第6期租期应付物业费;
        excelData[key].energySharingSix = excelData[key].第6期能耗公摊;
        excelData[key].totalRentSix = excelData[key].第6期租费合计;

        excelData[key].isPayBond = excelData[key].保证金是否支付;
        excelData[key].isPayFirstRent = excelData[key].首年租金是否支付;
        excelData[key].isPaySecondRent = excelData[key].第二年租金是否支付;
        excelData[key].rentalUnits = excelData[key].出租单元数;
        excelData[key].annualTurnoverInterval = excelData[key].年成交额区间;
        excelData[key].dailyQuantityInterval = excelData[key].日均单量区间;
        excelData[key].register = excelData[key].注册;

        // 删除数据
        delete excelData[key].房号;
        delete excelData[key].所属办公楼;
        delete excelData[key].业主;
        delete excelData[key].合同保证金;
        delete excelData[key].起租期;
        delete excelData[key].终止期;
        delete excelData[key].租期;

        delete excelData[key].首期租金单价;
        delete excelData[key].首期租期周期;
        delete excelData[key].首期租期应付总额;
        delete excelData[key].首期租期应付物业费;
        delete excelData[key].首期能耗公摊;
        delete excelData[key].首期租费合计;

        delete excelData[key].第2期租金单价;
        delete excelData[key].第2期租期周期;
        delete excelData[key].第2期租期应付总额;
        delete excelData[key].第2期租期应付物业费;
        delete excelData[key].第2期能耗公摊;
        delete excelData[key].第2期租费合计;

        delete excelData[key].第3期租金单价;
        delete excelData[key].第3期租期周期;
        delete excelData[key].第3期租期应付总额;
        delete excelData[key].第3期租期应付物业费;
        delete excelData[key].第3期能耗公摊;
        delete excelData[key].第3期租费合计;

        delete excelData[key].第4期租金单价;
        delete excelData[key].第4期租期周期;
        delete excelData[key].第4期租期应付总额;
        delete excelData[key].第4期租期应付物业费;
        delete excelData[key].第4期能耗公摊;
        delete excelData[key].第4期租费合计;

        delete excelData[key].第5期租金单价;
        delete excelData[key].第5期租期周期;
        delete excelData[key].第5期租期应付总额;
        delete excelData[key].第5期租期应付物业费;
        delete excelData[key].第5期能耗公摊;
        delete excelData[key].第5期租费合计;

        delete excelData[key].第6期租金单价;
        delete excelData[key].第6期租期周期;
        delete excelData[key].第6期租期应付总额;
        delete excelData[key].第6期租期应付物业费;
        delete excelData[key].第6期能耗公摊;
        delete excelData[key].第6期租费合计;

        delete excelData[key].保证金是否支付;
        delete excelData[key].首年租金是否支付;
        delete excelData[key].第二年租金是否支付;
        delete excelData[key].出租单元数;
        delete excelData[key].年成交额区间;
        delete excelData[key].日均单量区间;
        delete excelData[key].注册;
      }

      // 验证空数据
      let isDataEmpty = 0;
      for (var key in excelData) {
        excelData[key].roomNumber == "" ||
        excelData[key].roomNumber == null ||
        excelData[key].roomNumber == undefined ||
        excelData[key].buildingName == "" ||
        excelData[key].buildingName == null ||
        excelData[key].buildingName == undefined ||
        excelData[key].owner == "" ||
        excelData[key].owner == null ||
        excelData[key].owner == undefined ||
        excelData[key].depositOnContracts == "" ||
        excelData[key].depositOnContracts == null ||
        excelData[key].depositOnContracts == undefined ||
        excelData[key].startingLeasePeriod == "" ||
        excelData[key].startingLeasePeriod == null ||
        excelData[key].startingLeasePeriod == undefined ||
        excelData[key].terminationPeriod == "" ||
        excelData[key].terminationPeriod == null ||
        excelData[key].terminationPeriod == undefined ||
        excelData[key].leaseTerm == "" ||
        excelData[key].leaseTerm == null ||
        excelData[key].leaseTerm == undefined ||
        excelData[key].isPayBond == "" ||
        excelData[key].isPayBond == null ||
        excelData[key].isPayBond == undefined ||
        excelData[key].isPayFirstRent == "" ||
        excelData[key].isPayFirstRent == null ||
        excelData[key].isPayFirstRent == undefined ||
        excelData[key].isPaySecondRent == "" ||
        excelData[key].isPaySecondRent == null ||
        excelData[key].isPaySecondRent == undefined ||
        excelData[key].rentalUnits == "" ||
        excelData[key].rentalUnits == null ||
        excelData[key].rentalUnits == undefined ||
        excelData[key].annualTurnoverInterval == "" ||
        excelData[key].annualTurnoverInterval == null ||
        excelData[key].annualTurnoverInterval == undefined ||
        excelData[key].dailyQuantityInterval == "" ||
        excelData[key].dailyQuantityInterval == null ||
        excelData[key].dailyQuantityInterval == undefined ||
        excelData[key].register == "" ||
        excelData[key].register == null ||
        excelData[key].register == undefined
          ? (isDataEmpty += 1)
          : (isDataEmpty += 0);
      }

      // 2.1 验证成功，上传后台数据库
      if (isDataEmpty == 0) {
        let _this = this;
        axios
          .request({
            url: "/lease/uploadLeaseList",
            method: "post",
            headers: {
              "Content-Type": "application/json;charset=UTF-8"
            },
            data: excelData
          })
          .then(function(response) {
            if (response.data != 0) {
              _this.$Message.success("导入成功");
              _this.getRequestData(_this.pageCurrent);
            } else {
              _this.$Message.error("表内无数据，导入失败");
            }
          });
      }
      // 2.2 验证失败，提示信息
      else {
        this.$Message.error("该表内有" + isDataEmpty + "行数据有空项");
        isDataEmpty = 0;
      }
    },

    // 对上传的数据初始化
    initUpload() {
      this.file = null;
      this.uploadTableData = [];
    },
    // 点击上传按钮
    handleUploadFile() {
      this.initUpload();
    },

    // 上传前读取并验证数据
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
      };
      reader.onprogress = e => {
        this.progressPercent = Math.round((e.loaded / e.total) * 100);
      };
      reader.onerror = e => {
        this.$Message.error("文件读取出错");
      };
      reader.onload = e => {
        const data = e.target.result;
        const { header, results } = excel.read(data, "array");
        this.uploadTableData = results;
        this.uploadLoading = false;
        // 上传数据到后台
        this.uploadExcelData(this.uploadTableData);
      };
    },

    // Excel模板下载
    exportExcelModel() {
      if (this.historyDataSaveModel.length) {
        this.exportLoading = true;
        const params = {
          title: [
            "所属办公楼",
            "房号",
            "业主",
            "合同保证金",
            "租期",
            "起租期",
            "终止期",
            "首期租金单价",
            "首期租期周期",
            "首期租期应付总额",
            "首期租期应付物业费",
            "首期能耗公摊",
            "首期租费合计",
            "第2期租金单价",
            "第2期租期周期",
            "第2期租期应付总额",
            "第2期租期应付物业费",
            "第2期能耗公摊",
            "第2期租费合计",
            "第3期租金单价",
            "第3期租期周期",
            "第3期租期应付总额",
            "第3期租期应付物业费",
            "第3期能耗公摊",
            "第3期租费合计",
            "第4期租金单价",
            "第4期租期周期",
            "第4期租期应付总额",
            "第4期租期应付物业费",
            "第4期能耗公摊",
            "第4期租费合计",
            "第5期租金单价",
            "第5期租期周期",
            "第5期租期应付总额",
            "第5期租期应付物业费",
            "第5期能耗公摊",
            "第5期租费合计",
            "第6期租金单价",
            "第6期租期周期",
            "第6期租期应付总额",
            "第6期租期应付物业费",
            "第6期能耗公摊",
            "第6期租费合计",
            "保证金是否支付",
            "首年租金是否支付",
            "第二年租金是否支付",
            "出租单元数",
            "年成交额区间",
            "日均单量区间",
            "注册"
          ],
          key: [
            "buildingName",
            "roomNumber",
            "owner",
            "depositOnContracts",
            "leaseTerm",
            "startingLeasePeriod",
            "terminationPeriod",
            "unitRentOne",
            "leasePeriodOne",
            "totalAmountOne",
            "propertyFeeOne",
            "energySharingOne",
            "totalRentOne",
            "unitRentTwo",
            "leasePeriodTwo",
            "totalAmountTwo",
            "propertyFeeTwo",
            "energySharingTwo",
            "totalRentTwo",
            "unitRentThree",
            "leasePeriodThree",
            "totalAmountThree",
            "propertyFeeThree",
            "energySharingThree",
            "totalRentThree",
            "unitRentFour",
            "leasePeriodFour",
            "totalAmountFour",
            "propertyFeeFour",
            "energySharingFour",
            "totalRentFour",
            "unitRentFive",
            "leasePeriodFive",
            "totalAmountFive",
            "propertyFeeFive",
            "energySharingFive",
            "totalRentFive",
            "unitRentSix",
            "leasePeriodSix",
            "totalAmountSix",
            "propertyFeeSix",
            "energySharingSix",
            "totalRentSix",
            "isPayBond",
            "isPayFirstRent",
            "isPaySecondRent",
            "rentalUnits",
            "annualTurnoverInterval",
            "dailyQuantityInterval",
            "register"
          ],
          data: this.historyDataSaveModel,
          autoWidth: true,
          filename: "租赁信息录入模板"
        };
        excel.export_array_to_excel(params);
        this.exportLoading = false;
      } else {
        this.$Message.info("表格数据不能为空！");
      }
    },

    // Excel导出
    exportExcel() {
      if (this.historyData.length) {
        this.exportLoading = true;
        const params = {
          title: [
            "所属办公楼",
            "房号",
            "业主",
            "合同保证金",
            "租期",
            "起租期",
            "终止期",
            "首期租金单价",
            "首期租期周期",
            "首期租期应付总额",
            "首期租期应付物业费",
            "首期能耗公摊",
            "首期租费合计",
            "第2期租金单价",
            "第2期租期周期",
            "第2期租期应付总额",
            "第2期租期应付物业费",
            "第2期能耗公摊",
            "第2期租费合计",
            "第3期租金单价",
            "第3期租期周期",
            "第3期租期应付总额",
            "第3期租期应付物业费",
            "第3期能耗公摊",
            "第3期租费合计",
            "第4期租金单价",
            "第4期租期周期",
            "第4期租期应付总额",
            "第4期租期应付物业费",
            "第4期能耗公摊",
            "第4期租费合计",
            "第5期租金单价",
            "第5期租期周期",
            "第5期租期应付总额",
            "第5期租期应付物业费",
            "第5期能耗公摊",
            "第5期租费合计",
            "第6期租金单价",
            "第6期租期周期",
            "第6期租期应付总额",
            "第6期租期应付物业费",
            "第6期能耗公摊",
            "第6期租费合计",
            "保证金是否支付",
            "首年租金是否支付",
            "第二年租金是否支付",
            "出租单元数",
            "年成交额区间",
            "日均单量区间",
            "注册"
          ],
          key: [
            "buildingName",
            "roomNumber",
            "owner",
            "depositOnContracts",
            "leaseTerm",
            "startingLeasePeriod",
            "terminationPeriod",
            "unitRentOne",
            "leasePeriodOne",
            "totalAmountOne",
            "propertyFeeOne",
            "energySharingOne",
            "totalRentOne",
            "unitRentTwo",
            "leasePeriodTwo",
            "totalAmountTwo",
            "propertyFeeTwo",
            "energySharingTwo",
            "totalRentTwo",
            "unitRentThree",
            "leasePeriodThree",
            "totalAmountThree",
            "propertyFeeThree",
            "energySharingThree",
            "totalRentThree",
            "unitRentFour",
            "leasePeriodFour",
            "totalAmountFour",
            "propertyFeeFour",
            "energySharingFour",
            "totalRentFour",
            "unitRentFive",
            "leasePeriodFive",
            "totalAmountFive",
            "propertyFeeFive",
            "energySharingFive",
            "totalRentFive",
            "unitRentSix",
            "leasePeriodSix",
            "totalAmountSix",
            "propertyFeeSix",
            "energySharingSix",
            "totalRentSix",
            "isPayBond",
            "isPayFirstRent",
            "isPaySecondRent",
            "rentalUnits",
            "annualTurnoverInterval",
            "dailyQuantityInterval",
            "register"
          ],
          data: this.historyData,
          autoWidth: true,
          filename: "租赁信息管理"
        };
        excel.export_array_to_excel(params);
        this.exportLoading = false;
      } else {
        this.$Message.info("表格数据不能为空！");
      }
    },
    // 改变每页条数
    changePageNumber(index) {
      this.pageSize = index;
      if (this.pageCurrent === 1) {
        this.changePage(this.pageCurrent);
      }
    },
    //分页
    changePage(index) {
      // 获得当前页数，以及发送数据请求
      this.pageCurrent = index;
      console.log("请求前历史数据:");
      console.log(this.historyData);
      this.getRequestData(index);
    },
    // 删除记录
    handleDelete(index) {
      this.$Modal.confirm({
        title: "删除提示",
        content: "<p>是否确认删除该条记录？</p>",
        onOk: () => {
          let _this = this;
          let _data = this.historyData[index];
          _data.owner = "";
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

      this.editIndex = -1;
    },
    // 编辑修改记录
    handleEdit(row, index) {
      //
      this.editOwner = row.owner;
      this.editRoomNumber = row.roomNumber;
      this.editBuildingName = row.buildingName;
      this.editDepositOnContracts = row.depositOnContracts;
      this.editLeaseTerm = row.leaseTerm;
      this.editStartingLeasePeriod = row.startingLeasePeriod;
      this.editTerminationPeriod = row.terminationPeriod;
      this.editUnitRentOne = row.unitRentOne;
      this.editLeasePeriodOne = row.leasePeriodOne;
      this.editTotalAmountOne = row.totalAmountOne;
      this.editPropertyFeeOne = row.propertyFeeOne;
      this.editEnergySharingOne = row.energySharingOne;
      this.editTotalRentOne = row.totalRentOne;
      this.editUnitRentTwo = row.unitRentTwo;
      this.editLeasePeriodTwo = row.leasePeriodTwo;
      this.editTotalAmountTwo = row.totalAmountTwo;
      this.editPropertyFeeTwo = row.propertyFeeTwo;
      this.editEnergySharingTwo = row.energySharingTwo;
      this.editTotalRentTwo = row.totalRentTwo;
      this.editUnitRentThree = row.unitRentThree;
      this.editLeasePeriodThree = row.leasePeriodThree;
      this.editTotalAmountThree = row.totalAmountThree;
      this.editPropertyFeeThree = row.propertyFeeThree;
      this.editEnergySharingThree = row.energySharingThree;
      this.editTotalRentThree = row.totalRentThree;
      this.editUnitRentFour = row.unitRentFour;
      this.editLeasePeriodFour = row.leasePeriodFour;
      this.editTotalAmountFour = row.totalAmountFour;
      this.editPropertyFeeFour = row.propertyFeeFour;
      this.editEnergySharingFour = row.energySharingFour;
      this.editTotalRentFour = row.totalRentFour;
      this.editUnitRentFive = row.unitRentFive;
      this.editLeasePeriodFive = row.leasePeriodFive;
      this.editTotalAmountFive = row.totalAmountFive;
      this.editPropertyFeeFive = row.propertyFeeFive;
      this.editEnergySharingFive = row.energySharingFive;
      this.editTotalRentFive = row.totalRentFive;
      this.editUnitRentSix = row.unitRentSix;
      this.editLeasePeriodSix = row.leasePeriodSix;
      this.editTotalAmountSix = row.totalAmountSix;
      this.editPropertyFeeSix = row.propertyFeeSix;
      this.editEnergySharingSix = row.energySharingSix;
      this.editTotalRentSix = row.totalRentSix;
      this.editIsPayBond = row.isPayBond;
      this.editIsPayFirstRent = row.isPayFirstRent;
      this.editIsPaySecondRent = row.isPaySecondRent;
      this.editRentalUnits = row.rentalUnits;
      this.editAnnualTurnoverInterval = row.annualTurnoverInterval;
      this.editDailyQuantityInterval = row.dailyQuantityInterval;
      this.editRegister = row.register;
      // 把当前行数记录
      this.editIndex = index;
    },
    // 取消修改记录
    handleCancel(index) {
      // 数据恢复
      this.editOwner = this.historyData[index].owner;
      this.editRoomNumber = this.historyData[index].roomNumber;
      this.editBuildingName = this.historyData[index].buildingName;
      this.editDepositOnContracts = this.historyData[index].depositOnContracts;
      this.editLeaseTerm = this.historyData[index].leaseTerm;
      this.editStartingLeasePeriod = this.historyData[
        index
      ].startingLeasePeriod;
      this.editTerminationPeriod = this.historyData[index].terminationPeriod;
      this.editUnitRentOne = this.historyData[index].unitRentOne;
      this.editLeasePeriodOne = this.historyData[index].leasePeriodOne;
      this.editTotalAmountOne = this.historyData[index].totalAmountOne;
      this.editPropertyFeeOne = this.historyData[index].propertyFeeOne;
      this.editEnergySharingOne = this.historyData[index].energySharingOne;
      this.editTotalRentOne = this.historyData[index].totalRentOne;
      this.editUnitRentTwo = this.historyData[index].unitRentTwo;
      this.editLeasePeriodTwo = this.historyData[index].leasePeriodTwo;
      this.editTotalAmountTwo = this.historyData[index].totalAmountTwo;
      this.editPropertyFeeTwo = this.historyData[index].propertyFeeTwo;
      this.editEnergySharingTwo = this.historyData[index].energySharingTwo;
      this.editTotalRentTwo = this.historyData[index].totalRentTwo;
      this.editUnitRentThree = this.historyData[index].unitRentThree;
      this.editLeasePeriodThree = this.historyData[index].leasePeriodThree;
      this.editTotalAmountThree = this.historyData[index].totalAmountThree;
      this.editPropertyFeeThree = this.historyData[index].propertyFeeThree;
      this.editEnergySharingThree = this.historyData[index].energySharingThree;
      this.editTotalRentThree = this.historyData[index].totalRentThree;
      this.editUnitRentFour = this.historyData[index].unitRentFour;
      this.editLeasePeriodFour = this.historyData[index].leasePeriodFour;
      this.editTotalAmountFour = this.historyData[index].totalAmountFour;
      this.editPropertyFeeFour = this.historyData[index].propertyFeeFour;
      this.editEnergySharingFour = this.historyData[index].energySharingFour;
      this.editTotalRentFour = this.historyData[index].totalRentFour;
      this.editUnitRentFive = this.historyData[index].unitRentFive;
      this.editLeasePeriodFive = this.historyData[index].leasePeriodFive;
      this.editTotalAmountFive = this.historyData[index].totalAmountFive;
      this.editPropertyFeeFive = this.historyData[index].propertyFeeFive;
      this.editEnergySharingFive = this.historyData[index].energySharingFive;
      this.editTotalRentFive = this.historyData[index].totalRentFive;
      this.editUnitRentSix = this.historyData[index].unitRentSix;
      this.editLeasePeriodSix = this.historyData[index].leasePeriodSix;
      this.editTotalAmountSix = this.historyData[index].totalAmountSix;
      this.editPropertyFeeSix = this.historyData[index].propertyFeeSix;
      this.editEnergySharingSix = this.historyData[index].energySharingSix;
      this.editTotalRentSix = this.historyData[index].totalRentSix;
      this.editIsPayBond = this.historyData[index].isPayBond;
      this.editIsPayFirstRent = this.historyData[index].isPayFirstRent;
      this.editIsPaySecondRent = this.historyData[index].isPaySecondRent;
      this.editRentalUnits = this.historyData[index].rentalUnits;
      this.editAnnualTurnoverInterval = this.historyData[
        index
      ].annualTurnoverInterval;
      this.editDailyQuantityInterval = this.historyData[
        index
      ].dailyQuantityInterval;
      this.editRegister = this.historyData[index].register;

      // 把行数恢复默认值
      this.editIndex = -1;
    },

    // 保存数据
    handleSave(index) {
      let _this = this;
      let _data = this.historyDataSave;

      // 向后台发送数据
      this.historyData[index].owner = this.editOwner;
      this.historyData[index].roomNumber = this.editRoomNumber;
      this.historyData[index].buildingName = this.editBuildingName;
      this.historyData[index].depositOnContracts = this.editDepositOnContracts;
      this.historyData[index].leaseTerm = this.editLeaseTerm;
      this.historyData[
        index
      ].startingLeasePeriod = this.editStartingLeasePeriod;
      this.historyData[index].terminationPeriod = this.editTerminationPeriod;
      this.historyData[index].unitRentOne = this.editUnitRentOne;
      this.historyData[index].leasePeriodOne = this.editLeasePeriodOne;
      this.historyData[index].totalAmountOne = this.editTotalAmountOne;
      this.historyData[index].propertyFeeOne = this.editPropertyFeeOne;
      this.historyData[index].energySharingOne = this.editEnergySharingOne;
      this.historyData[index].totalRentOne = this.editTotalRentOne;
      this.historyData[index].unitRentTwo = this.editUnitRentTwo;
      this.historyData[index].leasePeriodTwo = this.editLeasePeriodTwo;
      this.historyData[index].totalAmountTwo = this.editTotalAmountTwo;
      this.historyData[index].propertyFeeTwo = this.editPropertyFeeTwo;
      this.historyData[index].energySharingTwo = this.editEnergySharingTwo;
      this.historyData[index].totalRentTwo = this.editTotalRentTwo;
      this.historyData[index].unitRentThree = this.editUnitRentThree;
      this.historyData[index].leasePeriodThree = this.editLeasePeriodThree;
      this.historyData[index].totalAmountThree = this.editTotalAmountThree;
      this.historyData[index].propertyFeeThree = this.editPropertyFeeThree;
      this.historyData[index].energySharingThree = this.editEnergySharingThree;
      this.historyData[index].totalRentThree = this.editTotalRentThree;
      this.historyData[index].unitRentFour = this.editUnitRentFour;
      this.historyData[index].leasePeriodFour = this.editLeasePeriodFour;
      this.historyData[index].totalAmountFour = this.editTotalAmountFour;
      this.historyData[index].propertyFeeFour = this.editPropertyFeeFour;
      this.historyData[index].energySharingFour = this.editEnergySharingFour;
      this.historyData[index].totalRentFour = this.editTotalRentFour;
      this.historyData[index].unitRentFive = this.editUnitRentFive;
      this.historyData[index].leasePeriodFive = this.editLeasePeriodFive;
      this.historyData[index].totalAmountFive = this.editTotalAmountFive;
      this.historyData[index].propertyFeeFive = this.editPropertyFeeFive;
      this.historyData[index].energySharingFive = this.editEnergySharingFive;
      this.historyData[index].totalRentFive = this.editTotalRentFive;
      this.historyData[index].unitRentSix = this.editUnitRentSix;
      this.historyData[index].leasePeriodSix = this.editLeasePeriodSix;
      this.historyData[index].totalAmountSix = this.editTotalAmountSix;
      this.historyData[index].propertyFeeSix = this.editPropertyFeeSix;
      this.historyData[index].energySharingSix = this.editEnergySharingSix;
      this.historyData[index].totalRentSix = this.editTotalRentSix;
      this.historyData[index].isPayBond = this.editIsPayBond;
      this.historyData[index].isPayFirstRent = this.editIsPayFirstRent;
      this.historyData[index].isPaySecondRent = this.editIsPaySecondRent;
      this.historyData[index].rentalUnits = this.editRentalUnits;
      this.historyData[
        index
      ].annualTurnoverInterval = this.editAnnualTurnoverInterval;
      this.historyData[
        index
      ].dailyQuantityInterval = this.editDailyQuantityInterval;
      this.historyData[index].register = this.editRegister;

      _data = this.historyData[index];

      axios
        .request({
          url: "/lease/updateLeaseList",
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          data: _data
        })
        .then(function(response) {
          if (response.data == 1) {
            _this.$Message.success("保存成功");
            _this.getRequestData(_this.pageCurrent);
          } else {
            _this.$Message.error("保存失败");
          }
        });
      this.editIndex = -1;
    },
    // 确认提交新增数据
    handleSubmitFirst(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 开始向后台发送数据
          let _this = this;
          let _data = this.formValidate;
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
                _this.$Message.error("已有该租赁信息存在");
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
    },
    // 首租页面点击取消
    handleResetFirst(name) {
      this.$refs[name].resetFields();
      this.isFirstRent = false;
    },
    // 首租页面点击取消

    handleResetContinue(name) {
      this.$refs[name].resetFields();
      this.isContinueRent = false;
    },
    // 从后台获取表格数据
    getRequestData(index) {
      let _this = this;
      this.pageStart = (index - 1) * this.pageSize;
      this.pageEnd = index * this.pageSize;
      axios
        .request({
          url: "/lease/getSearchList",
          method: "get",
          params: {
            search: this.searchBuildingName,
            dataStart: this.pageStart,
            dataEnd: this.pageEnd
          }
        })
        .then(function(response) {
          _this.historyData = response.data.leaseList;
          _this.pageData = _this.historyData;
          _this.dataCount = response.data.dataCount;
          console.log("数据请求:");
          console.log(_this.historyData);
        });
    },
    // 从后台获取办公楼数据
    getBuildingData() {
      let _this = this;
      axios
        .request({
          url: "/building/getBuildingList",
          method: "get"
        })
        .then(function(response) {
          _this.buildingData = response.data;
        });
    },
    // 从后台获取办公室数据
    getRoomData() {
      let _this = this;
      axios
        .request({
          url: "/room/getRoomList",
          method: "get"
        })
        .then(function(response) {
          _this.roomData = response.data;
        });
    },
    // 从后台获取系统设置数据
    getSettingData() {
      let _this = this;
      axios
        .request({
          url: "/setting/getSettingList",
          method: "get"
        })
        .then(function(response) {
          _this.settingData = response.data;
        });
    },
    // 房号存在验证
    checkRoomNumber(roomNumber, buildingName, roomData) {
      let isExits = false;
      for (var i in roomData) {
        if (
          roomNumber == roomData[i].roomNumber &&
          buildingName == roomData[i].buildingName
        ) {
          isExits = true;
        }
      }
      return isExits;
    },
    // 特殊字符验证
    checkSpecialKey(str) {
      var specialKey =
        "[`~!#$^&*()=|{}':;'\\[\\].<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]‘'";
      for (var i = 0; i < str.length; i++) {
        if (specialKey.indexOf(str.substr(i, 1)) != -1) {
          return false;
        }
      }
      return true;
    },
    // 数字格式验证
    checkNumberKey(str) {
      let isBuildingNumber = /^[0-9]+$/;
      let isDataOk = false;
      if (isBuildingNumber.test(str) == true) {
        isDataOk = true;
      }
      return isDataOk;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
