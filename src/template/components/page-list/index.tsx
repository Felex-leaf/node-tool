import React from 'react';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { List, ListProps } from '@jimu/components';

import { Root } from '@/interface';
import ComponentNameStore from '../../store/componentNameStore';

interface PageListProps {
  store?: ComponentNameStore;
}

const PageList = ({ store }: PageListProps) => {
  const { list, total } = toJS(store?.data) || {};
  const { pageSize, pageNo } = toJS(store?.page) || {};
  const { doSearch } = store;

  const listConfig: ListProps['listConfig'] = [
    /* LIST_CONFIG */
  ];

  const listProps: ListProps = {
    data: list,
    listConfig,
    loading: store.isLoadingData,
    scroll: { x: true },
    pagination: {
      total,
      pageSize,
      current: pageNo,
    },
    doCallBackOnInit: false,
    onChange: (pNo, pSize) => {
      doSearch({ pageNo: pNo, pageSize: pSize });
    },
  };
  return <List {...listProps} />;
};

export default inject(({ componentNameStore }: Root) => ({
  store: componentNameStore,
}))(observer(PageList));
