<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入查询关键字，如所属楼栋、业主"
      style="width:300px;margin-bottom:10px;float:left;"
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

    <!-- 新增宿舍房间按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewRoom"
      style="float:right"
    >新增</Button>

    <!-- 查看全部空闲房间按钮 -->
    <Button
      @click="selectVacancy"
      style="float:right"
    >空闲房间</Button>

    <!-- 查看全部全部房间按钮 -->
    <Button
      @click="selectAllRoom"
      style="float:right"
    >全部房间</Button>

    <!-- 清除浮动 -->
    <div style="clear:both"></div>

    <!-- 新增宿舍房间弹窗 -->
    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增宿舍房间信息填写"
    >
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
      >

        <FormItem
          label="所属宿舍楼"
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
          label="房间类型"
          prop="roomType"
        >
          <Select
            v-model="formValidate.roomType"
            style="width:200px"
            transfer:true
          >
            <Option
              v-for="item in roomTypeDate"
              :value="item.roomType"
              :key="item.id"
            >{{ item.roomType }}</Option>
          </Select>

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

    <!-- 宿舍房间显示表格 -->
    <Table
      border
      :columns="dataColumns"
      :data="pageData"
      ref="table"
      :height="tableHeight"
    >
      <template
        slot-scope="{ row }"
        slot="id"
      >
        <span>{{ row.id }}</span>
      </template>

      <template
        slot-scope="{ row}"
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
        slot-scope="{ row}"
        slot="roomNumber"
      >
        <!-- <Input
          type="text"
          v-model="editRoomNumber"
          v-if="editIndex === index"
        /> -->
        <span>{{ row.roomNumber }}</span>
      </template>

      <template
        slot-scope="{ row }"
        slot="owner"
      >
        <span>{{ row.owner }}</span>
      </template>

      <template
        slot-scope="{ row, index }"
        slot="roomType"
      >
        <Select
          v-model="editRoomType"
          transfer:true
          v-if="editIndex === index"
        >
          <Option
            v-for="item in roomTypeDate"
            :value="item.roomType"
            :key="item.id"
          >{{ item.roomType }}</Option>
        </Select>

        <span v-else>{{ row.roomType}}</span>
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
      tableHeight: 0,
      // 房间类型
      dataType: '宿舍',

      isAddNewData: false, // 是否新增数据

      buildingData: [], // 楼栋数据
      roomTypeDate: [], // 房型数据
      // 表单数据设置
      formValidate: {
        roomNumber: '',
        buildingName: '',
        roomType: '',
        insertTime: ''
      },
      // 表单数据验证设置
      ruleValidate: {
        roomNumber: [
          {
            required: true,
            message: '房号不得为空',
            trigger: 'blur'
          }
        ],
        buildingName: [
          {
            required: true,
            message: '所属宿舍楼不得为空',
            trigger: 'change'
          }
        ],
        roomType: [
          {
            required: true,
            message: '房间类型不得为空',
            trigger: 'change'
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
          roomNumber: '必须是数字，，例如:101',
          buildingName: '必须是宿舍楼的名称',
          roomType: '必须是存在的房间类型'
        }
      ],

      editIndex: -1, // 当前聚焦的输入框的行数
      editRentArea: '', // 编辑的计租面积
      editBuildingArea: '', // 编辑的建筑面积
      editRoomType: '', // 编辑的房间类型

      pageCurrent: 1, // 当前页数
      pageStart: 0,
      pageEnd: 0,
      dataCount: 0, // 后台数据的总记录
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
          title: '所属楼栋',
          key: 'buildingName',
          slot: 'buildingName'
        },
        {
          title: '房号',
          key: 'roomNumber',
          slot: 'roomNumber'
        },
        {
          title: '业主',
          key: 'owner',
          slot: 'owner'
        },
        {
          title: '房间类型',
          key: 'roomType',
          slot: 'roomType'
        },
        {
          title: '添加时间',
          key: 'insertTime'
        },
        {
          title: '修改时间',
          key: 'updateTime'
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
    // 查看空闲房间
    selectVacancy () {
      this.searchData = '空闲'
      this.getRequestData(1)
    },
    // 查看全部房间
    selectAllRoom () {
      this.searchData = ''
      this.getRequestData(1)
    },
    // 点击添加按钮
    isAddNewRoom () {
      this.isAddNewData = true
      this.formValidate.buildingName = this.buildingData[0].buildingName
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
                _this.getRequestData(_this.pageCurrent)
              } else if (response.data == -1) {
                _this.$Message.error('已有该房间存在')
              } else {
                _this.$Message.error('添加失败')
              }
            })
            .then(function () {
              _this.$refs[name].resetFields()
            })
          this.isAddNewData = false
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
        excelData[key].buildingName = excelData[key].宿舍楼名称
        excelData[key].roomType = excelData[key].房间类型
        excelData[key].insertTime = this.getFormatDate()

        delete excelData[key].房号
        delete excelData[key].宿舍楼名称
        delete excelData[key].房间类型
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
        excelData[key].roomType == '' ||
        excelData[key].roomType == null ||
        excelData[key].roomType == undefined
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
          title: ['房号', '宿舍楼名称', '房间类型'],
          key: ['roomNumber', 'buildingName', 'roomType'],
          data: this.excelDataModel,
          autoWidth: true,
          filename: '宿舍房间管理信息表模板'
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
          title: ['房号', '宿舍楼名称', '业主', '房间类型'],
          key: ['roomNumber', 'buildingName', 'owner', 'roomType'],
          data: this.pageData,
          autoWidth: true,
          filename: '宿舍房间管理信息表'
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
                // 判断是否pageData的数据长度<=1,是则页数减1;
                if (_this.pageData.length <= 1) {
                  _this.getRequestData(_this.pageCurrent - 1)
                } else {
                  _this.getRequestData(_this.pageCurrent)
                }
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
      // this.editRentArea = row.rentArea;
      // this.editBuildingArea = row.buildingArea;
      this.editRoomType = row.roomType
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
      let _data = this.pageData
      this.pageData[index].roomType = this.editRoomType
      // 判断是否为空，内容有空值就不发送
      if (
        this.pageData[index].roomType == '' ||
        this.pageData[index].roomType == null ||
        this.pageData[index].roomType == undefined
      ) {
        this.$Message.error('有内容未填写')
      } else {
        this.pageData[index].updateTime = this.getFormatDate()
        _data = this.pageData[index]
        _data.tempRoomNumber = this.pageData[index].roomNumber
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
        })
    },

    // 从后台获取宿舍楼数据
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
          _this.formValidate.buildingName = _this.buildingData[0].buildingName
        })
    },
    // 获取寝室房间类型
    getRoomType () {
      let _this = this
      axios
        .request({
          url: 'RoomType/getRoomTypes',
          method: 'get'
        })
        .then(function (response) {
          _this.roomTypeDate = response.data
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
    this.getRoomType()
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 75
  }
}
</script>
<style lang="scss" scoped>
</style>
