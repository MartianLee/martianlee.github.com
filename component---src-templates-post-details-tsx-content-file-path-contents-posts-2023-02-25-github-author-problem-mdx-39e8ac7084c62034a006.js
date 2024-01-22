"use strict";(self.webpackChunknew_gatsby_blog=self.webpackChunknew_gatsby_blog||[]).push([[3569,147],{3290:function(e,t,n){n.r(t);var r=n(1151),l=n(7294);function a(e){const t=Object.assign({p:"p",strong:"strong",h2:"h2",pre:"pre",code:"code",img:"img",ul:"ul",li:"li",a:"a"},(0,r.ah)(),e.components);return l.createElement(l.Fragment,null,l.createElement(t.p,null,l.createElement(t.strong,null,"Gihtub에서 author가 잘못된 커밋이 많이 쌓였을 때")),"\n",l.createElement(t.p,null,"회사에서 github에 커밋을 많이 하는데, 어느 순간부턴가 깃헙에 잔디가 찍히지 않는 다는 것을 발견했다. 뭔가 문제겠지 라고 생각하다가 어느 날 호기심이 들어서 찾아봤다."),"\n",l.createElement(t.p,null,"원인은, 쉽게 설명하면 github이 내가 작성한 commit이라는 것을 모른다는 것. ssh 키는 인증이 되어서 그걸로 알아서 나인지 판단한다고 생각했는데 github은 그것을 email과 name으로 판단한다."),"\n",l.createElement(t.p,null,"그러니까 이미 작성된 몇백개의 commit을 다 수정해 주어야 하는 것이었다! 어떡하지..."),"\n",l.createElement(t.p,null,"하지만, 다행히 방법이 있었다."),"\n",l.createElement(t.h2,null,"커밋을 되돌릴 repository로 이동한다."),"\n",l.createElement(t.pre,null,l.createElement(t.code,{className:"language-bash"},"git log\n")),"\n",l.createElement(t.img,{src:"../images/images/230225_github_author-problem/glg.png",alt:"glg"}),"\n",l.createElement(t.p,null,"를 실행하면 지난 커밋들이 보입니다. 여기서 잘못된 이메일을 찾습니다.\n저의 경우에는 한글자가 앞뒤로 잘못되어 있었습니다."),"\n",l.createElement(t.h2,null,"아래 스크립트를 실행한다."),"\n",l.createElement(t.p,null,"아래 스크립트를 보시면"),"\n",l.createElement(t.ul,null,"\n",l.createElement(t.li,null,l.createElement(t.code,null,'WRONG_EMAIL="{틀리게작성된@이메일}"')),"\n",l.createElement(t.li,null,l.createElement(t.code,null,'NEW_NAME="{새롭게작성할이름}"')),"\n",l.createElement(t.li,null,l.createElement(t.code,null,'NEW_EMAIL="{새롭게설정한@이메일}"')),"\n"),"\n",l.createElement(t.p,null,"이렇게 세 부분을 직접 작성하셔야 합니다."),"\n",l.createElement(t.pre,null,l.createElement(t.code,{className:"language-bash"},'git filter-branch --env-filter \'\nWRONG_EMAIL="{틀리게작성된@이메일}"\nNEW_NAME="{새롭게작성할이름}"\nNEW_EMAIL="{새롭게설정한@이메일}"\n\nif [ "$GIT_COMMITTER_EMAIL" = "$WRONG_EMAIL" ]\nthen\n    export GIT_COMMITTER_NAME="$NEW_NAME"\n    export GIT_COMMITTER_EMAIL="$NEW_EMAIL"\nfi\nif [ "$GIT_AUTHOR_EMAIL" = "$WRONG_EMAIL" ]\nthen\n    export GIT_AUTHOR_NAME="$NEW_NAME"\n    export GIT_AUTHOR_EMAIL="$NEW_EMAIL"\nfi\n\' --tag-name-filter cat -- --branches --tags\n')),"\n",l.createElement(t.p,null,"이 명령어를 사용하면 다음과 같이 결과가 출력됩니다.\n",l.createElement(t.img,{src:"%22../images/images/230225_github_author-problem/overwritten.png%22",alt:"overwritten"})),"\n",l.createElement(t.h2,null,"주의사항"),"\n",l.createElement(t.p,null,"출처의 블로그에서도 나와있지만 위 명령어는 ",l.createElement(t.strong,null,'"매우 주의해서:"')," 사용해야 한다고 합니다. 다른 stack-overflow에서도 권장하지 않는 방법이라는 이야기가 있습니다. 이전 커밋들을 몽땅 수정하는 명령어이기때문에 혹시 push되지 않은 repository라면 미리 clone해 놓거나 작업이 어느정도 일단락되어서 마무리된 상황에서 시도하면 될 것 같습니다.\n(참고로, 커밋되지 않은 변경사항이 있는 경우 명령어가 작동하지 않습니다.)"),"\n",l.createElement(t.p,null,"결과\n",l.createElement(t.img,{src:"%22../images/images/230225_github_author-problem/my-commits.png%22",alt:"my-commits"})),"\n",l.createElement(t.p,null,"덕분에 정말 수백 개의 커밋이 다시 잔디로 바뀌었다 흑흑. 잔디 없을 때는 별 생각 없었는데, 막상 채워지니까 뿌듯하다. 잔디를 더 많이많이 심어야지~"),"\n",l.createElement(t.h2,null,"출처"),"\n",l.createElement(t.p,null,l.createElement(t.a,{href:"https://madplay.github.io/post/change-git-author-name"},"https://madplay.github.io/post/change-git-author-name")))}t.default=function(e){void 0===e&&(e={});const{wrapper:t}=Object.assign({},(0,r.ah)(),e.components);return t?l.createElement(t,e,l.createElement(a,e)):a(e)}},9949:function(e,t,n){n.r(t),n.d(t,{default:function(){return I}});var r=n(3290),l=n(7462),a=n(4316),o=n(7294),i=n(1151),m=n(8899),c=n(917);const u=(0,a.Z)("h1",{target:"e5jkt9i12"})(""),g=(0,a.Z)("h2",{target:"e5jkt9i11"})({name:"7va4f6",styles:"margin:2rem 0 1rem"}),s=(0,a.Z)("h3",{target:"e5jkt9i10"})(""),p=(0,a.Z)("p",{target:"e5jkt9i9"})({name:"17ebupe",styles:"line-height:1.5rem;&>code{display:inline-block;background:transparent;padding:0 0.4rem;background:#fcf55f;border-radius:0;border:none;font-weight:bold;word-break:break-all;}"}),E=(0,a.Z)("code",{target:"e5jkt9i8"})(""),d=((0,a.Z)("pre",{target:"e5jkt9i7"})(""),(0,a.Z)("code",{target:"e5jkt9i6"})({name:"1gkxtoh",styles:"display:block;white-space:pre-wrap;word-wrap:break-word;background:#fbfbf4;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"})),h=(0,a.Z)("strong",{target:"e5jkt9i5"})({name:"1beyxqc",styles:"background:red;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"}),b=(0,a.Z)("img",{target:"e5jkt9i4"})({name:"1oax00r",styles:"margin:1rem 0"}),f=(0,a.Z)("a",{target:"e5jkt9i3"})({name:"1m5hyg0",styles:"word-break:break-all"}),_={h1:u,h2:g,h3:s,p:p,code:d,strong:h,blockquote:h,pre:E,img:b,a:e=>(0,c.tZ)(f,(0,l.Z)({},e,{target:"_blank",rel:"noopener noreferrer"}))},k=(0,a.Z)("div",{target:"e5jkt9i2"})({name:"d47c8v",styles:"padding:2.5rem 1rem 0.5rem 1rem;background:#e9e9e9"}),M=(0,a.Z)("section",{target:"e5jkt9i1"})({name:"okspu",styles:"padding:1rem;line-height:1.4rem"}),y=(0,a.Z)("div",{target:"e5jkt9i0"})({name:"2qga7i",styles:"text-align:right"});function Z(e){let{data:t,pageContext:n,children:r}=e;const{frontmatter:l}=t.mdx,{title:a,summary:o,featuredImg:u,tags:g,date:s}=l,[p,E]=new Date(s.replace(" ","T").replace(" ","")).toLocaleString().split("T");return(0,c.tZ)(m.Z,null,(0,c.tZ)(k,null,(0,c.tZ)("h1",null,a),(0,c.tZ)(y,null,"발행일: ",p)),(0,c.tZ)(M,null,(0,c.tZ)(i.Zo,{components:_},r)))}function I(e){return o.createElement(Z,e,o.createElement(r.default,e))}},1151:function(e,t,n){n.d(t,{Zo:function(){return i},ah:function(){return a}});var r=n(7294);const l=r.createContext({});function a(e){const t=r.useContext(l);return r.useMemo((()=>"function"==typeof e?e(t):{...t,...e}),[t,e])}const o={};function i({components:e,children:t,disableParentContext:n}){let i;return i=n?"function"==typeof e?e({}):e||o:a(e),r.createElement(l.Provider,{value:i},t)}}}]);
//# sourceMappingURL=component---src-templates-post-details-tsx-content-file-path-contents-posts-2023-02-25-github-author-problem-mdx-39e8ac7084c62034a006.js.map