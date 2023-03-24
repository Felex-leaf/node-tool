import { constantCase, camelCase, pascalCase } from 'change-case';
import { dedent } from 'vtils';

const PAGE_INFO = {
  STORE: {
    MODAL:  `
  // 新增、编辑弹窗
  @observable componentNameModal = false;

  // 当前行
  @observable currentRow = null;`,
    LIST: `
  // 是否正在加载数据
  @observable isLoadingData = false;

  // 列表数据
  @observable data = {
    list: [],
    total: 0,
  };

  // 页码页长
  @observable page = {
    pageNo: 1,
    pageSize: 10,
  };

  // 执行搜索
  @action.bound
  async doSearch({
    pageNo,
    pageSize,
  }: { pageNo?: number; pageSize?: number } = {}) {
    this.page.pageNo = pageNo || this.page.pageNo;
    this.page.pageSize = pageSize || this.page.pageSize;
    const param = {
      page: toJS(this.page),
      ...toJS(this.filter),
    };

    this.isLoadingData = true;
    const result = await getListService(param).catch(() => null) || {};
    this.isLoadingData = false;
    if (result.pageList) {
      this.data = {
        list: result.pageList || [],
        total: result.page?.totalCount,
      };
    } else {
      this.data = {
        list: [],
        total: 0,
      };
    }
  }`,
    SEARCH: `
  // 筛选条件
  @observable filter = {};

  // 获取表单数据
  get formValue() {
    if (!this.pageFormRef) return {};
    const formValue = this.pageFormRef.getFieldsValue();
    const value = formatFormValue(formValue, {});
    return value;
  }

  // 修改筛选条件
  @action.bound
  changeFilter() {
    this.filter = this.formValue;
    this.page.pageNo = 1;
    this.doSearch(); // 执行搜索
  }`
  }
}

// 获取 KEY_KEY 字符串数组和名称数组
export function getKs(model: Model) {
  const names: string[] = [];
  const kS: string[] = [];
  const K_S = Object.keys(model).map((key) => {
    names.push(model[key]);
    kS.push(camelCase(key));
    return constantCase(key);
  });
  return {
    names,
    K_S,
    kS,
  }
}

export function getModelInfo(model: Model) {
  if (!model) return {};
  const { K_S, kS, names } = getKs(model);
  /**
   * 例： 
   *  KEY,
   *  KEY_TWO,
   */
  const K_S_STR = dedent(K_S.reduce((pre, K, i) => {
    return pre + `${K},
  `
  }, ''));
  /**
   * 例： 
   *  KEY = 'key',
   *  KEY_TWO = 'keyTwo',
   */
  const ENUM_STR = dedent(Object.keys(model).reduce((pre, key, i) => {
    const k = camelCase(key);
    return pre + `${K_S[i]} = '${k}',
  `;
  }, ''));
  /**
   * 例： 
   *  [KEY]: {
   *    label: '名称',
   *  },
   *  [KEY_TWO]: {
   *    label: '名称2',
   *  },
   */
  const MODEL_STR = dedent(K_S.reduce((pre, K, i) => {
    return pre + `[${K}]: {
    label: '${names[i]}',
  },
  `;
  }, ''));

  const IMPORT_STR = K_S.reduce((pre, K, i) => {
    if (i === K_S.length - 1) return `${pre}${K}`;
    return `${pre}${K}, `
  }, '');

  const CONFIG_STR = dedent(K_S.reduce((pre, K, i) => {
    return pre + `[${K}]: {
      component: 'mtd-input',
      componentProps: {
        toFormItem: true,
        placeholder: '请输入${names[i]}',
      },
    },
    `
  }, ''));

  const LIST_CONFIG_STR = dedent(kS.reduce((pre, k, i) => {
    return pre + `{
      key: '${k}',
      dataKey: '${k}',
      title: '${names[i]}',
    },
    `
  }, ''));

  return {
    K_S_STR,
    ENUM_STR,
    MODEL_STR,
    IMPORT_STR,
    CONFIG_STR,
    LIST_CONFIG_STR,
  }
}

interface ReplaceStoreOption {
  searchModel: Model;
  modalModel: Model;
  listConfig: Model;
}

export function getReplaceInfo(option: ReplaceStoreOption) {
  const { searchModel, modalModel, listConfig } = option;
  const SEARCH_MODEL_INFO = getModelInfo(searchModel);

  const MODAL_MODEL_INFO = getModelInfo(modalModel);

  const LIST_MODEL_INFO = getModelInfo(listConfig);

  return {
    '/* SEARCH_KEY_MAP_CREATE */': SEARCH_MODEL_INFO.ENUM_STR,
    '/* SEARCH_KEY_MAP_EXPORT */': SEARCH_MODEL_INFO.K_S_STR,
    '/* SEARCH_MODEL */': SEARCH_MODEL_INFO.MODEL_STR,
    '/* SEARCH_IMPORT_MODEL */': SEARCH_MODEL_INFO.IMPORT_STR,
    '/* SEARCH_CONFIG */': SEARCH_MODEL_INFO.CONFIG_STR,
    '/* MODAL_KEY_MAP_CREATE */': MODAL_MODEL_INFO.ENUM_STR,
    '/* MODAL_KEY_MAP_EXPORT */': MODAL_MODEL_INFO.K_S_STR,
    '/* MODAL_MODEL */': MODAL_MODEL_INFO.MODEL_STR,
    '/* MODAL_IMPORT_MODEL */': MODAL_MODEL_INFO.IMPORT_STR,
    '/* MODAL_CONFIG */': MODAL_MODEL_INFO.CONFIG_STR,
    '/* LIST_CONFIG */': LIST_MODEL_INFO.LIST_CONFIG_STR,
    '/* MODAL_STORE_INFO */': modalModel ? PAGE_INFO.STORE.MODAL : '',
    '/* SEARCH_STORE_INFO */': searchModel ? PAGE_INFO.STORE.SEARCH : '',
    '/* LIST_STORE_INFO */': listConfig ? PAGE_INFO.STORE.LIST : '',
  }
}

export function componentNameReplace(str: string, pageName: string) {
  const smallHumpName = camelCase(pageName);
  const humpName = pascalCase(pageName);
  return str.replace(/ComponentName/g, humpName).replace(/componentName/g, smallHumpName).replace(/component-name/g, pageName);
}
