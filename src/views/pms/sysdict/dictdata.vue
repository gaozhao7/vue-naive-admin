

<template>
  <CommonPage back>
    <template #action>
      <n-button type="primary" @click="handleAdd({ dictcode: queryItems.dictcode })">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增
      </n-button>
    </template>

    <MeCrud ref="$table" v-model:query-items="queryItems" :scroll-x="1200" :columns="columns"
      :get-data="api.readDictData">

      <MeQueryItem label="字典名称" :label-width="80">
        <n-select v-model:value="queryItems.dictcode" :options="options" />
      </MeQueryItem>

      <MeQueryItem label="字典标签" :label-width="80">
        <n-input v-model:value="queryItems.dictlabel" type="text" placeholder="请输入字典标签" clearable
          @keydown.enter="() => $table?.handleSearch" />
      </MeQueryItem>

      <MeQueryItem label="状态" :label-width="50">
        <n-select v-model:value="queryItems.enable" clearable :options="[
          { label: '启用', value: 1 },
          { label: '停用', value: 0 },
        ]" />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form ref="modalFormRef" label-placement="left" label-align="left" :label-width="80" :model="modalForm"
        :disabled="modalAction === 'view'">
        <n-form-item label="字典名称" path="dictcode">
          <n-select v-if="modalAction === 'add'" v-model:value="modalForm.dictcode" :options="options" :disabled="true" />
          <n-select v-else v-model:value="modalForm.sysDict.dictcode" :options="options" :disabled="true" />
        </n-form-item>

        <n-form-item label="数据标签" path="dictlabel" :rule="{
          required: true,
          message: '请输入数据标签',
          trigger: ['input', 'blur'],
        }">
          <n-input v-model:value="modalForm.dictlabel" />
        </n-form-item>
        <n-form-item label="数据键值" path="dictvalue" :rule="{
          required: true,
          message: '请输入数据键值',
          trigger: ['input', 'blur'],
        }">
          <n-input v-model:value="modalForm.dictvalue" />
        </n-form-item>

        <n-form-item label="显示排序" path="dictsort" :rule="{
          type: 'number',
          required: true,
          message: '此为必填项',
          trigger: ['blur', 'change'],
        }">
          <n-input-number v-model:value="modalForm.dictsort" />
        </n-form-item>

        <n-form-item label="回显样式" path="listclass">
          <n-select v-model:value="modalForm.listclass" :options="classOptions" />
        </n-form-item>

        <n-form-item v-if="modalAction === 'add'" label="状态" path="status">
          <n-switch v-model:value="modalForm.status">
            <template #checked>启用</template>
            <template #unchecked>停用</template>
          </n-switch>
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NSwitch, NTag } from 'naive-ui'
import QuestionLabel from '../resource/components/QuestionLabel.vue'
import { MeCrud, MeQueryItem, MeModal } from '@/components'
import { formatDateTime } from '@/utils'
import { useCrud } from '@/composables'
import api from './api'
import { h } from 'vue'

defineOptions({ name: 'DictData' })
const route = useRoute()

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

const options = ref([])

const classOptions = ref([
  { label: '默认(default)', value: 'default' },
  { label: '主要(primary)', value: 'primary' },
  { label: '信息(info)', value: 'info' },
  { label: '成功(success)', value: 'success' },
  { label: '警告(warning)', value: 'warning' },
  { label: '错误(error)', value: 'error' },
])

onMounted(() => {
  queryItems.value.dictcode = route.query.dictcode
  onInitSysDict()
})



const columns = [
  { title: '字典主键', key: 'id', width: 80, },
  { title: '字典标签', key: 'dictlabel', width: 150, ellipsis: { tooltip: true } },
  { title: '字典值', key: 'dictvalue', width: 150, ellipsis: { tooltip: true } },
  { title: '字典排序', key: 'dictsort', width: 150, ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row['createTime']))
    },
  },
  {
    title: '状态',
    key: 'enable',
    width: 100,

    render: (row) =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.status,
          loading: !!row.enableLoading,
          onUpdateValue: () => handleEnable(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        }
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            //disabled: row.code === 'SUPER_ADMIN',
            onClick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' }),
          }
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          }
        ),]
    },
  },
]

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.updateDictData({ id: row.id, status: !row.status })
    row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  } catch (error) {
    row.enableLoading = false
  }
}

async function onInitSysDict() {

  const sysDicts = await api.read({ pageSize: 1000, });
  options.value = sysDicts.data?.pageData?.map(item => ({
    label: item.dictname,
    value: item.dictcode,
  }));
  $table.value?.handleSearch()
}

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleOpen,
  handleDelete,
  handleEdit,
} = useCrud({
  name: '字典数据',
  initForm: { status: true, },
  doCreate: api.createDictData,
  doDelete: api.deleteDictData,
  doUpdate: api.updateDictData,
  refresh: () => $table.value?.handleSearch(),
})
</script>
