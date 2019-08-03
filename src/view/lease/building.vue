<!--  -->
<template>
  <div>
    <Button icon="md-add" @click="isAddNewBuilding = true" style="float:left;">新增</Button>
    <Button icon="md-download" @click="exportData()" style="float:left;">导出</Button>
    <Upload action :before-upload="beforeUpload" style="float:left;">
      <Button icon="ios-cloud-upload-outline">导入</Button>
    </Upload>
    <div style="clear:both;"></div>
    <Table border :columns="buildingColumns" :data="buildingData" ref="table">
      <template slot-scope="{ row, index }" slot="buildingNumber">
        <Input type="text" v-model="editBuildingNumber" v-if="editIndex === index" />
        <span v-else>{{ row.buildingNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="buildingName">
        <Input type="text" v-model="editBuildingName" v-if="editIndex === index" />
        <span v-else>{{ row.buildingName }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="roomArea">
        <Input type="text" v-model="editRoomArea" v-if="editIndex === index" />
        <span v-else>{{ row.roomArea }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="hardwareSituation">
        <Input type="text" v-model="editHardwareSituation" v-if="editIndex === index" />
        <span v-else>{{ row.hardwareSituation }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="rent">
        <Input type="text" v-model="editRent" v-if="editIndex === index" />
        <span v-else>{{ row.rent }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="additionalConditions">
        <Input type="text" v-model="editAdditionalConditions" v-if="editIndex === index" />
        <span v-else>{{ row.additionalConditions }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button @click="handleSave(index)">保存</Button>
          <Button @click="editIndex = -1">取消</Button>
        </div>
        <div v-else>
          <Button @click="handleEdit(row, index)">修改</Button>
          <Button @click="handleDelete(index)">删除</Button>
        </div>
      </template>
    </Table>
    <Modal
      v-model="isAddNewBuilding"
      title="新增办公楼信息填写"
      @on-ok="handleSubmit('formValidate')"
      @on-cancel="handleReset('formValidate')"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="办公楼号" prop="buildingNumber">
          <Input v-model="formValidate.buildingNumber" />
        </FormItem>

        <FormItem label="办公楼名称" prop="buildingName">
          <Input v-model="formValidate.buildingName" />
        </FormItem>

        <FormItem label="房间面积" prop="roomArea">
          <Input v-model="formValidate.roomArea" />
        </FormItem>

        <FormItem label="硬件情况" prop="hardwareSituation">
          <Input v-model="formValidate.hardwareSituation" />
        </FormItem>

        <FormItem label="租金" prop="rent">
          <Input v-model="formValidate.rent" />
        </FormItem>

        <FormItem label="附加条件" prop="additionalConditions">
          <Input v-model="formValidate.additionalConditions" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import axios from '@/libs/api.request'
import { getArrayFromFile, getTableDataFromArray } from '@/libs/util'
export default {
  data () {
    return {
      formValidate: {
        buildingNumber: '',
        buildingName: '',
        roomArea: '',
        hardwareSituation: '',
        rent: '',
        additionalConditions: ''
      },
      ruleValidate: {
        buildingNumber: [
          {
            required: true,
            message: 'The buildingNumber cannot be empty',
            trigger: 'blur'
          }
        ],
        buildingName: [
          {
            required: true,
            message: 'The buildingName cannot be empty',
            trigger: 'blur'
          }
        ],
        roomArea: [
          {
            required: true,
            message: 'The roomArea cannot be empty',
            trigger: 'blur'
          }
        ],
        hardwareSituation: [
          {
            required: true,
            message: 'The hardwareSituation cannot be empty',
            trigger: 'blur'
          }
        ],
        rent: [
          {
            required: true,
            message: 'The rent cannot be empty',
            trigger: 'blur'
          }
        ],
        additionalConditions: [
          {
            required: true,
            message: 'The additionalConditions cannot be empty',
            trigger: 'blur'
          }
        ]
      },

      editIndex: -1, // 当前聚焦的输入框的行数
      editBuildingId: '',
      editBuildingNumber: '', // 第一列输入框，当然聚焦的输入框的输入内容，与 data 分离避免重构的闪烁
      editBuildingName: '', // 第二列输入框
      editRoomArea: '', // 第三列输入框
      editHardwareSituation: '', // 第四列输入框
      editRent: '',
      editAdditionalConditions: '',
      isAddNewBuilding: false,
      buildingColumns: [
        {
          title: '楼号',
          key: 'buildingNumber',
          slot: 'buildingNumber'
        },
        {
          title: '名称',
          key: 'buildingName',
          slot: 'buildingName'
        },
        {
          title: '面积',
          key: 'roomArea',
          slot: 'roomArea'
        },
        {
          title: '硬件情况',
          key: 'hardwareSituation',
          slot: 'hardwareSituation'
        },
        {
          title: '租金',
          key: 'rent',
          slot: 'rent'
        },
        {
          title: '附加条件',
          key: 'additionalConditions',
          slot: 'additionalConditions'
        },
        {
          title: '操作',
          slot: 'action'
        }
      ],
      buildingData: []
    }
  },

  components: {},

  computed: {},

  mounted () {
    this.getBuildingData()
  },

  methods: {
    beforeUpload (file) {
      getArrayFromFile(file)
        .then(data => {
          let { newColumns, tableData } = getTableDataFromArray(data)
          tableData.forEach(element => {
            element.buildingNumber = element.楼号
            delete element.楼号
            element.buildingName = element.名称
            delete element.名称
            element.roomArea = element.面积
            delete element.面积
            element.hardwareSituation = element.硬件情况
            delete element.硬件情况
            element.rent = element.租金
            delete element.租金
            element.additionalConditions = element.附加条件
            delete element.附加条件
          })
          console.log(tableData)
          let _this = this
          let _data = tableData
          axios
            .request({
              url: '/building/insertBuildingListAll',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              console.log(response)
              _this.buildingData = response.data
            })
        })
        .catch(() => {
          this.$Notice.warning({
            title: '只能上传Csv文件',
            desc: '只能上传Csv文件，请重新上传'
          })
        })
      return false
    },
    exportData () {
      this.$refs.table.exportCsv({
        filename: 'The original data',
        columns: this.buildingColumns.filter((col, index) => index < 6),
        data: this.buildingData.filter((data, index) => index < 6)
      })
    },
    handleDelete (index) {
      let _this = this
      let _data = this.buildingData[index]
      axios
        .request({
          url: '/building/deleteBuildingList',
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: _data
        })
        .then(function (response) {
          console.log(response)
          _this.buildingData = response.data
        })
      this.editIndex = -1
    },
    handleEdit (row, index) {
      this.editBuildingNumber = row.buildingNumber
      this.editBuildingName = row.buildingName
      this.editRoomArea = row.roomArea
      this.editHardwareSituation = row.hardwareSituation
      this.editRent = row.rent
      this.editAdditionalConditions = row.additionalConditions
      this.editIndex = index
    },
    handleSave (index) {
      this.buildingData[index].buildingNumber = this.editBuildingNumber
      this.buildingData[index].buildingName = this.editBuildingName
      this.buildingData[index].roomArea = this.editRoomArea
      this.buildingData[index].hardwareSituation = this.editHardwareSituation
      this.buildingData[index].rent = this.editRent
      this.buildingData[index].additionalConditions = this.editAdditionalConditions
      let _this = this
      let _data = this.buildingData[index]
      axios
        .request({
          url: '/building/updateBuildingList',
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: _data
        })
        .then(function (response) {
          console.log(response)
          _this.buildingData = response.data
        })
      this.editIndex = -1
    },
    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$Message.success('Success!')

          let _this = this
          let _data = this.formValidate
          axios
            .request({
              url: '/building/insertBuildingList',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              console.log(response)
              _this.buildingData = response.data
            })
            .then(function () {
              _this.$refs[name].resetFields()
            })
        } else {
          this.$Message.error('Fail!')
          this.$refs[name].resetFields()
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    getBuildingData () {
      let _this = this
      axios
        .request({
          url: '/building/getBuildingList',
          method: 'get'
        })
        .then(function (response) {
          _this.buildingData = response.data
        })
    }
  }
}
</script>
<style lang='scss' scoped>
</style>
