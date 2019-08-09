<template>
  <div>
    <!-- 系统设置表格显示 -->
    <Table size="large" border :columns="settingColumns" :data="settingData">
      <template slot-scope="{ row, index }" slot="rentUnitPrice">
        <Input type="text" v-model="editRentUnitPrice" v-if="editIndex === index" />
        <span v-else>{{ row.rentUnitPrice }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="manageExpense">
        <Input type="text" v-model="editManageExpense" v-if="editIndex === index" />
        <span v-else>{{ row.manageExpense }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button type="primary" style="margin-right: 5px" @click="handleSave(index)">保存</Button>
          <Button type="error" @click="editIndex = -1">取消</Button>
        </div>
        <div v-else>
          <Button type="primary" style="margin-right: 5px" @click="handleEdit(row, index)">修改</Button>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
import axios from "@/libs/api.request";
export default {
  data() {
    return {
      editIndex: -1, // 当前聚焦的输入框的行数
      editRentUnitPrice: "",
      editManageExpense: "",
      settingColumns: [
        {
          title: "租金单价(元/月*㎡)",
          key: "rentUnitPrice",
          slot: "rentUnitPrice",
          align: "center"
        },
        {
          title: "管理费(元/月*㎡)",
          key: "manageExpense",
          slot: "manageExpense",
          align: "center"
        },
        {
          title: "操作",
          width: 200,
          align: "center",
          slot: "action"
        }
      ],
      settingData: []
    };
  },
  methods: {
    handleEdit(row, index) {
      this.editRentUnitPrice = row.rentUnitPrice;
      this.editManageExpense = row.manageExpense;
      this.editIndex = index;
    },
    handleSave(index) {
      this.$Message.success("Success!");
      this.settingData[index].rentUnitPrice = this.editRentUnitPrice;
      this.settingData[index].manageExpense = this.editManageExpense;

      let _this = this;
      let _data = this.settingData[index];
      axios
        .request({
          url: "/setting/updateSettingList",
          method: "post",
          headers: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          data: _data
        })
        .then(function(response) {
          console.log(response);
          _this.settingData = response.data;
        });
      this.editIndex = -1;
    },
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
    }
  },
  mounted() {
    this.getSettingData();
  }
};
</script>
<style lang="scss" scoped>
</style>