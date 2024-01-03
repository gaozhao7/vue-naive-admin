/**********************************
 * @Author: gao.zhao
 * @LastEditor: 
 * @LastEditTime: 2023-12-27 10:34:53
 **********************************/

import { request } from '@/utils'

export default {
  create: (data) => request.post('/sysdict', data),
  read: (params = {}) => request.get('/sysdict', { params }),
  update: (data) => request.patch(`/sysdict/${data.id}`, data),
  delete: (id) => request.delete(`/sysdict/${id}`),
  resetPwd: (id, data) => request.patch(`/sysdict/password/reset/${id}`, data),

  // 字典值相关
  readDictData: (params = {}) => request.get('/dictdata', { params }),
  createDictData: (data) => request.post('/dictdata', data),
  updateDictData: (data) => request.patch(`/dictdata/${data.id}`, data),
  deleteDictData: (id) => request.delete(`/dictdata/${id}`),

  restCache: (params = {}) => request.get('/sysdict/restCache', { params }),
  getCache: (params = {}) => request.get('/sysdict/getCache', { params }),
}
