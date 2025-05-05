if (
  self.location.hostname.split('.').length > 2 &&
  self.location.hostname.split('.')[0] !== 'www' &&
  self.location.hostname.split('.')[0] !== 'pulse-app'
) {
  // We're on a subdomain, use API route for workbox
  self.workboxPath = '/api/workbox';
}

if (!self.define) {
  let e,
    s = {};
  const a = (a, c) => {
    return (
      (a = new URL(a + '.js', c).href),
      s[a] ||
        new Promise((s) => {
          if ('document' in self) {
            const e = document.createElement('script');
            (e.src = a), (e.onload = s), document.head.appendChild(e);
          } else (e = a), importScripts(a), s();
        }).then(() => {
          const e = s[a];
          if (!e) throw new Error(`Module ${a} didn't register its module`);
          return e;
        })
    );
  };
  self.define = (c, r) => {
    const i = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[i]) return;
    const t = {};
    const n = (e) => {
        return a(e, i);
      },
      p = { module: { uri: i }, exports: t, require: n };
    s[i] = Promise.all(
      c.map((e) => {
        return p[e] || n(e);
      }),
    ).then((e) => {
      return r(...e), t;
    });
  };
}
define(['./workbox-4754cb34'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: 'cea140409eeb77d28d0929c247061b19' },
        { url: '/_next/dynamic-css-manifest.json', revision: 'd751713988987e9331980363e24189ce' },
        {
          url: '/_next/static/chunks/0e5ce63c-5849325b323b4843.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/1074-3ec45a3a60357eb5.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/1118-9bb1d3e5406124bd.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/1292-e2c72799a409c446.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/1329d575-526e213536fd8a43.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/1471-4968adb418d312f5.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/1530-d4d102a481fdcd77.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/155-5492da88705cb8e8.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/1615-54960a4882a1db21.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/1684-d08de34a5267fccd.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/200-dbfc47b1ed309e6d.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2027-fc9ee730300214de.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/2170a4aa-0a4b96a33068a725.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/2191-5b6e275f212137ea.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2350-1a7c961d611a6d40.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2374-44e4aba1fa73e2d9.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2499-173759e7f1cc52e7.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2563-782461781e6ffe9d.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2674-1a4ca369b6663d98.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2743-4c278963c6f1224d.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2820-e25d3e11658bae51.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/2995-53372724d99c2477.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/3063-a20038ee27f1974a.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/3263-2fb7103f4a39b062.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/32ea55aa-7fa9bde63176c28b.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/3464-80511f1fe27bd31d.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/385-3391743384234fcc.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/4072-b0ee84c3d47950d3.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/4235-095d3d90140bb1e2.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/4332-0917efdb251a5a87.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/4339-97225b8b5879e754.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/4392-0981c78cfd5acde5.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/4573-4abb60b24e24c9ef.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/4792-137529118ed110c8.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/4bd1b696-d072200f62744da0.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/5073-7fd89906101a6ff0.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/5187-178a5df7f9a17ffd.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/5238-01d6cb70392dee31.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/5262-7a496914a6cb921d.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/5269-38bec365ddf6c302.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/54a60aa6-b5614b4849c60582.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/5525-4b2dcd8009df7a68.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/578c2090-cdbc03ee8fe38a0b.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/5918-523337c6358b22c8.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/59650de3-e27001247e0f8bc2.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/602dbae6-4fe3507ae9754be4.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/624-1efecf0a95606456.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/638-e745acb1cce43337.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/6544-718c148c24ef0266.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/6603-0a5abb59b10719cf.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/6671-fd9ba1767ff31893.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/6797-e5411c18e53af5b7.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/6835-be9a6f63496d6970.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/6874-805cbe039db197bf.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/6885-b6afdb79b5ee938b.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/704-82167bd54c49b55d.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/70e0d97a-73147749974705e7.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/7130-1bf5ad9e7bbd0366.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/7165-87c716938992ad18.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/7187-479e8ef719d8e8c4.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/7466-d36184b9c3c22eaf.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/7655-d5c2c0875161f933.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/7866-176cc077e10f3bd0.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/788-3f83a37a65d14f5e.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/8007-f97f8beda23a82a0.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/8374-37bf33fcda4c3ba0.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/8436-d3855088d54b238c.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/8515-7d70262a8c4f64ce.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/8717-cabaaaf59a2247e1.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/9032-4a399b15cf3b14b1.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/9278-dd2d0b9aed0b132d.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/9373-a6716df663ad6946.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/9436-bf1332cc59d9ea41.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/9453-23485e75f604f675.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/971-436e57557e64c8f6.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        { url: '/_next/static/chunks/9971-4b4fc9f408002aa3.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/(auth)/login/page-d36dd2946f7f8f77.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/(auth)/register/page-14fad0cd66608e35.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/(callback)/sync/google/callback/page-b98fbad0123c15fc.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/(portal)/portal/booking/%5BbookingId%5D/page-56ba2d3a748c437a.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/(portal)/portal/lead/%5Bid%5D/page-ea2428b52b3e1e21.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/(portal)/portal/lead/demo/page-2795c206de62b840.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/(standaone)/approvals/%5Bid%5D/page-e9d3bc25bdfebdaf.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/analytics/page-9d99e422d1bcd71e.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/calendar/page-20b9ce14043411fc.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/customers/page-12454be9d1b7256e.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/database/%5BtableId%5D/page-1e2e6f4b71337320.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/database/layout-a6c361fcc8f9074b.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/database/page-165984eca4039152.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/inventory/page-c5761773085844ec.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/invoice/%5Bid%5D/page-c8cdee77806eefce.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/invoices/new/page-ea5eb36ede1e2d87.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/invoices/page-bfb8c6cfb5fe38f2.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/invoices/refresh/page-07c5723c700c0afd.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/invoices/return/page-a05b8d2b4d5a89e7.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/layout-4888f0df63f47a3d.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/leads/form/%5B%5B...id%5D%5D/page-9816bdcb4fbde8a5.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/leads/form/new/page-4c802042ad0e2594.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/leads/layout-2fe15926f5cedfff.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/leads/page-144f20c385035e78.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/leads/settings/page-1b2e89c96455d4ce.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/leads/submissions/page-059705e4336ce57d.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/page-a7bdd3cdf8db553b.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/payment-success/page-cfcd6fecd4a9a109.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/payments/page-ebd3c379f14d70f3.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/profile/page-4504fd9f6e5adde2.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/%5Bid%5D/activity/page-9ff289b13c8f28fa.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/%5Bid%5D/files/page-505d6a061ca09ef2.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/%5Bid%5D/kanban/page-1fbff0d1fa06d24d.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/%5Bid%5D/modules/page-9e11508e90cecffb.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/%5Bid%5D/page-27a405bc2f5baab4.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/%5Bid%5D/payments/page-5dd2a9d7365b6976.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/%5Bid%5D/schedule/page-9c4fc4f131612f88.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/new/page-bbf9b03bc79b21f4.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/projects/page-27588a680df7e63b.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/settings/calendar/page-d19d8993611157ad.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/%5Bworkspace%5D/settings/page-89486d72a7bb0fd1.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-b45a6fafa2785729.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-ffb5f4f40fda4332.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-cd79240ad6791200.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/admin/page-896b435ddc03e5c7.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/api-test/page-3444a9d47abf029e.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/api/chat/route-5ae41a18207244c3.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/api/invoices/route-1e59315c94f6a702.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/api/manifest/%5Bworkspace%5D/route-9d67ec69c21922a7.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/api/project-modules/route-7a3f92e34a0308b0.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/calendar/page-3c418fd4c28929f5.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/customers/page-151c0cbce27f7719.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/dev/page-7c136666493a39de.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/examples/page-30615235006a0c24.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/inventory/page-292552ae5a9f1f8c.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/invite/layout-f5cbae30616516c7.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/invite/workspace/%5Btoken%5D/page-51e5f94f75acd9aa.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/layout-381d44a20060452f.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/offline/page-faf8b684555585d2.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/onboard/page-58752c23ec2ecf1a.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/page-2cf8bbd55608bf2c.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/payments/page-7328fd9bd5d8d7ff.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/profile/page-70bc78895038aceb.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/settings/page-2af963e837529d05.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/app/test/page-102b166cfac92032.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/b536a0f1-f601beff7361885b.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/bd904a5c-6665a444454e58ca.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/ccd63cfe-c530ff0cd3edc51f.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/e34aaff9-6d622e39e065d1d8.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/f4898fe8-a754f1a2a766b2f8.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/fc2f6fa8-8a27068848932b40.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/fcfb803e-14cdf0644f81101f.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/framework-c054b661e612b06c.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/chunks/main-1b887b231c580d51.js', revision: 'rapcpdHb_CH0Kr5jLTJ5e' },
        {
          url: '/_next/static/chunks/main-app-7b5b8994ec805114.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/pages/_app-5d1abe03d322390c.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/pages/_error-3b2a1d523de49635.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-574f1128f480abee.js',
          revision: 'rapcpdHb_CH0Kr5jLTJ5e',
        },
        { url: '/_next/static/css/3a9eb47239ee6851.css', revision: '3a9eb47239ee6851' },
        { url: '/_next/static/css/6040d5c10aa8df41.css', revision: '6040d5c10aa8df41' },
        { url: '/_next/static/css/64ba4acbedbaa2ab.css', revision: '64ba4acbedbaa2ab' },
        { url: '/_next/static/css/a598f9cf7d592dec.css', revision: 'a598f9cf7d592dec' },
        {
          url: '/_next/static/media/26d4368bf94c0ec4-s.p.woff2',
          revision: 'd28498895ed7050c37c94ddd026a4670',
        },
        {
          url: '/_next/static/media/2801417b65625cf5-s.woff2',
          revision: 'd313794bd9fda8b0ad44189b27348eab',
        },
        {
          url: '/_next/static/media/28793f5c5e3d822d-s.woff2',
          revision: 'c352fb162d499702d53f0dbfaab7b58f',
        },
        {
          url: '/_next/static/media/569ce4b8f30dc480-s.p.woff2',
          revision: 'ef6cefb32024deac234e82f932a95cbd',
        },
        {
          url: '/_next/static/media/747892c23ea88013-s.woff2',
          revision: 'a0761690ccf4441ace5cec893b82d4ab',
        },
        {
          url: '/_next/static/media/7b19b489dc6743ba-s.woff2',
          revision: 'fa052422282eb26cff400131e5af4da1',
        },
        {
          url: '/_next/static/media/8d697b304b401681-s.woff2',
          revision: 'cc728f6c0adb04da0dfcb0fc436a8ae5',
        },
        {
          url: '/_next/static/media/93f479601ee12b01-s.p.woff2',
          revision: 'da83d5f06d825c5ae65b7cca706cb312',
        },
        {
          url: '/_next/static/media/9610d9e46709d722-s.woff2',
          revision: '7b7c0ef93df188a852344fc272fc096b',
        },
        {
          url: '/_next/static/media/b3bf17a9041d9433-s.woff2',
          revision: 'ded54b0f07a0919cf7e27d7880a56e0a',
        },
        {
          url: '/_next/static/media/ba015fad6dcf6784-s.woff2',
          revision: '8ea4f719af3312a055caf09f34c89a77',
        },
        {
          url: '/_next/static/media/baa020e15443c7c9-s.p.woff2',
          revision: '344f39e54a04fc7d3bc8f7afba9b3b37',
        },
        {
          url: '/_next/static/media/c336923c403a4eca-s.woff2',
          revision: '1fffe98e9659f54c821860f7f9b3d2e4',
        },
        {
          url: '/_next/static/media/c436fa0951ed6fb9-s.woff2',
          revision: '42920ef1539a2f13c0c84b0d6e01f0ef',
        },
        {
          url: '/_next/static/media/c9c3823090ec8b55-s.woff2',
          revision: '625be018001610bec1a5c0ba45d9988c',
        },
        {
          url: '/_next/static/rapcpdHb_CH0Kr5jLTJ5e/_buildManifest.js',
          revision: '16fbc7c68a3b5e410dbeeaf2518880ad',
        },
        {
          url: '/_next/static/rapcpdHb_CH0Kr5jLTJ5e/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/fonts/Inter-Bold.woff', revision: '01bbd20096b3c9bfe707ca32a1ba157a' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/icons/apple-icon-180.png', revision: '7cb20b230bb0e42f05043c31990f7f2e' },
        {
          url: '/icons/manifest-icon-192.maskable.png',
          revision: '811a08d59596ceaa0f7a3e0af1271529',
        },
        {
          url: '/icons/manifest-icon-512.maskable.png',
          revision: '5896523add6a004eb679d8d730baa26a',
        },
        { url: '/manifest.json', revision: '92eea64f02bd6be3ebff0f2990eac9f0' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/noise.png', revision: '3be7b8b182ccd96e48989b4e57311193' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: a, state: c }) => {
              return s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s;
            },
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: e }) => {
        return !(self.origin === e.origin);
      },
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET',
    );
});
