<template>
  <div>
    <!-- 搜索 -->
    <Input
      search
      enter-button
      placeholder="请输入公司名或招商负责人名"
      @on-search="getClientCount"
      v-model="clientPage.name"
      style="width: 300px;float:left"
    />
    <!-- 新增客户按钮 -->
    <Button type="primary" @click="showAddClient()"  style="float:right">新增意向客户</Button>
    <div style="clear:both"></div>
    <!-- 意向客户表格展示 -->
    <Table border :columns="clientColumns" :data="clientData" ref="table" :height="tableHeight">
      <!-- 公司名 -->
      <template slot-scope="{ row, index }" slot="companyName">
        <span>{{ clientData[index].companyName }}</span>
      </template>
      <!-- 城市 -->
      <template slot-scope="{ row, index }" slot="city">
        <span>{{ clientData[index].city }}</span>
      </template>
      <!-- 联系人 -->
      <template slot-scope="{ row, index }" slot="contactPerson">
        <Input type="text" v-model="editdata.contactPerson" v-if="editIndex === index" />
        <span v-else>{{ clientData[index].contactPerson }}</span>
      </template>
      <!-- 职位 -->
      <template slot-scope="{ row, index }" slot="zhiWei">
        <Input type="text" v-model="editdata.zhiWei" v-if="editIndex === index" />
        <span v-else>{{ clientData[index].zhiWei }}</span>
      </template>
      <!-- 联系电话 -->
      <template slot-scope="{ row, index }" slot="phoneNumber">
        <Input type="text" v-model="editdata.phoneNumber" v-if="editIndex === index" />
        <span v-else>{{ clientData[index].phoneNumber }}</span>
      </template>
      <!-- 类目 -->
      <template slot-scope="{ row, index }" slot="category">
        <span>{{ clientData[index].category }}</span>
      </template>
      <!-- 平台 -->
      <template slot-scope="{ row, index }" slot="pingTai">
        <span>{{ clientData[index].pingTai }}</span>
      </template>
      <!-- 销售额 -->
      <template slot-scope="{ row, index }" slot="sales">
        <Input type="text" v-model="editdata.sales" v-if="editIndex === index" />
        <span v-else>{{ clientData[index].sales }}</span>
      </template>
      <!-- 招租负责人 -->
      <template slot-scope="{ row, index }" slot="zsFuZeRen">
        <Input type="text" v-model="editdata.zsFuZeRen" v-if="editIndex === index" />
        <span v-else>{{ clientData[index].zsFuZeRen }}</span>
      </template>
      <!-- 沟通详情 -->
      <template slot-scope="{ row, index }" slot="communication">
        <Input
          type="text"
          v-model="editdata.communication"
          @on-focus="editContext"
          v-if="editIndex === index"
        />
        <Tooltip v-else max-width="200">
          <div slot="content">
            <span>{{ row.communication }}</span>
          </div>
          <span>{{showOtherLess(clientData[index].communication)}}</span>
        </Tooltip>
      </template>
      <!-- 录入时间 -->
      <template slot-scope="{ row, index }" slot="createTime">
        <span>{{ clientData[index].createTime }}</span>
      </template>
      <!-- 操作 -->
      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex=== index">
          <Button type="primary" style="margin-right: 5px" @click="saveEdit(editdata)">保存</Button>
          <Button type="error" @click="cancelEdit()">取消</Button>
        </div>
        <div v-else>
          <Button type="primary" style="margin-right: 5px" @click="handleEdit(row, index)">修改</Button>
          <span v-if="row.contract==false">
          <Button type="error"  @click="handleDelete(row)">删除</Button>
          </span>
        </div>
      </template>
    </Table>
    <!-- 记录展示信息总条数 -->
    <span>记录总共 {{clientCounts}} 条</span>
    <!-- 分页 -->
    <Page
      :total="clientCounts"
      show-sizer
      @on-change="handlePage"
      @on-page-size-change="handlePageSize"
      :page-size-opts="[10,20,50,100]"
      :current="clientPage.startPage"
      align="center"
    />
    <!-- 修改沟通详情弹框 -->
    <Modal
      width="40"
      :closable="false"
      v-model="isEditCommuncation"
      :mask-closable="false"
      :scrollable="true"
      title="修改沟通信息"
    >
      <Input
        v-model="editdata.communication"
        :maxlength="250"
        show-word-limit
        type="textarea"
        :rows="7"
      />
      <div slot="footer">
        <Button type="text" size="large" @click="cancelContext()">取消</Button>
        <Button type="primary" size="large" @click="isEditCommuncation=false">确定</Button>
      </div>
    </Modal>
    <!-- 新增意向客户对话框 -->
    <Modal
      v-model="isAddClient"
      title="新增意向客户"
      :mask-closable="false"
      @on-cancel="concelAdd()"
    >
    <Form
      ref="addClientCustom"
      :model="addClientData"
      :rules="ruleCustom"
      :label-width="100"
    >
        <FormItem
          label="公司名"
          prop="companyName"
        >
          <Input
            type="text"
            v-model="addClientData.companyName"
          />
        </FormItem>

        <FormItem
          label="城市"
          prop="city"
        >
          <Input
            type="text"
            v-model="addClientData.city"
          />
        </FormItem>
        <FormItem
          label="联系人"
          prop="contactPerson"
        >
          <Input
            type="text"
            v-model="addClientData.contactPerson"
          />
        </FormItem>
        <FormItem
          label="职位"
          prop="zhiWei"
        >
          <Input
            type="text"
            v-model="addClientData.zhiWei"
          />
        </FormItem>
        <FormItem
          label="联系电话"
          prop="phoneNumber"
        >
          <Input
            type="text"
            v-model="addClientData.phoneNumber"
          />
        </FormItem>
        <FormItem
          label="类目"
          prop="category"
        >
          <Select
          v-model="addClientData.category"
          transfer
        >
          <Option
            v-for="item in categoryList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
        </FormItem>

        <FormItem
          label="平台"
          prop="pingTai"
        >
        <Input
            type="text"
            v-model="addClientData.pingTai"
          />
        </FormItem>

        <FormItem
          label="年销售额"
          prop="sales"
        >
        <Input
            type="text"
            v-model="addClientData.sales"
          />
        </FormItem>

        <FormItem
          label="招商负责人"
          prop="zsFuZeRen"
        >
        <Input
            type="text"
            v-model="addClientData.zsFuZeRen"
          />
        </FormItem>
        <FormItem
          label="沟通详情"
          prop="communication"
        >
        <Input
        v-model="addClientData.communication"
        :maxlength="250"
        show-word-limit
        type="textarea"
        :rows="7"
      />
        </FormItem>
    </Form>
    <div slot="footer">
        <Button
          type="text"
          size="large"
          @click="concelAdd()"
        >取消</Button>
        <Button
          type="primary"
          size="large"
          @click="pushAddClient('addClientCustom')"
        >确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import axios from '@/libs/api.request'
