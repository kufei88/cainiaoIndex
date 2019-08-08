<!--  -->
<template>
  <div>
    <Button>新增</Button>
    <Table :columns="buildingColumns" :data="buildingData"></Table>
  </div>
</template>

<script>
import axios from "@/libs/api.request";
export default {
  data() {
    return {
      buildingColumns: [
        { title: "楼号", key: "buildingNumber" },
        { title: "名称", key: "buildingName" }
      ],
      buildingData: []
    };
  },

  components: {},

  computed: {},

  mounted() {
    this.getBuildingData();
  },

  methods: {
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
    }
  }
};
</script>
<style lang='scss' scoped>
</style>
