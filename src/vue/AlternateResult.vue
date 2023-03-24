<template>
  <div>
    <common-title title="候补结果">
      <mtd-dropdown popper-class="title-dropdown" trigger="hover" :disabled="!pageList.length">
        <mtd-button :disabled="!pageList.length">
          <span style="margin-right: 4px;">导出</span>
          <i class="mtdicon mtdicon-down" />
        </mtd-button>
        <mtd-dropdown-menu slot="dropdown">
          <mtd-dropdown-menu-item>
            <a :href="exportUrl">导出申请人信息</a>
          </mtd-dropdown-menu-item>
          <mtd-dropdown-menu-item>
            <a @click="download">导出申请人车辆资料</a>
          </mtd-dropdown-menu-item>
        </mtd-dropdown-menu>
      </mtd-dropdown>
      <mtd-button type="primary" :disabled="disabled" @click="lottery" v-if="[1,2].includes(type)">
        开始摇号
      </mtd-button>
    </common-title>
    <mtd-loading :loading="loading">
      <mtd-table :data="pageList">
        <mtd-table-column label="序号">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </mtd-table-column>

        <mtd-table-column label="申请人">
          <template slot-scope="scope">
            {{ scope.row.name }} {{ scope.row.mis }}
          </template>
        </mtd-table-column>

        <mtd-table-column
          prop="mobile" ,
          label="手机号"
        />

        <mtd-table-column
          prop="carLicense" ,
          label="车牌号"
        />

        <mtd-table-column
          prop="spareCarLicense" ,
          label="备用车牌号"
          v-if="!spareCarFlag"
        />

        <mtd-table-column label="操作">
          <template slot-scope="scope">
            <a class="actionBtn" @click="showDialog(scope.row.empId)">查看车辆资料</a>
          </template>
        </mtd-table-column>
      </mtd-table>
    </mtd-loading>
    <mtd-pagination
      class="pagination"
      size="small"
      :total="page.totalCount"
      show-total
      show-size-changer
      show-quick-jumper
      :page-size.sync="page.pageSize"
      :current-page.sync="page.pageNo"
      @change="getList"
    />
    <carInfo ref="carInfo" :emp-id.sync="empId" :type="3" :id="$route.query.id"/>
  </div>
</template>
<script>
import { GetAlternateList, GetAlternateCount, AlternateStart } from '@/pc/api'
import carInfo from '../components/carInfo'
import { downloadFile } from '@/common/js/tools'

export default {
  components: {
    carInfo
  },
  data() {
    return {
      spareCarFlag: -1,
      pageList: [], // 结果列表
      page: { // 分页
        pageNo: 1,
        pageSize: 10
      },
      count: 0, // 候补数量
      disabled: true, // “开始摇号”按钮是否可用
      loading: false, // 列表加载
      empId: '',
      exportUrl: '', // 导出Url
      id:'', // 活动id
      type: -1 // 活动参与方式
    }
  },
  async created() {
    this.type = this.$route.query.type
    await this.getList()
    await this.getCount()
    this.exportUrl = `/parking/api/admin/exportByType?type=3&id=${this.$route.query.id}`
    this.spareCarFlag = +this.$route.query.spareCarFlag
  },
  methods: {
    download() {
      downloadFile(`/admin/getSuccessCarInfoUrl?type=3&id=${this.$route.query.id}`)
    },
    // 获取候补数量
    async getCount() {
      try {
        const { count, isShow } = await GetAlternateCount(this.$route.query.id)
        this.count = count
        this.disabled = !isShow
      } catch (error) {
        console.log('候补结果-获取候补数量失败')
      }
    },
    // 获取结果列表
    async getList() {
      this.loading = true
      try {
        const { page, pageList } = await GetAlternateList({ pageReq: this.page, id: this.$route.query.id })
        this.page = page
        this.pageList = pageList
      } catch (error) {
        console.log('候补结果-获取列表失败')
      }
      this.loading = false
    },
    showDialog(empId) {
      this.empId = empId
    },
    // 点击“开始摇号”按钮
    lottery() {
      this.$mtd.confirm({
        message: `摇号候补数为${this.count}，是否确定摇号？`,
        width: '430px',
        type: 'warning',
        showCancelButton: true,
        onOk: async () => {
          try {
            await AlternateStart(this.$route.query.id)
          } catch (error) {
            console.log('候补结果-摇号失败')
          }
          this.page = {
            pageNo: 1,
            pageSize: 10
          }
          this.getList()
          this.getCount()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
