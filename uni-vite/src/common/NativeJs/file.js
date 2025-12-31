export function checkFileExists(filePath) {
  return new Promise((resolve) => {
    plus.io.resolveLocalFileSystemURL(filePath,
      (entry) => {
        entry.file((file) => {
          console.log('文件存在，大小:', file.size, '字节');
          console.log('完整路径:', entry.toURL());
          console.log('本地路径:', entry.fullPath);
          resolve(true);
        });
      },
      () => {
        console.log('文件不存在');
        resolve(false);
      }
    );
  });
}

export function getFileInfo(filePath) {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
      const info = {
        toURL: entry.toURL(),
        fullPath: entry.fullPath,
        name: entry.name,
        isFile: entry.isFile,
        isDirectory: entry.isDirectory
      };

      entry.file((file) => {
        info.size = file.size;
        info.lastModified = file.lastModifiedDate;
        console.log('文件信息:', info);
        resolve(info);
      });

    }, reject);
  });
}

export function listDocFiles(dir = '_doc') {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(dir, (entry) => {
      const reader = entry.createReader();
      reader.readEntries((entries) => {
        if (entries.length) {
          console.log('_doc 目录内容:');
        } else {
          console.log('_doc 为空目录！')
        }
        entries.forEach((entry, index) => {
          console.log(`${index + 1}. ${entry.name} (${entry.isFile ? '文件' : '目录'})`);

          if (entry.isFile) {
            entry.file((file) => {
              console.log(`   大小: ${file.size} 字节`);
            });
          }
        });
        resolve(entries);
      }, reject);
    }, reject);
  });
}

export function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(filePath,
      (entry) => {
        entry.remove(() => {
          console.log('文件删除成功:', filePath);
          resolve(true);
        }, (removeError) => {
          console.error('文件删除失败:', removeError);
          reject(new Error(`删除文件失败: ${removeError.message}`));
        });
      },
      () => {
        console.log('文件不存在，无需删除:', filePath);
        resolve(true);
      }
    );
  });
}

export function clearDirectory(dirPath = '_doc') {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(dirPath,
      (dirEntry) => {
        if (!dirEntry.isDirectory) {
          reject(new Error(`路径不是目录: ${dirPath}!`));
          return;
        }

        const reader = dirEntry.createReader();

        // 递归读取并删除所有内容
        const deleteEntries = () => {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              console.log(`目录清空完成:${dirPath}!`);
              resolve(true);
              return;
            }

            const deletePromises = entries.map(entry => {
              return new Promise((resolveEntry, rejectEntry) => {
                if (entry.isDirectory) {
                  entry.removeRecursively(resolveEntry, rejectEntry);
                } else {
                  entry.remove(resolveEntry, rejectEntry);
                }
              });
            });

            Promise.all(deletePromises)
              .then(() => {
                deleteEntries();
              })
              .catch((error) => {
                console.error('删除条目失败:', error);
                reject(new Error(`删除目录内容失败: ${error.message}`));
              });
          }, (readError) => {
            console.error('读取目录内容失败:', readError);
            reject(new Error(`读取目录失败: ${readError.message}`));
          });
        };

        deleteEntries();
      },
      () => {
        console.log(`目录不存在，无需清空:${dirPath}!`);
        resolve(true);
      }
    );
  });
}