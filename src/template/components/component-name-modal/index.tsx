import React, { useRef, useState, useEffect } from 'react';
import { FormScheme, FormSchemeProps } from '@jimu/components';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Button, Form, message, Modal } from '@ss/mtd-react';
import { formatFormValue } from '@/utils';

import { Root } from '@/interface';

import model, { /* MODAL_IMPORT_MODEL */ } from './model';
import ComponentNameStore from '../../store/componentNameStore';

interface ComponentNameModalProps {
  store?: ComponentNameStore;
}

function ComponentNameModal({ store }: ComponentNameModalProps) {
  const formRef = useRef<Form>();
  const [loading, setLoading] = useState(false);
  const { changeFilter } = store;
  const currentRow = toJS(store.currentRow);

  const handleClose = () => {
    store?.setData({
      componentNameModal: false,
    });
  };

  const handleOk = async () => {
    const form = formRef?.current;
    if (!form?.validateFields()) return;
    const formValue = form.getFieldsValue();
    const value = formatFormValue(formValue, {});
    setLoading(true);
    try {
      handleClose();
      changeFilter();
      message.success({
        message: '操作成功',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEcho = async () => {
    const value = {};
    formRef?.current?.setFieldsValue(value);
  };

  useEffect(() => {
    currentRow && handleEcho();
  }, []);

  const config = {
    /* MODAL_CONFIG */
  };

  const formProps: FormSchemeProps = {
    model,
    config,
    labelWidth: '8em',
  };

  return (
    <Modal style={{ width: '400px' }} title={`${currentRow ? '编辑' : '新增'}物品`} onClose={handleClose}>
      <Modal.Body>
        <FormScheme {...formProps} ref={formRef} />
      </Modal.Body>
      <Modal.Footer>
        <Button style={{ marginRight: '20px' }} onClick={handleClose}>
          取消
        </Button>
        <Button type="primary" onClick={handleOk} loading={loading}>
          确定
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default inject(({ componentNameStore }: Root) => ({
  store: componentNameStore,
}))(observer(ComponentNameModal));
