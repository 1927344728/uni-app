import { buildCategoryOptions, buildTypeOptions } from './category';

export const CLIENT_ROLE_OPTIONS = [
  { label: '超级管理员', value: 1 },
  { label: '家长', value: 2 },
  { label: '学生', value: 3 },
];

export const ADMIN_ROLE_OPTIONS = [
  { label: '超级管理员', value: 1 },
  { label: '管理员', value: 2 },
];

/** @deprecated 兼容旧引用；后台展示请用 ADMIN_ROLE_OPTIONS */
export const ROLE_OPTIONS = [
  ...ADMIN_ROLE_OPTIONS,
  ...CLIENT_ROLE_OPTIONS,
];

export const PLATFORM_OPTIONS = [
  { label: 'H5', value: 'h5' },
  { label: '安卓 App', value: 'app-plus' },
  { label: '微信小程序', value: 'mp-weixin' },
];

export const JUMP_TO_OPTIONS = [
  { label: '应用内跳转 (navigate)', value: 'navigate' },
  { label: '内嵌网页 (webview)', value: 'webview' },
  { label: '外部浏览器 (web)', value: 'web' },
];

export const BANNER_TYPE_OPTIONS = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
];

export const CONTENT_CATEGORY_OPTIONS = buildCategoryOptions();

export const ARTICLE_TYPE_OPTIONS = buildTypeOptions(1);
export const BOOK_TYPE_OPTIONS = buildTypeOptions(2);
export const MUSIC_TYPE_OPTIONS = buildTypeOptions(3);
export const VIDEO_TYPE_OPTIONS = buildTypeOptions(4);

export const BUTTONS = [
  { key: 'create', label: '新建' },
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除' },
  { key: 'restore', label: '恢复' },
  { key: 'upload', label: '上传' },
  { key: 'resetPassword', label: '重置密码' },
  { key: 'changeRole', label: '改角色' },
];

