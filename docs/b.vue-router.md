## vue 路由传参数

在Vue Router中，传递参数主要有以下几种方式，每种方式适用于不同的场景：

---

### **1. 动态路由参数（Params）**

- **适用场景**：参数作为URL路径的一部分（如 `/user/123`）。
- **配置路由**：
  ```js
  // router.js
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
  ```
- **传递参数**：
    - 声明式导航（`<router-link>`）：
      ```html
      <router-link :to="{ name: 'User', params: { id: 123 }}">用户</router-link>
      ```
    - 编程式导航：
      ```javascript
      this.$router.push({ name: 'User', params: { id: 123 }});
      ```
- **接收参数**：
    - 通过 `$route.params`：
      ```javascript
      // User.vue
      export default {
        mounted() {
          console.log(this.$route.params.id); // 123
        }
      }
      ```
    - **通过Props解耦**（推荐）：
      ```javascript
      // router.js
      {
        path: '/user/:id',
        props: true, // 将params自动映射为组件的props
        component: User
      }
  
      // User.vue
      export default {
        props: ['id'], // 直接通过props接收
      }
      ```

---

### **2. 查询参数（Query）**

- **适用场景**：通过URL查询字符串传递参数（如 `/user?id=123`）。
- **传递参数**：
    - 声明式导航：
      ```html
      <router-link :to="{ name: 'User', query: { id: 123 }}">用户</router-link>
      ```
    - 编程式导航：
      ```javascript
      this.$router.push({ name: 'User', query: { id: 123 }});
      ```
- **接收参数**：
  ```javascript
  // User.vue
  export default {
    mounted() {
      console.log(this.$route.query.id); // 123
    }
  }
  ```

---

### **3. 通过Props传递对象**

- **适用场景**：传递静态数据或复杂对象，避免通过URL暴露参数。
- **配置路由**：
  ```javascript
  // router.js
  {
    path: '/user',
    name: 'User',
    component: User,
    props: { role: 'admin' } // 静态props
    // 或动态函数（可结合params/query）
    props: (route) => ({
      id: route.params.id,
      role: route.query.role
    })
  }
  ```
- **接收参数**：
  ```javascript
  // User.vue
  export default {
    props: ['id', 'role'], // 同时接收动态和静态参数
  }
  ```

---

### **4. 编程式导航的额外方式**

- **通过路由的 `meta` 字段**：
  ```javascript
  // router.js
  {
    path: '/user',
    component: User,
    meta: { requiresAuth: true }
  }
  ```
- **在导航守卫中传递数据**：
  ```javascript
  this.$router.push({
    name: 'User',
    state: { data: '秘密数据' } // 通过history.state传递（需浏览器支持）
  });

  // 在组件中获取
  console.log(history.state.data); // '秘密数据'
  ```

---

### **关键区别与注意事项**

| 方式         | 参数位置                 | 是否可见（URL） | 组件接收方式                          | 刷新是否保留 |
|------------|----------------------|-----------|---------------------------------|--------|
| 动态路由参数     | URL路径 (`/user/123`)  | 是         | `$route.params` 或 `props`       | 是      |
| 查询参数       | URL查询字符串 (`?id=123`) | 是         | `$route.query`                  | 是      |
| Props      | 不暴露在URL              | 否         | 组件 `props`                      | 否      |
| Meta/State | 不暴露                  | 否         | `$route.meta` 或 `history.state` | 否/部分保留 |

---

### **最佳实践**

1. **优先使用Props**：通过 `props: true` 或函数形式解耦组件与路由，提升可复用性。
2. **敏感数据避免URL暴露**：使用 `props` 或 `meta` 传递。
3. **监听参数变化**：
   ```javascript
   // User.vue
   watch: {
     '$route'(to, from) {
       if (to.params.id !== from.params.id) {
         this.fetchUser(to.params.id);
       }
     }
   }
   ```
4. **可选参数处理**：
   ```javascript
   // router.js
   path: '/user/:id?', // id为可选
   ```

## Vue Router原理

---

### **核心原理对比**

#### 1. **Hash 模式**

- **实现机制**：
    - URL 中的 `#` 后的部分称为 **哈希（hash）**，例如 `http://example.com/#/home`。
    - **哈希变化不会触发浏览器向服务器发送请求**，因此页面不会重新加载。
    - 依赖 `hashchange` 事件监听哈希变化：
      ```js
      window.addEventListener('hashchange', () => {
        // 根据当前哈希值更新页面内容
      });
      ```
    - **Vue Router 内部**：
        - 通过 `window.location.hash` 修改 URL。
        - 监听 `hashchange` 事件，触发路由匹配和组件渲染。

- **关键特点**：
    - **完全由前端控制**：服务器只需返回一个 HTML 文件（如 `index.html`），所有路由逻辑由前端处理。
    - **兼容性极好**：`hashchange` 事件在老旧浏览器（如 IE8+）中也能工作。

---

#### 2. **History 模式**

- **实现机制**：
    - 使用 HTML5 的 **History API**（`pushState` 和 `replaceState`）修改 URL：
      ```js
      // 添加一条历史记录
      history.pushState({}, '', '/home');
      // 替换当前历史记录
      history.replaceState({}, '', '/home');
      ```
    - **URL 路径变化不会触发页面刷新**，但需要前端自行处理路由逻辑。
    - **Vue Router 内部**：
        - 通过 `history.pushState` 或 `history.replaceState` 修改 URL。
        - 监听 `popstate` 事件（用户点击浏览器前进/后退按钮时触发）：
          ```js
          window.addEventListener('popstate', () => {
            // 根据当前路径更新页面内容
          });
          ```

