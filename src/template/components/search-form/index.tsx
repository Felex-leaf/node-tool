import React, { useRef, useEffect } from 'react';
import { FormInstance, FormScheme, FormSchemeProps } from '@jimu/components';
import { Form } from '@ss/mtd-react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

import { Root } from '@/interface';

import model, { /* SEARCH_IMPORT_MODEL */ } from './model';
import ComponentNameStore from '../../store/componentNameStore';

interface SearchFormProps {
  store?: ComponentNameStore;
}

const SearchForm = ({ store }: SearchFormProps) => {
  const formRef = useRef<FormInstance>(); // 筛选表单Ref
  const filter = toJS(store.filter);
  const { changeFilter } = store;

  useEffect(() => {
    const form = formRef?.current;
    if (form) {
      store.pageFormRef = form;
      form.setFieldsValue({
        ...filter,
      });
      changeFilter();
    }
    return () => {
      store.setData({
        filter: {},
      });
    };
  }, []);

  const config = {
    /* SEARCH_CONFIG */
  };

  const formProps: FormSchemeProps = {
    model,
    config,
    filter: {
      showReset: true,
      btnList: [
        {
          type: 'primary',
          text: '搜索',
          ghost: true,
          onClick: changeFilter,
          style: {
            backgroundColor: 'white',
          },
        },
      ],
      onReset: changeFilter,
    },
    column: 2,
    labelWidth: '8em',
  };

  return <FormScheme ref={formRef} {...formProps} />;
};

export default inject(({ componentNameStore }: Root) => ({
  store: componentNameStore,
}))(observer(SearchForm));
