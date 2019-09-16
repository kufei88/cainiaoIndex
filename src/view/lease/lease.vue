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
    <!-- <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcelModel"
      style="float:right"
    >模板下载</Button> -->
    <!-- Excel导出按钮 -->
    <!-- <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcel"
      style="float:right"
    >导出文件</Button> -->
    <!-- Excel导入按钮 -->
    <!-- <Upload
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

    </Upload> -->

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
      title="首租租赁信息填写"
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
          prop="rentPeriod"
        >
          <Input
            clearable
            v-model="formValidate.rentPeriod"
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
            v-model="formValidate.startRentTime"
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
            v-model="formValidate.endRentTime"
            @on-change="selectEndDate"
          ></DatePicker>

        </FormItem>

        <!-- 首期 -->
        <FormItem
          label="首期租金单价(元/月/平米):"
          prop="unitPrice1"
        >
          <Input
            clearable
            v-model="formValidate.unitPrice1"
          />
        </FormItem>

        <FormItem
          label="首期租期周期(月):"
          prop="period1"
        >
          <Input
            clearable
            v-model="formValidate.period1"
          />
        </FormItem>

        <FormItem
          label="首期租期应付总额:"
          prop="rentCost1"
        >
          <p>{{getrentCost(formValidate.unitPrice1,formValidate.period1,formValidate,roomData)}}元</p>

        </FormItem>

        <FormItem
          label="首期租期应付物业费:"
          prop="propertyFee1"
        >

          <p>{{getPropertyFee(formValidate.period1,formValidate,roomData)}}元</p>

        </FormItem>

        <FormItem
          label="首期能耗公摊(元):"
          prop="energySharing1"
        >
          <Input
            clearable
            v-model="formValidate.energySharing1"
          />
        </FormItem>

        <FormItem
          label="首期租费合计:"
          prop="totalCost1"
        >
          <p>{{gettotalCost(formValidate,formValidate.rentCost1,formValidate.propertyFee1,formValidate.energySharing1)}}元</p>

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
          prop="isPayFirst"
        >
          <RadioGroup v-model="formValidate.isPayFirst">
            <Radio label="是">是</Radio>
            <Radio label="否">否</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem
          label="第二年租金是否支付:"
          prop="isPaySecond"
        >
          <RadioGroup v-model="formValidate.isPaySecond">
            <Radio label="是">是</Radio>
            <Radio label="否">否</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem
          label="出租单元数:"
          prop="rentCount"
        >
          <Input
            clearable
            v-model="formValidate.rentCount"
          />
        </FormItem>

        <FormItem
          label="年成交额区间:"
          prop="yearTurnoverRange"
        >
          <Input
            clearable
            v-model="formValidate.yearTurnoverRange"
          />
        </FormItem>

        <FormItem
          label="日均单量区间:"
          prop="dayAverageRange"
        >
          <Input
            clearable
            v-model="formValidate.dayAverageRange"
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

    <!-- 第n期租赁信息弹窗 -->
    <Modal
      :closable="false"
      v-model="isContinueRent"
      :mask-closable="false"
      :scrollable="true"
      title="续租租赁信息填写"
    >
      <Form
        ref="formValidate2"
        :model="formValidate2"
        :rules="ruleValidate2"
        :label-width="130"
      >

        <FormItem
          label="所属办公楼:"
          prop="buildingName"
        >
          <Select
            v-model="formValidate2.buildingName"
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
            v-model="formValidate2.roomNumber"
            style="width:200px"
            transfer:true
          >
            <Option
              v-for="item in selectRoomNumberContinue(roomDataContinue)"
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
            v-model="formValidate2.owner"
          />
        </FormItem>
        <FormItem
          label="租赁期数"
          prop="rentNumber"
        >
          <Select
            v-model="formValidate2.rentNumber"
            style="width:200px"
            transfer:true
          >
            <Option
              v-for="item in rentNumber"
              :value="item"
              :key="item"
            >{{ item }}</Option>
          </Select>
        </FormItem>

        <!-- 首期 -->
        <FormItem
          label="租金单价(元/月/平米):"
          prop="unitPrice1"
        >
          <Input
            clearable
            v-model="formValidate2.unitPrice1"
          />
        </FormItem>

        <FormItem
          label="租期周期(月):"
          prop="period1"
        >
          <Input
            clearable
            v-model="formValidate2.period1"
          />
        </FormItem>

        <FormItem
          label="租期应付总额:"
          prop="rentCost1"
        >
          <p>{{getrentCost(formValidate2.unitPrice1,formValidate2.period1,formValidate2,roomDataContinue)}}元</p>

        </FormItem>

        <FormItem
          label="租期应付物业费:"
          prop="propertyFee1"
        >

          <p>{{getPropertyFee(formValidate2.period1,formValidate2,roomDataContinue)}}元</p>

        </FormItem>

        <FormItem
          label="能耗公摊(元):"
          prop="energySharing1"
        >
          <Input
            clearable
            v-model="formValidate2.energySharing1"
          />
        </FormItem>

        <FormItem
          label="租费合计:"
          prop="totalCost1"
        >
          <p>{{gettotalCost(formValidate2,formValidate2.rentCost1,formValidate2.propertyFee1,formValidate2.energySharing1)}}元</p>

        </FormItem>

      </Form>
      <!-- 确定取消框 -->
      <div slot="footer">
        <Button
          type="text"
          size="large"
          @click="handleResetContinue('formValidate2')"
        >取消</Button>
        <Button
          type="primary"
          size="large"
          @click="handleSubmitContinue('formValidate2')"
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
        slot="rentPeriod"
      >
        <Input
          type="text"
          v-model="editRentPeriod"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentPeriod }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="startRentTime"
      >
        <Input
          type="text"
          v-model="editStartRentTime"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.startRentTime }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="endRentTime"
      >
        <Input
          type="text"
          v-model="editEndRentTime"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.endRentTime }}</span>
      </template>
      <!-- 首期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitPrice1"
      >
        <Input
          type="text"
          v-model="editunitPrice1"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitPrice1 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="period1"
      >
        <Input
          type="text"
          v-model="editperiod1"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.period1 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentCost1"
      >
        <Input
          type="text"
          v-model="editRentCost1"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentCost1 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFee1"
      >
        <Input
          type="text"
          v-model="editPropertyFee1"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFee1 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharing1"
      >
        <Input
          type="text"
          v-model="editEnergySharing1"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharing1 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalCost1"
      >
        <Input
          type="text"
          v-model="edittotalCost1"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalCost1 }}</span>
      </template>

      <!-- 第2期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitPrice2"
      >
        <Input
          type="text"
          v-model="editunitPrice2"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitPrice2 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="period2"
      >
        <Input
          type="text"
          v-model="editperiod2"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.period2 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentCost2"
      >
        <Input
          type="text"
          v-model="editRentCost2"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentCost2 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFee2"
      >
        <Input
          type="text"
          v-model="editPropertyFee2"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFee2 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharing2"
      >
        <Input
          type="text"
          v-model="editEnergySharing2"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharing2 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalCost2"
      >
        <Input
          type="text"
          v-model="edittotalCost2"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalCost2 }}</span>
      </template>

      <!-- 第3期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitPrice3"
      >
        <Input
          type="text"
          v-model="editunitPrice3"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitPrice3 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="period3"
      >
        <Input
          type="text"
          v-model="editperiod3"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.period3 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentCost3"
      >
        <Input
          type="text"
          v-model="editRentCost3"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentCost3 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFee3"
      >
        <Input
          type="text"
          v-model="editPropertyFee3"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFee3 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharing3"
      >
        <Input
          type="text"
          v-model="editEnergySharing3"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharing3 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalCost3"
      >
        <Input
          type="text"
          v-model="edittotalCost3"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalCost3 }}</span>
      </template>

      <!-- 第4期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitPrice4"
      >
        <Input
          type="text"
          v-model="editunitPrice4"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitPrice4 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="period4"
      >
        <Input
          type="text"
          v-model="editperiod4"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.period4 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentCost4"
      >
        <Input
          type="text"
          v-model="editRentCost4"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentCost4 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFee4"
      >
        <Input
          type="text"
          v-model="editPropertyFee4"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFee4 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharing4"
      >
        <Input
          type="text"
          v-model="editEnergySharing4"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharing4 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalCost4"
      >
        <Input
          type="text"
          v-model="edittotalCost4"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalCost4 }}</span>
      </template>

      <!-- 第5期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitPrice5"
      >
        <Input
          type="text"
          v-model="editunitPrice5"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitPrice5 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="period5"
      >
        <Input
          type="text"
          v-model="editperiod5"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.period5 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentCost5"
      >
        <Input
          type="text"
          v-model="editRentCost5"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentCost5 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFee5"
      >
        <Input
          type="text"
          v-model="editPropertyFee5"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFee5 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharing5"
      >
        <Input
          type="text"
          v-model="editEnergySharing5"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharing5 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalCost5"
      >
        <Input
          type="text"
          v-model="edittotalCost5"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalCost5 }}</span>
      </template>

      <!-- 第6期 -->
      <template
        slot-scope="{ row, index }"
        slot="unitPrice6"
      >
        <Input
          type="text"
          v-model="editunitPrice6"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.unitPrice6 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="period6"
      >
        <Input
          type="text"
          v-model="editperiod6"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.period6 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentCost6"
      >
        <Input
          type="text"
          v-model="editRentCost6"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentCost6 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="propertyFee6"
      >
        <Input
          type="text"
          v-model="editPropertyFee6"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.propertyFee6 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="energySharing6"
      >
        <Input
          type="text"
          v-model="editEnergySharing6"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.energySharing6 }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="totalCost6"
      >
        <Input
          type="text"
          v-model="edittotalCost6"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.totalCost6 }}</span>
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
        slot="isPayFirst"
      >
        <Input
          type="text"
          v-model="editIsPayFirstRent"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.isPayFirst }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="isPaySecond"
      >
        <Input
          type="text"
          v-model="editIsPaySecondRent"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.isPaySecond }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentCount"
      >
        <Input
          type="text"
          v-model="editRentalUnits"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentCount }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="yearTurnoverRange"
      >
        <Input
          type="text"
          v-model="editAnnualTurnoverInterval"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.yearTurnoverRange }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="dayAverageRange"
      >
        <Input
          type="text"
          v-model="editDailyQuantityInterval"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.dayAverageRange }}</span>
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
    return {
      roomDataContinue: [], // 存储已有租赁信息
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
      editRentPeriod: "",
      editStartRentTime: "",
      editEndRentTime: "",
      editunitPrice1: "",
      editperiod1: "",
      editRentCost1: "",
      editPropertyFee1: "",
      editEnergySharing1: "",
      edittotalCost1: "",
      editunitPrice2: "",
      editperiod2: "",
      editRentCost2: "",
      editPropertyFee2: "",
      editEnergySharing2: "",
      edittotalCost2: "",
      editunitPrice3: "",
      editperiod3: "",
      editRentCost3: "",
      editPropertyFee3: "",
      editEnergySharing3: "",
      edittotalCost3: "",
      editunitPrice4: "",
      editperiod4: "",
      editRentCost4: "",
      editPropertyFee4: "",
      editEnergySharing4: "",
      edittotalCost4: "",
      editunitPrice5: "",
      editperiod5: "",
      editRentCost5: "",
      editPropertyFee5: "",
      editEnergySharing5: "",
      edittotalCost5: "",
      editunitPrice6: "",
      editperiod6: "",
      editRentCost6: "",
      editPropertyFee6: "",
      editEnergySharing6: "",
      edittotalCost6: "",
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
          key: "rentPeriod",
          width: 165,
          align: "center",
          slot: "rentPeriod"
        },

        {
          title: "起租期",
          key: "startRentTime",
          width: 165,
          align: "center",
          slot: "startRentTime"
        },

        {
          title: "终止期",
          key: "endRentTime",
          width: 165,
          align: "center",
          slot: "endRentTime"
        },
        // 首期
        {
          title: "首期租金单价",
          key: "unitPrice1",
          width: 165,
          align: "center",
          slot: "unitPrice1"
        },
        {
          title: "首期租期周期",
          key: "period1",
          width: 165,
          align: "center",
          slot: "period1"
        },
        {
          title: "首期租期应付总额",
          key: "rentCost1",
          width: 165,
          align: "center",
          slot: "rentCost1"
        },
        {
          title: "首期租期应付物业费",
          key: "propertyFee1",
          width: 165,
          align: "center",
          slot: "propertyFee1"
        },
        {
          title: "首期能耗公摊",
          key: "energySharing1",
          width: 165,
          align: "center",
          slot: "energySharing1"
        },
        {
          title: "首期租费合计",
          key: "totalCost1",
          width: 165,
          align: "center",
          slot: "totalCost1"
        },
        // 第2期
        {
          title: "第2期租金单价",
          key: "unitPrice2",
          width: 165,
          align: "center",
          slot: "unitPrice2"
        },
        {
          title: "第2期租期周期",
          key: "period2",
          width: 165,
          align: "center",
          slot: "period2"
        },
        {
          title: "第2期租期应付总额",
          key: "rentCost2",
          width: 165,
          align: "center",
          slot: "rentCost2"
        },
        {
          title: "第2期租期应付物业费",
          key: "propertyFee2",
          width: 165,
          align: "center",
          slot: "propertyFee2"
        },
        {
          title: "第2期能耗公摊",
          key: "energySharing2",
          width: 165,
          align: "center",
          slot: "energySharing2"
        },
        {
          title: "第2期租费合计",
          key: "totalCost2",
          width: 165,
          align: "center",
          slot: "totalCost2"
        },
        // 第3期
        {
          title: "第3期租金单价",
          key: "unitPrice3",
          width: 165,
          align: "center",
          slot: "unitPrice3"
        },
        {
          title: "第3期租期周期",
          key: "period3",
          width: 165,
          align: "center",
          slot: "period3"
        },
        {
          title: "第3期租期应付总额",
          key: "rentCost3",
          width: 165,
          align: "center",
          slot: "rentCost3"
        },
        {
          title: "第3期租期应付物业费",
          key: "propertyFee3",
          width: 165,
          align: "center",
          slot: "propertyFee3"
        },
        {
          title: "第3期能耗公摊",
          key: "energySharing3",
          width: 165,
          align: "center",
          slot: "energySharing3"
        },
        {
          title: "第3期租费合计",
          key: "totalCost3",
          width: 165,
          align: "center",
          slot: "totalCost3"
        },
        // 第4期
        {
          title: "第4期租金单价",
          key: "unitPrice4",
          width: 165,
          align: "center",
          slot: "unitPrice4"
        },
        {
          title: "第4期租期周期",
          key: "period4",
          width: 165,
          align: "center",
          slot: "period4"
        },
        {
          title: "第4期租期应付总额",
          key: "rentCost4",
          width: 165,
          align: "center",
          slot: "rentCost4"
        },
        {
          title: "第4期租期应付物业费",
          key: "propertyFee4",
          width: 165,
          align: "center",
          slot: "propertyFee4"
        },
        {
          title: "第4期能耗公摊",
          key: "energySharing4",
          width: 165,
          align: "center",
          slot: "energySharing4"
        },
        {
          title: "第4期租费合计",
          key: "totalCost4",
          width: 165,
          align: "center",
          slot: "totalCost4"
        },
        // 第5期
        {
          title: "第5期租金单价",
          key: "unitPrice5",
          width: 165,
          align: "center",
          slot: "unitPrice5"
        },
        {
          title: "第5期租期周期",
          key: "period5",
          width: 165,
          align: "center",
          slot: "period5"
        },
        {
          title: "第5期租期应付总额",
          key: "rentCost5",
          width: 165,
          align: "center",
          slot: "rentCost5"
        },
        {
          title: "第5期租期应付物业费",
          key: "propertyFee5",
          width: 165,
          align: "center",
          slot: "propertyFee5"
        },
        {
          title: "第5期能耗公摊",
          key: "energySharing5",
          width: 165,
          align: "center",
          slot: "energySharing5"
        },
        {
          title: "第5期租费合计",
          key: "totalCost5",
          width: 165,
          align: "center",
          slot: "totalCost5"
        },
        // 第6期
        {
          title: "第6期租金单价",
          key: "unitPrice6",
          width: 165,
          align: "center",
          slot: "unitPrice6"
        },
        {
          title: "第6期租期周期",
          key: "period6",
          width: 165,
          align: "center",
          slot: "period6"
        },
        {
          title: "第6期租期应付总额",
          key: "rentCost6",
          width: 165,
          align: "center",
          slot: "rentCost6"
        },
        {
          title: "第6期租期应付物业费",
          key: "propertyFee6",
          width: 165,
          align: "center",
          slot: "propertyFee6"
        },
        {
          title: "第6期能耗公摊",
          key: "energySharing6",
          width: 165,
          align: "center",
          slot: "energySharing6"
        },
        {
          title: "第6期租费合计",
          key: "totalCost6",
          width: 165,
          align: "center",
          slot: "totalCost6"
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
          key: "isPayFirst",
          width: 165,
          align: "center",
          slot: "isPayFirst"
        },
        {
          title: "第二年租金是否支付",
          key: "isPaySecond",
          width: 165,
          align: "center",
          slot: "isPaySecond"
        },
        {
          title: "出租单元数",
          key: "rentCount",
          width: 165,
          align: "center",
          slot: "rentCount"
        },
        {
          title: "年成交额区间",
          key: "yearTurnoverRange",
          width: 120,
          align: "center",
          slot: "yearTurnoverRange"
        },
        {
          title: "日均单量区间",
          key: "dayAverageRange",
          width: 165,
          align: "center",
          slot: "dayAverageRange"
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
      settingData: "",

      // excel模板数据格式
      historyDataSaveModel: [
        {
          owner: "",
          roomNumber: "",
          buildingName: "",
          depositOnContracts: "",
          rentPeriod: "",
          startRentTime: "",
          endRentTime: "",
          unitPrice1: "",
          period1: "",
          rentCost1: "",
          propertyFee1: "",
          energySharing1: "",
          totalCost1: "",
          unitPrice2: "",
          period2: "",
          rentCost2: "",
          propertyFee2: "",
          energySharing2: "",
          totalCost2: "",
          unitPrice3: "",
          period3: "",
          rentCost3: "",
          propertyFee3: "",
          energySharing3: "",
          totalCost3: "",
          unitPrice4: "",
          period4: "",
          rentCost4: "",
          propertyFee4: "",
          energySharing4: "",
          totalCost4: "",
          unitPrice5: "",
          period5: "",
          rentCost5: "",
          propertyFee5: "",
          energySharing5: "",
          totalCost5: "",
          unitPrice6: "",
          period6: "",
          rentCost6: "",
          propertyFee6: "",
          energySharing6: "",
          totalCost6: "",
          isPayBond: "",
          isPayFirst: "",
          isPaySecond: "",
          rentCount: "",
          yearTurnoverRange: "",
          dayAverageRange: "",
          register: ""
        }
      ],
      // 修改时原数据暂存
      historyDataSave: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        depositOnContracts: "",
        rentPeriod: "",
        startRentTime: "",
        endRentTime: "",
        unitPrice1: "",
        period1: "",
        rentCost1: "",
        propertyFee1: "",
        energySharing1: "",
        totalCost1: "",
        unitPrice2: "",
        period2: "",
        rentCost2: "",
        propertyFee2: "",
        energySharing2: "",
        totalCost2: "",
        unitPrice3: "",
        period3: "",
        rentCost3: "",
        propertyFee3: "",
        energySharing3: "",
        totalCost3: "",
        unitPrice4: "",
        period4: "",
        rentCost4: "",
        propertyFee4: "",
        energySharing4: "",
        totalCost4: "",
        unitPrice5: "",
        period5: "",
        rentCost5: "",
        propertyFee5: "",
        energySharing5: "",
        totalCost5: "",
        unitPrice6: "",
        period6: "",
        rentCost6: "",
        propertyFee6: "",
        energySharing6: "",
        totalCost6: "",
        isPayBond: "",
        isPayFirst: "",
        isPaySecond: "",
        rentCount: "",
        yearTurnoverRange: "",
        dayAverageRange: "",
        register: ""
      },
      // 表单数据设置
      formValidate: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        depositOnContracts: "",
        rentPeriod: "",
        startRentTime: "",
        endRentTime: "",
        unitPrice1: "",
        period1: "",
        rentCost1: "",
        propertyFee1: "",
        energySharing1: "",
        totalCost1: "",
        isPayBond: "",
        isPayFirst: "",
        isPaySecond: "",
        rentCount: "",
        yearTurnoverRange: "",
        dayAverageRange: "",
        register: "",
        insertTime: ""
      },
      formValidate2: {
        owner: "",
        roomNumber: "",
        buildingName: "",
        rentNumber: "",
        unitPrice1: "",
        period1: "",
        rentCost1: "",
        propertyFee1: "",
        energySharing1: "",
        totalCost1: "",
        updateTime: ""
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
        rentPeriod: [
          {
            required: true,
            message: "租期不得为空",
            trigger: "blur"
          }
        ],
        // 六期填写不需要验证
        isPayBond: [
          {
            required: true,
            message: "请选择保证金是否支付",
            trigger: "change"
          }
        ],
        isPayFirst: [
          {
            required: true,
            message: "请选择首年租金是否支付",
            trigger: "change"
          }
        ],
        isPaySecond: [
          {
            required: true,
            message: "请选择第二年租金是否支付",
            trigger: "change"
          }
        ],
        rentCount: [
          {
            required: true,
            message: "出租单元数不得为空",
            trigger: "blur"
          }
        ],
        yearTurnoverRange: [
          {
            required: true,
            message: "年成交额区间不得为空",
            trigger: "blur"
          }
        ],
        dayAverageRange: [
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
      },
      ruleValidate2: {
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
        rentNumber: [
          {
            required: true,
            message: "租期期数不得为空",
            trigger: "blur"
          }
        ]
      },
      // 租赁期数数据
      rentNumber: ["第2期", "第3期", "第4期", "第5期", "第6期"]
    };
  },
  mounted() {
    this.getRequestData(this.pageCurrent);
    this.getBuildingData();
    this.getRoomData();
    this.getSettingData();
    this.getAllLease();
  },

  methods: {
    // 查询数据***
    searchData(value) {
      this.searchBuildingName = value;
      this.pageCurrent = 1;
      this.getRequestData(this.pageCurrent);
    },
    // 级联选择房间号-首租
    selectRoomNumber(roomData) {
      let numberData = [];
      for (var key in roomData) {
        if (roomData[key].buildingName == this.formValidate.buildingName) {
          numberData.push(roomData[key]);
        }
      }
      return numberData;
    },
    // 级联选择房间号-续租
    selectRoomNumberContinue(roomDataContinue) {
      let numberData = [];
      for (var key in roomDataContinue) {
        if (
          roomDataContinue[key].buildingName == this.formValidate2.buildingName
        ) {
          numberData.push(roomDataContinue[key]);
        }
      }
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
        }
      } else {
        if (dt1.getDate() - d1 + d2 >= moreDay) {
          range += 1;
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
        this.formValidate.rentPeriod != "" ||
        this.formValidate.rentPeriod != null ||
        this.formValidate.rentPeriod != undefined
      ) {
        this.formValidate.endRentTime = this.addMonth(
          date,
          parseInt(this.formValidate.rentPeriod)
        );
      }
      this.formValidate.startRentTime = date;
    },
    // 选择终止期,自动更新租期
    selectEndDate(date) {
      this.formValidate.rentPeriod = this.getDaterange(
        this.formValidate.startRentTime,
        date
      );
      this.formValidate.endRentTime = date;
    },
    // 计算租费合计，租费+物业费+能耗公摊
    gettotalCost(formValidate, rentCost, propertyFee, energySharing) {
      let sum = 0;

      if (
        rentCost != undefined &&
        propertyFee != undefined &&
        energySharing != undefined
      ) {
        let num1 = parseFloat(rentCost);
        let num2 = parseFloat(propertyFee);
        let num3 = parseFloat(energySharing);
        sum = num1 + num2 + num3;
        formValidate.totalCost1 = sum;
      }

      return sum;
    },
    // 计算租期应付物业费，周期*单价*计租面积
    getPropertyFee(period, formValidate, roomData) {
      let sum = 0;
      if (period != undefined) {
        // 1.找到Room的计租面积
        let rentArea = 0;
        for (var key in roomData) {
          if (
            roomData[key].roomNumber == formValidate.roomNumber &&
            roomData[key].buildingName == formValidate.buildingName
          ) {
            rentArea = parseFloat(roomData[key].rentArea);
          }
        }
        // 2.找到Setting的管理单价
        let money = parseFloat(this.settingData);
        // 3.当管理单价和计租面积都不为空时计算
        if (rentArea != 0 && money != 0) {
          sum = parseFloat(period) * money * rentArea;
          formValidate.propertyFee1 = sum;
        }
      }

      return sum;
    },
    // 计算租期应付总额，周期*租金*计租面积
    getrentCost(unitPrice, period, formValidate, roomData) {
      let sum = 0;
      if (unitPrice != undefined && period != undefined) {
        // 1.先找到Room的计租面积
        let rentArea = 0;
        for (var key in roomData) {
          if (
            roomData[key].roomNumber == formValidate.roomNumber &&
            roomData[key].buildingName == formValidate.buildingName
          ) {
            rentArea = parseFloat(roomData[key].rentArea);
          }
        }
        // 2.当计租面积不为空的时候才计算
        if (rentArea != 0) {
          sum = parseFloat(unitPrice) * parseFloat(period) * rentArea;
          formValidate.rentCost1 = sum;
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
        excelData[key].startRentTime = excelData[key].起租期;
        excelData[key].endRentTime = excelData[key].终止期;
        excelData[key].rentPeriod = excelData[key].租期;

        excelData[key].unitPrice1 = excelData[key].首期租金单价;
        excelData[key].period1 = excelData[key].首期租期周期;
        excelData[key].rentCost1 = excelData[key].首期租期应付总额;
        excelData[key].propertyFee1 = excelData[key].首期租期应付物业费;
        excelData[key].energySharing1 = excelData[key].首期能耗公摊;
        excelData[key].totalCost1 = excelData[key].首期租费合计;

        excelData[key].unitPrice2 = excelData[key].第2期租金单价;
        excelData[key].period2 = excelData[key].第2期租期周期;
        excelData[key].rentCost2 = excelData[key].第2期租期应付总额;
        excelData[key].propertyFee2 = excelData[key].第2期租期应付物业费;
        excelData[key].energySharing2 = excelData[key].第2期能耗公摊;
        excelData[key].totalCost2 = excelData[key].第2期租费合计;

        excelData[key].unitPrice3 = excelData[key].第3期租金单价;
        excelData[key].period3 = excelData[key].第3期租期周期;
        excelData[key].rentCost3 = excelData[key].第3期租期应付总额;
        excelData[key].propertyFee3 = excelData[key].第3期租期应付物业费;
        excelData[key].energySharing3 = excelData[key].第3期能耗公摊;
        excelData[key].totalCost3 = excelData[key].第3期租费合计;

        excelData[key].unitPrice4 = excelData[key].第4期租金单价;
        excelData[key].period4 = excelData[key].第4期租期周期;
        excelData[key].rentCost4 = excelData[key].第4期租期应付总额;
        excelData[key].propertyFee4 = excelData[key].第4期租期应付物业费;
        excelData[key].energySharing4 = excelData[key].第4期能耗公摊;
        excelData[key].totalCost4 = excelData[key].第4期租费合计;

        excelData[key].unitPrice5 = excelData[key].第5期租金单价;
        excelData[key].period5 = excelData[key].第5期租期周期;
        excelData[key].rentCost5 = excelData[key].第5期租期应付总额;
        excelData[key].propertyFee5 = excelData[key].第5期租期应付物业费;
        excelData[key].energySharing5 = excelData[key].第5期能耗公摊;
        excelData[key].totalCost5 = excelData[key].第5期租费合计;

        excelData[key].unitPrice6 = excelData[key].第6期租金单价;
        excelData[key].period6 = excelData[key].第6期租期周期;
        excelData[key].rentCost6 = excelData[key].第6期租期应付总额;
        excelData[key].propertyFee6 = excelData[key].第6期租期应付物业费;
        excelData[key].energySharing6 = excelData[key].第6期能耗公摊;
        excelData[key].totalCost6 = excelData[key].第6期租费合计;

        excelData[key].isPayBond = excelData[key].保证金是否支付;
        excelData[key].isPayFirst = excelData[key].首年租金是否支付;
        excelData[key].isPaySecond = excelData[key].第二年租金是否支付;
        excelData[key].rentCount = excelData[key].出租单元数;
        excelData[key].yearTurnoverRange = excelData[key].年成交额区间;
        excelData[key].dayAverageRange = excelData[key].日均单量区间;
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
        excelData[key].startRentTime == "" ||
        excelData[key].startRentTime == null ||
        excelData[key].startRentTime == undefined ||
        excelData[key].endRentTime == "" ||
        excelData[key].endRentTime == null ||
        excelData[key].endRentTime == undefined ||
        excelData[key].rentPeriod == "" ||
        excelData[key].rentPeriod == null ||
        excelData[key].rentPeriod == undefined ||
        excelData[key].isPayBond == "" ||
        excelData[key].isPayBond == null ||
        excelData[key].isPayBond == undefined ||
        excelData[key].isPayFirst == "" ||
        excelData[key].isPayFirst == null ||
        excelData[key].isPayFirst == undefined ||
        excelData[key].isPaySecond == "" ||
        excelData[key].isPaySecond == null ||
        excelData[key].isPaySecond == undefined ||
        excelData[key].rentCount == "" ||
        excelData[key].rentCount == null ||
        excelData[key].rentCount == undefined ||
        excelData[key].yearTurnoverRange == "" ||
        excelData[key].yearTurnoverRange == null ||
        excelData[key].yearTurnoverRange == undefined ||
        excelData[key].dayAverageRange == "" ||
        excelData[key].dayAverageRange == null ||
        excelData[key].dayAverageRange == undefined ||
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
            if (response.data == 0) {
              _this.$Message.error("未知原因，导入失败");
            } else if (response.data == -1) {
              _this.$Message.error("导入失败，表内无数据");
            } else if (response.data == -2) {
              _this.$Message.error("导入失败，数据全部存在");
            } else {
              if (response.data == excelData.length) {
                _this.$Message.success("导入成功");
              } else if (response.data < excelData.length) {
                let num = excelData.length - response.data;
                _this.$Message.info(num + "条数据因重复而未导入");
              }
              _this.getRequestData(_this.pageCurrent);
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
            "rentPeriod",
            "startRentTime",
            "endRentTime",
            "unitPrice1",
            "period1",
            "rentCost1",
            "propertyFee1",
            "energySharing1",
            "totalCost1",
            "unitPrice2",
            "period2",
            "rentCost2",
            "propertyFee2",
            "energySharing2",
            "totalCost2",
            "unitPrice3",
            "period3",
            "rentCost3",
            "propertyFee3",
            "energySharing3",
            "totalCost3",
            "unitPrice4",
            "period4",
            "rentCost4",
            "propertyFee4",
            "energySharing4",
            "totalCost4",
            "unitPrice5",
            "period5",
            "rentCost5",
            "propertyFee5",
            "energySharing5",
            "totalCost5",
            "unitPrice6",
            "period6",
            "rentCost6",
            "propertyFee6",
            "energySharing6",
            "totalCost6",
            "isPayBond",
            "isPayFirst",
            "isPaySecond",
            "rentCount",
            "yearTurnoverRange",
            "dayAverageRange",
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
            "rentPeriod",
            "startRentTime",
            "endRentTime",
            "unitPrice1",
            "period1",
            "rentCost1",
            "propertyFee1",
            "energySharing1",
            "totalCost1",
            "unitPrice2",
            "period2",
            "rentCost2",
            "propertyFee2",
            "energySharing2",
            "totalCost2",
            "unitPrice3",
            "period3",
            "rentCost3",
            "propertyFee3",
            "energySharing3",
            "totalCost3",
            "unitPrice4",
            "period4",
            "rentCost4",
            "propertyFee4",
            "energySharing4",
            "totalCost4",
            "unitPrice5",
            "period5",
            "rentCost5",
            "propertyFee5",
            "energySharing5",
            "totalCost5",
            "unitPrice6",
            "period6",
            "rentCost6",
            "propertyFee6",
            "energySharing6",
            "totalCost6",
            "isPayBond",
            "isPayFirst",
            "isPaySecond",
            "rentCount",
            "yearTurnoverRange",
            "dayAverageRange",
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
      this.$Message.info("功能暂定");
    },
    // handleEdit(row, index) {
    //   //
    //   this.editOwner = row.owner;
    //   this.editRoomNumber = row.roomNumber;
    //   this.editBuildingName = row.buildingName;
    //   this.editDepositOnContracts = row.depositOnContracts;
    //   this.editRentPeriod = row.rentPeriod;
    //   this.editStartRentTime = row.startRentTime;
    //   this.editEndRentTime = row.endRentTime;
    //   this.editunitPrice1 = row.unitPrice1;
    //   this.editperiod1 = row.period1;
    //   this.editRentCost1 = row.rentCost1;
    //   this.editPropertyFee1 = row.propertyFee1;
    //   this.editEnergySharing1 = row.energySharing1;
    //   this.edittotalCost1 = row.totalCost1;
    //   this.editunitPrice2 = row.unitPrice2;
    //   this.editperiod2 = row.period2;
    //   this.editRentCost2 = row.rentCost2;
    //   this.editPropertyFee2 = row.propertyFee2;
    //   this.editEnergySharing2 = row.energySharing2;
    //   this.edittotalCost2 = row.totalCost2;
    //   this.editunitPrice3 = row.unitPrice3;
    //   this.editperiod3 = row.period3;
    //   this.editRentCost3 = row.rentCost3;
    //   this.editPropertyFee3 = row.propertyFee3;
    //   this.editEnergySharing3 = row.energySharing3;
    //   this.edittotalCost3 = row.totalCost3;
    //   this.editunitPrice4 = row.unitPrice4;
    //   this.editperiod4 = row.period4;
    //   this.editRentCost4 = row.rentCost4;
    //   this.editPropertyFee4 = row.propertyFee4;
    //   this.editEnergySharing4 = row.energySharing4;
    //   this.edittotalCost4 = row.totalCost4;
    //   this.editunitPrice5 = row.unitPrice5;
    //   this.editperiod5 = row.period5;
    //   this.editRentCost5 = row.rentCost5;
    //   this.editPropertyFee5 = row.propertyFee5;
    //   this.editEnergySharing5 = row.energySharing5;
    //   this.edittotalCost5 = row.totalCost5;
    //   this.editunitPrice6 = row.unitPrice6;
    //   this.editperiod6 = row.period6;
    //   this.editRentCost6 = row.rentCost6;
    //   this.editPropertyFee6 = row.propertyFee6;
    //   this.editEnergySharing6 = row.energySharing6;
    //   this.edittotalCost6 = row.totalCost6;
    //   this.editIsPayBond = row.isPayBond;
    //   this.editIsPayFirst = row.isPayFirst;
    //   this.editIsPaySecondRent = row.isPaySecond;
    //   this.editRentalUnits = row.rentCount;
    //   this.editAnnualTurnoverInterval = row.yearTurnoverRange;
    //   this.editDailyQuantityInterval = row.dayAverageRange;
    //   this.editRegister = row.register;
    //   // 把当前行数记录
    //   this.editIndex = index;
    // },

    // 取消修改记录
    handleCancel(index) {
      // 数据恢复
      this.editOwner = this.historyData[index].owner;
      this.editRoomNumber = this.historyData[index].roomNumber;
      this.editBuildingName = this.historyData[index].buildingName;
      this.editDepositOnContracts = this.historyData[index].depositOnContracts;
      this.editRentPeriod = this.historyData[index].rentPeriod;
      this.editStartRentTime = this.historyData[index].startRentTime;
      this.editEndRentTime = this.historyData[index].endRentTime;
      this.editunitPrice1 = this.historyData[index].unitPrice1;
      this.editperiod1 = this.historyData[index].period1;
      this.editRentCost1 = this.historyData[index].rentCost1;
      this.editPropertyFee1 = this.historyData[index].propertyFee1;
      this.editEnergySharing1 = this.historyData[index].energySharing1;
      this.edittotalCost1 = this.historyData[index].totalCost1;
      this.editunitPrice2 = this.historyData[index].unitPrice2;
      this.editperiod2 = this.historyData[index].period2;
      this.editRentCost2 = this.historyData[index].rentCost2;
      this.editPropertyFee2 = this.historyData[index].propertyFee2;
      this.editEnergySharing2 = this.historyData[index].energySharing2;
      this.edittotalCost2 = this.historyData[index].totalCost2;
      this.editunitPrice3 = this.historyData[index].unitPrice3;
      this.editperiod3 = this.historyData[index].period3;
      this.editRentCost3 = this.historyData[index].rentCost3;
      this.editPropertyFee3 = this.historyData[index].propertyFee3;
      this.editEnergySharing3 = this.historyData[index].energySharing3;
      this.edittotalCost3 = this.historyData[index].totalCost3;
      this.editunitPrice4 = this.historyData[index].unitPrice4;
      this.editperiod4 = this.historyData[index].period4;
      this.editRentCost4 = this.historyData[index].rentCost4;
      this.editPropertyFee4 = this.historyData[index].propertyFee4;
      this.editEnergySharing4 = this.historyData[index].energySharing4;
      this.edittotalCost4 = this.historyData[index].totalCost4;
      this.editunitPrice5 = this.historyData[index].unitPrice5;
      this.editperiod5 = this.historyData[index].period5;
      this.editRentCost5 = this.historyData[index].rentCost5;
      this.editPropertyFee5 = this.historyData[index].propertyFee5;
      this.editEnergySharing5 = this.historyData[index].energySharing5;
      this.edittotalCost5 = this.historyData[index].totalCost5;
      this.editunitPrice6 = this.historyData[index].unitPrice6;
      this.editperiod6 = this.historyData[index].period6;
      this.editRentCost6 = this.historyData[index].rentCost6;
      this.editPropertyFee6 = this.historyData[index].propertyFee6;
      this.editEnergySharing6 = this.historyData[index].energySharing6;
      this.edittotalCost6 = this.historyData[index].totalCost6;
      this.editIsPayBond = this.historyData[index].isPayBond;
      this.editIsPayFirstRent = this.historyData[index].isPayFirst;
      this.editIsPaySecondRent = this.historyData[index].isPaySecond;
      this.editRentalUnits = this.historyData[index].rentCount;
      this.editAnnualTurnoverInterval = this.historyData[
        index
      ].yearTurnoverRange;
      this.editDailyQuantityInterval = this.historyData[index].dayAverageRange;
      this.editRegister = this.historyData[index].register;

      // 把行数恢复默认值
      this.editIndex = -1;
    },

    // 保存数据
    handleSave(index) {
      this.$Message.info("功能暂定");
    },
    // handleSave(index) {
    //   let _this = this;
    //   let _data = this.historyDataSave;

    //   // 向后台发送数据
    //   this.historyData[index].owner = this.editOwner;
    //   this.historyData[index].roomNumber = this.editRoomNumber;
    //   this.historyData[index].buildingName = this.editBuildingName;
    //   this.historyData[index].depositOnContracts = this.editDepositOnContracts;
    //   this.historyData[index].rentPeriod = this.editRentPeriod;
    //   this.historyData[index].startRentTime = this.editStartRentTime;
    //   this.historyData[index].endRentTime = this.editEndRentTime;
    //   this.historyData[index].unitPrice1 = this.editunitPrice1;
    //   this.historyData[index].period1 = this.editperiod1;
    //   this.historyData[index].rentCost1 = this.editRentCost1;
    //   this.historyData[index].propertyFee1 = this.editPropertyFee1;
    //   this.historyData[index].energySharing1 = this.editEnergySharing1;
    //   this.historyData[index].totalCost1 = this.edittotalCost1;
    //   this.historyData[index].unitPrice2 = this.editunitPrice2;
    //   this.historyData[index].period2 = this.editperiod2;
    //   this.historyData[index].rentCost2 = this.editRentCost2;
    //   this.historyData[index].propertyFee2 = this.editPropertyFee2;
    //   this.historyData[index].energySharing2 = this.editEnergySharing2;
    //   this.historyData[index].totalCost2 = this.edittotalCost2;
    //   this.historyData[index].unitPrice3 = this.editunitPrice3;
    //   this.historyData[index].period3 = this.editperiod3;
    //   this.historyData[index].rentCost3 = this.editRentCost3;
    //   this.historyData[index].propertyFee3 = this.editPropertyFee3;
    //   this.historyData[index].energySharing3 = this.editEnergySharing3;
    //   this.historyData[index].totalCost3 = this.edittotalCost3;
    //   this.historyData[index].unitPrice4 = this.editunitPrice4;
    //   this.historyData[index].period4 = this.editperiod4;
    //   this.historyData[index].rentCost4 = this.editRentCost4;
    //   this.historyData[index].propertyFee4 = this.editPropertyFee4;
    //   this.historyData[index].energySharing4 = this.editEnergySharing4;
    //   this.historyData[index].totalCost4 = this.edittotalCost4;
    //   this.historyData[index].unitPrice5 = this.editunitPrice5;
    //   this.historyData[index].period5 = this.editperiod5;
    //   this.historyData[index].rentCost5 = this.editRentCost5;
    //   this.historyData[index].propertyFee5 = this.editPropertyFee5;
    //   this.historyData[index].energySharing5 = this.editEnergySharing5;
    //   this.historyData[index].totalCost5 = this.edittotalCost5;
    //   this.historyData[index].unitPrice6 = this.editunitPrice6;
    //   this.historyData[index].period6 = this.editperiod6;
    //   this.historyData[index].rentCost6 = this.editRentCost6;
    //   this.historyData[index].propertyFee6 = this.editPropertyFee6;
    //   this.historyData[index].energySharing6 = this.editEnergySharing6;
    //   this.historyData[index].totalCost6 = this.edittotalCost6;
    //   this.historyData[index].isPayBond = this.editIsPayBond;
    //   this.historyData[index].isPayFirst = this.editIsPayFirstRent;
    //   this.historyData[index].isPaySecond = this.editIsPaySecondRent;
    //   this.historyData[index].rentCount = this.editRentalUnits;
    //   this.historyData[
    //     index
    //   ].yearTurnoverRange = this.editAnnualTurnoverInterval;
    //   this.historyData[index].dayAverageRange = this.editDailyQuantityInterval;
    //   this.historyData[index].register = this.editRegister;

    //   if (
    //     this.historyData[index].roomNumber == "" ||
    //     this.historyData[index].roomNumber == null ||
    //     this.historyData[index].roomNumber == undefined ||
    //     this.historyData[index].buildingName == "" ||
    //     this.historyData[index].buildingName == null ||
    //     this.historyData[index].buildingName == undefined ||
    //     this.historyData[index].owner == "" ||
    //     this.historyData[index].owner == null ||
    //     this.historyData[index].owner == undefined ||
    //     this.historyData[index].depositOnContracts == "" ||
    //     this.historyData[index].depositOnContracts == null ||
    //     this.historyData[index].depositOnContracts == undefined ||
    //     this.historyData[index].startRentTime == "" ||
    //     this.historyData[index].startRentTime == null ||
    //     this.historyData[index].startRentTime == undefined ||
    //     this.historyData[index].endRentTime == "" ||
    //     this.historyData[index].endRentTime == null ||
    //     this.historyData[index].endRentTime == undefined ||
    //     this.historyData[index].rentPeriod == "" ||
    //     this.historyData[index].rentPeriod == null ||
    //     this.historyData[index].rentPeriod == undefined ||
    //     this.historyData[index].isPayBond == "" ||
    //     this.historyData[index].isPayBond == null ||
    //     this.historyData[index].isPayBond == undefined ||
    //     this.historyData[index].isPayFirst == "" ||
    //     this.historyData[index].isPayFirst == null ||
    //     this.historyData[index].isPayFirst == undefined ||
    //     this.historyData[index].isPaySecond == "" ||
    //     this.historyData[index].isPaySecond == null ||
    //     this.historyData[index].isPaySecond == undefined ||
    //     this.historyData[index].rentCount == "" ||
    //     this.historyData[index].rentCount == null ||
    //     this.historyData[index].rentCount == undefined ||
    //     this.historyData[index].yearTurnoverRange == "" ||
    //     this.historyData[index].yearTurnoverRange == null ||
    //     this.historyData[index].yearTurnoverRange == undefined ||
    //     this.historyData[index].dayAverageRange == "" ||
    //     this.historyData[index].dayAverageRange == null ||
    //     this.historyData[index].dayAverageRange == undefined ||
    //     this.historyData[index].register == "" ||
    //     this.historyData[index].register == null ||
    //     this.historyData[index].register == undefined
    //   ) {
    //     this.$Message.error("有内容未填写");
    //   } else {
    //     _data = this.historyData[index];
    //     _data.updateTime = this.getFormatDate();
    //     axios
    //       .request({
    //         url: "/lease/updateLeaseList",
    //         method: "post",
    //         headers: {
    //           "Content-Type": "application/json;charset=UTF-8"
    //         },
    //         data: _data
    //       })
    //       .then(function(response) {
    //         if (response.data == 1) {
    //           _this.$Message.success("保存成功");
    //           _this.getRequestData(_this.pageCurrent);
    //         } else {
    //           _this.$Message.error("保存失败");
    //         }
    //       });
    //     this.editIndex = -1;
    //   }
    // },

    // 确认提交首期租赁数据
    handleSubmitFirst(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 开始向后台发送数据
          let _this = this;
          this.formValidate.insertTime = this.getFormatDate();
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
          this.isFirstRent = false;
        }
      });
    },

    // 确认提交第n期租赁数据
    handleSubmitContinue(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 开始向后台发送数据
          let _this = this;
          let _data = this.formValidate2;
          _data.updateTime = this.getFormatDate();
          axios
            .request({
              url: "/lease/insertLeaseListContinue",
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
          this.isContinueRent = false;
        }
      });
    },

    // 首租页面点击取消
    handleResetFirst(name) {
      this.$refs[name].resetFields();
      this.isFirstRent = false;
    },

    // 续租页面点击取消
    handleResetContinue(name) {
      this.$refs[name].resetFields();
      this.isContinueRent = false;
    },

    // 从后台获取表格数据
    getRequestData(index) {
      let _this = this;
      this.pageStart = (index - 1) * this.pageSize;
      axios
        .request({
          url: "/lease/getSearchList",
          method: "get",
          params: {
            search: this.searchBuildingName,
            dataStart: this.pageStart,
            dataSize: this.pageSize
          }
        })
        .then(function(response) {
          _this.historyData = response.data.leaseList;
          _this.pageData = _this.historyData;
          _this.dataCount = response.data.dataCount;
        });
    },

    // 从后台获取办公楼数据
    getBuildingData() {
      let _this = this;
      axios
        .request({
          url: "/lease/getBuildingList",
          method: "get"
        })
        .then(function(response) {
          _this.buildingData = response.data;
        });
    },

    // 从后台获取空闲办公室数据
    getRoomData() {
      let _this = this;
      axios
        .request({
          url: "/lease/getEmptyRoomList",
          method: "get"
        })
        .then(function(response) {
          _this.roomData = response.data;
        });
    },

    // 从后台获取已租办公室信息
    getAllLease() {
      let _this = this;
      axios
        .request({
          url: "/lease/getContinueRoomList",
          method: "get"
        })
        .then(function(response) {
          _this.roomDataContinue = response.data;
        });
    },

    // 从后台获取系统设置数据
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
  }
};
</script>

<style lang="scss" scoped>
</style>
