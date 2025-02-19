const openDB = (dbName, version = 1.0) => {
  return new Promise((resolve, reject) => {
    const IDBFactory = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDb
    let IDBDatabase
    const IDBOpenDBRequest = IDBFactory.open(dbName, version)
    // indexDB 打开成功回调
    IDBOpenDBRequest.onsuccess = (event) => {
      IDBDatabase = event.target.result
      console.log('打开数据库成功')
      resolve(IDBDatabase)
    }

    // indexDB 打开失败
    IDBOpenDBRequest.onerror = (e) => {
      console.log(e, '打开数据库失败')
      reject(e)
    }

    // indexDB 更新数据
    // 数据库创建或者更新的时候会调用
    IDBOpenDBRequest.onupgradeneeded = (ev) => {
      const db = ev.target.result // 数据库对象
      // 创建存错库-单聊
      /**
       *keyPath: 'uuid' 主键
       */
      const IDBObjectStore = db.createObjectStore('users', {keyPath: 'uuid'})
      debugger
      // 创建索引，在后面查询数据的时候可以根据索引查
      IDBObjectStore.createIndex("uuid", "uuid", { unique: true })
      IDBObjectStore.createIndex("name", "name", { unique: false })
      IDBObjectStore.createIndex("age", "age", {
        unique: false,
      })
    }
  })
}
// 增加数据
const addData = (IDBDatabase, collectionName, data) => {
  const IDBRequest = IDBDatabase
  .transaction([collectionName], "readwrite") // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
  .objectStore(collectionName) // 仓库对象
  .add(data)
  IDBRequest.onsuccess = function (event) {
    console.log("数据写入成功")
  }
  
  IDBRequest.onerror = function (event) {
    console.log("数据写入失败")
  }
}

// 通过主键查询数据
const getOneByPrimaryKey = (db, collectionName, key) => {
    const IDBTransaction = db.transaction([collectionName]) // 事务
    const IDBObjectStore = IDBTransaction.objectStore(collectionName) // 仓库对象
    const IDBOpenDBRequest = IDBObjectStore.get(key) // 通过主键获取数据 getAll() 查询所有数据
  
  IDBOpenDBRequest.onerror = function (event) {
      console.log("事务失败")
    }
  
  IDBOpenDBRequest.onsuccess = function (event) {
      console.log("主键查询结果: ", IDBOpenDBRequest.result)
  }
}

// 通过游标查询数据
function cursorGetData(IDBDatabase, collectionName) {
  let list = []
  const IDBObjectStore = IDBDatabase
  .transaction(collectionName, "readwrite") // 事务
  .objectStore(collectionName); // 仓库对象
  const IDBRequest = IDBObjectStore.openCursor(); // 指针对象
  // 游标开启成功，逐行读数据
  IDBRequest.onsuccess = function (e) {
    const cursor = e.target.result
    if (cursor) {
      // 必须要检查
      list.push(cursor.value)
      cursor.continue() // 遍历了存储对象中的所有内容
    } else {
      console.log("游标读取的数据：", list)
    }
  }
}


// 只能查找满足条件的一条数据
function getDataByIndex(db, collectionName, indexName, indexValue) {
  const IDBObjectStore = db.transaction(collectionName, "readwrite").objectStore(collectionName);
  const IDBRequest = IDBObjectStore.index(indexName).get(indexValue)
  IDBRequest.onerror = function () {
    console.log("事务失败")
  };
  IDBRequest.onsuccess = function (e) {
    const res = e.target.result
    console.log("索引查询结果：", res)
  };
}



// 通过索引和游标查询记录
function cursorGetDataByIndex(db, collectionName, indexName, indexValue) {
  let list = []
  const IDBObjectStore = db.transaction(collectionName, "readwrite").objectStore(collectionName) // 仓库对象
  const IDBRequest  = IDBObjectStore
  .index(indexName) // 索引对象
  .openCursor(IDBKeyRange.only(indexValue)) // 指针对象
  IDBRequest.onsuccess = function (e) {
    const cursor = e.target.result
    if (cursor) {
      // 必须要检查
      list.push(cursor.value)
      cursor.continue() // 遍历了存储对象中的所有内容
    } else {
      console.log("游标索引查询结果：", list)
    }
  };
  IDBRequest.onerror = function (e) {}
}

