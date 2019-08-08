<template>
  <div>
    <!-- 新增园区企业按钮 -->
    <Button icon="md-add" @click="isAddNewEnterprise = true">新增</Button>

    <!-- 新增园区企业弹窗 -->
    <Modal v-model="isAddNewEnterprise" title="新增园区企业信息填写">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="公司名称" prop="enterpriseName">
          <Input v-model="formValidate.enterpriseName" />
        </FormItem>

        <FormItem label="联系人" prop="enterprisePerson">
          <Input v-model="formValidate.enterprisePerson" />
        </FormItem>

         <FormItem label="联系电话" prop="enterpriseTelphone">
          <Input v-model="formValidate.enterpriseTelphone" />
        </FormItem>

      </Form>

      <div slot="footer">
        <Button type="text" size="large" @click="handleReset('formValidate')">取消</Button>
        <Button type="primary" size="large" @click="handleSubmit('formValidate')">确定</Button>
      </div>
    </Modal>
    <!-- 企业园区表格显示 -->
    <Table border :columns="enterpriseColumns" :data="enterpriseData" ref="table">
      <template slot-scope="{ row }" slot="id">
        <span>{{ row.id }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="enterpriseName">
        <Input type="text" v-model="editEnterpriseName" v-if="editIndex === index" />
        <span v-else>{{ row.enterpriseName }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="enterprisePerson">
        <Input type="text" v-model="editEnterprisePerson" v-if="editIndex === index" />
        <span v-else>{{ row.enterprisePerson }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="enterpriseTelphone">
        <Input type="text" v-model="editEnterpriseTelphone" v-if="editIndex === index" />
        <span v-else>{{ row.enterpriseTelphone }}</span>
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
      isAddNewEnterprise: false,
      isFormData: false,
      formValidate: {
        enterpriseName: '',
        enterprisePerson: '',
        enterpriseTelphone: ''
      },
      ruleValidate: {
        enterpriseName: [
          {
            required: true,
            message: '公司名称不得为空',
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
        enterpriseTelphone: [
          {
            required: true,
            message: '联系电话不得为空',
            trigger: 'blur'
          }
        ]
      },
      editIndex: -1, // 当前聚焦的输入框的行数
      editEnterpriseId: '',
      editEnterpriseName: '', // 第二列输入框
      editEnterprisePerson: '',
      editEnterpriseTelphone: '',
      enterpriseData: [],
      enterpriseColumns: [
        {
          title: '#id',
          key: 'id',
          slot: 'id'
        },
        {
          title: '公司名称',
          key: 'enterpriseName',
          slot: 'enterpriseName'
        },
        {
          title: '联系人',
          key: 'enterprisePerson',
          slot: 'enterprisePerson'
        },
        {
          title: '联系电话',
          key: 'enterpriseTelphone',
          slot: 'enterpriseTelphone'
        },
        {
          title: '操作',
          slot: 'action',
          width: 200,
          align: 'center'
        }
      ]
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 验证是否有重复的数据
          this.enterpriseData.forEach(element => {
            if (element.enterpriseName == this.formValidate.enterpriseName) {
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
                url: '/enterprise/insertEnterpriseList',
                method: 'post',
                headers: {
                  'Content-Type': 'application/json;charset=UTF-8'
                },
                data: _data
              })
              .then(function (response) {
                console.log(response)
                _this.enterpriseData = response.data
              })
              .then(function () {
                _this.$refs[name].resetFields()
              })
            this.isAddNewEnterprise = false
          } else {
            this.$Message.error('已有该公司名称，请重新填写！')
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
      this.isAddNewEnterprise = false
    },
    handleDelete (index) {
      this.$Modal.confirm({
        title: '删除提示',
        content: '<p>是否确认删除该条记录？</p>',
        onOk: () => {
          this.$Message.success('Success!')
          let _this = this
          let _data = this.enterpriseData[index]
          axios
            .request({
              url: '/enterprise/deleteEnterpriseList',
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=UTF-8'
              },
              data: _data
            })
            .then(function (response) {
              console.log(response)
              _this.enterpriseData = response.data
            })
        },
        onCancel: () => {}
      })

      this.editIndex = -1
    },
    handleEdit (row, index) {
      this.editEnterpriseId = row.id
      this.editEnterpriseName = row.enterpriseName
      this.editEnterprisePerson = row.enterprisePerson
      this.editEnterpriseTelphone = row.enterpriseTelphone
      this.editIndex = index
    },
    handleSave (index) {
      this.$Message.success('Success!')
      this.enterpriseData[index].id = this.editEnterpriseId
      this.enterpriseData[index].enterpriseName = this.editEnterpriseName
      this.enterpriseData[index].enterprisePerson = this.editEnterprisePerson
      this.enterpriseData[index].enterpriseTelphone = this.editEnterpriseTelphone

      let _this = this
      let _data = this.enterpriseData[index]
      axios
        .request({
          url: '/enterprise/updateEnterpriseList',
          method: 'post',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          data: _data
        })
        .then(function (response) {
          console.log(response)
          _this.enterpriseData = response.data
        })
      this.editIndex = -1
    },
    getEnterpriseData () {
      let _this = this
      axios
        .request({
          url: '/enterprise/getEnterpriseList',
          method: 'get'
        })
        .then(function (response) {
          _this.enterpriseData = response.data
          console.log(response.data)
        })
    }
  },
  mounted () {
    this.getEnterpriseData()
  }
}
</script>
<style lang="scss" scoped>
</style>
