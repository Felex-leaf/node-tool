import React from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { ButtonConfigProps, ButtonList, Space } from '@jimu/components';

import { Root } from '@/interface';
import PageList from './components/page-list';
import SearchForm from './components/search-form';
import ComponentNameModal from './components/component-name-modal';
import ComponentNameStore from './store/componentNameStore';

interface ComponentNameProps {
  store: ComponentNameStore;
}

const ComponentName = ({ store }: ComponentNameProps) => {
  const componentNameModal = toJS(store.componentNameModal);
  const { setData } = store;

  const handleAdd = async () => {
    setData({
      componentNameModal: true,
      currentRow: null,
    });
  };

  const btnList: ButtonConfigProps[] = [
    {
      text: '新增',
      onClick: handleAdd,
    },
  ];
  return (
    <>
      <Space size="middle" direction="vertical" className="component-name">
        <SearchForm />
        <ButtonList btnList={btnList} />
        <PageList />
        {componentNameModal && <ComponentNameModal />}
      </Space>
    </>
  );
};
export default inject(({ componentNameStore }: Root) => ({
  store: componentNameStore,
}))(observer(ComponentName));