const getCount = (db, collectionName, indexName, indexValue) => {
 let num = 0
  const IDBObjectStore = db.transaction(collectionName, "readwrite").objectStore(collectionName) // 仓库对象
  const IDBRequest  = IDBObjectStore
  .index(indexName) // 索引对象
  .openCursor(IDBKeyRange.only(indexValue)) // 指针对象
  IDBRequest.onsuccess = function (e) {
    const cursor = e.target.result
    if (cursor) {
     num++
      cursor.continue() // 遍历了存储对象中的所有内容
    } else {
      console.log("游标索引查询结果：", num)
    }
  };
  IDBRequest.onerror = function (e) {}
}

// 清空所有数据
const clearData = (db, collectionName) => {
  const IDBObjectStore = db.transaction(collectionName, "readwrite").objectStore(collectionName) // 仓库对象
  IDBObjectStore.clear()
}
/**
 * 通过索引和游标分页查询记录
 * @param {object} db 数据库实例
 * @param {string} collectionName 仓库名称
 * @param {string} indexName 索引名称
 * @param {number} indexValue 索引值
 * @param {number} page 页码
 * @param {number} pageSize 查询条数
 */
function cursorGetDataByIndexAndPage(
  db,
  collectionName,
  indexName,
  indexValue,
  page,
  pageSize
) {
  let list = []
  let counter = 0 // 计数器
  let advanced = true // 是否跳过多少条查询
  const store = db.transaction(collectionName, "readwrite").objectStore(collectionName)  // 仓库对象
  const request = store
  .index(indexName) // 索引对象
  .openCursor(IDBKeyRange.only(indexValue)) // 指针对象
  getCount(db, collectionName, indexName, indexValue)
  request.onsuccess = function (e) {
    let cursor = e.target.result
    if (page > 1 && advanced) {
      advanced = false
      cursor.advance((page - 1) * pageSize); // 跳过多少条
      return
    }
    if (cursor) {
      // 必须要检查
      list.push(cursor.value)
      counter++
      if (counter < pageSize) {
        cursor.continue() // 遍历了存储对象中的所有内容
      } else {
        cursor = null
        console.log("分页查询结果", list)
      }
    } else {
      console.log("分页查询结果", list)
    }
  }
  request.onerror = function (e) {}
}

function updateDB(db, collectionName, data) {
  const request = db
  .transaction([collectionName], "readwrite") // 事务对象
  .objectStore(collectionName) // 仓库对象
  .put(data);

  request.onsuccess = function () {
    console.log("数据更新成功")
  };

  request.onerror = function () {
    console.log("数据更新失败")
  };
}


// 通过主键删除数据
function deleteDB(db, collectionName, id) {
  const request = db
  .transaction([collectionName], "readwrite")
  .objectStore(collectionName)
  .delete(id);

  request.onsuccess = function () {
    console.log("数据删除成功")
  };

  request.onerror = function () {
    console.log("数据删除失败")
  };
}

// 通过索引和游标删除指定的数据
const cursorDelete = (db, collectionName, indexName, indexValue) =>{
  const store = db.transaction(collectionName, "readwrite").objectStore(collectionName);
  const request = store
  .index(indexName) // 索引对象
  .openCursor(IDBKeyRange.only(indexValue)); // 指针对象
  request.onsuccess = function (e) {
    const cursor = e.target.result
    let deleteRequest;
    if (cursor) {
      deleteRequest = cursor.delete() // 请求删除当前项
      deleteRequest.onerror = function () {
        console.log("游标删除该记录失败")
      };
      deleteRequest.onsuccess = function () {
        console.log("游标删除该记录成功")
      };
      cursor.continue();
    }
  };
  request.onerror = function (e) {}
}


const  closeDB = db => {
  db.close();
  console.log("数据库已关闭")
}


const deleteDBAll = dbName =>{
  console.log(dbName)
  let deleteRequest = window.indexedDB.deleteDatabase(dbName);
  deleteRequest.onerror = function (event) {
    console.log("删除失败")
  };
  deleteRequest.onsuccess = function (event) {
    console.log("删除成功")
  };
}
