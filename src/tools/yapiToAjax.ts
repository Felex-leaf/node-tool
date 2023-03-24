/* eslint-disable no-template-curly-in-string */
import axios from 'axios';
import { appendFile } from 'fs';
import { join } from'path';
import { deleteDir } from '../utils/utils';

const options = {
  yapiUrl: 'https://yapi.sankuai.com',
  replaceStr: '/room/backstage', // 通用path 替换
  prefix: '${_prefix}', // 通用path 变量
  funcNameSuffix: 'Service', // 接口函数名统一结尾
  token: '47e6069e1b868463d5240a3acbbfb67e0a118ae6e348f74654e3e3cf6ae822c7', // yapi token
  catid: '200902', // 分类id
  project_id: '23170', // 项目id
  limit: 1000, // 条目
};

const { replaceStr, prefix, funcNameSuffix, token, catid, limit, yapiUrl, project_id } = options;

function toQueryString(params) {
  if (Object.prototype.toString.call(params) !== '[object Object]') return '';
  return Object.keys(params).reduce((prev, key, i) => (i === 0 ? `${key}=${params[key]}` : `${prev}&${key}=${params[key]}`), '');
}

function fisrtUpperCase(str) {
  return str.replace(replaceStr, '').split('/').map((a, i) => {
    if (a.includes('{')) return '';
    if (i === 0) return a;
    const characters = [...a];
    characters[0] = characters[0].toUpperCase();
    return characters.join('');
  }).join('') || '';
}

function exportFile(list) {
  if (!Array.isArray(list)) {
    console.error('数据结构不正确');
    return;
  }

  const str = list.reduce((prev, { path, title, method }, i) => {
    const med = method.toLocaleLowerCase();
    const funcTitle = fisrtUpperCase(`${med}${path}`);
    const funcStr = `// ${title}
export function ${funcTitle}${funcNameSuffix}(params) {
  const reqUrl = \`${prefix}${path.replace(replaceStr, '').replace('{', '${')}\`;
  return ajax.${med}(reqUrl, params);
}
`
    if (i === 0) {
      return funcStr
    }
    return `${prev}
${funcStr}`;
  }, '');
  deleteDir(join('src/out', 'ajaxApi.ts'), () => {
    appendFile(join('src/out', 'ajaxApi.ts'), str, (err) => { err ? console.error('输出失败') : console.log('输出成功'); });
  });
}

const queryString = toQueryString({
  token,
  catid,
  limit,
  project_id
});

async function category() {
  const res = await axios.get(`${yapiUrl}/api/interface/list_cat?${queryString}`);
  const list = res.data.data.list || [];
  exportFile(list);
}

async function all() {
  const res = await axios.get(`${yapiUrl}/api/interface/list?${queryString}`);
  const list = res.data.data.list || [];
  exportFile(list);
}

const isAll = process.argv[2] === '-a';

(isAll ? all : category)();
