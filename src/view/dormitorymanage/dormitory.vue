<template>
    <Table :columns="dormitoryColumns" :data="dormitoryData">
        <template slot-scope="{ row, index }" slot="id">
        <Input type="text" v-model="dormitoryData[index].id" v-if="editIndex === index" />
        <span v-else>{{ row.id }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="dormitoryName">
        <Input type="text" v-model="dormitoryData[index].dormitoryName" v-if="editIndex === index" />
        <span v-else>{{ row.dormitoryName }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="money">
        <Input type="text" v-model="dormitoryData[index].money" v-if="editIndex === index" />
        <span v-else>{{ row.money }}</span>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button>保存</Button>
          <Button>取消</Button>
        </div>
        <div v-else>
          <Button @click="clk()">操作</Button>
        </div>
      </template>
    </Table>
</template>
<script>
import axios from "@/libs/api.request";
export default {
  data() {
    return {
      dormitoryColumns: [
        { title: "楼号", slot: "id", key: "id" },
        { title: "名称", slot: "dormitoryName", key: "dormitoryName" },
        { title: "每月租金", slot: "money", key: "money" },
      ],
      editIndex: -1,
      dormitoryData: []
    };
  },

  components: {},

  computed: {},

  mounted() {
    this.getdormitoryData();
    
  },

  methods: {
    clk(){console.log(this.dormitoryData);},
    getdormitoryData() {
      let _this = this;
      axios
        .request({
          url: "/Dormitory/getDormitoryList",
          method: "get"
        })
        .then(function(response) {
          _this.dormitoryData = response.data;
        });
    }
  }
};
</script>