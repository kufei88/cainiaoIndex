<template>
  <div>
    <!-- 搜索 -->
    <Input
      search
      enter-button
      placeholder="请输入公司名"
      @on-search="getSearchCount"
      v-model="souActivePage.name"
      style="width: 300px;float:left"
    />
    <Button type="primary" style="float:right;margin-left:10px">新增活动</Button>
    <div style="clear:both"></div>
    <!-- 意向客户表格展示 -->
    <Table
      border
      :columns="souActiveColumns"
      :data="souActiveData"
      ref="activeTable"
      :height="tableHeight"
    >
    </Table>
    <!-- 记录展示信息总条数 -->
    <span>记录总共 {{souActiveCounts}} 条</span>
    <!-- 分页 -->
    <Page
      :total="souActiveCounts"
      show-sizer
      @on-change="handlePage"
      @on-page-size-change="handlePageSize"
      :page-size-opts="[10,20,50,100]"
      :current="souActivePage.startPage"
      align="center"
    />
  </div>
</template>
<style>
.ivu-table .table-join {
  background-color: #33ff00;
  color: #33ff00;
}
.ivu-table .table-nojoin {
  background-color: #ffffff;
  color: #ffffff;
}
</style>
<script>
import axios from '@/libs/api.request'
import excel from '@/libs/excel'
export default {
  data () {
    return {
      tableHeight: 0,
      showTableData: [],
      souActiveCounts: 0, // 合同总条数
      souActiveData: [], // 合同信息
      souActivePage: {
        name: '', // 搜索信息
        startPage: 1, // 页码
        pageSize: 10 // 当前页显示的信息条数
      },

      souActiveColumns: [
        {
          type: 'index',
          width: 60,
          align: 'center',
          fixed: 'left',
          indexMethod (row) {
            return row._index + 1 + (row.pageCurrent - 1) * row.pageSize
          }
        },
        {
          title: '公司名',
          fixed: 'left',
          key: 'companyName',
          width: 120
        },
        {
          title: '活动1',
          key: 'active1',
        },
        {
          title: '活动2',
          key: 'active2',
        },
        {
          title: '活动3',
          key: 'active3',
        },
        {
          title: '活动4',
          key: 'active4',
        },
        {
          title: '活动5',
          key: 'active5',
        },
        {
          title: '活动6',
          key: 'active6',
        },
        {
          title: '活动7',
          key: 'active7',
        },
        {
          title: '活动8',
          key: 'active8',
        },
        {
          title: '活动9',
          key: 'active9',
        },
        {
          title: '活动10',
          key: 'active10',
        },
        {
          title: '活动11',
          key: 'active11',
        },
        {
          title: '活动12',
          key: 'active12',
        },
      ]
    }
  },
  methods: {
      // 搜索
    getSearchCount () {
      this.souActivePage.startPage = 1
      this.getsouActiveCount()
    },
    // 获取客户信息总条数
    getsouActiveCount () {
      let _this = this
      axios
        .request({
          url: 'Active/getActiveCount',
          method: 'get',
          params: _this.souActivePage
        })
        .then(function (response) {
          _this.souActiveCounts = response.data
          _this.getsouActiveList()
        })
    },
    // 获取客户信息
    getsouActiveList () {
      let _this = this
      axios
        .request({
          url: 'Active/getActiveList',
          method: 'get',
          params: _this.souActivePage
        })
        .then(function (response) {
          _this.souActiveData = response.data
          _this.addPageCurrentAndPageSize(_this.souActiveData)
        })
    },
    // 换页
    handlePage (val) {
      this.souActivePage.startPage = val
      this.getsouActiveList()
    },
    // 更换每页显示条数
    handlePageSize (val) {
      this.souActivePage.startPage = 1
      this.souActivePage.pageSize = val
      this.getsouActiveList()
    },
    addPageCurrentAndPageSize (updatePageData) {
      for (var key in updatePageData) {
        updatePageData[key].cellClassName={};
        updatePageData[key].pageCurrent = this.souActivePage.startPage;
        updatePageData[key].pageSize = this.souActivePage.pageSize;
        for(var k in updatePageData[key]){
          if(!updatePageData[key][k]&&k!="id"&&k!="companyName"&&k!="pageCurrent"&&k!="pageSize"&&k!="cellClassName")
          {
            this.$set(updatePageData[key].cellClassName, k.toString(), "table-nojoin")
          }
          if(updatePageData[key][k]&&k!="id"&&k!="companyName"&&k!="pageCurrent"&&k!="pageSize"&&k!="cellClassName")
          {
            this.$set(updatePageData[key].cellClassName, k.toString(), "table-join")
          }
        }
      }
    }
  },
  mounted () {
    this.getsouActiveCount(),
    this.tableHeight = window.innerHeight - this.$refs.activeTable.$el.offsetTop - 75
  }
}
</script>
<style lang="scss" scoped>
</style>