export const RESOURCES = [
  {
    key: 'articles',
    label: '文章',
    path: '/content/articles',
    endpoint: '/api/admin/articles',
    pagePermission: 'content.articles',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'author', label: '作者', table: true },
      { key: 'note', label: '摘要', type: 'textarea' },
      { key: 'type', label: '类型', type: 'select', multiple: true, categoryId: 1, options: ARTICLE_TYPE_OPTIONS, table: true },
      { key: 'subType', label: '子类型', type: 'select', categoryLevel: 'subType', categoryId: 1 },
      { key: 'className', label: '样式类名' },
      { key: 'seq', label: '排序', type: 'number', table: true },
      { key: 'thumb', label: '封面', type: 'image', table: true },
      { key: 'jumpTo', label: '跳转类型', type: 'select', options: JUMP_TO_OPTIONS },
      { key: 'url', label: '跳转地址', type: 'link' },
      {
        key: 'content',
        label: '内容 JSON 块',
        type: 'json',
        span: 24,
        tip: '文章正文按块数组编辑。已识别类型：title / subTitle / author / readText / image；未识别类型原样保存。',
        example: `[
  { "type": "title", "content": "标题" },
  { "type": "author", "content": "作者" },
  { "type": "readText", "content": "<p>可朗读的 HTML</p>", "rate": 1 },
  { "type": "image", "content": "https://example.com/a.jpg", "description": "图注" }
]`,
      },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'books',
    label: '书籍',
    path: '/content/books',
    endpoint: '/api/admin/books',
    pagePermission: 'content.books',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'author', label: '作者', table: true },
      { key: 'owner', label: '所有者' },
      { key: 'type', label: '类型', type: 'select', multiple: true, categoryId: 2, options: BOOK_TYPE_OPTIONS, table: true },
      { key: 'score', label: '评分', type: 'number' },
      { key: 'seq', label: '排序', type: 'number', table: true },
      { key: 'cover', label: '封面', type: 'image', table: true },
      { key: 'description', label: '简介', type: 'textarea', span: 24 },
      {
        key: 'tags',
        label: '标签 JSON',
        type: 'json',
        span: 24,
        tip: '书籍标签字符串数组，客户端按标签展示。',
        example: `["成长", "科普", "亲子"]`,
      },
      {
        key: 'summaries',
        label: '摘记 JSON',
        type: 'json',
        span: 24,
        tip: '书籍摘记，可为字符串或字符串数组。',
        example: `["这段话很重要", "适合亲子共读"]`,
      },
      {
        key: 'highlights',
        label: '高亮 JSON',
        type: 'json',
        span: 24,
        tip: '高亮金句字符串数组。',
        example: `["真正的成长来自持续练习", "把知识用起来"]`,
      },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'musics',
    label: '音乐',
    path: '/content/musics',
    endpoint: '/api/admin/musics',
    pagePermission: 'content.musics',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'singer', label: '歌手', table: true },
      { key: 'type', label: '类型', type: 'select', multiple: true, categoryId: 3, options: MUSIC_TYPE_OPTIONS, table: true },
      { key: 'desc', label: '简介', type: 'textarea' },
      { key: 'seq', label: '排序', type: 'number', table: true },
      { key: 'url', label: '音频', type: 'media' },
      { key: 'cover', label: '封面', type: 'image', table: true },
      { key: 'lyric', label: '歌词', type: 'textarea', span: 24 },
      { key: 'fileName', label: '文件名' },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'music-menus',
    label: '歌单',
    path: '/content/music-menus',
    endpoint: '/api/admin/music-menus',
    pagePermission: 'content.musicMenus',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'desc', label: '简介', type: 'textarea' },
      { key: 'icon', label: '图标', type: 'image', table: true },
      {
        key: 'songIds',
        label: '歌曲 ID JSON/逗号列表',
        type: 'json',
        span: 24,
        tip: '歌单内歌曲 ID 列表，顺序即播放顺序；也可写成逗号分隔。',
        example: `[12, 34, 56]`,
      },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'videos',
    label: '视频',
    path: '/content/videos',
    endpoint: '/api/admin/videos',
    pagePermission: 'content.videos',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'publisher', label: '发布者', table: true },
      { key: 'type', label: '类型', type: 'select', multiple: true, categoryId: 4, options: VIDEO_TYPE_OPTIONS, table: true },
      { key: 'desc', label: '简介', type: 'textarea' },
      { key: 'seq', label: '排序', type: 'number', table: true },
      { key: 'url', label: '视频', type: 'media' },
      { key: 'cover', label: '封面', type: 'image', table: true },
      { key: 'objectFit', label: '填充模式' },
      { key: 'ratio', label: '比例' },
      { key: 'fileName', label: '文件名' },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'video-menus',
    label: '片单',
    path: '/content/video-menus',
    endpoint: '/api/admin/video-menus',
    pagePermission: 'content.videoMenus',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'desc', label: '简介', type: 'textarea' },
      {
        key: 'videoIds',
        label: '视频 ID JSON/逗号列表',
        type: 'json',
        span: 24,
        tip: '片单内视频 ID 列表，顺序即展示顺序；也可写成逗号分隔。',
        example: `[7, 8, 15]`,
      },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'tasks',
    label: '任务',
    path: '/content/tasks',
    endpoint: '/api/admin/tasks',
    pagePermission: 'content.tasks',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'status', label: '状态', type: 'select', options: [{ label: '未开始', value: 1 }, { label: '进行中', value: 2 }, { label: '已完成', value: 3 }, { label: '已取消', value: 4 }], table: true },
      { key: 'publisher', label: '发布者' },
      { key: 'targeter', label: '目标用户' },
      { key: 'content', label: '正文', type: 'textarea', span: 24 },
      { key: 'progress', label: '进度', type: 'number' },
      { key: 'finished', label: '完成情况', type: 'textarea' },
      {
        key: 'awards',
        label: '奖励 JSON',
        type: 'json',
        span: 24,
        tip: '任务奖励内容块数组，结构与文章 content 类似，客户端用 ArticleDetail 渲染。',
        example: `[
  { "type": "title", "content": "完成奖励" },
  { "type": "text", "content": "贴纸一张" }
]`,
      },
      {
        key: 'attachments',
        label: '附件 JSON',
        type: 'json',
        span: 24,
        tip: '任务附件内容块数组，结构与文章 content 类似。',
        example: `[
  { "type": "image", "content": "https://example.com/file.png", "description": "参考图" }
]`,
      },
      {
        key: 'works',
        label: '作品 JSON',
        type: 'json',
        span: 24,
        tip: '任务作品内容块数组，结构与文章 content 类似。',
        example: `[
  { "type": "image", "content": "https://example.com/work.jpg", "description": "学生作品" }
]`,
      },
      { key: 'publishTime', label: '发布时间', type: 'date' },
      { key: 'startTime', label: '开始时间', type: 'date' },
      { key: 'endTime', label: '结束时间', type: 'date' },
      { key: 'seq', label: '排序', type: 'number', table: true },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'banners',
    label: 'Banner',
    path: '/ops/banners',
    endpoint: '/api/admin/banners',
    pagePermission: 'ops.banners',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'type', label: '类型', type: 'select', options: BANNER_TYPE_OPTIONS, table: true },
      { key: 'image', label: '图片', type: 'image', table: true },
      { key: 'jumpTo', label: '跳转类型', type: 'select', options: JUMP_TO_OPTIONS },
      { key: 'url', label: '跳转地址', type: 'link' },
      { key: 'seq', label: '排序', type: 'number', table: true },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'home-entries',
    label: '快捷入口',
    path: '/ops/home-entries',
    endpoint: '/api/admin/home-entries',
    pagePermission: 'ops.homeEntries',
    searchable: true,
    fields: [
      { key: 'key', label: 'Key', required: true, table: true },
      { key: 'name', label: '名称', required: true, table: true },
      { key: 'image', label: '图标', type: 'image', table: true },
      { key: 'jumpTo', label: '跳转类型', type: 'select', options: JUMP_TO_OPTIONS },
      { key: 'url', label: '跳转地址', type: 'link' },
      { key: 'seq', label: '排序', type: 'number', table: true },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'categories',
    label: '分类',
    path: '/ops/categories',
    endpoint: '/api/admin/categories',
    pagePermission: 'ops.categories',
    searchable: true,
    compactIds: true,
    mergeCells: {
      categoryId: ['categoryId'],
      typeName: ['categoryId', 'typeId'],
    },
    fields: [
      { key: 'categoryId', label: '类型', type: 'select', options: CONTENT_CATEGORY_OPTIONS, table: true, width: 88 },
      { key: 'categoryName', label: '类型名称' },
      { key: 'typeId', label: '分类ID', type: 'number' },
      { key: 'typeName', label: '分类名称', table: true, width: 100 },
      { key: 'subTypeId', label: '子分类ID', type: 'number' },
      { key: 'subTypeName', label: '子分类名称', table: true, width: 120 },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
  {
    key: 'word-libraries',
    label: '词库',
    path: '/ops/word-libraries',
    endpoint: '/api/admin/word-libraries',
    pagePermission: 'ops.wordLibraries',
    searchable: true,
    fields: [
      { key: 'title', label: '标题', required: true, table: true },
      { key: 'words', label: '词表文本', type: 'textarea', table: true },
      { key: 'platform', label: '平台', type: 'platform', table: true },
    ],
  },
];

export const PAGE_PERMISSIONS = [
  { key: 'dashboard', label: '数据看板', buttons: [] },
  ...RESOURCES.map((item) => ({
    key: item.pagePermission,
    label: item.label,
    buttons: BUTTONS.filter((button) => {
      if (button.key === 'resetPassword' || button.key === 'changeRole') return item.key === 'users';
      return true;
    }).map((button) => ({ key: `${item.pagePermission}.${button.key}`, label: button.label })),
  })),
  { key: 'system.users', label: '用户', buttons: ['create', 'edit', 'delete', 'restore', 'resetPassword', 'changeRole'].map((key) => ({ key: `system.users.${key}`, label: BUTTONS.find((button) => button.key === key)?.label || key })) },
  { key: 'system.permissions', label: '权限管理', buttons: [{ key: 'system.permissions.edit', label: '编辑' }] },
];
