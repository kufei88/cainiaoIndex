<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入查询关键字，如公司名称、联系人、登记状态"
      style="width:400px;margin-bottom:10px;float:left;"
      @on-search="searchButton"
      v-model="searchData"
    />

    <!-- Excel模板下载按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcelModel"
      style="float:right"
    >模板下载</Button>

    <!-- Excel导出按钮 -->
    <Button
      icon="md-download"
      :loading="exportLoading"
      @click="exportExcel"
      style="float:right"
    >导出文件</Button>

    <!-- Excel导入按钮 -->
    <Upload
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

    </Upload>

    <!-- 新增办公室按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewData = true"
      style="float:right"
    >新增</Button>

    <!-- 清除浮动 -->
    <div style="clear:both"></div>

    <!-- 新增园区企业弹窗 -->
    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增园区企业信息填写"
    >

      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
      >

        <FormItem
          label="公司名称"
          prop="enterpriseName"
        >
          <Input v-model="formValidate.enterpriseName" />
        </FormItem>

        <FormItem
          label="联系人"
          prop="enterprisePerson"
        >
          <Input v-model="formValidate.enterprisePerson" />
        </FormItem>

        <FormItem
          label="联系电话"
          prop="contactNumber"
        >
          <Input v-model="formValidate.contactNumber" />
        </FormItem>

        <FormItem
          label="职位"
          prop="position"
        >
          <Input v-model="formValidate.position" />
        </FormItem>
        <FormItem
          label="年销售额(万元)"
          prop="annualSales"
        >
          <Input v-model="formValidate.annualSales" />
        </FormItem>
        <FormItem
          label="行业"
          prop="industry"
        >
          <Input v-model="formValidate.industry" />
        </FormItem>

        <FormItem
          label="登记状态"
          prop="state"
        >
          <Select
            v-model="formValidate.state"
            transfer
          >
            <Option
              v-for="item in stateList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>

        <FormItem
          label="备注信息"
          prop="other"
        >
          <Input
            v-model="formValidate.other"
            :maxlength="200"
            show-word-limit
            type="textarea"
            :rows="5"
          />
        </FormItem>

      </Form>

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

    <!-- 企业园区表格显示 -->
    <Table
      border
      :columns="dataColumns"
      :data="pageData"
      ref="table"
      height="522"
    >

      <template
        slot-scope="{ row, index }"
        slot="enterprisePerson"
      >
        <Input
          type="text"
          v-model="editEnterprisePerson"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.enterprisePerson }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="contactNumber"
      >
        <Input
          type="text"
          v-model="editContactNumber"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.contactNumber }}</span>
      </template>

<template
        slot-scope="{ row, index }"
        slot="position"
      >
        <Input
          type="text"
          v-model="editPosition"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.position }}</span>
      </template>
