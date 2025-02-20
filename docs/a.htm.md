## html 知识剖析

### 网站开发中，如何实现图片的懒加载

#### 一、基本原理

> 触发条件：当图片进入用户可视区域（或接近可视区域）时，动态替换占位符为真实图片URL。

- 核心步骤：

:::tip
1.使用 data-src（或 data-srcset）属性存储真实图片地址。

2.检测图片是否进入视口，触发加载。

3.加载完成后替换占位符，显示真实图片。
:::

#### 二、实现方案

:::tip
1.原生 JavaScript + Intersection Observer API（推荐）

优势：高性能、低耦合，现代浏览器原生支持。
:::

```html
<img class="lazyload" data-src="real-image.jpg" alt="image"/>
```

```js
// JavaScript
document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll(".lazyload");

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src; // 替换真实URL
                img.classList.remove("lazyload");
                observer.unobserve(img); // 停止观察已加载图片
            }
        });
    }, {
        rootMargin: "0px 0px 200px 0px", // 预加载200px外的图片
        threshold: 0.1 // 交叉比例阈值
    });

    lazyImages.forEach(img => observer.observe(img));
});
```

:::tip
2.传统滚动事件监听 + 节流

适用场景：兼容旧浏览器（如IE）
:::

```js
function lazyLoad() {
    const imgs = document.querySelectorAll('.lazyload');
    imgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight + 200 && rect.bottom >= 0) {
            img.src = img.dataset.src;
            img.classList.remove('lazyload');
        }
    });
}

// 节流优化 + 初始化加载
const throttleLazyLoad = _.throttle(lazyLoad, 200);
window.addEventListener('scroll', throttleLazyLoad);
window.addEventListener('resize', throttleLazyLoad);
lazyLoad(); // 首次加载可见图片
```

:::tip
3.第三方库

- lozad.js：轻量级（<1KB），基于Intersection Observer。

- lazysizes：功能丰富，支持响应式图片、自动检测滚动等。
  :::

```html
<!-- 使用 lazysizes -->
<script src="lazysizes.min.js"></script>
<img data-src="image.jpg" class="lazyload" alt="image"/>
```

### HTML 中有哪些语义化标签

:::tip
header
footer
main
aside
article
section
address
summary/details
menu
h1/h2/h3/h4/h5/h6
img
p
strong/italic
:::

# H5新特性：十个新特性

:::tip
一、语义标签

二、增强型表单

三、视频和音频

四、Canvas绘图

五、SVG绘图

六、地理定位

七、拖放API

八、WebWorker

九、WebStorage

十、WebSocket
:::

一、语义标签

html5语义标签，可以使开发者更方便清晰构建页面的布局

| 标签          | 描述                 |
|-------------|--------------------|
| `<header>`  | 定义了文档的头部区域         |
| `<footer>`  | 定义了文档的尾部区域         |
| `<nav>`     | 定义文档的导航            |
| `<section>` | 定义文档中的节            |
| `<article>` | 定义文章               |
| `<aside>`   | 定义页面以外的内容          |
| `<details>` | 定义用户可以看到或者隐藏的额外细节  |
| `<summary>` | 标签包含`details`元素的标题 |
| `<dialog>`  | 定义对话框              |
| `<figure>`  | 定义自包含内容，如图表        |
| `<main>`    | 定义文档主内容            |
| `<mark>`    | 定义文档的主内容           |
| `<time>`    | 定义日期/时间            |

二、增强型表单

html5修改一些新的input输入特性，改善更好的输入控制和验证

| 输入类型             | 描述             |
|------------------|----------------|
| `color`          | 主要用于选取颜色       |
| `date`           | 选取日期           |
| `datetime`       | 选取日期（UTC时间）    |
| `datetime-local` | 选取日期（无时区）      |
| `month`          | 选择一个月份         |
| `week`           | 选择周和年          |
| `time`           | 选择一个时间         |
| `email`          | 包含e-mail地址的输入域 |
| `number`         | 数值的输入域         |
| `url`            | url地址的输入域      |
| `tel`            | 定义输入电话号码和字段    |
| `search`         | 用于搜索域          |
| `range`          | 一个范围内数字值的输入域   |

html5新增了五个表单元素

| 标签           | 描述                      |
|--------------|-------------------------|
| `<datalist>` | 用户会在他们输入数据时看到域定义选项的下拉列表 |
| `<progress>` | 进度条，展示连接/下载进度           |
| `<meter>`    | 刻度值，用于某些计量，例如温度、重量等     |
| `<keygen>`   | 提供一种验证用户的可靠方法，生成一个公钥和私钥 |
| `<output>`   | 用于不同类型的输出，比如尖酸或脚本输出     |

html5新增表单属性

| 属性             | 描述                            |
|----------------|-------------------------------|
| `placeholder`  | 输入框默认提示文字                     |
| `required`     | 要求输入的内容是否可为空                  |
| `pattern`      | 描述一个正则表达式验证输入的值               |
| `min/max`      | 设置元素最小/最大值                    |
| `step`         | 为输入域规定合法的数字间隔                 |
| `height/width` | 用于`image`类型`<input>`标签图像高度/宽度 |
| `autofocus`    | 规定在页面加载时，域自动获得焦点              |
| `multiple`     | 规定`<input>`元素中可选择多个值          |  

### HTML 标签有哪些行内元素

