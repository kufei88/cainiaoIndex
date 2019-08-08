<template>
  <div>
    <!-- 新增办公楼按钮 -->
    <Button icon="md-add" @click="isAddNewBuilding = true">新增</Button>
    <!-- 新增办公楼弹窗 -->
    <Modal v-model="isAddNewBuilding" title="新增办公楼信息填写">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="办公楼号" prop="buildingNumber">
          <Input v-model="formValidate.buildingNumber" />
        </FormItem>

        <FormItem label="办公楼名称" prop="buildingName">
          <Input v-model="formValidate.buildingName" />
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" @click="handleReset('formValidate')">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit('formValidate')">确定</Button>
      </div>
    </Modal>
    <!-- 办公楼数据显示表格 -->
    <Table border :columns="buildingColumns" :data="buildingData" ref="table">
      <template slot-scope="{ row, index }" slot="buildingNumber">
        <Input type="text" v-model="editBuildingNumber" v-if="editIndex === index" />
        <span v-else>{{ row.buildingNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="buildingName">
        <Input type="text" v-model="editBuildingName" v-if="editIndex === index" />
        <span v-else>{{ row.buildingName }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button type="primary" style="margin-right: 5px" @click="handleSave(index)">保存</Button>
          <Button type="error" @click="editIndex = -1">取消</Button>
        </div>
        <div v-else>
          <Button type="primary" style="margin-right: 5px" @click="handleEdit(row, index)">修改</Button>
          <Button type="error" @click="handleDelete(index)">删除</Button>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
import axios from '@/libs/api.request'
export default {
  data() {
    return {
      isDeleteBuilding: false,
      editIndex: -1, // 当前聚焦的输入框的行数
      editBuildingNumber: '', // 第一列输入框，当然聚焦的输入框的输入内容，与 data 分离避免重构的闪烁
      editBuildingName: '', // 第二列输入框
      isFormData: false,
      isAddNewBuilding: false,
      buildingColumns: [
        {
          title: '楼号#',
          key: 'buildingNumber',
          slot: 'buildingNumber'
        },
        {
          title: '名称',
          key: 'buildingName',
          slot: 'buildingName'
        },
        {
          title: '操作',
          slot: 'action',
          width: 200,
          align: 'center'
        }
      ],
      buildingData: [],
      formValidate: {
        buildingNumber: '',
        buildingName: ''
      },
      ruleValidate: {
        buildingNumber: [
          {
            required: true,
            message: '办公楼号不得为空',
            trigger: 'blur'
          }
        ],
        buildingName: [
          {
            required: true,
            message: '办公楼名称不得为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted () {
    this.getBuildingData()
  },
  methods: {
    handleDelete (index) {
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>是否确认删除该条记录？</p>',
        onOk: () => {
          this.$Message.success('Success!')
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
        },
        onCancel: () => {

        }
      })

      this.editIndex = -1
    },
    handleEdit (row, index) {
      this.editBuildingNumber = row.buildingNumber
      this.editBuildingName = row.buildingName
      this.editIndex = index
    },
    handleSave (index) {
      this.$Message.success('Success!')
      this.buildingData[index].buildingNumber = this.editBuildingNumber
      this.buildingData[index].buildingName = this.editBuildingName

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
          // 验证是否有重复的数据
          this.buildingData.forEach(element => {
            if (element.buildingNumber == this.formValidate.buildingNumber) {
              this.isFormData = true
            }
          })
          if (this.isFormData == false) {
            this.$Message.success('Success!')
            // 开始向后台发送数据
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
            this.isAddNewBuilding = false
          } else {
            this.$Message.error('已有办公楼楼号，请重新填写！')
            this.isFormData = false
            this.$refs[name].resetFields()
          }
        } else {
          this.$Message.error('请填写详细信息，且不得有空！')
          this.$refs[name].resetFields()
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
      this.isAddNewBuilding = false
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
        .then(function(response) {
          _this.buildingData = response.data;
        });
    }
  }
};
</script>
<style lang='scss' scoped>
</style>
