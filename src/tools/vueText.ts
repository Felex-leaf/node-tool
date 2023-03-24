import { addFile, deleteDir, fileDisplay } from "../utils/utils";
import { mkdirSync, readFileSync } from "fs";
import { join } from "path";

const outPath = join(__dirname, '../vue-text');

// 过滤vue文件内容
const txtFilter = (value) => {
  var str = "";
  str = value.replace(
    /[`:_.~!@#$%^&*() \+ =<>?"{}|, \/ ;' \\ [ \] ·~！@#￥%……&*（）—— \+ ={}|《》？：“”【】、；‘’，。、0-9 a-zA-Z -]/g,
    ""
  );
  return str;
};
const typeMap = {
  form: ['form-item', 'input'],
  btn: ['button'],
  table: ['table']
}

const run = async () => {
  const { filePaths } = await fileDisplay(join(__dirname, '../vue'));
  await deleteDir(outPath)
  await mkdirSync(outPath)
  filePaths.forEach(async (filePath) => {
    const name = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.lastIndexOf("."));
    const reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
    const res = readFileSync(filePath).toString().replace(reg, function(word) { 
      // 去除注释后的文本 
      return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
    });;
    const json = {};
    res
      .split('<')
      .map((item) => item.split('>'))
      .forEach((item) => {
        const text = item.join('');
        const filterText = txtFilter(text)
          .split('\n')
          .filter((i) => i);
        if (filterText[0]) {
          Object.keys(typeMap).forEach((key) => {
            if (typeMap[key].some((k) => text.includes(k))) {
              json[`${key}_${filterText[0]}`] = filterText[0];
              filterText[0] = undefined;
            }
          })
        }
        filterText.forEach((i) => {
          if (!i) return;
          json[i] = i;
        });
      });
    addFile(
      join(
        __dirname,
        `../vue-text/${name}.json`,
      ),
      JSON.stringify(json, null, 2),
      (err) => { err ? console.error(err) : console.log('输出成功'); }
    )
  });
};

run();