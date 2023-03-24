import { appendFile, existsSync, promises, readdir, statSync } from 'fs';
import { join } from 'path';

const filePaths: string[] = [];
const allFileDirs: string[] = [];

export async function fileDisplay(filePath: string): Promise<{ fileDirs: string[]; filePaths: string[] }> {
  //根据文件路径读取文件，返回文件列表  
  return new Promise((resole) => {
    readdir(filePath, async (err, files) =>{  
      if(err) return;
      const fileDirs: string[] = [];
      //遍历读取到的文件列表  
      await Promise.all(files.map(async (filename, i) =>{  
        //获取当前文件的绝对路径  
        const filedir = join(filePath, filename);
        const fileStatus = await statSync(filedir);
        const isDir = fileStatus?.isDirectory();
        if(isDir){
          fileDirs.push(filedir);
          allFileDirs.push(filedir);
          return;
        }
        filePaths.push(filedir)
      }));
      await Promise.all(fileDirs?.map((item) => fileDisplay(item)))
      resole({
        filePaths,
        fileDirs: allFileDirs,
      });
    });  
  })
}

export const deleteDir = async (directoryPath: string, callback?: (res?: boolean) => void) => {
  const fsPromises = promises;
  let fileDirs: string[] = [];
  async function rmdirAsync (directoryPath: string) {
    try {
      let stat = await fsPromises.stat(directoryPath)
      if (stat.isFile()) {
        await fsPromises.unlink(directoryPath)
      } else {
        const dirs = await fsPromises.readdir(directoryPath)
        // 递归删除文件夹内容(文件/文件夹)
        fileDirs = [...fileDirs, ...dirs]
        const Promises = dirs.map(dir => rmdirAsync(join(directoryPath, dir)))
        await Promise.all(Promises)
        await fsPromises.rmdir(directoryPath)
      }
    } catch (e) {
      alert(e);
      console.error(e);
    }
  }
  return await existsSync(directoryPath) ? rmdirAsync(directoryPath).then(() => {
  	// 确保文件/文件夹均已删除 => 回调
    callback && callback();
  }) : callback && callback(false);
}

type AddFile = (filePath: string, content: string | Uint8Array, callBack?: (err?: NodeJS.ErrnoException | null) => void) => void;

export const addFile: AddFile = (filePath, content, callBack) => {
  deleteDir(filePath, () => {
    appendFile(filePath, content, callBack);
  });
}

type AddFileSync = (filePath: string, content: string | Uint8Array) => Promise<boolean>;

export const addFileSync: AddFileSync = (filePath, content) => new Promise(
  (res, rej) => {
    deleteDir(filePath, () => {
      appendFile(filePath, content, (err) => {
        if (err) {
          rej(err)
        }
        res(true)
      });
    });
  }
)
