<template>
  <div>

    <Button icon="md-add" @click="isAddNewData = true">新增</Button>

    <!-- 新增房间类型弹窗 -->
    <Modal :closable="false" v-model="isAddNewData" :mask-closable="false" title="新增房间类型">
      <!-- 新增表单填写 -->
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="房间类型" prop="roomType">
          <Input clearable v-model="formValidate.roomType" />
        </FormItem>
        <FormItem label="每月租金" prop="monthRent">
          <Input clearable v-model="formValidate.monthRent" />
        </FormItem>
      </Form>
      <!-- 对话框页脚 -->
      <div slot="footer">
        <Button type="text" size="large" @click="handleReset('formValidate')">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit('formValidate')">确定</Button>
      </div>
    </Modal>

    <Table border :columns="dataColumns" :data="pageData" ref="table" :height="tableHeight">
      <!-- 房间类型 -->
      <template slot-scope="{ row }" slot="roomType">
        <span>{{ row.roomType }}</span>
      </template>
      <!-- 每月租金 -->
      <template slot-scope="{ row, index }" slot="monthRent">
        <Input type="text" v-model="editMonthRent" v-if="editIndex === index" />
        <span v-else>{{ row.monthRent }}</span>
      </template>

      <!-- 操作 -->
      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button type="primary" style="margin-right: 5px" @click="handleSave(index)">保存</Button>

          <Button type="error" @click="handleCancel(index)">取消</Button>
        </div>

        <div v-else>
          <Button type="primary" style="margin-right: 5px" @click="handleEdit(row, index)">修改</Button>

          <Button type="error" @click="handleDelete(index)">删除</Button>
        </div>
        <Modal v-model="model2" title="提示">
          <p>是否确定删除</p>
          <div slot="footer">
            <Button type="text" size="large" @click="model2=false">取消</Button>
            <Button type="primary" size="large" @click="deleterow()">确定</Button>
          </div>
        </Modal>
      </template>
    </Table>

  </div>
</template>

<script>
import axios from '@/libs/api.request'
import excel from '@/libs/excel'
export default {
  data () {
    return {
      tableHeight:0,
      dataType: '宿舍', //
      // 表单数据设置
      formValidate: {
        roomType: '',
        monthRent: ''
      },
      // 表单数据验证设置
      ruleValidate: {
        roomType: [
          {
            required: true,
            message: '房间类型不能为空',
            trigger: 'blur'
          }
        ],

        monthRent: [
          {
            required: true,
            message: '每月租金不能为空',
            trigger: 'blur',
            transform (value) {
              var posPattern = /^[0-9]*$/
              if (!posPattern.test(value)) {
                this.message = '请输入正确的租金'
                return false
              } else {
                return String(value)
              }
            }
          }
        ]
      },
      isAddNewData: false,
      deleteData: '',
      editIndex: -1, // 当前聚焦的输入框的行数
      editMonthRent: '',

      pageData: [], // table绑定的数据
      model2: false,
      // 表格显示的列名数据
      dataColumns: [
        {
          type: 'index',
          width: 60,
          align: 'center',
          indexMethod (row) {
            return row._index + 1
          }
        },
        {
          title: '房间类型',
          key: 'roomType',
          slot: 'roomType'
        },
        {
          title: '每月租金',
          key: 'monthRent',
          slot: 'monthRent'
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
    // 取消修改
    handleCancel () {
      this.editIndex = -1
      this.getRoomType()
    },
    // 获取房间类型全部信息
    getRoomType () {
      let _this = this
      axios
        .request({
          url: 'RoomType/getRoomTypes',
          method: 'get'
        })
        .then(function (response) {
          _this.pageData = response.data
        })
    },
    // 提交新增房型
    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 开始向后台发送数据
          let _this = this
          let _data = this.formValidate
          axios
            .request({
              url: 'RoomType/insertRoomType',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              if (response.data == 1) {
                _this.$Message.success('添加成功')
                _this.getRoomType()
              } else {
                _this.$Message.error('添加失败')
              }
            })
            .then(function () {
              _this.$refs[name].resetFields()
            })
          _this.isAddNewData = false
        }
      })
    },
    // 删除房型提示框弹出
    handleDelete (index) {
      this.deleteData = this.pageData[index]
      this.model2 = true
    },
    // 删除房型
    deleterow () {
      let _this = this
      axios
        .request({
          url: 'RoomType/deleteRoomType',
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: _this.deleteData
        })
        .then(function (response) {
          if (response.data == 1) {
            _this.$Message.success('删除成功')
            _this.getRoomType()
          } else {
            _this.$Message.error('删除失败')
          }
        })
    },
    // 修改
    handleEdit (row, index) {
      this.editMonthRent = row.monthRent
      this.editIndex = index
    },
    // 保存修改
    handleSave (index) {
      let _this = this
      let _data = this.pageData

      // 向后台发送数据
      this.pageData[index].monthRent = this.editMonthRent
      // 判断是否为空，内容有空值就不发送
      if (
        this.pageData[index].monthRent == '' ||
        this.pageData[index].monthRent == null ||
        this.pageData[index].monthRent == undefined
      ) {
        this.$Message.error('有内容未填写')
      } else {
        _data = this.pageData[index]

        axios
          .request({
            url: 'RoomType/updateMonthRent',
            method: 'post',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            data: _data
          })
          .then(function (response) {
            if (response.data == 1) {
              _this.$Message.success('保存成功')
            } else {
              _this.$Message.error('保存失败')
            }
            _this.getRoomType()
          })
        this.editIndex = -1
      }
    },
    handleReset (name) {
      this.$refs[name].resetFields()
      this.isAddNewData = false
    }
  },
  mounted () {
    this.getRoomType()
    this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 75;
  }
}
</script>
