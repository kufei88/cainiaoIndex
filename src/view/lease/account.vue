<template>
  <div>
    <Button type="primary" @click="showadd()" ghost>新增</Button>
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

    return {
      accountColumns: [
        { title: "公司名称", slot: "companyName",key: "companyName" },
        { title: "联系人", slot: "contact",key: "contact" },
        { title: "联系电话", slot: "contactNumber",key: "contactNumber" },
        { title: "租赁场地门牌号", slot: "venueNumber",key: "venueNumber" },
        { title: "租赁合同签署情况", slot: "contractSigning",key: "contractSigning" },
        { title: "租期", slot: "leasePeriod",key: "leasePeriod" },
        { title: "备注", slot: "remark",key: "remark"},
        {
          title: "Action",
          slot: "action",
          width: 150,
          align: "center"
        }
      ],
      accountData: [],
      editIndex: -1,
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
      loadingf:true
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
        columns: this.accountColumns.filter((col, index) => index < 6),
      });
    },
    show(index) {
      this.editIndex = index;
    },
    save(row) {
      this.update(row);

      this.getaccountData();
      this.editIndex = -1;
    },
    deleteaccount(row){
      this.deleterow(row),
      this.getaccountData();
    },
    deleterow(row){
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
    },
    //对话框页面设计
    showadd() {
      let _this = this;
      this.$Modal.confirm({
        render: h => {
          return h("div", [
            h("p", "公司名称:"),
            h("Input", {
              props: {
                value: this.value,
                placeholder: "请输入公司名称"
              },
              on: {
                "on-blur"(e) {
                  _this.editDtae.companyName = e.target.value;
                  console.log(e.target.value);
                }
              }
            }),
            h("p", "联系人:"),
            h("Input", {
              props: {
                value: this.value,
                placeholder: "请输入联系人"
              },
              on: {
                "on-blur"(e) {
                  _this.editDtae.contact = e.target.value;
                  console.log(e.target.value);
                }
              }
            }),
            h("p", "联系电话:"),
            h("Input", {
              props: {
                value: this.value,
                placeholder: "请输入联系电话"
              },
              on: {
                "on-blur"(e) {
                  _this.editDtae.contactNumber = e.target.value;
                  console.log(e.target.value);
                }
              }
            }),
            h("p", "租赁场地门牌号:"),
            h("Input", {
              props: {
                value: this.value,
                placeholder: "请输入租赁场地门牌号"
              },
              on: {
                "on-blur"(e) {
                  _this.editDtae.venueNumber = e.target.value;
                  console.log(e.target.value);
                }
              }
            }),
            h("p", "租赁合同签署情况:"),
            h("Input", {
              props: {
                value: this.value,
                placeholder: "请输入租赁合同签署情况"
              },
              on: {
                "on-blur"(e) {
                  _this.editDtae.contractSigning = e.target.value;
                  console.log(e.target.value);
                }
              }
            }),
            h("p", "租期:"),
            h("Input", {
              props: {
                value: this.value,
                placeholder: "请输入租期"
              },
              on: {
                "on-blur"(e) {
                  _this.editDtae.leasePeriod = e.target.value;
                  console.log(e.target.value);
                }
              }
            }),
            h("p", "备注:"),
            h("Input", {
              props: {
                type: "textarea",
                value: this.value,
                placeholder: "请输入备注"
              },
              on: {
                "on-blur"(e) {
                  _this.editDtae.remark = e.target.value;
                  console.log(e.target.value);
                }
              }
            })
          ]);
        },
        //如有为空的值则不提交
        onOk: s => {
          let t=this;
          for (let item in _this.editDtae) {
            if (_this.editDtae[item] == "") {

              _this.flag = true;
              break;
            }
          }
          if (!_this.flag) {
            _this.insert();
            _this.getaccountData();


            console.log(_this.getaccountData());
          }
        },

      });
    }
  }
};
</script>