<template
        slot-scope="{ row, index }"
        slot="annualSales"
      >
        <Input
          type="text"
          v-model="editAnnualSales"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.annualSales }}</span>
      </template>
      <template
        slot-scope="{ row, index }"
        slot="industry"
      >
        <Input
          type="text"
          v-model="editIndustry"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.industry }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="state"
      >
        <Select
          v-model="editState"
          v-if="editIndex === index && row.state!='已入驻'"
          transfer
        >
          <Option
            v-for="item in stateList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>

        <span v-else>{{ row.state }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="other"
      >
        <Input
          type="text"
          v-model="editOther"
          v-if="editIndex === index"
          @on-focus="editOtherText"
        />

        <Tooltip
          v-else
          max-width="450"
        >
          <div slot="content">
            <span>{{ row.other }}</span>
          </div>
          <span>{{ showOtherLess(row.other) }}</span>
        </Tooltip>

      </template>

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
            v-if="row.state!='已入驻'"
            type="error"
            @click="handleDelete(index)"
          >删除</Button>

        </div>
      </template>
    </Table>

    <!-- 修改备注信息弹窗 -->
    <Modal
      width=40
      :closable="false"
      v-model="isUpdateOther"
      :mask-closable="false"
      :scrollable="true"
      title="修改备注信息"
    >

      <!-- 表单填写 -->

      <Form
        ref="updateOther"
        :label-width="100"
        @submit.native.prevent
      >

        <FormItem
          label="备注信息:"
          prop="owner"
        >

          <Input
            v-model="editOther"
            :maxlength="200"
            show-word-limit
            type="textarea"
            :rows="7"
          />
        </FormItem>

      </Form>

      <!-- 确定取消框 -->

      <div slot="footer">

        <Button
          type="text"
          size="large"
          @click="otherReset('updateOther')"
        >取消</Button>

        <Button
          type="primary"
          size="large"
          @click="otherSubmit('updateOther')"
        >确定</Button>

      </div>

    </Modal>

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
import axios from '@/libs/api.request'
import excel from '@/libs/excel'
export default {
  data () {
    return {
      saveOther: '', // 暂存编辑修改备注内容
      isUpdateOther: false, // 是否修改备注信息
      // 登记状态下拉列表
      stateList: [
        {
          value: '未注册',
          label: '未注册'
        },
        {
          value: '已注册',
          label: '已注册'
        },
        {
          value: '部分退租',
          label: '部分退租'
        },
        {
          value: '退租',
          label: '退租'
        }
      ],

      isAddNewData: false, // 是否新增数据

      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储
      exportLoading: false, // 是否导出Excel成功
      // excel模板数据格式
      excelDataModel: [
        {
          enterpriseName: '例如：某某有限公司',
          enterprisePerson: '填写公司主要负责人名称',
          contactNumber: '填写负责人电话',
          state: '企业登记状态，如未注册、已注册',
          other: '备注信息填写',
          position: '填写职位',
          annualSales: '填写年销售额',
          industry: '填写行业'
        }
      ],

      editIndex: -1, // 当前聚焦的输入框的行数
      editEnterprisePerson: '', // 编辑的企业联系人
      editContactNumber: '', // 编辑的企业联系电话
      editState: '', // 编辑的企业登记状态
      editOther: '', // 编辑的备注信息
      editPosition: '', // 编辑的职位
      editAnnualSales: '', // 编辑的年销售额
      editIndustry: '', // 编辑的行业

      searchData: '', // 查询内容

      pageCurrent: 1, // 当前页数
      pageStart: 0, // 记录开始位置
      dataCount: 0, // 从后台读取的总记录条数
      pageSize: 10, // 每页显示多少条
      pageData: [], // table绑定的数据

      // 表格显示的列名数据
      dataColumns: [
        {
          type: 'index',
          width: 60,
          align: 'center',
          indexMethod (row) {
            return row._index + 1 + (row.pageCurrent - 1) * row.pageSize
          }
        },
        {
          title: '公司名称',
          key: 'enterpriseName',
          align: 'center'
        },
        {
          title: '联系人',
          key: 'enterprisePerson',
          align: 'center',
          slot: 'enterprisePerson'
        },
        {
          title: '联系电话',
          key: 'contactNumber',
          align: 'center',
          slot: 'contactNumber'
        },

        {
          title: '职位',
          key: 'position',
          align: 'center',
          slot: 'position'
        },
        {
          title: '年销售额(万元)',
          key: 'annualSales',
          align: 'center',
          slot: 'annualSales'
        },
        {
          title: '行业',
          key: 'industry',
          align: 'center',
          slot: 'industry'
        },

        {
          title: '登记状态',
          key: 'state',
          align: 'center',
          slot: 'state'
        },
        {
          title: '备注',
          key: 'other',
          align: 'center',
          slot: 'other'
        },
        {
          title: '添加时间',
          key: 'insertTime',
          align: 'center'
        },
        {
          title: '修改时间',
          key: 'updateTime',
          align: 'center'
        },
        {
          title: '操作',
          slot: 'action',
          width: 180,
          align: 'center'
        }
      ],

      // 表单数据设置
      formValidate: {
        enterpriseName: '',
        enterprisePerson: '',
        enterpriseTelphone: '',
        position: '',
        annualSales: '',
        industry: '',
        other: '',
        state: '未注册'
      },

      // 表单数据验证设置
      ruleValidate: {
        enterpriseName: [
          {
            required: true,
            message: '公司名称不得为空',
            trigger: 'blur'
          }
        ],
        position: [
          {
            required: true,
            message: '职位不得为空',
            trigger: 'blur'
          }
        ],
        annualSales: [
          {
            required: true,
            message: '年销售额不得为空',
            trigger: 'blur'
          }
        ],
        industry: [
          {
            required: true,
            message: '行业不得为空',
            trigger: 'blur'
          }
        ],
        enterprisePerson: [
          {
            required: true,
            message: '联系人不得为空',
            trigger: 'blur'
          }
        ],
        contactNumber: [
          {
            required: true,
            message: '请填写正确的联系方式',
            trigger: 'blur',
            transform (value) {
              var myreg = /^[1][3,4,5,7,8][0-9]{9}$/
              if (!myreg.test(value)) {
                return false
              } else {
                return String(value)
              }
            }
          }
        ],
        state: [
          {
            required: true,
            message: '登记状态不得为空',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    // 备注信息省略显示
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
    // 确认修改备注信息
    otherSubmit () {
      this.isUpdateOther = false
    },
    // 取消修改备注信息
    otherReset () {
      this.isUpdateOther = false
      this.editOther = this.saveOther
    },
    // 修改备注信息
    editOtherText (value) {
      this.isUpdateOther = true
      this.saveOther = this.editOther
    },

    // 确认提交新增数据
    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 开始向后台发送数据
          let _this = this
          let _data = this.formValidate
          _data.insertTime = this.getFormatDate()
          axios
            .request({
              url: 'enterprise/insertEnterpriseList',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              if (response.data == 1) {
                _this.$Message.success('添加成功')
                _this.getRequestData(_this.pageCurrent)
                _this.isAddNewData = false
              } else if (response.data == -1) {
                _this.$Message.error('已有该企业存在')
              } else {
                _this.$Message.error('添加失败')
                _this.isAddNewData = false
              }
            })
            .then(function () {
              if (_this.isAddNewData == false) {
                _this.$refs[name].resetFields()
              }
            })
        }
      })
    },

    // 新增页面点击取消
    handleReset (name) {
      this.$refs[name].resetFields()
      this.isAddNewData = false
    },

    // 查询数据
    searchButton (value) {
      this.searchData = value
      this.pageCurrent = 1
      this.getRequestData(this.pageCurrent)
    },

    // Excel导入数据
    uploadExcelData (excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        excelData[key].enterpriseName = excelData[key].公司名称
        excelData[key].enterprisePerson = excelData[key].联系人
        excelData[key].contactNumber = excelData[key].联系电话
        excelData[key].state = excelData[key].登记状态
        excelData[key].other = excelData[key].备注
        excelData[key].position = excelData[key].职位
        excelData[key].annualSales = excelData[key].年销售额(万元)
        excelData[key].industry = excelData[key].行业
        excelData[key].insertTime = this.getFormatDate()

        delete excelData[key].公司名称
        delete excelData[key].联系人
        delete excelData[key].联系电话
        delete excelData[key].登记状态
        delete excelData[key].备注
        delete excelData[key].职位
        delete excelData[key].年销售额(万元)
        delete excelData[key].行业
      }

      // 验证空数据
      let isDataEmpty = 0
      for (var key in excelData) {
        excelData[key].enterpriseName == undefined ||
          excelData[key].enterpriseName == null ||
          excelData[key].enterpriseName == '' ||
          excelData[key].enterprisePerson == '' ||
          excelData[key].enterprisePerson == null ||
          excelData[key].enterprisePerson == undefined ||
          excelData[key].contactNumber == '' ||
          excelData[key].contactNumber == null ||
          excelData[key].contactNumber == undefined ||
        excelData[key].position == '' ||
        excelData[key].position == null ||
        excelData[key].position == undefined ||
        excelData[key].annualSales == '' ||
        excelData[key].annualSales == null ||
        excelData[key].annualSales == undefined ||
        excelData[key].industry == '' ||
        excelData[key].industry == null ||
        excelData[key].industry == undefined ||
        excelData[key].state == '' ||
        excelData[key].state == null ||
        excelData[key].state == undefined

          ? (isDataEmpty += 1)
          : (isDataEmpty += 0)
      }
      // 2.1 验证成功，上传后台数据库
      if (isDataEmpty == 0) {
        let _this = this
        axios
          .request({
            url: 'enterprise/uploadEnterpriseList',
            method: 'post',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            data: excelData
          })
          .then(function (response) {
            if (response.data == 0) {
              _this.$Message.error('未知原因，导入失败')
            } else if (response.data == -1) {
              _this.$Message.error('导入失败，表内无数据')
            } else if (response.data == -2) {
              _this.$Message.error('导入失败，数据全部存在')
            } else {
              if (response.data == excelData.length) {
                _this.$Message.success('导入成功')
              } else if (response.data < excelData.length) {
                let num = excelData.length - response.data
                _this.$Message.info(num + '条数据因无效而未导入')
              }
              _this.getRequestData(_this.pageCurrent)
            }
          }).catch(function (error) {
            _this.$Message.error('导入失败')
          })
      }
      // 2.2 验证失败，提示信息
      else {
        this.$Message.error('该表内有' + isDataEmpty + '行数据有空项')
        isDataEmpty = 0
      }
    },

    // 对上传的数据初始化
    initUpload () {
      this.file = null
      this.uploadTableData = []
    },
    // 点击上传按钮
    handleUploadFile () {
      this.initUpload()
    },

    // 上传前读取并验证数据
    handleBeforeUpload (file) {
      const fileExt = file.name
        .split('.')
        .pop()
        .toLocaleLowerCase()
      if (fileExt === 'xlsx' || fileExt === 'xls') {
        this.readFile(file)
        this.file = file
      } else {
        this.$Notice.warning({
          title: '文件类型错误',
          desc:
            '文件：' +
            file.name +
            '不是EXCEL文件，请选择后缀为.xlsx或者.xls的EXCEL文件。'
        })
      }
      return false
    },

    // 读取文件
    readFile (file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadstart = e => {
        this.uploadLoading = true
      }
      reader.onprogress = e => {
        this.progressPercent = Math.round((e.loaded / e.total) * 100)
      }
      reader.onerror = e => {
        this.$Message.error('文件读取出错')
      }
      reader.onload = e => {
        const data = e.target.result
        const { header, results } = excel.read(data, 'array')
        this.uploadTableData = results
        this.uploadLoading = false
        // 上传数据到后台
        this.uploadExcelData(this.uploadTableData)
      }
    },

    // Excel模板下载
    exportExcelModel () {
      if (this.excelDataModel.length) {
        this.exportLoading = true
        const params = {
          title: ['公司名称', '联系人', '联系电话', '职位', '年销售额(万元)', '行业', '登记状态', '备注'],
          key: [
            'enterpriseName',
            'enterprisePerson',
            'contactNumber',
            'position',
            'annualSales',
            'industry',
            'state',
            'other'
          ],
          data: this.excelDataModel,
          autoWidth: true,
          filename: '园区企业管理信息表模板'
        }
        excel.export_array_to_excel(params)
        this.exportLoading = false
      } else {
        this.$Message.info('表格数据不能为空！')
      }
    },

    // Excel导出
    exportExcel () {
      if (this.pageData.length) {
        this.exportLoading = true
        const params = {
          title: ['公司名称', '联系人', '联系电话', '职位', '年销售额(万元)', '行业', '登记状态', '备注'],
          key: [
            'enterpriseName',
            'enterprisePerson',
            'contactNumber',
            'position',
            'annualSales',
            'industry',
            'state',
            'other'
          ],
          data: this.pageData,
          autoWidth: true,
          filename: '园区企业管理信息表'
        }
        excel.export_array_to_excel(params)
        this.exportLoading = false
      } else {
        this.$Message.info('表格数据不能为空！')
      }
    },

    // 编辑修改记录
    handleEdit (row, index) {
      this.editEnterprisePerson = row.enterprisePerson
      this.editContactNumber = row.contactNumber
      this.editPosition = row.position
      this.editAnnualSales = row.annualSales
      this.editIndustry = row.industry
      this.editState = row.state
      this.editOther = row.other
      this.editIndex = index
    },

    // 取消修改记录
    handleCancel (index) {
      // 数据恢复
      this.editIndex = -1
    },

    // 保存数据
    handleSave (index) {
      let _this = this

      // 向后台发送数据
      this.pageData[index].enterprisePerson = this.editEnterprisePerson
      this.pageData[index].contactNumber = this.editContactNumber
      this.pageData[index].position = this.editPosition
      this.pageData[index].annualSales = this.editAnnualSales
      this.pageData[index].industry = this.editIndustry
      this.pageData[index].state = this.editState
      this.pageData[index].other = this.editOther

      if (
        this.pageData[index].enterpriseName == undefined ||
        this.pageData[index].enterpriseName == null ||
        this.pageData[index].enterpriseName == '' ||
        this.pageData[index].enterprisePerson == '' ||
        this.pageData[index].enterprisePerson == null ||
        this.pageData[index].enterprisePerson == undefined ||
        this.pageData[index].contactNumber == '' ||
        this.pageData[index].contactNumber == null ||
        this.pageData[index].contactNumber == undefined ||

        this.pageData[index].position == '' ||
        this.pageData[index].position == null ||
        this.pageData[index].position == undefined ||
        this.pageData[index].annualSales == '' ||
        this.pageData[index].annualSales == null ||
        this.pageData[index].annualSales == undefined ||
        this.pageData[index].industry == '' ||
        this.pageData[index].industry == null ||
        this.pageData[index].industry == undefined
      ) {
        this.$Message.error('有内容未填写')
      } else if (
        this.isNumberRule(this.pageData[index].contactNumber) == false
      ) {
        this.$Message.error('请输入正确的联系方式')
      } else {
        this.pageData[index].updateTime = this.getFormatDate()
        let _data = this.pageData[index]

        axios
          .request({
            url: 'enterprise/updateEnterpriseList',
            method: 'post',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            data: _data
          })
          .then(function (response) {
            if (response.data == 1) {
              _this.$Message.success('保存成功')
            } else if (response.data == -1) {
              _this.$Message.error('已有该企业')
            } else {
              _this.$Message.error('保存失败')
            }
            _this.getRequestData(_this.pageCurrent)
          })
          .then(function () {
            _this.changePage(_this.pageCurrent)
          })
        this.editIndex = -1
      }
    },

    // 删除记录
    handleDelete (index) {
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>是否确认删除该条记录？</p>',
        onOk: () => {
          let _this = this
          let _data = this.pageData[index]
          axios
            .request({
              url: 'enterprise/deleteEnterpriseList',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              if (response.data == 1) {
                _this.$Message.success('删除成功')
                // 判断是否pageData的数据长度<=1,然后判断是否第1页,是则页数减1;
                if (_this.pageData.length <= 1) {
                  if (_this.pageCurrent != 1) {
                    _this.pageCurrent = _this.pageCurrent - 1
                  }
                }
                _this.getRequestData(_this.pageCurrent)
              } else {
                _this.$Message.error('删除失败')
              }
            })
        },
        onCancel: () => {}
      })

      this.editIndex = -1
    },

    // 改变每页条数
    changePageNumber (index) {
      this.pageSize = index
      if (this.pageCurrent === 1) {
        this.changePage(this.pageCurrent)
      }
    },

    // 分页
    changePage (index) {
      // 获得当前页数，以及发送数据请求
      this.pageCurrent = index
      this.getRequestData(index)
    },

    // 从后台获取表格数据
    getRequestData (index) {
      let _this = this
      this.pageStart = (index - 1) * this.pageSize
      axios
        .request({
          url: 'enterprise/getSearchList',
          method: 'get',
          params: {
            search: this.searchData,
            dataStart: this.pageStart,
            dataSize: this.pageSize
          }
        })
        .then(function (response) {
          _this.pageData = response.data.enterpriseList
          _this.dataCount = response.data.dataCount
          _this.addPageCurrentAndPageSize(_this.pageData)
        })
    },

    // 获取当前系统时间
    getFormatDate () {
      var date = new Date()
      var month = date.getMonth() + 1
      var strDate = date.getDate()
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

    // 添加当前页和页码数据
    addPageCurrentAndPageSize (updatePageData) {
      for (var key in updatePageData) {
        updatePageData[key].pageCurrent = this.pageCurrent
        updatePageData[key].pageSize = this.pageSize
      }
    },

    // 判断手机号码是否正确
    isNumberRule (value) {
      var myreg = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!myreg.test(value)) {
        return false
      } else {
        return true
      }
    }
  },
  mounted () {
    this.getRequestData(this.pageCurrent)
  }
}
</script>
<style lang="scss" scoped>
</style>
