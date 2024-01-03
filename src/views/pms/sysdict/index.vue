
<template>
  <CommonPage>
    <template #action>
      <div class="flex items-center">
        <n-button type="primary" @click="handleAdd()">
          <i class="i-material-symbols:add mr-4 text-18" />
          新增
        </n-button>
        <n-button class="ml-12" type="error" @click="handleRestCache()">
          <i class="i-material-symbols:add mr-4 text-18" />
          刷新缓存
        </n-button>
        <n-button class="ml-12" type="info" @click="handleGetCache()">
          <i class="i-material-symbols:add mr-4 text-18" />
          测试缓存
        </n-button>
      </div>
    </template>

    <MeCrud ref="$table" v-model:query-items="queryItems" :scroll-x="1200" :columns="columns" :get-data="api.read">
      <MeQueryItem label="字典名称" :label-width="80">
        <n-input v-model:value="queryItems.dictname" type="text" placeholder="请输入字典名称" clearable
          @keydown.enter="() => $table?.handleSearch" />
      </MeQueryItem>

      <MeQueryItem label="字典编码" :label-width="80">
        <n-input v-model:value="queryItems.dictcode" type="text" placeholder="请输入字典编码" clearable
          @keydown.enter="() => $table?.handleSearch" />
      </MeQueryItem>

      <MeQueryItem label="状态" :label-width="50">
        <n-select v-model:value="queryItems.status" clearable :options="[
          { label: '启用', value: 1 },
          { label: '停用', value: 0 },
        ]" />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form ref="modalFormRef" label-placement="left" label-align="left" :label-width="80" :model="modalForm"
        :disabled="modalAction === 'view'">
        <n-form-item label="字典名称" path="dictname" :rule="{
          required: true,
          message: '请输入字典名称',
          trigger: ['input', 'blur'],
        }">
          <n-input v-model:value="modalForm.dictname" />
        </n-form-item>
        <n-form-item label="字典编码" path="dictcode" :rule="{
          required: true,
          message: '请输入字典编码',
          trigger: ['input', 'blur'],
        }">
          <n-input v-model:value="modalForm.dictcode" />
        </n-form-item>

        <n-form-item v-if="modalAction === 'add'" label="状态" path="status">
          <n-switch v-model:value="modalForm.status">
            <template #checked>启用</template>
            <template #unchecked>停用</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input v-model:value="modalForm.remark" type="textarea" size="small" :autosize="{
            minRows: 3,
            maxRows: 5
          }" />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NSwitch, NTag } from 'naive-ui'
import { formatDateTime } from '@/utils'
import { MeCrud, MeQueryItem, MeModal } from '@/components'
import { useCrud } from '@/composables'
import api from './api'

defineOptions({ name: 'SysDictMgt' })

const router = useRouter()

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const columns = [
  { title: '字典ID', key: 'id', width: 100 },
  { title: '字典名称', key: 'dictname', width: 150, ellipsis: { tooltip: true } },
  {
    title: '字典编码',
    key: 'dictcode',
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: '备注',
    key: 'remark',
    width: 150,
    ellipsis: { tooltip: true },
  },
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
    key: 'status',
    width: 120,
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
    width: 280,
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
            secondary: true,
            onClick: () =>
              router.push({ path: `/pms/sysdict/dictdata`, query: { dictcode: row.dictcode } }),
          },
          {
            default: () => '配置',
            icon: () => h('i', { class: 'i-line-md:confirm-circle text-14' }),
          }
        ),
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
        ),
      ]
    },
  },
]

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.update({ id: row.id, status: !row.status })
    row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  } catch (error) {
    row.enableLoading = false
  }
}

async function handleRestCache() {
  await api.restCache({});
  $message.success('刷新成功')
}

async function handleGetCache() {
  let result = await api.getCache({ dictcode: 'test' })
  console.log(result)
}

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleEdit,
} = useCrud({
  name: '字典类型',
  initForm: { status: true },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

</script>
