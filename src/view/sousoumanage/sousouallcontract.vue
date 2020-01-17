<template>
  <div>
    <!-- 搜索 -->
    <Input
      search
      enter-button
      placeholder="请输入公司名"
      @on-search="getSearchCount"
      v-model="souContractPage.name"
      style="width: 300px;float:left"
    />
    <Button type="primary" @click="showAddContract()" style="float:right;margin-left:10px">新增客户</Button>
    <Button type="primary" style="float:right;margin-left:10px" @click="showXuYue()">续约</Button>
    <Button type="primary" @click="showDetail()" style="float:right">合同详情</Button>
    <!-- 过期合同按钮 -->
    <Button type="primary" @click="getDeleteCount()" style="float:right;margin-left:10px">到期合同</Button>
    <!-- 未到期合同 -->
    <Button type="primary" @click="getBeforCount()" style="float:right;margin-left:10px">未到期合同</Button>
    <div style="clear:both"></div>
    <!-- 意向客户表格展示 -->
    <Table
      border
      :row-class-name="rowClassName"
      :columns="souContractColumns"
      highlight-row
      :data="souContractData"
      ref="contractTable"
      height="540"
      @on-row-click="currentChange"
    >
      <!-- 公司名 -->
      <template slot-scope="{ row, index }" slot="companyName">
        <span>{{ souContractData[index].companyName }}</span>
      </template>
      <!-- 学号 -->
      <template slot-scope="{ row, index }" slot="sno">
        <span>{{ souContractData[index].sno }}</span>
      </template>
      <!-- 合同起始日 -->
      <template slot-scope="{ row, index }" slot="htStartTime">
        <span>{{ souContractData[index].htStartTime }}</span>
      </template>
      <!-- 合同截止日 -->
      <template slot-scope="{ row, index }" slot="htEndTime">
        <span>{{ souContractData[index].htEndTime }}</span>
      </template>
      <!-- 缴费金额 -->
      <template slot-scope="{ row, index }" slot="payment">
        <span>{{ souContractData[index].payment }}</span>
      </template>
      <!-- 标签 -->
      <template slot-scope="{ row, index }" slot="tag">
        <span>{{ souContractData[index].tag }}</span>
      </template>
      <!-- 经营方式 -->
      <template slot-scope="{ row, index }" slot="jyFangShi">
        <span>{{ souContractData[index].jyFangShi }}</span>
      </template>
      <!-- 产品品牌 -->
      <template slot-scope="{ row, index }" slot="pingPai">
        <span>{{ souContractData[index].pingPai }}</span>
      </template>
      <!-- 运营团队人数 -->
      <template slot-scope="{ row, index }" slot="teamSize">
        <span>{{ souContractData[index].teamSize }}</span>
      </template>
      <!-- 招租负责人 -->
      <template slot-scope="{ row, index }" slot="zsFuZeRen">
        <span>{{ souContractData[index].zsFuZeRen }}</span>
      </template>
      <!-- 优势备注 -->
      <template slot-scope="{ row, index }" slot="advantage">
        <Input
          type="text"
          v-model="editdata.advantage"
          @on-focus="editContext"
          v-if="editIndex === index"
        />
        <Tooltip v-else max-width="200">
          <div slot="content">
            <span>{{ row.advantage }}</span>
          </div>
          <span>{{showOtherLess(souContractData[index].advantage)}}</span>
        </Tooltip>
      </template>
      <!-- 录入时间 -->
      <template slot-scope="{ row, index }" slot="createTime">
        <span>{{ souContractData[index].createTime }}</span>
      </template>
      <!-- 操作 -->
      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button type="primary" style="margin-right: 5px" @click="saveEdit(editdata)">保存</Button>
          <Button type="error" @click="cancelEdit()">取消</Button>
        </div>
        <div v-else>
          <Button type="primary" style="margin-right: 5px" @click="handleEdit(row, index)">修改</Button>
          <Button type="error" @click="deleteSouHt(row)">到期</Button>
        </div>
      </template>
    </Table>
    <!-- 记录展示信息总条数 -->
    <span>记录总共 {{souContractCounts}} 条</span>
    <!-- 分页 -->
    <Page
      :total="souContractCounts"
      show-sizer
      @on-change="handlePage"
      @on-page-size-change="handlePageSize"
      :page-size-opts="[10,20,50,100]"
      :current="souContractPage.startPage"
      align="center"
    />
    <!-- 修改优势信息弹框 -->
    <Modal
      width="40"
      :closable="false"
      v-model="isEditAdvantage"
      :mask-closable="false"
      :scrollable="true"
      title="修改优势信息"
    >
      <Input
        v-model="editdata.advantage"
        :maxlength="250"
        show-word-limit
        type="textarea"
        :rows="7"
      />
      <div slot="footer">
        <Button type="text" size="large" @click="cancelContext()">取消</Button>
        <Button type="primary" size="large" @click="saveContext()">确定</Button>
      </div>
    </Modal>
    <!-- 新增客户对话框 -->
    <Modal v-model="isAddContract" title="新增客户" :mask-closable="false" @on-cancel="concelAdd()">
      <Form
        ref="addContractCustom"
        :model="addContractData"
        :rules="ruleContract"
        :label-width="100"
      >
        <FormItem label="公司名称" prop="companyName">
          <Select
            v-model="addContractData.companyName"
            style="width:300px"
            filterable
            clearable
            @on-query-change="getAllClient"
          >
            <Option
              v-for="item in clientData"
              :value="item.companyName"
              @click.native="chioce(item)"
              :key="item.id"
            >{{ item.companyName }}</Option>
          </Select>
        </FormItem>
        <FormItem label="学号" prop="sno">
          <Input type="text" v-model="addContractData.sno" />
        </FormItem>
        <FormItem label="产品品牌" prop="pingPai">
          <Input type="text" v-model="addContractData.pingPai" />
        </FormItem>
        <FormItem label="团队人数" prop="teamSize">
          <Input type="text" v-model="addContractData.teamSize" />
        </FormItem>
        <FormItem label="经营方式" prop="jyFangShi">
          <Select v-model="addContractData.jyFangShi" transfer>
            <Option
              v-for="item in jyFangShiList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="标签" prop="tag">
          <Input type="text" v-model="addContractData.tag" />
        </FormItem>
        <FormItem label="招商负责人" prop="zsFuZeRen">
          <Input type="text" v-model="addContractData.zsFuZeRen" />
        </FormItem>

        <FormItem label="开始日期" prop="htStartTime">
          <DatePicker
            type="datetime"
            format="yyyy-MM-dd"
            v-model="addContractData.htStartTime"
            @on-change="startChange"
            style="width: 200px"
          ></DatePicker>
        </FormItem>

        <FormItem label="结束日期" prop="htEndTime">
          <DatePicker
            type="datetime"
            format="yyyy-MM-dd"
            v-model="addContractData.htEndTime"
            @on-change="endChange"
            style="width: 200px"
          ></DatePicker>
        </FormItem>
        <FormItem label="缴费金额" prop="payment">
          <Input type="text" v-model="addContractData.payment" />
        </FormItem>
        <FormItem label="优势" prop="advantage">
          <Input
            v-model="addContractData.advantage"
            :maxlength="250"
            show-word-limit
            type="textarea"
            :rows="7"
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="concelAdd()">取消</Button>
        <Button type="primary" size="large" @click="pushAddContract('addContractCustom')">确定</Button>
      </div>
    </Modal>
    <!-- 新增客户对话框 -->
    <Modal v-model="isAddXuYue" title="续约" :mask-closable="false" @on-cancel="cancelXuYue()">
      <Form ref="addXuYueCustom" :model="addXuYueData" :rules="ruleXuYue" :label-width="100">
        <FormItem label="开始日期" prop="htStartTime">
          <DatePicker
            type="date"
            format="yyyy-MM-dd"
            v-model="addXuYueData.htStartTime"
            @on-change="startChange2"
            style="width: 200px"
          ></DatePicker>
        </FormItem>

        <FormItem label="结束日期" prop="htEndTime">
          <DatePicker
            type="date"
            format="yyyy-MM-dd"
            v-model="addXuYueData.htEndTime"
            @on-change="endChange2"
            style="width: 200px"
          ></DatePicker>
        </FormItem>
        <FormItem label="缴费金额" prop="payment">
          <Input type="text" v-model="addXuYueData.payment" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancelXuYue()">取消</Button>
        <Button type="primary" size="large" @click="pushAddXuYue('addXuYueCustom')">确定</Button>
      </div>
    </Modal>
    <!-- 合同详情 -->
    <Modal
      :closable="false"
      v-model="isDetailed"
      :mask-closable="false"
      :scrollable="true"
      width="75"
      title="合同详情信息"
    >
      <Divider>基本信息</Divider>

      <p style="margin-left:10%;margin-top:10px;margin-bottom:10px;display:flex;">
        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>公司名称:</strong>
          {{selectContract.companyName}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>城市:</strong>
          {{selectContract.city}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>学号:</strong>
          {{selectContract.sno}}
        </span>
      </p>
      <p style="margin-left:10%;margin-top:10px;margin-bottom:10px;display:flex;">
        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>联系人:</strong>
          {{selectContract.contactPerson}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>联系电话:</strong>
          {{selectContract.phoneNumber}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>职位:</strong>
          {{selectContract.zhiWei}}
        </span>
        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>团队人数:</strong>
          {{selectContract.teamSize}}
        </span>
      </p>
      <p style="margin-left:10%;margin-top:10px;margin-bottom:10px;display:flex;">
        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>主营平台:</strong>
          {{selectContract.pingTai}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>年销售额(万元):</strong>
          {{selectContract.sales}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>招商负责人:</strong>
          {{selectContract.zsFuZeRen}}
        </span>
      </p>
      <p style="margin-left:10%;margin-top:10px;margin-bottom:10px;display:flex;">
        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>标签:</strong>
          {{selectContract.tag}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>类目:</strong>
          {{selectContract.category}}
        </span>

        <span style="font-size:14px;margin-left:35px;flex:1">
          <strong>经营方式:</strong>
          {{selectContract.jyFangShi}}
        </span>
      </p>

      <Table
        border
        highlight-row
        :columns="showColumns"
        :data="showTableData"
        ref="showTable"
        height="250"
      >
        <template slot-scope="{ row, index }" slot="delete">
          <span>{{ showTableData[index].delete?"已到期":"未到期"}}</span>
        </template>
      </Table>

      <!-- 确定取消框 -->

      <div slot="footer">
        <Button type="primary" size="large" @click="isDetailed=false">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<style>
.ivu-table .demo-table-error-row td {
  background-color: #ff6600;
  color: #000000;
}
.ivu-table .table-overTime td {
  background-color: #ff0000;
  color: #000000;
}
</style>
<script>
import axios from '@/libs/api.request'
import excel from '@/libs/excel'
export default {
  data () {
    var tel = /^[0-9]*$/
    var validateCompanyName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('公司名称不能为空'))
      } else {
        callback()
      }
    }
    var validateZsFuZeRen = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('招商负责人不能为空'))
      } else {
        callback()
      }
    }
    var validateTag = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('标签不能为空'))
      } else {
        callback()
      }
    }
    var validateTeamSize = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('团队人数不能为空'))
      } else if (!tel.test(value)) {
        callback(new Error('请输入正确的格式'))
      } else {
        callback()
      }
    }
    var validateJyFangShi = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('经营方式不能为空'))
      } else {
        callback()
      }
    }
    var validatePingPai = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('产品品牌不能为空'))
      } else {
        callback()
      }
    }
    var validateSno = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('学号不能为空'))
      } else {
        callback()
      }
    }
    var validatePaymeny = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('缴费金额不能为空'))
      } else if (!tel.test(value)) {
        callback(new Error('请输入正确的缴费金额'))
      } else {
        callback()
      }
    }
    var validateStartTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('起始日期不能为空'))
      } else {
        callback()
      }
    }
    var validateEndTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('截至日期不能为空'))
      } else {
        callback()
      }
    }
    return {
      showIndex: -1,
      showTableData: [],
      isDetailed: false, // 合同详情弹框标识
      isAddXuYue: false, // 续约弹框标识
      isEditAdvantage: false, // 优势备注修改是否弹出
      isAddContract: false, // 是否弹出新增合同对话框
      isSelect: false, // 是否已经选择合同
      clientData: [], // 意向客户信息
      editIndex: -1,
      selectContract: {}, // 选中行信息
      souContractCounts: 0, // 合同总条数
      souContractData: [], // 合同信息
      year: '', // 年
      month: '', // 月
      day: '', // 日
      editdata: {
        sno: '', // 学号
        advantage: '' // 优势
      },
      souContractPage: {
        name: '', // 搜索信息
        startPage: 1, // 页码
        pageSize: 10, // 当前页显示的信息条数
        isDelete: false
      },
      // 新增表单验证规则匹配与触发条件
      ruleContract: {
        companyName: [{ validator: validateCompanyName, trigger: 'onchange' }], // 公司名匹配
        tag: [{ validator: validateTag, trigger: 'blur' }], // 标签匹配
        zsFuZeRen: [{ validator: validateZsFuZeRen, trigger: 'blur' }], // 标签匹配
        payment: [{ validator: validatePaymeny, trigger: 'blur' }], // 缴费金额匹配
        sno: [{ validator: validateSno, trigger: 'blur' }], // 学号匹配
        teamSize: [{ validator: validateTeamSize, trigger: 'blur' }], // 团队人数匹配
        pingPai: [{ validator: validatePingPai, trigger: 'blur' }], // 产品品牌匹配
        jyFangShi: [{ validator: validateJyFangShi, trigger: 'onchange' }], // 经营方式匹配
        htStartTime: [{ validator: validateStartTime, trigger: 'blur' }], // 合同起租日匹配
        htEndTime: [{ validator: validateEndTime, trigger: 'blur' }] // 合同截止日匹配
      },
      ruleXuYue: {
        payment: [{ validator: validatePaymeny, trigger: 'blur' }], // 缴费金额匹配
        htStartTime: [{ validator: validateStartTime, trigger: 'blur' }], // 合同起租日匹配
        htEndTime: [{ validator: validateEndTime, trigger: 'blur' }] // 合同截止日匹配
      },
      addXuYueData: {
        id: '',
        zsFuZeRen: '', // 招商负责人
        companyName: '', // 公司名
        payment: '', // 缴费金额
        sno: '', // 学号
        city: '', // 城市
        contactPerson: '', // 联系人
        zhiWei: '', // 职位
        phoneNumber: '', // 联系电话
        category: '', // 类目
        pingTai: '', // 平台
        sales: '', // 销售额
        teamSize: '', // 团队人数
        pingPai: '', // 产品品牌
        jyFangShi: '', // 经营方式
        htStartTime: '', // 合同起始日
        htEndTime: '', // 合同截止日
        tag: '', // 标签
        advantage: '', // 优势
        createTime: '', // 创建时间
        lsHtEndTime: '' // 临时存放合同截至日期
      },
      // 新增数据
      addContractData: {
        zsFuZeRen: '', // 招商负责人
        companyName: '', // 公司名
        payment: '', // 缴费金额
        sno: '', // 学号
        city: '', // 城市
        contactPerson: '', // 联系人
        zhiWei: '', // 职位
        phoneNumber: '', // 联系电话
        category: '', // 类目
        pingTai: '', // 平台
        sales: '', // 销售额
        teamSize: '', // 团队人数
        pingPai: '', // 产品品牌
        jyFangShi: '', // 经营方式
        htStartTime: '', // 合同起始日
        htEndTime: '', // 合同截止日
        tag: '', // 标签
        advantage: '', // 优势
        createTime: '' // 创建时间
      },
      jyFangShiList: [
        {
          value: '自产',
          label: '自产'
        },
        {
          value: '代理',
          label: '代理'
        },
        {
          value: '贴牌加工',
          label: '贴牌加工'
        }
      ],
      showColumns: [
        {
          type: 'index',
          width: 100,
          align: 'center',
          indexMethod (row) {
            return row._index + 1
          }
        },
        {
          title: '公司名',
          key: 'companyName'
        },
        {
          title: '合同起始日',
          key: 'htStartTime'
        },
        {
          title: '合同截止日',
          key: 'htEndTime'
        },
        {
          title: '缴费金额',
          key: 'payment'
        },
        {
          title: '录入时间',
          key: 'createTime'
        },
        {
          title: '是否到期',
          slot: 'delete',
          key: 'delete'
        }
      ],
      souContractColumns: [
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
          slot: 'companyName',
          fixed: 'left',
          key: 'companyName',
          width: 120
        },
        {
          title: '学号',
          slot: 'sno',
          key: 'sno',
          width: 100
        },
        {
          title: '合同起始日',
          slot: 'htStartTime',
          key: 'htStartTime',
          width: 200
        },
        {
          title: '合同截止日',
          slot: 'htEndTime',
          key: 'htEndTime',
          width: 200
        },
        {
          title: '缴费金额',
          slot: 'payment',
          key: 'payment',
          width: 120
        },
        {
          title: '标签',
          slot: 'tag',
          key: 'tag',
          width: 120
        },
        {
          title: '经营方式',
          slot: 'jyFangShi',
          key: 'jyFangShi',
          width: 120
        },
        {
          title: '产品品牌',
          slot: 'pingPai',
          key: 'pingPai',
          width: 160
        },
        {
          title: '运营团队人数',
          slot: 'teamSize',
          key: 'teamSize',
          width: 120
        },
        {
          title: '招商负责人',
          slot: 'zsFuZeRen',
          key: 'zsFuZeRen',
          width: 160
        },
        {
          title: '优势',
          slot: 'advantage',
          key: 'advantage',
          width: 160
        },
        {
          title: '录入时间',
          slot: 'createTime',
          key: 'createTime',
          width: 200
        },
        {
          title: '操作',
          slot: 'action',
          fixed: 'right',
          width: 180,
          align: 'center'
        }
      ]
    }
  },
  methods: {
    // 获取到期期合同信息
    getDeleteCount () {
      this.ResetSelect()
      this.souContractPage.name = '',
      this.souContractPage.isDelete = true
      this.getsouContractCount()
    },
    getBeforCount () {
      this.ResetSelect()
      this.souContractPage.name = '',
      this.souContractPage.isDelete = false
      this.getsouContractCount()
    },
    // 点击到期
    deleteSouHt (row) {
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>是否确认删除该条记录？</p>',
        onOk: () => {
          this.deleteContract(row)
        },
        onCancel: () => {}
      })
    },

    deleteContract (row) {
      let _this = this
      axios
        .request({
          url: 'SouContract/deleteContract',
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: row
        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('删除成功')
            if (
              _this.souContractPage.startPage > 1 &&
              _this.souContractData.length == 1
            ) {
              _this.souContractPage.startPage -= 1
              _this.ResetSelect()
            }
            _this.getsouContractCount()
          } else {
            _this.$Message.error('删除失败')
          }
        })
    },
    // 为即将到期的合同添加颜色作为提醒
    rowClassName (row, index) {
      this.getFormatDate()
      var datearr = row.htEndTime.toString().split('-')
      var eyear = parseInt(datearr[0]) * 360
      var emonth = parseInt(datearr[1]) * 30
      var eday = parseInt(datearr[2])

      var d = (
        eyear -
        this.year +
        emonth -
        this.month +
        eday -
        this.day
      ).toString()

      if (d > 0 && d <= 30) {
        if (this.showIndex == index) {
          return ''
        } else {
          return 'demo-table-error-row'
        }
      } else if (d <= 0) {
        if (this.showIndex == index) {
          return ''
        } else {
          return 'table-overTime'
        }
      }
      return ''
    },
    // 合同详情
    showDetail () {
      let _this = this
      let sno = this.selectContract.sno
      if (this.isSelect == false) {
        this.$Message.error('请选择合同')
        return false
      }
      axios
        .request({
          url: 'SouContract/getContractBySno',
          method: 'post',
          headers: {
            'Content-Type': 'application/json' // 设置请求头请求格式为JSON
          },
          data: sno
        })
        .then(function (response) {
          _this.showTableData = response.data
          _this.isDetailed = true
        })
    },
    // 续约数据提交
    pushAddXuYue (refName) {
      this.addXuYueData.htStartTime = this.addXuYueData.lsHtEndTime
      let _this = this
      this.$refs[refName].validate(valid => {
        if (valid) {
          _this.addXuYueData.createTime = _this.getFormatDate()
          _this.insertXuYueContract(_this.addXuYueData)
        }
      })
    },
    // 插入续约合同
    insertXuYueContract (addXuYueData) {
      let _this = this
      axios
        .request({
          url: 'SouContract/insertXuYueContract',
          method: 'post',
          headers: {
            'Content-Type': 'application/json' // 设置请求头请求格式为JSON
          },
          data: addXuYueData
        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('续约成功')
            _this.isAddXuYue = false
            _this.getsouContractList()
          } else {
            _this.$Message.error('续约失败')
          }
        })
    },
    // 点击续约
    showXuYue () {
      if (this.isSelect == false) {
        this.$Message.error('请选择合同')
        return false
      }
      this.$refs['addXuYueCustom'].resetFields()
      this.addXuYueData.htStartTime = this.addXuYueData.lsHtEndTime
      this.isAddXuYue = true
    },
    // 取消续约
    cancelXuYue () {
      this.isAddXuYue = false
    },
    // 单选合同
    currentChange (currentRow, index) {
      this.showIndex = index
      this.isSelect = true
      this.selectContract = currentRow
      this.addXuYueData.id = currentRow.id
      this.addXuYueData.zsFuZeRen = currentRow.zsFuZeRen
      this.addXuYueData.pingTai = currentRow.pingTai
      this.addXuYueData.sales = currentRow.sales
      this.addXuYueData.teamSize = currentRow.teamSize
      this.addXuYueData.pingPai = currentRow.pingPai
      this.addXuYueData.jyFangShi = currentRow.jyFangShi
      this.addXuYueData.lsHtEndTime = currentRow.htEndTime
      this.addXuYueData.tag = currentRow.tag
      this.addXuYueData.advantage = currentRow.advantage
      this.addXuYueData.companyName = currentRow.companyName
      this.addXuYueData.sno = currentRow.sno
      this.addXuYueData.city = currentRow.city
      this.addXuYueData.contactPerson = currentRow.contactPerson
      this.addXuYueData.zhiWei = currentRow.zhiWei
      this.addXuYueData.phoneNumber = currentRow.phoneNumber
      this.addXuYueData.category = currentRow.category
    },
    // 提交新增信息
    pushAddContract (refName) {
      let _this = this
      this.$refs[refName].validate(valid => {
        if (valid) {
          _this.addContractData.createTime = _this.getFormatDate()
          _this.insertAddContract(_this.addContractData)
        }
      })
    },
    insertAddContract (addContractData) {
      let _this = this
      axios
        .request({
          url: 'SouContract/insertContract',
          method: 'post',
          headers: {
            'Content-Type': 'application/json' // 设置请求头请求格式为JSON
          },
          data: addContractData
        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('新增成功')
            _this.isAddContract = false
            _this.getsouContractCount()
          } else if (response.data == -1) {
            _this.$Message.error('该学号已存在')
          } else if (response.data == -2) {
            _this.$Message.error('该公司仍存在未到期合同')
          } else if (response.data == -3) {
            _this.$Message.error('当前学号与该公司学号不一致')
          } else {
            _this.$Message.error('新增失败')
          }
        })
    },
    // 选择客户获取具体信息
    chioce (client) {
      this.addContractData.sales = client.sales
      this.addContractData.pingTai = client.pingTai
      this.addContractData.contactPerson = client.contactPerson
      this.addContractData.city = client.city
      this.addContractData.zhiWei = client.zhiWei
      this.addContractData.phoneNumber = client.phoneNumber
      this.addContractData.category = client.category
      if (client.sno != null && client.sno != '' && client != undefined) {
        this.addContractData.sno = client.sno
      }
    },
    // 获取意向客户数据
    getAllClient (query) {
      let _this = this
      let name = query
      if (query != '' && query != undefined && query != null) {
        axios
          .request({
            url: 'SouSouClient/getAllClient',
            method: 'post',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            data: name
          })
          .then(function (response) {
            _this.clientData = response.data
          })
      }
    },
    // 新增窗口弹出
    showAddContract () {
      this.$refs['addContractCustom'].resetFields()
      this.resetAddContract()
      this.isAddContract = true
    },
    // 取消新增
    concelAdd () {
      this.isAddContract = false
    },
    // 起始时间格式转换
    startChange (date) {
      this.addContractData.htStartTime = date.toString()
    },
    // 结束时间格式转换
    endChange (date) {
      this.addContractData.htEndTime = date.toString()
    },
    // 续约起始时间格式转换
    startChange2 (date) {
      this.addXuYueData.htStartTime = date.toString()
    },
    // 续约结束时间格式转换
    endChange2 (date) {
      this.addXuYueData.htEndTime = date.toString()
    },
    // 修改
    handleEdit (row, index) {
      this.editIndex = index
      this.editdata.advantage = row.advantage
      this.editdata.sno = row.sno
      // console.log(row.htStartTime);
    },
    // 保存编辑验证
    saveEdit (editRow) {
      this.updataEdit()
    },
    // 更新修改
    updataEdit () {
      let _this = this
      axios
        .request({
          url: 'SouContract/updateAdvantage',
          method: 'post',
          headers: {
            'Content-Type': 'application/json' // 设置请求头请求格式为JSON
          },
          data: {
            advantage: _this.editdata.advantage,
            sno: _this.editdata.sno.toString()
          }
        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('修改成功')
            _this.getsouContractList()
          } else {
            _this.$Message.error('修改失败')
          }
        })
      _this.editIndex = -1
    },
    // 换页
    handlePage (val) {
      this.souContractPage.startPage = val
      this.getsouContractList()
      this.editIndex = -1
      this.ResetSelect()
    },
    // 更换每页显示条数
    handlePageSize (val) {
      this.souContractPage.startPage = 1
      this.souContractPage.pageSize = val
      this.editIndex = -1
      this.getsouContractList()
      this.ResetSelect()
    },
    // 取消编辑
    cancelEdit () {
      this.editIndex = -1
      this.getsouContractList()
    },
    // 确定优势信息
    saveContext () {
      this.souContractData[this.editIndex].advantage = this.editdata.advantage
      this.isEditAdvantage = false
    },
    // 取消更新优势信息
    cancelContext () {
      this.isEditAdvantage = false
      this.editdata.advantage = this.souContractData[this.editIndex].advantage
    },
    // 更新备注
    editContext (value) {
      this.isEditAdvantage = true
    },
    // 获取客户信息
    getsouContractList () {
      let _this = this
      axios
        .request({
          url: 'SouContract/getContractList',
          method: 'get',
          params: _this.souContractPage
        })
        .then(function (response) {
          _this.souContractData = response.data
          _this.addPageCurrentAndPageSize(_this.souContractData)
        })
    },
    // 搜索
    getSearchCount () {
      this.souContractPage.startPage = 1
      this.getsouContractCount()
    },
    // 获取客户信息总条数
    getsouContractCount () {
      let _this = this
      axios
        .request({
          url: 'SouContract/getContractCount',
          method: 'get',
          params: _this.souContractPage
        })
        .then(function (response) {
          _this.souContractCounts = response.data
          _this.getsouContractList()
        })
    },
    // 沟通信息省略显示
    showOtherLess (value) {
      var str = ''
      if (value != '' && value != undefined && value != null) {
        str = value.substring(0, 6)
        if (value.length > 6) {
          str += '...'
        }
      }
      return str
    },
    addPageCurrentAndPageSize (updatePageData) {
      for (var key in updatePageData) {
        updatePageData[key].pageCurrent = this.souContractPage.startPage
        updatePageData[key].pageSize = this.souContractPage.pageSize
      }
    },
    // 重置新增数据容器
    resetAddContract () {
      this.addContractData.zsFuZeRen = ''
      this.addContractData.companyName = ''
      this.addContractData.teamSize = ''
      this.addContractData.pingPai = ''
      this.addContractData.jyFangShi = ''
      this.addContractData.htStartTime = ''
      this.addContractData.htEndTime = ''
      this.addContractData.tag = ''
      this.addContractData.advantage = ''
      this.addContractData.createTime = ''
      this.addContractData.payment = ''
      this.addContractData.sno = ''
    },
    // 获取当前时间
    getFormatDate () {
      var date = new Date()
      this.year = date.getFullYear() * 360
      var month = date.getMonth() + 1
      this.month = month * 30
      var strDate = date.getDate()
      this.day = date.getDate()
      if (month >= 1 && month <= 9) {
        month = '0' + month
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate
      }
      var currentDate =
        date.getFullYear() +
        '-' +
        month +
        '-' +
        strDate +
        ' ' +
        date.getHours() +
        ':' +
        date.getMinutes() +
        ':' +
        date.getSeconds()
      return currentDate
    },
    // 清除选择
    ResetSelect () {
      this.$refs.contractTable.clearCurrentRow()
      this.showIndex = -1
      this.isSelect = false
    }
  },
  mounted () {
    this.getsouContractCount()
  }
}
</script>
<style lang="scss" scoped>
</style>
