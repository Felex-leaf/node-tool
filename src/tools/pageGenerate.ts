import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { dedent } from 'vtils';
import { componentNameReplace, getReplaceInfo } from '../utils/pageGenerate';
import { addFile, deleteDir, fileDisplay } from '../utils/utils';

const option = {
  pageName: 'occupancy-detection-message',
  searchModel: {
    building: '大厦',
    room: '会议室',
    bookingDate: '预订日期',
    booker: '预订人',
  },
  modalModel: null,
  listConfig: {
    booker: '预订人',
    room: '会议室',
    bookingDate: '预订日期',
    bookingTime: '预订时间',
    messageType: '发送消息类型',
    messageTime: '发送消息时间',
    releaseRoomTime: '释放会议室时间',
  },
}

const { pageName, searchModel, modalModel, listConfig } = option;

const modelPath = componentNameReplace('/components/component-name-modal/model.ts', pageName);

const modelIndexPath = componentNameReplace('/components/component-name-modal/index.tsx', pageName);

const REPLACE_MAP = getReplaceInfo(option);

async function exportFile() {
  const { filePaths, fileDirs } = await fileDisplay(join(__dirname, '../template'));
  const noOuts: string[] = [];
  const files = await Promise.all(filePaths.map(async (filePath) => {
    const fileName = filePath.split('/').pop();
    
    const outPath = componentNameReplace(filePath.split('/template')[1], pageName);

    const PAGE_INFO_MAP = {
      '/components/search-form/index.tsx': {
        model: searchModel,
        key: 'search-form-index',
      },
      '/components/search-form/model.ts': {
        model: searchModel,
        key: 'search-form-model',
      },
      [modelPath]: {
        model: modalModel,
        key: 'modal-model',
      },
      [modelIndexPath]: {
        model: modalModel,
        key: 'modal-index',
      },
      '/components/page-list/index.tsx': {
        config: listConfig,
        key: 'page-list',
      }
    }

    const PAGE_INFO = PAGE_INFO_MAP[outPath];

    const { model, config, key } = PAGE_INFO || {};
    
    const out = key ? !!(model || config) : true; 

    let fileStr = componentNameReplace(await readFileSync(filePath).toString(), pageName);
    
    if (!out) noOuts.push(outPath.replace(`/${fileName}`, ''));

    const REPLACE_KEYS = Object.keys(REPLACE_MAP);
    
    REPLACE_KEYS.forEach((key) => {
      if (fileStr.includes(key)) {
        fileStr = fileStr.replace(key, REPLACE_MAP[key]);
      }
    })

    return {
      fileStr: dedent(fileStr),
      filePath,
      outPath,
      fileName,
      out,
    }
  }));
  fileDirs.unshift('template/');
  if (noOuts.length === 5) noOuts.push('/components');
  await deleteDir(join(__dirname, `../out/${pageName}`))
  await Promise.all(fileDirs.map(async (item) => {
    const filePath = componentNameReplace(item.split('template')[1], pageName);
    if (noOuts.includes(filePath)) return;
    await mkdirSync(join(__dirname, `../out/${pageName}`, filePath))
  }))
  
  files.forEach(({ fileStr, outPath, out }) => {
    if (!fileStr) return;
    if (out) 
      addFile(
        join(
          __dirname,
          `../out/${pageName}`,
          componentNameReplace(outPath, pageName)
        ),
        fileStr,
        (err) => { err ? console.error(err) : console.log('输出成功'); }
      )
  })
}

exportFile()