- **关键特点**：
    - **需要服务器配合**：当用户直接访问子路径（如 `http://example.com/home`）时，服务器需要返回 `index.html`，否则会报 404。
    - **依赖现代浏览器**：IE9 及以下不支持 History API。

---

### **深入原理**

#### Hash 模式如何避免页面刷新？

- **哈希的天然特性**：  
  浏览器对 `#` 后的内容视为“页面内的锚点”，修改哈希值不会触发页面请求。前端通过监听 `hashchange` 事件，手动更新页面内容。

#### History 模式如何模拟“无刷新跳转”？

- **History API 的魔法**：  
  `pushState` 和 `replaceState` 允许前端直接修改 URL 路径，而**不会触发页面加载**。但浏览器不会自动处理这些路径对应的内容，需要前端自己实现路由匹配。

---

### **为什么 History 模式需要服务器配置？**

假设用户直接访问 `http://example.com/home`：

1. 浏览器会向服务器发送请求 `/home`。
2. 如果服务器没有对应的路由处理，会返回 404。
3. **解决方案**：  
   服务器将所有非静态资源请求重定向到 `index.html`，例如：
    - **Nginx 配置**：
      ```nginx
      location / {
        try_files $uri $uri/ /index.html;
      }
      ```
    - **Express 配置**：
      ```js
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
      ```

---

### **路由跳转的完整流程**

#### Hash 模式流程：

1. **用户点击 `<router-link to="/home">`**：
    - Vue Router 调用 `router.push('/home')`。
    - 修改 `window.location.hash` 为 `#/home`。
2. **触发 `hashchange` 事件**：
    - Vue Router 解析哈希值 `/home`，匹配对应路由。
    - 加载并渲染对应的组件。
3. **用户点击浏览器后退按钮**：
    - 哈希值变化，再次触发 `hashchange` 事件。
    - 重复步骤 2。

#### History 模式流程：

1. **用户点击 `<router-link to="/home">`**：
    - Vue Router 调用 `router.push('/home')`。
    - 调用 `history.pushState({}, '', '/home')`，URL 变为 `/home`。
2. **Vue Router 解析路径 `/home`**：
    - 匹配对应路由，加载并渲染组件。
3. **用户点击浏览器后退按钮**：
    - 触发 `popstate` 事件。
    - Vue Router 解析当前路径，重新渲染组件。

---

### **关键问题与解决方案**

#### 1. **History 模式的 404 问题**

- **场景**：用户直接访问 `/home`，但服务器未配置，返回 404。
- **解决**：服务器需将所有路径指向 `index.html`（如上述 Nginx 配置）。

#### 2. **Hash 模式的 SEO 问题**

- **问题**：搜索引擎可能忽略 `#` 后的内容。
- **解决**：改用 History 模式 + 服务端渲染（SSR）或静态生成（如 Nuxt.js）。

#### 3. **History 模式的浏览器兼容性**

- **问题**：IE9 及以下不支持 History API。
- **解决**：使用 Hash 模式，或为旧浏览器提供降级方案。

---

### **Vue Router 的底层实现**

- **Hash 模式**：
  ```js
  class HashHistory {
    constructor(router) {
      window.addEventListener('hashchange', () => {
        const path = window.location.hash.slice(1); // 去掉 # 号
        router.transitionTo(path); // 执行路由跳转
      });
    }
  }
  ```

- **History 模式**：
  ```js
  class HTML5History {
    constructor(router) {
      window.addEventListener('popstate', (event) => {
        const path = window.location.pathname;
        router.transitionTo(path); // 执行路由跳转
      });
    }

    push(path) {
      history.pushState({}, '', path); // 修改 URL
      router.transitionTo(path); // 手动触发路由跳转
    }
  }
  ```

---

### **总结**

| **核心差异**    | **Hash 模式**                   | **History 模式**                      |
|-------------|-------------------------------|-------------------------------------|
| **URL 结构**  | 带 `#`，如 `http://a.com/#/home` | 无 `#`，如 `http://a.com/home`         |
| **服务器要求**   | 无需配置                          | 需配置所有路径返回 `index.html`              |
| **实现原理**    | `hashchange` 事件 + 哈希操作        | `history.pushState` + `popstate` 事件 |
| **兼容性**     | 所有浏览器                         | 不支持 IE9 及以下                         |
| **SEO 友好性** | 差（需额外处理）                      | 较好（仍需服务端渲染）                         |
| **前端路由控制权** | 完全由前端管理                       | 需与服务器配合                             |

**选择建议**：

- 优先使用 **History 模式**：追求 URL 美观，且能控制服务器配置。
- 降级为 **Hash 模式**：兼容旧浏览器，或无法配置服务器时。

理解这些原理后，可以更自信地处理路由相关的问题（如 404、SEO、浏览器兼容性等）！

## 路由拦截是怎么实现的

路由拦截，需要在路由配置中添加一个字段，它是用于判断路由是否需要拦截

```js
{
    name: 'index',
    path: "/index",
    component: Index,
    meta: {
        requirtAuth:true
    }
}
router.beforeEach((to,from,next) => {
    if(to.meta.requirtAuth){
        if( store.satte.token ){
            next()
        }else{
            
        }
    }
})
```

## 说一下vue的动态路由

要在路由配置里设置meat属性，扩展权限相关的字段，在路由导航守卫里通过判断这个权限标识，实现路由的动态增加和跳转
根据用户登录的账号，返回用户角色
前端再根据角色，跟路由表的meta.role进行匹配
把匹配搭配的路由形成可访问的路由

