<<<<<<< HEAD
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
  </div>
</template>
<script>
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
      ruleCustom: {
        companyName: [{ validator: validatecompanyName, trigger: "blur" }],
        contact: [{ validator: validatecontact, trigger: "blur" }],
        contactNumber: [{ validator: validatecontactNumber, trigger: "blur" }],
        venueNumber: [{ validator: validatevenueNumber, trigger: "blur" }],
        contractSigning:[{ validator: validatecontractSigning, trigger: "blur" }],
        leasePeriod:[{ validator: validateleasePeriod, trigger: "blur" }]
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
      modal1: false,
      flag:false
    };
  },
  methods: {
    pushdata(name) {
      let _this=this;
      let item;
      for (item in _this.editDtae) {
        if (_this.editDtae[item] == "") {
          _this.flag = true;
          break;
        }
      }
      if(_this.flag){
        this.$refs[name].validate();
        return false
      }
      else{

        _this.modal1=false;
        for (let item in _this.editDtae) {
        _this.editDtae[item]= "";
      }

      }
    },
    showadd() {
      this.modal1 = true;
    }
  }
};
</script>
=======
>>>>>>> 77337226bc2380bc6bd8e6da069487b9f8fed7a9
