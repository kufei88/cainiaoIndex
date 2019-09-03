<template>
  <div>
      <Modal
      :closable="false"
      v-model="isAddNewData"
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

        <!-- 第2期 -->
        <FormItem
          label="第2期租金单价(元/月/平米):"
          prop="unitRentTwo"
        >
          <Input
            clearable
            v-model="formValidate.unitRentTwo"
          />
        </FormItem>

        <FormItem
          label="第2期租期周期(月):"
          prop="leasePeriodTwo"
        >
          <Input
            clearable
            v-model="formValidate.leasePeriodTwo"
          />
        </FormItem>

        <FormItem
          label="第2期租期应付总额:"
          prop="totalAmountTwo"
        >
          <p>{{getTotalAmount(formValidate.unitRentTwo,formValidate.leasePeriodTwo,2)}}元</p>

        </FormItem>

        <FormItem
          label="第2期租期应付物业费:"
          prop="propertyFeeTwo"
        >
          <p>{{getPropertyFee(formValidate.leasePeriodTwo,2)}}元</p>

        </FormItem>

        <FormItem
          label="第2期能耗公摊(元):"
          prop="energySharingTwo"
        >
          <Input
            clearable
            v-model="formValidate.energySharingTwo"
          />
        </FormItem>

        <FormItem
          label="第2期租费合计:"
          prop="totalRentTwo"
        >
          <p>{{getTotalRent(formValidate.totalAmountTwo,formValidate.propertyFeeTwo,formValidate.energySharingTwo,2)}}元</p>

        </FormItem>

        <!-- 第3期 -->
        <FormItem
          label="第3期租金单价(元/月/平米):"
          prop="unitRentThree"
        >
          <Input
            clearable
            v-model="formValidate.unitRentThree"
          />
        </FormItem>

        <FormItem
          label="第3期租期周期(月):"
          prop="leasePeriodThree"
        >
          <Input
            clearable
            v-model="formValidate.leasePeriodThree"
          />
        </FormItem>

        <FormItem
          label="第3期租期应付总额:"
          prop="totalAmountThree"
        >
          <p>{{getTotalAmount(formValidate.unitRentThree,formValidate.leasePeriodThree,3)}}元</p>

        </FormItem>

        <FormItem
          label="第3期租期应付物业费:"
          prop="propertyFeeThree"
        >
          <p>{{getPropertyFee(formValidate.leasePeriodThree,3)}}元</p>

        </FormItem>

        <FormItem
          label="第3期能耗公摊(元):"
          prop="energySharingThree"
        >
          <Input
            clearable
            v-model="formValidate.energySharingThree"
          />
        </FormItem>

        <FormItem
          label="第3期租费合计:"
          prop="totalRentThree"
        >
          <p>{{getTotalRent(formValidate.totalAmountThree,formValidate.propertyFeeThree,formValidate.energySharingThree,3)}}元</p>

        </FormItem>

        <!-- 第4期 -->
        <FormItem
          label="第4期租金单价(元/月/平米):"
          prop="unitRentFour"
        >
          <Input
            clearable
            v-model="formValidate.unitRentFour"
          />
        </FormItem>

        <FormItem
          label="第4期租期周期(月):"
          prop="leasePeriodFour"
        >
          <Input
            clearable
            v-model="formValidate.leasePeriodFour"
          />
        </FormItem>

        <FormItem
          label="第4期租期应付总额:"
          prop="totalAmountFour"
        >
          <p>{{getTotalAmount(formValidate.unitRentFour,formValidate.leasePeriodFour,4)}}元</p>

        </FormItem>

        <FormItem
          label="第4期租期应付物业费:"
          prop="propertyFeeFour"
        >
          <p>{{getPropertyFee(formValidate.leasePeriodFour,4)}}元</p>

        </FormItem>

        <FormItem
          label="第4期能耗公摊(元):"
          prop="energySharingFour"
        >
          <Input
            clearable
            v-model="formValidate.energySharingFour"
          />
        </FormItem>

        <FormItem
          label="第4期租费合计:"
          prop="totalRentFour"
        >
          <p>{{getTotalRent(formValidate.totalAmountFour,formValidate.propertyFeeFour,formValidate.energySharingFour,4)}}元</p>

        </FormItem>

        <!-- 第5期 -->
        <FormItem
          label="第5期租金单价(元/月/平米):"
          prop="unitRentFive"
        >
          <Input
            clearable
            v-model="formValidate.unitRentFive"
          />
        </FormItem>

        <FormItem
          label="第5期租期周期(月):"
          prop="leasePeriodFive"
        >
          <Input
            clearable
            v-model="formValidate.leasePeriodFive"
          />
        </FormItem>

        <FormItem
          label="第5期租期应付总额:"
          prop="totalAmountFive"
        >
          <p>{{getTotalAmount(formValidate.unitRentFive,formValidate.leasePeriodFive,5)}}元</p>

        </FormItem>

        <FormItem
          label="第5期租期应付物业费:"
          prop="propertyFeeFive"
        >
          <p>{{getPropertyFee(formValidate.leasePeriodFive,5)}}元</p>

        </FormItem>

        <FormItem
          label="第5期能耗公摊(元):"
          prop="energySharingFive"
        >
          <Input
            clearable
            v-model="formValidate.energySharingFive"
          />
        </FormItem>

        <FormItem
          label="第5期租费合计:"
          prop="totalRentFive"
        >
          <p>{{getTotalRent(formValidate.totalAmountFive,formValidate.propertyFeeFive,formValidate.energySharingFive,5)}}元</p>

        </FormItem>

        <!-- 第6期 -->
        <FormItem
          label="第6期租金单价(元/月/平米):"
          prop="unitRentSix"
        >
          <Input
            clearable
            v-model="formValidate.unitRentSix"
          />
        </FormItem>

        <FormItem
          label="第6期租期周期(月):"
          prop="leasePeriodSix"
        >
          <Input
            clearable
            v-model="formValidate.leasePeriodSix"
          />
        </FormItem>

        <FormItem
          label="第6期租期应付总额:"
          prop="totalAmountSix"
        >
          <p>{{getTotalAmount(formValidate.unitRentSix,formValidate.leasePeriodSix,6)}}元</p>

        </FormItem>

        <FormItem
          label="第6期租期应付物业费:"
          prop="propertyFeeSix"
        >
          <p>{{getPropertyFee(formValidate.leasePeriodSix,6)}}元</p>

        </FormItem>

        <FormItem
          label="第6期能耗公摊(元):"
          prop="energySharingSix"
        >
          <Input
            clearable
            v-model="formValidate.energySharingSix"
          />
        </FormItem>

        <FormItem
          label="第6期租费合计:"
          prop="totalRentSix"
        >
          <p>{{getTotalRent(formValidate.totalAmountSix,formValidate.propertyFeeSix,formValidate.energySharingSix,6)}}元</p>

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
          @click="handleReset('formValidate')"
        >取消</Button>
        <Button
          type="primary"
          size="large"
          @click="handleSubmit('formValidate')"
        >确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {
    };
  },
  methods: {},
  mounted() {},
  watch: {},
  computed: {},
  created() {}
};
</script>
<style lang="scss" scoped>
</style>