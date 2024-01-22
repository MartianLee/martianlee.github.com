"use strict";(self.webpackChunknew_gatsby_blog=self.webpackChunknew_gatsby_blog||[]).push([[7208,7403],{496:function(e,t,n){n.r(t);var a=n(1151),l=n(7294);function r(e){const t=Object.assign({h1:"h1",h2:"h2",ul:"ul",li:"li",p:"p",h3:"h3",pre:"pre",code:"code",a:"a",ol:"ol"},(0,a.ah)(),e.components);return l.createElement(l.Fragment,null,l.createElement(t.h1,null,"블로그 이전"),"\n",l.createElement(t.h2,null,"왜 이전인가요"),"\n",l.createElement(t.ul,null,"\n",l.createElement(t.li,null,"이전의 jekyll 블로그는 깃헙에서 바로 지원하는 정적 블로그 생성기라서 사용했다. 무엇보다 예전에 루비를 사용해서 일을 하기도 해서 쉽게 커스텀 할 수 있다고 생각했다. 그런데 처음 만든 뒤 시간이 좀 지나서 스타일링이나 전체적인 구성을 바꾸고 싶은데 일이 너무 크다고 생각해서 계속 미뤄왔다."),"\n",l.createElement(t.li,null,"최근에는 javascript를 주력으로 사용하고 있다. 그렇다 보니 자연스레 블로그도 javascript 기반 CMS 도구를 사용해보아야겠다고 생각했다. 그래서 이왕 바꾸는거 과감하게 언어와 정적 생성기 자체를 바꿔보자 마음 먹었다. 그리고 내 선택은 Gatsby였다."),"\n"),"\n",l.createElement(t.h2,null,"과정"),"\n",l.createElement(t.p,null,"→ 상세 설치는 다른 블로그에서 자세히 설명한 분들이 많아 생략한다. 이전하면서 겪은 경험을 위주로 글을 작성하였다."),"\n",l.createElement(t.h3,null,"Gatsby 설치 및 설정"),"\n",l.createElement(t.pre,null,l.createElement(t.code,{className:"language-bash"},"npm init gatsby\n")),"\n",l.createElement(t.p,null,l.createElement(t.a,{href:"%5Bhttps://www.gatsbyjs.com/docs/quick-start/%5D(https://www.gatsbyjs.com/docs/quick-start/)"},"Gatsby 공식 문서"),"를 참조하면 쉽게 설정할 수 있다. 아참 나는 vanila js보다는 typescript를 선호해서 ",l.createElement(t.code,null,"-ts")," 옵션을 추가했다. 그 외에 폴더 구조 각종 gatsby 플러그인, 스타일링 라이브러리 등을 결정해야 한다. 이는 이 블로그 repository 혹은 다른 설치 게시글을 참조하면 좋겠다."),"\n",l.createElement(t.h3,null,"파일 옮겨오기"),"\n",l.createElement(t.p,null,"이 부분이 핵심이다. Gatsby의 구조에 대한 이해가 필요한데, 내가 경로를 설정하고 그 경로에 해당하는 파일을 page로 생성하는 코드를 gatsby-node에 추가해 주어야 한다."),"\n",l.createElement(t.pre,null,l.createElement(t.code,{className:"language-jsx"},"const { data } = await graphql(`\n  query Posts {\n    allMdx(sort: { fields: frontmatter___date, order: DESC }) {\n      nodes {\n        slug\n        frontmatter {\n          title\n          author\n          categories\n          crawlertitle\n          date\n          layout\n          summary\n          tags\n        }\n      }\n    }\n  }\n`);\nconst posts = data.allMdx.nodes;\nposts.forEach(async (node, index) => {\n  const pagetitle = node.slug?.split('-').splice(3).join('-');\n  createPage({\n    path: `/posts/${pagetitle}`,\n    component: path.resolve('./src/templates/post-details.tsx'),\n    context: {\n      title: node.frontmatter.title,\n      prev: index == 0 ? null : posts[index - 1],\n      next: index == posts.length - 1 ? null : posts[index + 1],\n    },\n  });\n});\n")),"\n",l.createElement(t.p,null,"그 부분은 위와 같다. 이 부분 또한 처음 Gatsby 사용자의 경우 어떤 값을 가져와야 하는지, template 페이지에 뭘 넣어야 하는 지, createPage의 context에 어떤 값을 넘겨줘야 하는 지 등등 결정하기가 쉽지 않다. 개인적으로는 Gatsby 튜토리얼이나 일단 작동하는 다른 블로그의 사례를 따라해서 컨텐츠를 로딩하는 데 성공한 이후에 각각의 값이 어떤 의미인지 문서를 읽어나가는 편을 추천한다."),"\n",l.createElement(t.h3,null,"스타일링하기"),"\n",l.createElement(t.p,null,"스타일링은 emotion의 styled component을 선택했다. tailwind, MUI가 유력한 대안이었는데, tailwind는 개인적으로 class가 줄줄 늘어서있는 모양이 마음에 들지 않았고 숙련도도 그리 높지 않아 선택하지 않았다. MUI 는 개인적으로 사용하는 방법이 좋지 못하다고 생각한다. 특히 sx="," 이렇게 생겨먹는 녀석들이 아주 별로다. 이미 컴포넌트를 제공하는 장점이 있지만, 커스텀이 들어가는 순간 사용성은 처음부터 직접 만드는 것보다 별로였다. 나의 개인적 선택은 emotion이었지만 emotion 또한 매번 컴포넌트를 생성해 주면서 이름도 붙여줘야 하는 귀찮음이 있다. 스타일링은 정답이 없고 무엇이든 장단점이 있으니 취향껏 선택하면 될 것 같다."),"\n",l.createElement(t.h3,null,"배포 - github action 설정하기"),"\n",l.createElement(t.p,null,"대망의 배포 시간이다. 사실 Gatsby의 손쉬운 배포는 github action 덕에 가능하다. 그리고 이 github action 설정도 다른 분들이 이미 만들어 놓으신 github action에 적극 의존했다."),"\n",l.createElement(t.p,null,l.createElement(t.code,null,".github/workflows")," 파일"),"\n",l.createElement(t.pre,null,l.createElement(t.code,{className:"language-yaml"},"name: Gatsby Publish\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n        with:\n          node-version: 16\n      - name: Gatsby Publish\n        uses: enriikke/gatsby-gh-pages-action@v2.2.0\n        with:\n          access-token: ${{ secrets.ACCESS_TOKEN }}\n          deploy-branch: gh-pages\n          gatsby-args: --prefix-paths\n")),"\n",l.createElement(t.p,null,"내 배포 구성은 위와 같다."),"\n",l.createElement(t.p,null,"github action의 발생 조건은 main 블로그에 push되거나 pr이 머지되면,"),"\n",l.createElement(t.p,null,"어떤 일을 하는지 보면 ubuntu-latest ,node16 환경에서 ",l.createElement(t.code,null,"enriikke/gatsby-gh-pages-action@v2.2.0")," 이 github action을 실행하라는 것 뿐이다. enriikke님이 큰 도움을 주셨다. 그리고 이 배포 결과는 gh-pages에 새로운 커밋으로 배포된다. 우리가 할 일은 gh-pages를 github blog의 배포 브랜치로 설정해주는 것이다. (repository의 Settings - Pages - Build and deployment - Branch 에서 설정할 수 있다)"),"\n",l.createElement(t.h2,null,"결과"),"\n",l.createElement(t.p,null,"결과는 지금 보시는 블로그다. (이 블로그도 추후에 바뀔 수 있으니 10월 9일 시점이라고 할 수 있다)"),"\n",l.createElement(t.p,null,"블로그를 이전할 때 이전의 블로그를 측정해 놓지 않아서 기록은 없지만 이미지도 많고 직접 html을 한 땀 한 땀 그려서 접근성 측면도 썩 좋지 않았다. 지금은 (아무것도 없기 때문에 당연하지만) lighthouse 100점을 받은 상황이다. 로드하는 데이터 소모도 적고 속도도 빠르니 환경적 측면에도 꽤 괜찮다. (홈 화면이 1MB이 되지 않음 !) 앞으로 이것저것 예쁘게 여러 기능을 추가하게 되겠지만, 계속해서 높은 lighthouse 점수를 추구할 것이다."),"\n",l.createElement(t.h2,null,"어려웠던 점"),"\n",l.createElement(t.ol,null,"\n",l.createElement(t.li,null,"Gatsby 익히기 : Gatsby가 그나마 다른 프레임워크에 비해 낫지만 그래도 나름의 생성 방식을 이해하는 데 시간이 꽤 필요했다. react 익숙하다고 해도 서버사이드 렌더링에 대한 경험이 없다면 조금 헤멜 수도 있다. 아 그리고 정적 자원을 질의하는 데 graphql을 사용하고 있어서 아주 거창하지는 않더라도 기본적인 graphql 사용법도 알아야 된다. 쓰고 보니 생각보다 진입장벽이 있다."),"\n",l.createElement(t.li,null,"Gatsby 라이브러리 : Gatsby 익히기의 연장이라고 할 수 있다. Gatsby에서 기능을 사용하려면 이미 만들어진 라이브러리들을 사용하는 편이 좋은데, ",l.createElement(t.code,null,"gatsby-plugin-mdx")," 라던지 이런 라이브러리를 gatsby에 설치하는 과정이 아주 매끄럽진 않다. gatsby-config의 plugins에 추가해 주어야 하는데, 익숙해지면 엄청나게 커스터마이징이 가능하지만 처음엔 정말 헷갈린다."),"\n",l.createElement(t.li,null,"디자인 : 역시 처음부터 블로그를 디자인하는 일은 쉽지 않다. 필수적인 것만 넣는다고 생각했는데도 여기에 이 버튼이 있는 게 맞나? 게시글 가독성도 그다지 좋지 않다. 마음에 안드는 구석이 많지만 지금 코드 베이스는 수정이 이전에 비해 매우 용이해서 위안삼고 있다."),"\n",l.createElement(t.li,null,"이전 keyll 에서 사용하던 이미지 경로를 수정하지 못했다. 그래서 현재 이미지가 뜨지 않는 상황. 정규표현식으로 replace하면 적당할듯 하다."),"\n"),"\n",l.createElement(t.h2,null,"끝내며"),"\n",l.createElement(t.p,null,"다 쓰고보니 정말 진입장벽이 높다. javascript를 주력으로 쓰는 분이 아니라면 쉽게 추천하기는 어려운 방법 같다. 그럼에도 불구하고 리엑트와 프론트엔드 라이브러리들의 넓은 생태계를 개인 블로그에서 경험할 수 있기 때문에 강력 추천한다. 무엇보다 재밌다 🤣"),"\n",l.createElement(t.h2,null,"참조 링크"),"\n",l.createElement(t.p,null,"자세한 설치 방법\nhttps://devfoxstar.github.io/web/github-pages-gatsby/"),"\n",l.createElement(t.p,null,"https://hislogs.com/make-gatsby-blog/"),"\n",l.createElement(t.p,null,l.createElement(t.a,{href:"https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/how-gatsby-works-with-github-pages/"},"공식문서 - How Gatsby Works with GitHub Pages")))}t.default=function(e){void 0===e&&(e={});const{wrapper:t}=Object.assign({},(0,a.ah)(),e.components);return t?l.createElement(t,e,l.createElement(r,e)):r(e)}},8871:function(e,t,n){n.r(t),n.d(t,{default:function(){return Z}});var a=n(496),l=n(7462),r=n(4316),s=n(7294),o=n(1151),c=n(8899),i=n(917);const u=(0,r.Z)("h1",{target:"e5jkt9i12"})(""),m=(0,r.Z)("h2",{target:"e5jkt9i11"})({name:"7va4f6",styles:"margin:2rem 0 1rem"}),g=(0,r.Z)("h3",{target:"e5jkt9i10"})(""),p=(0,r.Z)("p",{target:"e5jkt9i9"})({name:"17ebupe",styles:"line-height:1.5rem;&>code{display:inline-block;background:transparent;padding:0 0.4rem;background:#fcf55f;border-radius:0;border:none;font-weight:bold;word-break:break-all;}"}),d=(0,r.Z)("code",{target:"e5jkt9i8"})(""),h=((0,r.Z)("pre",{target:"e5jkt9i7"})(""),(0,r.Z)("code",{target:"e5jkt9i6"})({name:"1gkxtoh",styles:"display:block;white-space:pre-wrap;word-wrap:break-word;background:#fbfbf4;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"})),b=(0,r.Z)("strong",{target:"e5jkt9i5"})({name:"1beyxqc",styles:"background:red;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"}),y=(0,r.Z)("img",{target:"e5jkt9i4"})({name:"1oax00r",styles:"margin:1rem 0"}),E=(0,r.Z)("a",{target:"e5jkt9i3"})({name:"1m5hyg0",styles:"word-break:break-all"}),k={h1:u,h2:m,h3:g,p:p,code:h,strong:b,blockquote:b,pre:d,img:y,a:e=>(0,i.tZ)(E,(0,l.Z)({},e,{target:"_blank",rel:"noopener noreferrer"}))},f=(0,r.Z)("div",{target:"e5jkt9i2"})({name:"d47c8v",styles:"padding:2.5rem 1rem 0.5rem 1rem;background:#e9e9e9"}),w=(0,r.Z)("section",{target:"e5jkt9i1"})({name:"okspu",styles:"padding:1rem;line-height:1.4rem"}),x=(0,r.Z)("div",{target:"e5jkt9i0"})({name:"2qga7i",styles:"text-align:right"});function j(e){let{data:t,pageContext:n,children:a}=e;const{frontmatter:l}=t.mdx,{title:r,summary:s,featuredImg:u,tags:m,date:g}=l,[p,d]=new Date(g.replace(" ","T").replace(" ","")).toLocaleString().split("T");return(0,i.tZ)(c.Z,null,(0,i.tZ)(f,null,(0,i.tZ)("h1",null,r),(0,i.tZ)(x,null,"발행일: ",p)),(0,i.tZ)(w,null,(0,i.tZ)(o.Zo,{components:k},a)))}function Z(e){return s.createElement(j,e,s.createElement(a.default,e))}},1151:function(e,t,n){n.d(t,{Zo:function(){return o},ah:function(){return r}});var a=n(7294);const l=a.createContext({});function r(e){const t=a.useContext(l);return a.useMemo((()=>"function"==typeof e?e(t):{...t,...e}),[t,e])}const s={};function o({components:e,children:t,disableParentContext:n}){let o;return o=n?"function"==typeof e?e({}):e||s:r(e),a.createElement(l.Provider,{value:o},t)}}}]);
//# sourceMappingURL=component---src-templates-post-details-tsx-content-file-path-contents-posts-2022-10-10-gatsby-migration-mdx-22eb5b1c97a3199813ef.js.map