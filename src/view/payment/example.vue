<template>
  <div ref="dom">

  </div>
  <!-- <Button @click="show">显示</Button> -->
</template>

<script>
import echarts from "echarts";
import { on, off } from "@/libs/tools";
export default {
  name: "serviceRequests",
  props: ["exampleData"] /*通过props接收父组件传递过来的数据 */,
  data() {
    return {
      dom: null,
      waterData: [],
      electricityData: []
    };
  },
  methods: {
    resize() {
      this.dom.resize();
    }
  },
  mounted() {
    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985"
          }
        }
      },
      grid: {
        top: "3%",
        left: "1.2%",
        right: "2%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          // data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
          data: this.exampleData.timeData
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "水表读数",
          type: "line",
          stack: "总量",
          areaStyle: {
            normal: {
              color: "#2d8cf0"
            }
          },
          // data: [120, 132, 101, 134]
          data: this.exampleData.waterData
        },
        {
          name: "电表读数",
          type: "line",
          stack: "总量",
          areaStyle: {
            normal: {
              color: "#10A6FF"
            }
          },
          // data: [257, 358, 278, 234]
          data: this.exampleData.electricityData
        }
      ]
    };
    this.$nextTick(() => {
      this.dom = echarts.init(this.$refs.dom);
      this.dom.setOption(option);
      on(window, "resize", this.resize);
    });
  },
  beforeDestroy() {
    off(window, "resize", this.resize);
  },
  init() {}
};
</script>