:::tip
a
img
picture
span
input
textarea
select
label
:::

### 如何取消请求的发送

根据发送网络请求的API不同，取消方法不同

- xhr
- fetch
- axios


#### 001 XHR 使用 xhr.abort()

```js
const xhr = new XMLHttpRequest(),
  method = "GET",
  url = "https://developer.mozilla.org/";
xhr.open(method, url, true);
 
xhr.send();
 
// 取消发送请求
xhr.abort();
```
#### 002 fetch 使用 AbortController

```js
const controller = new AbortController()
const signal = controller.signal

const downloadBtn = document.querySelector('.download');
const abortBtn = document.querySelector('.abort');

downloadBtn.addEventListener('click', fetchVideo);

// 点击取消按钮时，取消请求的发送
abortBtn.addEventListener('click', function () {
    controller.abort();
    console.log('Download aborted');
});

function fetchVideo() {
// ...
    fetch(url, {signal}).then(function (response) {
    // ...
    }).catch(function (e) {
        // 请求被取消之后将会得到一个 AbortError
        reports.textContent = 'Download error: ' + e.message;
    })
}
```

#### 003 Axios: xhr 与 http/https

```js
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios
        .get("/user/12345", {
          cancelToken: source.token,
        })
        .catch(function (thrown) {
          if (axios.isCancel(thrown)) {
            console.log("Request canceled", thrown.message);
          } else {
            // handle error
          }
        });

axios.post(
        "/user/12345",
        {
          name: "new name",
        },
        {
          cancelToken: source.token,
        },
);

// cancel the request (the message parameter is optional)
source.cancel("Operation canceled by the user.");
```

#### 在 Canvas 中如何处理跨域的图片

```js 
img.setAttribute("crossOrigin", "anonymous");
```

#### textarea 如何禁止拉伸

```css
textarea {
  resize: none;
}
```


### 什么是 HTML 的实体编码 (HTML Entity Encode)

:::tip
- 不可分的空格:＆nbsp;
- <(小于符号):＆lt;
- (大于符号):＆gt;
- ＆(与符号):＆amp;
- ″(双引号):＆quot;
- ‘(单引号):‘＆apos;
- ...
:::

HTML 实体是一段以连字号（&）开头、以分号（;）结尾的字符串。用以显示不可见字符及保留字符 (如 HTML 标签)

在前端，一般为了避免 XSS 攻击，会将 <> 编码为 &lt; 与 &gt;，这些就是 HTML 实体编码。

在 [whatwg]('https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references) 中可查看实体编码数据。

在 HTML 转义时，仅仅只需要对六个字符进行编码: &, <, >, ", ', ```。可使用 [he]("https://npm.devtool.tech/he") 这个库进行编码及转义


```js
// 实体编码
he.encode('<img src=""></img>')
"&#x3C;img src=&#x22;&#x22;&#x3E;&#x3C;/img&#x3E;"
 
// 转义
he.escape('<img src=""></img>')
"&lt;img src=&quot;&quot;&gt;&lt;/img&gt;"
```


### 什么是 Data URL

#### Data URL是将图片转换为base64直接嵌入到了网页中，使用`<img src="data:[MIME type];base64"/>`这种方式引用图片，不需要再发请求获取图片。 使用Data URL也有一些缺点：

:::tip
- base64编码后的图片会比原来的体积大三分之一左右。
- Data URL形式的图片不会缓存下来，每次访问页面都要被下载一次。可以将Data URL写入到CSS文件中随着CSS被缓存下来。
:::


#### Data URL是前缀为data:协议的URL； 它允许内容创建者向文档中嵌入小文件，比如图片等。 Data URL由四部分组成：

:::tip
- 前缀data:
- 指示数据类型的MIME类型。例如image/jpeg表示JPEG图像文件；如果此部分被省略，则默认值为text/plain;charset=US-SACII
- 如果为非文本数据，则可选base64做标记
- 数据
:::

```html
data:[mediatype][;base63], data
```  

### HTML 中的 input 标签有哪些 type

:::warning
- button
- checkbox
- color
- date
- datetime-local
- email
- file
- hidden
- image
- month
- number
- password
- radio
- range
- reset
- search
- submit
- tel
- text
- time
- url
- week
:::

### 什么是重排重绘，如何减少重拍重绘

> 重排和重绘是关键渲染路径中的两步，可以参考另一个问题: [什么是关键渲染路径]("https://q.shanyue.tech/fe/engineering/391")

 - 重排(Reflow)：元素的位置发生变动时发生重排，也叫回流。此时在关键渲染路径中的 Layout 阶段，计算每一个元素在设备视口内的确切位置和大小。当一个元素位置发生变化时，其父元素及其后边的元素位置都可能发生变化，代价极高


 - 重绘(Repaint): 元素的样式发生变动，但是位置没有改变。此时在关键渲染路径中的 Paint 阶段，将渲染树中的每个节点转换成屏幕上的实际像素，这一步通常称为绘制或栅格化

> 另外，重排必定会造成重绘。以下是避免过多重拍重绘的方法

:::tip
- 1.使用 DocumentFragment 进行 DOM 操作，不过现在原生操作很少也基本上用不到
- 2.CSS 样式尽量批量修改
- 3.避免使用 table 布局
- 4.为元素提前设置好高宽，不因多次渲染改变位置
:::

#### 如何计算白屏时间和首屏时间