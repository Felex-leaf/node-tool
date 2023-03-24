import { action, observable, toJS } from 'mobx';
import { Root } from '@/interface';
import { formatFormValue } from '@/utils';

export default class ComponentNameStore {
  root: Root;

  constructor(root: Root) {
    this.root = root;
  }

  @action.bound
  setData(data: { [key in keyof ComponentNameStore]?: ComponentNameStore[key] }) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });
  }

  // 页面表单对象
  pageFormRef = null;
  /* MODAL_STORE_INFO */
  /* SEARCH_STORE_INFO */
  /* LIST_STORE_INFO */
}
