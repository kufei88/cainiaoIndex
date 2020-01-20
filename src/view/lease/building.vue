<template>
  <div>
    <!-- 自定义查询模块 -->
    <Input
      search
      enter-button="查询"
      placeholder="请输入查询关键字，如楼栋名称、楼栋类型"
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

    <!-- 新增办公楼按钮 -->
    <Button
      icon="md-add"
      @click="isAddNewData = true"
      style="float:right"
    >新增</Button>

    <div style="clear:both"></div>
    <!-- 新增办公楼弹窗 -->
    <Modal
      :closable="false"
      v-model="isAddNewData"
      :mask-closable="false"
      title="新增楼栋信息填写"
    >
      <!-- 新增表单填写 -->
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
      >

        <FormItem
          label="楼栋名称"
          prop="buildingName"
        >
          <Input
            clearable
            v-model="formValidate.buildingName"
          />
        </FormItem>

        <FormItem
          label="楼栋类型"
          prop="buildingType"
        >
          <Select
            v-model="formValidate.buildingType"
            transfer
          >
            <Option
              v-for="item in buildingTypeList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Form>
      <!-- 对话框页脚 -->
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
    <!-- 办公楼数据显示表格 -->
    <Table
      border
      :columns="dataColumns"
      :data="pageData"
      ref="table"
      :height="tableHeight"
    >
      <!-- 楼栋名称 -->
      <template
        slot-scope="{ row, index }"
        slot="buildingName"
      >
        <Input
          type="text"
          v-model="editBuildingName"
          v-if="editIndex === index"
        />

        <span v-else>{{ row.buildingName }}</span>
      </template>
      <!-- 楼栋类型 -->
      <template
        slot-scope="{ row, index }"
        slot="buildingType"
      >
        <Select
          v-model="editBuildingType"
          v-if="editIndex === index"
          transfer
        >
          <Option
            v-for="item in buildingTypeList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>

        <span v-else>{{ row.buildingType }}</span>
      </template>
      <!-- 添加时间 -->
      <template
        slot-scope="{ row }"
        slot="insertTime"
      >
        <span>{{ row.insertTime }}</span>
      </template>
      <!-- 修改时间 -->
      <template
        slot-scope="{ row }"
        slot="updateTime"
      >
        <span>{{ row.updateTime }}</span>
      </template>
      <!-- 操作 -->
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
            type="error"
            @click="handleDelete(index)"
          >删除</Button>

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
      tableHeight:0,
      buildingTypeList: [
        {
          value: '办公',
          label: '办公'
        },
        {
          value: '仓办',
          label: '仓办'
        },
        {
          value: '宿舍',
          label: '宿舍'
        },
        {
          value: '商业',
          label: '商业'
        }
      ],
      // 表单数据设置
      formValidate: {
        buildingName: '',
        buildingType: '',
        insertTime: this.getFormatDate()
      },
      // 表单数据验证设置
      ruleValidate: {
        buildingName: [
          {
            required: true,
            message: '楼栋名称不得为空',
            trigger: 'blur'
          }
        ],
        buildingType: [
          {
            required: true,
            message: '楼栋类型不得为空',
            trigger: 'change'
          }
        ]
      },
      isAddNewData: false, // 是否添加新数据

      uploadLoading: false, // 上传时等待状态是否开启
      file: null, // 文件
      uploadTableData: [], // 上传的excel表格数据存储

      exportLoading: false, // 是否导出Excel成功
      // excel模板数据格式
      excelModel: [
        {
          buildingName: '不能有特殊字符且不得为空，例如：1号楼',
          buildingType: '不能有特殊字符且不得为空，例如：办公、仓办、宿舍'
        }
      ],

      searchData: '', // 搜索栏内容

      editIndex: -1, // 当前聚焦的输入框的行数
      editBuildingName: '', // 编辑的楼栋名称
      editBuildingType: '', // 编辑的楼栋类型

      pageCurrent: 1, // 当前页数
      pageStart: 0, // 记录开始位置
      dataCount: 0, // 后台读取的总记录长度
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
          title: '楼栋名称',
          key: 'buildingName',
          align: 'center',
          slot: 'buildingName'
        },
        {
          title: '楼栋类型',
          key: 'buildingType',
          align: 'center',
          slot: 'buildingType'
        },
        {
          title: '添加时间',
          key: 'insertTime',
          align: 'center',
          slot: 'insertTime'
        },
        {
          title: '修改时间',
          key: 'updateTime',
          align: 'center',
          slot: 'updateTime'
        },
        {
          title: '操作',
          slot: 'action',
          width: 180,
          align: 'center'
        }
      ]
    }
  },
  methods: {
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
              url: 'building/deleteBuildingList',
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

    // 确认提交新增数据
    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        // 通过表单验证
        if (valid) {
          // 开始向后台发送数据
          let _this = this
          let _data = this.formValidate
          axios
            .request({
              url: 'building/insertBuildingList',
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
                _this.$Message.error('已有该楼栋存在')
              } else {
                _this.$Message.error('添加失败')
                _this.isAddNewData = false
              }
            })
            .then(function () {
              if (!_this.isAddNewData) {
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

    // Excel导入数据***
    uploadExcelData (excelData) {
      // 1.先进行数据的处理，转化成符合后台读取的格式
      for (var key in excelData) {
        excelData[key].buildingName = excelData[key].楼栋名称
        excelData[key].buildingType = excelData[key].楼栋类型
        excelData[key].insertTime = this.getFormatDate()

        delete excelData[key].楼栋名称
        delete excelData[key].楼栋类型
      }
      // 验证空数据
      let isDataEmpty = 0
      for (var key in excelData) {
        excelData[key].buildingName == '' ||
        excelData[key].buildingName == null ||
        excelData[key].buildingName == undefined
          ? (isDataEmpty += 1)
          : (isDataEmpty += 0)
      }
      // 2.1 验证成功，上传后台数据库
      if (isDataEmpty == 0) {
        let _this = this
        axios
          .request({
            url: 'building/uploadBuildingList',
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
                _this.$Message.info(num + '条数据因重复而未导入')
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

    // 对上传的数据初始化（excel上传）
    initUpload () {
      this.file = null
      this.uploadTableData = []
    },

    // 点击上传按钮（excel上传）
    handleUploadFile () {
      this.initUpload()
    },

    // 上传前读取并验证数据（excel上传）
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

    // 读取文件（excel上传）
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

    // Excel导出
    exportExcel () {
      if (this.pageData.length) {
        this.exportLoading = true
        const params = {
          title: ['楼栋名称', '楼栋类型', '添加时间', '修改时间'],
          key: ['buildingName', 'buildingType', 'insertTime', 'updateTime'],
          data: this.pageData,
          autoWidth: true,
          filename: '楼栋管理表'
        }
        excel.export_array_to_excel(params)
        this.exportLoading = false
      } else {
        this.$Message.info('表格数据不能为空！')
      }
    },

    // Excel模板下载
    exportExcelModel () {
      if (this.excelModel.length) {
        this.exportLoading = true
        const params = {
          title: ['楼栋名称', '楼栋类型'],
          key: ['buildingName', 'buildingType'],
          data: this.excelModel,
          autoWidth: true,
          filename: '楼栋管理表模板'
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

    // 编辑修改记录
    handleEdit (row, index) {
      this.editBuildingName = row.buildingName
      this.editBuildingType = row.buildingType
      this.editIndex = index
    },

    // 取消修改记录
    handleCancel (index) {
      this.editIndex = -1
    },

    // 保存记录
    handleSave (index) {
      let _this = this
      // 编辑栏赋值给需要保存的数据
      this.pageData[index].buildingType = this.editBuildingType
      this.pageData[index].buildingName = this.editBuildingName
      // 判断是否为空，为空不发送请求
      if (
        this.pageData[index].buildingType == '' ||
        this.pageData[index].buildingType == null ||
        this.pageData[index].buildingType == undefined ||
        this.pageData[index].buildingName == '' ||
        this.pageData[index].buildingName == null ||
        this.pageData[index].buildingName == undefined
      ) {
        this.$Message.error('有内容未填写')
      } else {
        let _data = this.pageData[index]
        _data.updateTime = this.getFormatDate()
        axios
          .request({
            url: 'building/updateBuildingList',
            method: 'post',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            data: _data
          })
          .then(function (response) {
            if (response.data == 1) {
              _this.$Message.success('保存成功')
              _this.getRequestData(_this.pageCurrent)
            } else if (response.data == -1) {
              _this.$Message.error('已有楼栋名称')
            } else {
              _this.$Message.error('保存失败')
            }
          })
          .then(function () {
            _this.changePage(_this.pageCurrent)
          })
        this.editIndex = -1
      }
    },

    // 从后台查询数据
    getRequestData (index) {
      let _this = this
      this.pageStart = (index - 1) * this.pageSize
      axios
        .request({
          url: 'building/getSearchList',
          method: 'get',
          params: {
            search: this.searchData,
            dataStart: this.pageStart,
            dataSize: this.pageSize
          }
        })
        .then(function (response) {
          _this.pageData = response.data.buildingList
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
    }
  },
  mounted () {
    this.getRequestData(this.pageCurrent)
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 75;
  }
}
</script>
<style lang="scss" scoped>
</style>