import excel from '@/libs/excel'
export default {
  data () {
    // 公司名验证规则
    var validateCompanyName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('公司名称不能为空'))
      } else {
        callback()
      }
    }
    // 城市验证规则
    var validateCity = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('城市不能为空'))
      } else {
        callback()
      }
    }
    // 联系人验证规则
    var validateContactPerson = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('联系人不能为空'))
      } else {
        callback()
      }
    }
    // 职位验证规则
    var validateZhiWei = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('职位不能为空'))
      } else {
        callback()
      }
    }
    // 联系电话验证规则
    var tel = /^1(3|4|5|7|8)\d{9}$/
    var validatePhoneNumber = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('联系电话不能为空'))
      } else if (!tel.test(value)) {
        callback(new Error('联系电话格式错误'))
      } else {
        callback()
      }
    }
    // 类目验证规则
    var validateCategory = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('类目不能为空'))
      } else {
        callback()
      }
    }
    // 平台验证规则
    var validatePingTai = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('平台不能为空'))
      } else {
        callback()
      }
    }
    // 年销售额验证规则
    var validateSales = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('年销售额不能为空'))
      } else {
        callback()
      }
    }
    // 招商负责人验证规则
    var validateZsFuZeRen = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('招商负责人不能为空'))
      } else {
        callback()
      }
    }
    return {
      // 表格高度
      tableHeight: 0,
      // 新增表单验证规则匹配与触发条件
      ruleCustom: {
        companyName: [{validator: validateCompanyName, trigger: 'blur'}], // 公司名匹配
        city: [{validator: validateCity, trigger: 'blur'}], // 城市匹配
        contactPerson: [{validator: validateContactPerson, trigger: 'blur'}], // 联系人匹配
        zhiWei: [{validator: validateZhiWei, trigger: 'blur'}], // 职位匹配
        phoneNumber: [{validator: validatePhoneNumber, trigger: 'blur'}], // 联系电话匹配
        category: [{validator: validateCategory, trigger: 'blur'}], // 类目匹配
        pingTai: [{validator: validatePingTai, trigger: 'blur'}], // 平台匹配
        sales: [{validator: validateSales, trigger: 'blur'}], // 销售额匹配
        zsFuZeRen: [{validator: validateZsFuZeRen, trigger: 'blur'}] // 招商负责人匹配
      },
      // 是否弹出添加意向客户对话框
      isAddClient: false,
      // 是否弹出编辑沟通信息的对话框
      isEditCommuncation: false,
      // 类目选择列表
      categoryList: [
        {
          value: '服装内衣',
          label: '服装内衣'
        },
        {
          value: '家居百货',
          label: '家居百货'
        },
        {
          value: '饰品',
          label: '饰品'
        },
        {
          value: '鞋包',
          label: '鞋包'
        },
        {
          value: '美妆个护',
          label: '美妆个护'
        },

        {
          value: '运动户外',
          label: '运动户外'
        },

        {
          value: '母婴玩具',
          label: '母婴玩具'
        },

        {
          value: '数码家电',
          label: '数码家电'
        },
        {
          value: '汽车配件',
          label: '汽车配件'
        },
        {
          value: '食品',
          label: '食品'
        },
        {
          value: '其他品类',
          label: '其他品类'
        }
      ],
      // 提示标签
      tagname: {
        contactPerson: '联系人', // 联系人提示标签
        zhiWei: '职位', // 职位提示标签
        phoneNumber: '联系电话', // 联系电话提示标签
        sales: '销售额', // 销售额提示标签
        zsFuZeRen: '招商负责人', // 招商负责人提示标签
        communication: '沟通详情' // 沟通详情提示标签
      },
      // 新增数据
      addClientData: {
        companyName: '', // 公司名
        city: '', // 城市
        contactPerson: '', // 联系人
        zhiWei: '', // 职位
        phoneNumber: '', // 联系电话
        category: '', // 类目
        pingTai: '', // 平台
        sales: '', // 销售额
        zsFuZeRen: '', // 招商负责人
        communication: '', // 沟通详情
        createTime: ''// 创建时间
      },
      // 编辑数据
      editdata: {
        companyName: '', // 公司名
        contactPerson: '', // 编辑联系人
        zhiWei: '', // 编辑职位
        phoneNumber: '', // 编辑联系电话
        sales: '', // 编辑销售额
        zsFuZeRen: '', // 编辑招商负责人
        communication: '' // 编辑沟通详情
      },
      clientCounts: 10, // 总条数
      clientPage: {
        name: '',
        startPage: 1, // 页码
        pageSize: 10 // 当前页显示的信息条数
      },
      clientData: [], // 意向客户数据
      editIndex: -1, // 点击修改的合同的index
      // 列名
      clientColumns: [
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
          title: '城市',
          slot: 'city',
          key: 'city',
          width: 120
        },
        {
          title: '联系人',
          slot: 'contactPerson',
          key: 'contactPerson',
          width: 140
        },
        {
          title: '职位',
          slot: 'zhiWei',
          key: 'zhiWei',
          width: 120
        },
        {
          title: '联系电话',
          slot: 'phoneNumber',
          key: 'phoneNumber',
          width: 160
        },
        {
          title: '类目',
          slot: 'category',
          key: 'category',
          width: 120
        },
        {
          title: '主营平台',
          slot: 'pingTai',
          key: 'pingTai',
          width: 160
        },
        {
          title: '年销售额(万元)',
          slot: 'sales',
          key: 'sales',
          width: 160
        },
        {
          title: '招商负责人',
          slot: 'zsFuZeRen',
          key: 'zsFuZeRen',
          width: 160
        },
        {
          title: '沟通详情',
          slot: 'communication',
          key: 'communication',
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
    // 提交新增意向客户数据
    pushAddClient (formRef) {
      let _this = this
      this.$refs[formRef].validate(valid => {
        if (valid) {
          _this.addClientData.createTime = _this.getFormatDate()
          _this.insertAddClient(_this.addClientData)
        }
      })
    },
    // 弹出新增客户对话框
    showAddClient () {
      this.$refs['addClientCustom'].resetFields()
      this.resetAddClient()
      this.isAddClient = true
    },
    // 取消新增意向客户
    concelAdd () {
      this.isAddClient = false
    },
    // 保存编辑验证
    saveEdit (editRow) {
      let _this = this
      for (let item in editRow) {
        if (editRow[item] == null || editRow[item] == '') {
          this.$Message.error(_this.tagname[item] + '不能为空')
          return false
          break
        }
      }
      this.updataEdit()
    },
    // 删除提示框
    handleDelete (row) {
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>是否确认删除该条记录？</p>',
        onOk: () => {
          this.deleteClient(row.companyName)
        },
        onCancel: () => {}
      })
    },
    deleteClient (companyName) {
      let _this = this
      axios
        .request({
          url: 'SouSouClient/deleteClient',
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: companyName

        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('删除成功')
            if (_this.clientPage.startPage > 1 && _this.clientData.length == 1) {
              _this.clientPage.startPage -= 1
            }
            _this.getClientCount()
          } else {
            _this.$Message.error('删除失败')
          }
        })
    },
    // 新增意向客户
    insertAddClient (addClientData) {
      let _this = this
      axios
        .request({
          url: 'SouSouClient/insertClient',
          method: 'post',
          headers: {
            'Content-Type': 'application/json' // 设置请求头请求格式为JSON
          },
          data: addClientData
        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('新增成功')
            _this.isAddClient = false
            _this.getClientCount()
          } else if (response.data == -1) {
            _this.$Message.error('该公司已存在')
          } else {
            _this.$Message.error('新增失败')
          }
        })
    },
    // 更新修改
    updataEdit () {
      let _this = this
      axios
        .request({
          url: 'SouSouClient/updateClient',
          method: 'post',
          headers: {
            'Content-Type': 'application/json' // 设置请求头请求格式为JSON
          },
          data: _this.editdata
        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('修改成功')
            _this.getClientList()
          } else {
            _this.$Message.error('修改失败')
          }
        })
      _this.editIndex = -1
    },
    // 取消编辑
    cancelEdit () {
      this.editIndex = -1
      this.getClientCount()
    },
    // 更新备注
    editContext (value) {
      this.isEditCommuncation = true
    },
    // 取消更新沟通信息
    cancelContext () {
      this.isEditCommuncation = false
      this.editdata.communication = this.clientData[this.editIndex].communication
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
    // 换页
    handlePage (val) {
      this.clientPage.startPage = val
      this.getClientCount()
      this.editIndex = -1
    },
    // 更换每页显示条数
    handlePageSize (val) {
      this.clientPage.startPage = 1
      this.clientPage.pageSize = val
      this.editIndex = -1
      this.getClientCount()
    },
    // 修改
    handleEdit (row, index) {
      this.editIndex = index
      this.editdata.companyName = row.companyName
      this.editdata.contactPerson = row.contactPerson
      this.editdata.zhiWei = row.zhiWei
      this.editdata.phoneNumber = row.phoneNumber
      this.editdata.sales = row.sales
      this.editdata.zsFuZeRen = row.zsFuZeRen
      this.editdata.communication = row.communication
    },
    // 获取客户信息
    getClientList () {
      let _this = this
      axios
        .request({
          url: 'SouSouClient/getClientList',
          method: 'get',
          params: _this.clientPage
        })
        .then(function (response) {
          _this.clientData = response.data
          _this.addPageCurrentAndPageSize(_this.clientData)
        })
    },
    // 获取客户信息总条数
    getClientCount () {
      let _this = this
      axios
        .request({
          url: 'SouSouClient/getClientCount',
          method: 'get',
          params: _this.clientPage
        })
        .then(function (response) {
          _this.clientCounts = response.data
          _this.getClientList()
        })
    },
    // 重置新增数据容器
    resetAddClient () {
      this.addClientData.companyName = ''
      this.addClientData.city = ''
      this.addClientData.contactPerson = ''
      this.addClientData.zhiWei = ''
      this.addClientData.phoneNumber = ''
      this.addClientData.category = this.categoryList[0].value
      this.addClientData.pingTai = ''
      this.addClientData.sales = ''
      this.addClientData.zsFuZeRen = ''
      this.addClientData.communication = ''
    },
    addPageCurrentAndPageSize (updatePageData) {
      for (var key in updatePageData) {
        updatePageData[key].pageCurrent = this.clientPage.startPage
        updatePageData[key].pageSize = this.clientPage.pageSize
      }
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
    }
  },
  mounted () {
    this.getClientCount()
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 75
  }
}
</script>
<style lang="scss" scoped>
</style>
