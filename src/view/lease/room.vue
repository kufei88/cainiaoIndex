<template>
  <div>
    <!-- 新增办公室按钮 -->
    <Button icon="md-add" @click="isAddNewRoom = true">新增</Button>

    <!-- 新增办公室弹窗 -->
    <Modal v-model="isAddNewRoom" title="新增办公室信息填写">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="房号" prop="roomNumber">
          <Input v-model="formValidate.roomNumber" />
        </FormItem>

        <FormItem label="办公楼号" prop="buildingNumber">
          <Select v-model="formValidate.buildingNumber" style="width:200px" transfer="true">
            <Option
              v-for="item in buildingData"
              :value="item.buildingNumber"
              :key="item.buildingNumber"
            >{{ item.buildingNumber }}</Option>
          </Select>
        </FormItem>

        <FormItem label="计租面积" prop="rentArea">
          <Input v-model="formValidate.rentArea" />
        </FormItem>

        <FormItem label="建筑面积" prop="builtUpArea">
          <Input v-model="formValidate.builtUpArea" />
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" @click="handleReset('formValidate')">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit('formValidate')">确定</Button>
      </div>
    </Modal>

    <!-- 办公室表格显示 -->
    <Table border :columns="roomColumns" :data="roomData" ref="table">
      <template slot-scope="{ row }" slot="id">
        <span>{{ row.id }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="roomNumber">
        <Input type="text" v-model="editRoomNumber" v-if="editIndex === index" />
        <span v-else>{{ row.roomNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="buildingNumber">
        <Select v-model="editBuildingNumber" transfer="true" v-if="editIndex === index">
          <Option
            v-for="item in buildingData"
            :value="item.buildingNumber"
            :key="item.buildingNumber"
          >{{ item.buildingNumber }}</Option>
        </Select>
        <span v-else>{{ row.buildingNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="rentArea">
        <Input type="text" v-model="editRentArea" v-if="editIndex === index" />
        <span v-else>{{ row.rentArea }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="builtUpArea">
        <Input type="text" v-model="editBuiltUpArea" v-if="editIndex === index" />
        <span v-else>{{ row.builtUpArea }}</span>
      </template>

      <template slot-scope="{ row }" slot="owner">
        <span>{{ row.owner }}</span>
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
  data () {
    return {
      isFormData: false,
      formValidate: {
        roomNumber: '',
        buildingNumber: '',
        rentArea: '',
        builtUpArea: ''
      },
      ruleValidate: {
        roomNumber: [
          {
            required: true,
            message: '房号不得为空',
            trigger: 'blur'
          }
        ],
        buildingNumber: [
          {
            required: true,
            message: '办公楼号不得为空',
            trigger: 'blur'
          }
        ],
        rentArea: [
          {
            required: true,
            message: '计租面积不得为空',
            trigger: 'blur'
          }
        ],
        builtUpArea: [
          {
            required: true,
            message: '建筑面积不得为空',
            trigger: 'blur'
          }
        ]
      },
      isAddNewRoom: false,
      buildingData: [],
      editIndex: -1, // 当前聚焦的输入框的行数
      editRoomId: '',
      editRoomNumber: '',
      editBuildingNumber: '',
      editRentArea: '',
      editBuiltUpArea: '',
      editOwner: '',
      roomColumns: [
        {
          title: '#id',
          key: 'id',
          slot: 'id'
        },
        {
          title: '房号',
          key: 'roomNumber',
          slot: 'roomNumber'
        },
        {
          title: '办公楼号',
          key: 'buildingNumber',
          slot: 'buildingNumber'
        },
        {
          title: '计租面积',
          key: 'rentArea',
          slot: 'rentArea'
        },
        {
          title: '建筑面积',
          key: 'builtUpArea',
          slot: 'builtUpArea'
        },
        {
          title: '业主',
          key: 'owner',
          slot: 'owner'
        },
        {
          title: '操作',
          width: 200,
          align: 'center',
          slot: 'action'
        }
      ],
      roomData: []
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 验证是否有重复的数据
          this.roomData.forEach(element => {
            if (element.roomNumber == this.formValidate.roomNumber && element.buildingNumber == this.formValidate.buildingNumber) {
              this.isFormData = true;
            }
          })
          if (this.isFormData == false) {
            this.$Message.success('Success!')
            // 开始向后台发送数据
            let _this = this
            let _data = this.formValidate
            axios
              .request({
                url: '/room/insertRoomList',
                method: 'post',
                headers: {
                  'Content-Type': 'application/json;charset=UTF-8'
                },
                data: _data
              })
              .then(function (response) {
                console.log(response)
                _this.roomData = response.data
              })
              .then(function () {
                _this.$refs[name].resetFields()
              })
            this.isAddNewRoom = false
          } else {
            this.$Message.error('该楼已有该房号，请重新填写！')
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
      this.isAddNewRoom = false
    },
    handleEdit (row, index) {
      this.editRoomId = row.id
      this.editRoomNumber = row.roomNumber
      this.editBuildingNumber = row.buildingNumber
      this.editRentArea = row.rentArea
      this.editBuiltUpArea = row.builtUpArea
      this.editOwner = row.owner
      this.editIndex = index
    },
    handleSave (index) {
      this.$Message.success('Success!')
      this.roomData[index].id = this.editRoomId
      this.roomData[index].roomNumber = this.editRoomNumber
      this.roomData[index].buildingNumber = this.editBuildingNumber
      this.roomData[index].rentArea = this.editRentArea
      this.roomData[index].builtUpArea = this.editBuiltUpArea
      this.roomData[index].owner = this.editOwner
      let _this = this
      let _data = this.roomData[index]
      axios
        .request({
          url: '/room/updateRoomList',
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: _data
        })
        .then(function (response) {
          console.log(response)
          _this.roomData = response.data
        })
      this.editIndex = -1
    },
    handleDelete (index) {
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>是否确认删除该条记录？</p>',
        onOk: () => {
          this.$Message.success('Success!')
          let _this = this
          let _data = this.roomData[index]
          axios
            .request({
              url: '/room/deleteRoomList',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              console.log(response)
              _this.roomData = response.data
            })
        },
        onCancel: () => {}
      })

      this.editIndex = -1
    },
    getRoomData () {
      let _this = this
      axios
        .request({
          url: '/room/getRoomList',
          method: 'get'
        })
        .then(function (response) {
          _this.roomData = response.data
        })
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
  },
  mounted () {
    this.getRoomData()
    this.getBuildingData()
  }
}
</script>
<style lang="scss" scoped>
</style>
