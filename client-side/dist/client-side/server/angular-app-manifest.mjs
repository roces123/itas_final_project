
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/register"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/user-dashboard"
  },
  {
    "renderMode": 2,
    "route": "/my-request"
  },
  {
    "renderMode": 2,
    "route": "/new-request"
  },
  {
    "renderMode": 2,
    "route": "/user/profile"
  },
  {
    "renderMode": 2,
    "route": "/admin-dashboard"
  },
  {
    "renderMode": 2,
    "route": "/manage-request"
  },
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 8793, hash: '2dbdb4fb426c5137794a4bab0464c6f5fb6349690cf679bd3791d601c0f7efe9', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 948, hash: 'd2f0dbbbe224c192a3c5bb0aad15013e06bafeacc87b4b5ad5021c97ea153a72', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'user/profile/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/user_profile_index_html.mjs').then(m => m.default)},
    'admin-dashboard/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/admin-dashboard_index_html.mjs').then(m => m.default)},
    'new-request/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/new-request_index_html.mjs').then(m => m.default)},
    'user-dashboard/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/user-dashboard_index_html.mjs').then(m => m.default)},
    'manage-request/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/manage-request_index_html.mjs').then(m => m.default)},
    'my-request/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/my-request_index_html.mjs').then(m => m.default)},
    'register/index.html': {size: 22283, hash: '9358b9c798e2bab0a11db5dc2d8d786e736a59665d2bfca3c881814525d06a1c', text: () => import('./assets-chunks/register_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 19807, hash: '31f597fe6c8fce1275edd75d71715989f0732108c37c1147809471f1dc91a6ef', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-WEYCXKRM.css': {size: 46562, hash: 'OaCfRBbM1nE', text: () => import('./assets-chunks/styles-WEYCXKRM_css.mjs').then(m => m.default)}
  },
};
