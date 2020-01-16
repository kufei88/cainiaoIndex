<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入查询关键字，如所属楼栋、业主"
      style="width:350px;margin-bottom:10px;float:left;"
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

    <!-- 新增商业按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewData = true"
      style="float:right"
    >新增</Button>

    <Button
      type="primary"
      @click="showEmptyRoom"
      style="float:right"
    >空闲房间</Button>

    <!-- 清除浮动 -->
    <div style="clear:both"></div>
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
            maxlength="200"
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
    <!-- 新增商业弹窗 -->
    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增商业信息填写"
    >
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
      >

        <FormItem
          label="所属楼栋"
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
          label="房号"
          prop="roomNumber"
        >
          <Input
            clearable
            v-model="formValidate.roomNumber"
          />
        </FormItem>

        <FormItem
          label="计租面积"
          prop="rentArea"
        >
          <Input
            clearable
            v-model="formValidate.rentArea"
            placeholder="单位(㎡)"
          />
        </FormItem>

        <FormItem
          label="建筑面积"
          prop="buildingArea"
        >
          <Input
            clearable
            v-model="formValidate.buildingArea"
            placeholder="单位(㎡)"
          />
        </FormItem>

<FormItem
          label="跟进人"
          prop="followUpPeople"
        >
          <Input
            clearable
            v-model="formValidate.followUpPeople"

          />
        </FormItem>

        <FormItem
          label="备注信息"
          prop="other"
        >
          <Input
            v-model="formValidate.other"
            maxlength="200"
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

    <!-- 商业显示表格 -->
    <Table
      border
      :columns="dataColumns"
      :data="pageData"
      ref="table"
      height="522"
    >
      <template
        slot-scope="{ row }"
        slot="id"
      >
        <span>{{ row.id }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="buildingName"
      >
        <!-- <Select
          v-model="editBuildingName"
          v-if="editIndex === index"
          transfer:true
        >
          <Option
            v-for="item in buildingData"
            :value="item.buildingName"
            :key="item.buildingName"
          >{{ item.buildingName }}</Option>
        </Select> -->
        <span>{{ row.buildingName }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="roomNumber"
      >
        <Input
          type="text"
          v-model="editRoomNumber"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.roomNumber }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="rentArea"
      >
        <Input
          type="text"
          v-model="editRentArea"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.rentArea }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="buildingArea"
      >
        <Input
          type="text"
          v-model="editBuildingArea"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.buildingArea }}</span>
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
        slot="followUpPeople"
      >
        <Input
          type="text"
          v-model="editFollowUpPeople"
          v-if="editIndex === index"
        />
        <span v-else>{{ row.followUpPeople }}</span>
      </template>

      <template
        slot-scope="{ row }"
        slot="owner"
      >
        <span>{{ row.owner }}</span>
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
          <div v-if="row.owner=='空闲'">
            <Button
              type="primary"
              style="margin-right: 5px"
              @click="handleEdit(row, index)"
            >修改</Button>
            <Button
              type="error"
              @click="handleDelete(index)"
            >删除</Button>
          </div>
          <div v-else>
            <Button type="error">该房间已出租</Button>
          </div>
        </div>
      </template>
    </Table>

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
      // 房间类型
      dataType: '商业',

      isAddNewData: false, // 是否新增数据

      buildingData: [], // 楼栋数据

      // 表单数据设置
      formValidate: {
        roomNumber: '',
        buildingName: '',
        rentArea: '',
        buildingArea: '',
        insertTime: '',
        followUpPeople: '',
        other: ''
      },
      // 表单数据验证设置
      ruleValidate: {
        roomNumber: [
          {
            required: true,
            message: '请输入正确的房间号',
            trigger: 'blur',
            transform (value) {
              var posPattern = /^\d+$/
              if (!posPattern.test(value)) {
                return false
              } else {
                return String(value)
              }
            }
          }
        ],
        buildingName: [
          {
            required: true,
            message: '所属办公楼不得为空',
            trigger: 'change'
          }
        ],
        followUpPeople: [
          {
            required: true,
            message: '跟进人不得为空',
            trigger: 'change'
          }
        ],
        rentArea: [
          {
            required: true,
            message: '请输入正确的面积大小',
            trigger: 'blur',
            transform (value) {
              var posPattern = /^\d*\.?\d+$/
              if (!posPattern.test(value)) {
                return false
              } else {
                return String(value)
              }
            }
          }
        ],
        buildingArea: [
          {
            required: true,
            message: '请输入正确的面积大小',
            trigger: 'blur',
            transform (value) {
              var posPattern = /^\d*\.?\d+$/
              if (!posPattern.test(value)) {
                return false
              } else {
                return String(value)
              }
            }
          }
        ]
      },

      searchData: '', // 查询内容

      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储
      exportLoading: false, // 是否导出Excel成功
      // excel模板数据格式
      excelDataModel: [
        {
          roomNumber: '必须是数字，例如:101',
          buildingName: '必须是办公楼管理里存在的名称',
          rentArea: '必须是数字，单位(㎡)',
          followUpPeople: '填写跟进人',
          other: '填写备注',
          buildingArea: '必须是数字，单位(㎡)'
        }
      ],

      editIndex: -1, // 当前聚焦的输入框的行数
      editRentArea: '', // 编辑的计租面积
      editBuildingArea: '', // 编辑的建筑面积
      editRoomNumber: '', // 编辑的房号
      editOther: '', // 编辑的备注
      editFollowUpPeople: '', // 编辑的跟进人

      saveOther: '', // 暂存编辑修改备注内容
      isUpdateOther: false, // 是否修改备注信息

      pageCurrent: 1, // 当前页数
      pageStart: 0, // 记录开始位置
      dataCount: 0, // 后台数据的总记录
      pageSize: 10, // 每页显示多少条
      pageData: [], // table绑定的数据

      tempRoomNumber: '', // 记录旧的房间号

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
          title: '所属楼栋',
          key: 'buildingName',
          align: 'center',
          slot: 'buildingName'
        },
        {
          title: '房号',
          key: 'roomNumber',
          align: 'center',
          slot: 'roomNumber'
        },
        {
          title: '业主',
          key: 'owner',
          align: 'center',
          slot: 'owner'
        },
        {
          title: '计租面积(㎡)',
          key: 'rentArea',
          align: 'center',
          slot: 'rentArea'
        },
        {
          title: '建筑面积(㎡)',
          key: 'buildingArea',
          align: 'center',
          slot: 'buildingArea'
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
          title: '备注',
          key: 'other',
          align: 'center',
          slot: 'other'
        },
        {
          title: '跟进人',
          key: 'followUpPeople',
          align: 'center',
          slot: 'followUpPeople'
        },
        {
          title: '操作',
          width: 180,
          align: 'center',
          slot: 'action'
        }
      ]
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

    // 显示空闲房间
    showEmptyRoom () {
      this.searchData = '空闲'
      this.getRequestData(1)
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
              url: 'room/insertRoomList',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              if (response.data == 1) {
                _this.$Message.success('添加成功')
                _this.isAddNewData = false
                _this.getRequestData(_this.pageCurrent)
              } else if (response.data == -1) {
                _this.$Message.error('已有该商业存在')
              } else {
                _this.isAddNewData = false
                _this.$Message.error('添加失败')
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

    // Excel导入数据
    uploadExcelData (excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        excelData[key].roomNumber = excelData[key].房号
        excelData[key].buildingName = excelData[key].所属楼栋
        excelData[key].rentArea = excelData[key].计租面积
        excelData[key].buildingArea = excelData[key].建筑面积
        excelData[key].other = excelData[key].备注
        excelData[key].followUpPeople = excelData[key].跟进人
        excelData[key].insertTime = this.getFormatDate()

        delete excelData[key].房号
        delete excelData[key].所属楼栋
        delete excelData[key].计租面积
        delete excelData[key].建筑面积
        delete excelData[key].备注
        delete excelData[key].跟进人
      }
      // 验证空数据
      let isDataEmpty = 0
      for (var key in excelData) {
        excelData[key].roomNumber == '' ||
        excelData[key].roomNumber == null ||
        excelData[key].roomNumber == undefined ||
        excelData[key].buildingName == '' ||
        excelData[key].buildingName == null ||
        excelData[key].buildingName == undefined ||
        excelData[key].rentArea == '' ||
        excelData[key].rentArea == null ||
        excelData[key].rentArea == undefined ||
        excelData[key].buildingArea == '' ||
        excelData[key].buildingArea == null ||
        excelData[key].buildingArea == undefined ||
        excelData[key].followUpPeople == '' ||
        excelData[key].followUpPeople == null ||
        excelData[key].followUpPeople == undefined
          ? (isDataEmpty += 1)
          : (isDataEmpty += 0)
      }
      // 2.1 验证成功，上传后台数据库
      if (isDataEmpty == 0) {
        let _this = this
        axios
          .request({
            url: 'room/uploadRoomList',
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
          title: ['房号', '所属楼栋', '计租面积', '建筑面积', '备注', '跟进人'],
          key: ['roomNumber', 'buildingName', 'rentArea', 'buildingArea', 'other', 'followUpPeople'],
          data: this.excelDataModel,
          autoWidth: true,
          filename: '商业管理信息表模板'
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
          title: ['房号', '所属楼栋', '计租面积', '建筑面积', '备注', '跟进人'],
          key: ['roomNumber', 'buildingName', 'rentArea', 'buildingArea', 'other', 'followUpPeople'],
          data: this.pageData,
          autoWidth: true,
          filename: '商业管理信息表'
        }
        excel.export_array_to_excel(params)
        this.exportLoading = false
      } else {
        this.$Message.info('表格数据不能为空！')
      }
    },

    // 查询按钮点击事件
    searchButton (value) {
      this.searchData = value
      this.pageCurrent = 1
      this.getRequestData(this.pageCurrent)
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
              url: 'room/deleteRoomList',
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
    // 编辑修改记录
    handleEdit (row, index) {
      this.editRentArea = row.rentArea
      this.editBuildingArea = row.buildingArea
      this.editFollowUpPeople = row.followUpPeople
      this.editOther = row.other
      this.editRoomNumber = row.roomNumber
      this.editIndex = index
      this.tempRoomNumber = row.roomNumber
    },
    // 取消修改记录
    handleCancel (index) {
      // 数据恢复
      this.editIndex = -1
    },

    // 保存数据
    handleSave (index) {
      let _this = this
      let _data = this.pageData

      // 向后台发送数据
      this.pageData[index].rentArea = this.editRentArea
      this.pageData[index].buildingArea = this.editBuildingArea
      this.pageData[index].other = this.editOther
      this.pageData[index].followUpPeople = this.editFollowUpPeople
      this.pageData[index].roomNumber = this.editRoomNumber
      this.pageData[index].tempRoomNumber = this.tempRoomNumber
      // 判断是否为空，内容有空值就不发送
      if (
        this.pageData[index].rentArea == '' ||
        this.pageData[index].rentArea == null ||
        this.pageData[index].rentArea == undefined ||
        this.pageData[index].buildingArea == '' ||
        this.pageData[index].buildingArea == null ||
        this.pageData[index].buildingArea == undefined ||
        this.pageData[index].roomNumber == '' ||
        this.pageData[index].roomNumber == null ||
        this.pageData[index].roomNumber == undefined ||
        this.pageData[index].followUpPeople == '' ||
        this.pageData[index].followUpPeople == null ||
        this.pageData[index].followUpPeople == undefined

      ) {
        this.$Message.error('有内容未填写')
        _this.getRequestData(_this.pageCurrent)
      } else {
        this.pageData[index].updateTime = this.getFormatDate()
        _data = this.pageData[index]

        axios
          .request({
            url: 'room/updateRoomList',
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
              _this.$Message.error('该楼已有该房号')
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
          url: 'room/getSearchList',
          method: 'get',
          params: {
            search: this.searchData,
            dataStart: this.pageStart,
            dataSize: this.pageSize,
            dataType: this.dataType
          }
        })
        .then(function (response) {
          _this.pageData = response.data.roomList
          _this.dataCount = response.data.dataCount
          _this.addPageCurrentAndPageSize(_this.pageData)
          console.log(_this.pageData)
        })
    },

    // 从后台获取办公楼数据
    getBuildingData () {
      let _this = this
      axios
        .request({
          url: 'room/getBuildingList',
          method: 'get',
          params: {
            dataType: this.dataType
          }
        })
        .then(function (response) {
          _this.buildingData = response.data
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
    }
  },
  mounted () {
    this.getRequestData(this.pageCurrent)
    this.getBuildingData()
  }
}
</script>
<style lang="scss" scoped>
</style>
