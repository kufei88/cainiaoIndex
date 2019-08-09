<template>
  <div>
    <Button type="primary" @click="showadd()" ghost>新增</Button>
    <Modal v-model="modal1" title="新增">
      <Form ref="formCustom" :model="editDtae" :rules="ruleCustom" :label-width="80">
        <FormItem label="公司名称" prop="companyName">
          <Input type="text" v-model="editDtae.companyName" />
        </FormItem>
        <FormItem label="联系人" prop="contact">
          <Input type="text" v-model="editDtae.contact" />
        </FormItem>
        <FormItem label="联系电话" prop="contactNumber">
          <Input type="text" v-model="editDtae.contactNumber" number />
        </FormItem>
        <FormItem label="门牌号" prop="venueNumber">
          <Input type="text" v-model="editDtae.venueNumber" />
        </FormItem>
        <FormItem label="签署情况" prop="contractSigning">
          <Input type="text" v-model="editDtae.contractSigning" />
        </FormItem>
        <FormItem label="租期" prop="leasePeriod">
          <Input type="text" v-model="editDtae.leasePeriod" />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input type="textarea" v-model="editDtae.remark" />
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" @click="modal1=false">取消</Button>
        <Button type="primary" size="large" @click="pushdata('formCustom')">确定</Button>
      </div>
    </Modal>
    <Button type="primary" @click="exportData()" ghost>导出</Button>
    <Table border :columns="accountColumns" :data="accountData" ref="table">
      <template slot-scope="{ row, index }" slot="companyName">
        <Input type="text" v-model="accountData[index].companyName" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].companyName }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="contact">
        <Input type="text" v-model="accountData[index].contact" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contact }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="contactNumber">
        <Input type="text" v-model="accountData[index].contactNumber" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contactNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="venueNumber">
        <Input type="text" v-model="accountData[index].venueNumber" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].venueNumber }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="contractSigning">
        <Input type="text" v-model="accountData[index].contractSigning" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].contractSigning }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="leasePeriod">
        <Input type="text" v-model="accountData[index].leasePeriod" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].leasePeriod }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="remark">
        <Input type="text" v-model="accountData[index].remark" v-if="editIndex === index" />
        <span v-else>{{ accountData[index].remark }}</span>
      </template>

      <template slot-scope="{ row, index }" slot="action">
        <div v-if="editIndex === index">
          <Button @click="save(row)">保存</Button>
          <Button @click="editIndex = -1">取消</Button>
        </div>
        <div v-else>
          <Button @click="show(index)">更新</Button>
          <Button @click="deleteaccount(row)">删除</Button>
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
import axios from "@/libs/api.request";
export default {
  data() {
    var validatecompanyName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("公司名称不能为空"));
      } else {
        callback();
      }
    };
    var validatecontact = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("联系人不能为空"));
      } else {
        callback();
      }
    };
    var validatecontactNumber = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("联系电话不能为空"));
      } else {
        callback();
      }
    };
    var validatevenueNumber = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("门牌号不能为空"));
      } else {
        callback();
      }
    };
    var validatecontractSigning = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("签署情况不能为空"));
      } else {
        callback();
      }
    };
    var validateleasePeriod = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("租期不能为空"));
      } else {
        callback();
      }
    };
    return {
      accountColumns: [
        { title: "公司名称", slot: "companyName", key: "companyName" },
        { title: "联系人", slot: "contact", key: "contact" },
        { title: "联系电话", slot: "contactNumber", key: "contactNumber" },
        { title: "租赁场地门牌号", slot: "venueNumber", key: "venueNumber" },
        {
          title: "租赁合同签署情况",
          slot: "contractSigning",
          key: "contractSigning"
        },
        { title: "租期", slot: "leasePeriod", key: "leasePeriod" },
        { title: "备注", slot: "remark", key: "remark" },
        {
          title: "Action",
          slot: "action",
          width: 150,
          align: "center"
        }
      ],
      accountData: [],
      editIndex: -1,
      ruleCustom: {
        companyName: [{ validator: validatecompanyName, trigger: "blur" }],
        contact: [{ validator: validatecontact, trigger: "blur" }],
        contactNumber: [{ validator: validatecontactNumber, trigger: "blur" }],
        venueNumber: [{ validator: validatevenueNumber, trigger: "blur" }],
        contractSigning: [
          { validator: validatecontractSigning, trigger: "blur" }
        ],
        leasePeriod: [{ validator: validateleasePeriod, trigger: "blur" }]
      },
      editDtae: {
        companyName: "",
        contact: "",
        contactNumber: "",
        venueNumber: "",
        contractSigning: "",
        leasePeriod: "",
        remark: ""
      },
      flag: false,
      modal1: false
    };
  },
  components: {},

  computed: {},

  mounted() {
    this.getaccountData();
  },

  methods: {
    exportData() {
      this.$refs.table.exportCsv({
        filename: "台账",
        columns: this.accountColumns.filter((col, index) => index < 6)
      });
    },
    pushdata(name) {
      let _this = this;
      let item;
      for (item in _this.editDtae) {
        if (_this.editDtae[item] == "") {
          if(item.toString()=="remark"){
            break;
          }
          _this.flag = true;
          break;
        }
      }
      if (_this.flag) {
        this.$refs[name].validate();
        _this.flag=false;
        return false;
      } else {
        _this.modal1 = false;
        //console.log(_this.editDtae);
        _this.insert();
        _this.getaccountData();
      }     
    },
    showadd() {
      let _this=this;
      for (let item in _this.editDtae) {
          _this.editDtae[item] = "";
        }
      this.modal1 = true;
    },
    show(index) {
      this.editIndex = index;
    },

    save(row) {
      this.update(row);

      this.getaccountData();
      this.editIndex = -1;
    },
    deleteaccount(row) {
      this.deleterow(row), this.getaccountData();
    },
    deleterow(row) {
      axios.request({
        url: "/Account/deleteAccount",
        method: "post",
        params: row
      });
    },
    update(row) {
      //console.log(row);
      // console.log(this.accountData[index]);
      // console.log(JSON.stringify(row));
      axios.request({
        url: "/Account/updateAccount",
        method: "post",
        params: row
      });
    },
    insert() {
      let _this = this;
      //console.log(_this.editDtae);
      axios.request({
        url: "/Account/insertAccount",
        method: "post",
        params: _this.editDtae
      });
    },
    getaccountData() {
      let _this = this;
      axios
        .request({
          url: "/Account/getAccountList",
          method: "get"
        })
        .then(function(response) {
          _this.accountData = response.data;
        });
    }
  }
};
</script>
