"use strict";(self.webpackChunknew_gatsby_blog=self.webpackChunknew_gatsby_blog||[]).push([[3465,3006],{3322:function(e,t,n){n.r(t);var r=n(1151),l=n(7294);function a(e){const t=Object.assign({h2:"h2",p:"p",code:"code",a:"a",pre:"pre"},(0,r.ah)(),e.components);return l.createElement(l.Fragment,null,l.createElement(t.h2,null,"Migration"),"\n",l.createElement(t.p,null,"Gatsby v4에서 v5로 마이그레이션하면 ",l.createElement(t.code,null,"@mdx-js/react")," 라이브러리도 v2로 버전업 해야 한다.\n이 때 여러 문제가 동시다발적을 터져서 고통받았다. 혹시 같이 겪는 분을 위해 기록을 남긴다."),"\n",l.createElement(t.h2,null,"문제1"),"\n",l.createElement(t.p,null,"mdx 파일 안에 기존 jekyll 에서 사용하던 문자열 ex. ",l.createElement(t.code,null,"{:toc}")," 같은 것들이 포함되어 있었다.\n그런데 파서는 원인을 찾기 어려운 동일한 에러를 띄웠다."),"\n",l.createElement(t.p,null,"에러는 계속해서 ",l.createElement(t.code,null,"Invalid left-hand side in prefix operation. (1:2)")," 혹은 ",l.createElement(t.code,null,"Could not parse expression with acorn")," 과 같은 에러가 발생했다.\n처음에 나는 mdx 파서가 frontmatter를 읽지 못하는 줄 알았다. 에러가 거의 대부분의 파일에서 발생했기 때문이다.\n그러나 검색을 하고 mdx 파일을 수정하던 결과 결국 mdx 포맷에 맞지 않는 구문을 사용하면 그냥 최상단에서 에러가 발생하다는 것을 발견했다."),"\n",l.createElement(t.p,null,l.createElement(t.a,{href:"https://paulie.dev/posts/2022/08/mdx-2-breaking-changes-and-gatsby-plugin-mdx-v4/"},"참조한 글")),"\n",l.createElement(t.p,null,"최종적으로는 위 글에 큰 도움을 받았다."),"\n",l.createElement(t.p,null,"이 글에서는 jsx 포맷에서 사용되는 ",l.createElement(t.code,null,"{")," 대괄호를 그냥 사용하면 안된다는 것을 지적한다."),"\n",l.createElement(t.p,null,"그래서 mdx 파일을 찬찬히 봤더니 정말로 잘못 사용하고 있었다.\njekyll에서 사용하던 문서들을 migration해서 썼던 탓에 ",l.createElement(t.code,null,"{:toc}")," 혹은 ",l.createElement(t.code,null,"{{ site.url }}"),"과 같은 구문이 거의 대부분의 문서에 포함되어 있었다."),"\n",l.createElement(t.p,null,"이것들을 모두 제공했더니 아무 에러 없이 빌드가 되었다."),"\n",l.createElement(t.h2,null,"문제2"),"\n",l.createElement(t.p,null,"slug가 없어졌다. 기존의 page create는 전적으로 slug에 의존하고 있었기 때문에 바로 에러가 났다.\n방법을 고민하다, 기존 페이지(SEO)와의 호환성을 위해 페이지별로 수동으로 slug frontmatter 값을 추가해 주었다."),"\n",l.createElement(t.pre,null,l.createElement(t.code,null,"---\n...\nslug: '2023-03-02-gatsby-v5-to-v4'\n...\n---\n")),"\n",l.createElement(t.p,null,"위와 같이 모든 파일에 일일히 기존의 파일 이름을 추가했다.\n추후에 글 쓸 때 약간 번거로울 수 있지만 우선은 기존 포맷으로 가기로 했다."),"\n",l.createElement(t.h2,null,"마치며"),"\n",l.createElement(t.p,null,"문제 해결을 위해서 eslint 파서가 문제인가? 하면서 babel을 뜯어야 하는걸까? 온갖 고민을 다했다.\n다행히, 실마리를 찾아서 잘 해결해서 지금은 배포한 상태다. 도구들에 의존하는데, 도구를 잘 알지 못하고 버전업을 하다 보면 이렇게 문제에 부닥친다.\n덕분에 Gatsby와 조금 더 친해진 기분이 든다. 한번 고통받고 나니 차라리 static page도 nextjs로 마이그레이션 하는 게 나은 게 아닐까? 라는 생각까지 하고 있다. 하하."))}t.default=function(e){void 0===e&&(e={});const{wrapper:t}=Object.assign({},(0,r.ah)(),e.components);return t?l.createElement(t,e,l.createElement(a,e)):a(e)}},4093:function(e,t,n){n.r(t),n.d(t,{default:function(){return v}});var r=n(3322),l=n(7462),a=n(4316),o=n(7294),c=n(1151),i=n(8899),m=n(917);const u=(0,a.Z)("h1",{target:"e5jkt9i12"})(""),s=(0,a.Z)("h2",{target:"e5jkt9i11"})({name:"7va4f6",styles:"margin:2rem 0 1rem"}),d=(0,a.Z)("h3",{target:"e5jkt9i10"})(""),g=(0,a.Z)("p",{target:"e5jkt9i9"})({name:"17ebupe",styles:"line-height:1.5rem;&>code{display:inline-block;background:transparent;padding:0 0.4rem;background:#fcf55f;border-radius:0;border:none;font-weight:bold;word-break:break-all;}"}),p=(0,a.Z)("code",{target:"e5jkt9i8"})(""),b=((0,a.Z)("pre",{target:"e5jkt9i7"})(""),(0,a.Z)("code",{target:"e5jkt9i6"})({name:"1gkxtoh",styles:"display:block;white-space:pre-wrap;word-wrap:break-word;background:#fbfbf4;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"})),h=(0,a.Z)("strong",{target:"e5jkt9i5"})({name:"1beyxqc",styles:"background:red;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"}),f=(0,a.Z)("img",{target:"e5jkt9i4"})({name:"1oax00r",styles:"margin:1rem 0"}),k=(0,a.Z)("a",{target:"e5jkt9i3"})({name:"1m5hyg0",styles:"word-break:break-all"}),E={h1:u,h2:s,h3:d,p:g,code:b,strong:h,blockquote:h,pre:p,img:f,a:e=>(0,m.tZ)(k,(0,l.Z)({},e,{target:"_blank",rel:"noopener noreferrer"}))},x=(0,a.Z)("div",{target:"e5jkt9i2"})({name:"d47c8v",styles:"padding:2.5rem 1rem 0.5rem 1rem;background:#e9e9e9"}),y=(0,a.Z)("section",{target:"e5jkt9i1"})({name:"okspu",styles:"padding:1rem;line-height:1.4rem"}),Z=(0,a.Z)("div",{target:"e5jkt9i0"})({name:"2qga7i",styles:"text-align:right"});function j(e){let{data:t,pageContext:n,children:r}=e;const{frontmatter:l}=t.mdx,{title:a,summary:o,featuredImg:u,tags:s,date:d}=l,[g,p]=new Date(d.replace(" ","T").replace(" ","")).toLocaleString().split("T");return(0,m.tZ)(i.Z,null,(0,m.tZ)(x,null,(0,m.tZ)("h1",null,a),(0,m.tZ)(Z,null,"발행일: ",g)),(0,m.tZ)(y,null,(0,m.tZ)(c.Zo,{components:E},r)))}function v(e){return o.createElement(j,e,o.createElement(r.default,e))}},1151:function(e,t,n){n.d(t,{Zo:function(){return c},ah:function(){return a}});var r=n(7294);const l=r.createContext({});function a(e){const t=r.useContext(l);return r.useMemo((()=>"function"==typeof e?e(t):{...t,...e}),[t,e])}const o={};function c({components:e,children:t,disableParentContext:n}){let c;return c=n?"function"==typeof e?e({}):e||o:a(e),r.createElement(l.Provider,{value:c},t)}}}]);
//# sourceMappingURL=component---src-templates-post-details-tsx-content-file-path-contents-posts-2023-03-02-gatsby-v-5-to-v-4-mdx-8ef806f13dedc572d8cc.js.map