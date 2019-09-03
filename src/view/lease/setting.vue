<template>
  <div class="settingBorder">
    <div class="settingItem">
      <div>
        <span>管理单价(元/月/平米)：</span>
        <input
          v-model="historyData[0].manageExpense"
          v-if="isSetState==true"
          type="text"
        />
        <span v-else>{{historyData[0].manageExpense}}</span>
        <span> 元</span>
      </div>

    </div>
    <div class="footerButton">
      <div v-if="isSetState==false">
        <Button
          type="primary"
          size="large"
          @click="isSetState=true"
        >修改设置</Button>
      </div>
      <div v-else>
        <Button
          type="text"
          size="large"
          @click="isSetState=false"
        >取消</Button>
        <Button
          type="primary"
          size="large"
          @click="handleSubmit"
        >确定</Button>
      </div>

    </div>
  </div>

</template>

<script>
import axios from "@/libs/api.request";
export default {
  data() {
    return {
      isSetState: false, // 是否修改设置
      historyData: [
        {
          manageExpense: 0
        }
      ] // 后台数据存储
    };
  },
  mounted() {
    this.getHistoryData();
  },
  methods: {
    handleSubmit() {
      this.$Message.success("保存成功！");
      let _this = this;
      let _data = this.historyData[0];
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
          _this.historyData = response.data;
        });
      this.isSetState = false;
    },
    // 从后台获取设置数据
    getHistoryData() {
      let _this = this;
      axios
        .request({
          url: "/setting/getSettingList",
          method: "get"
        })
        .then(function(response) {
          _this.historyData = response.data;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.settingBorder {
  width: 100%;
  height: 580px;
  font-size: 24px;
  .settingItem {
    width: 70%;
    margin: 0 auto;
    text-align: left;
  }
  .footerButton {
    width: 70%;
    margin: 0 auto;
    text-align: center;
    button {
      margin: 10px;
    }
  }
}
</style>