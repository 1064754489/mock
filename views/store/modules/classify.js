import * as api from '../../api'

export default {
  namespaced: true,
  mutations: {
    SET_VALUE (state, payload) {
      console.log('payload', payload)
      state.list = payload || []
    },
    GET_CLASSIFIES (state) {
      return state.list
    }
  },
  actions: {
    FETCH ({commit, state}, projectId) {
      return api.classify.list({
        params: {
          page_size: 2000, // 不考虑分页
          project_id: projectId
        }
      }).then((res) => {
        if (res.data.success) {
          const classifiesArr = res.data.data.classifies.map((item) => {
            return {title: item.name, id: item._id}
          })
          classifiesArr.unshift({title: '全部', id: ''})
          commit('SET_VALUE', classifiesArr)
          return res.data.data
        }
      })
    },
    CREATE ({commit, dispatch}, {name, projectId}) {
      return api.classify.create({
        data: {
          name,
          project_id: projectId
        }
      }).then((res) => {
        if (res.data.success) {
          dispatch('FETCH', projectId)
        }
        return res
      })
    },
    UPDATE ({commit, dispatch}, {newName, projectId, id}) {
      return api.classify.update({
        data: {
          name: newName,
          id
        }
      }).then((res) => {
        if (res.data.success) {
          dispatch('FETCH', projectId)
        }
        return res
      })
    },
    DELETE ({commit, dispatch}, {id, projectId}) {
      return api.classify.delete({
        data: {
          id
        }
      }).then((res) => {
        if (res.data.success) {
          dispatch('FETCH', projectId)
        }
        return res
      })
    }
  }
}
