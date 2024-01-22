"use strict";(self.webpackChunknew_gatsby_blog=self.webpackChunknew_gatsby_blog||[]).push([[9253],{8503:function(e,n,t){t.r(n);var o=t(1151),l=t(7294);function r(e){const n=Object.assign({p:"p",pre:"pre",code:"code",a:"a"},(0,o.ah)(),e.components);return l.createElement(l.Fragment,null,l.createElement(n.p,null,"장고에서 우리가 흔히 알고 있는 빙고게임과 같은 기능을 구현하려고 하였다.\n그렇게 하려면 게임판의 사이즈를 알고 그 사이즈*사이즈 만큼의 HTML table을 그려야 하는데, 기존에 내가 알고 있던 장고Django 템플릿Template의 for loop는 그저 주어진 객체의 갯수만큼 자동으로 반복되는 수 밖에 없었다. 그래서 찾아 보았더니..."),"\n",l.createElement(n.pre,null,l.createElement(n.code,{className:"language-django"},"...\nrender_to_response('foo.html', \\{..., 'range': range(10), ...\\}, ...)\n...\nand in the template:\n\n\\{% for i in range %\\}\n...\n\\{% endfor %\\}\n\n\\{% endhighlight %\\}\n")),"\n",l.createElement(n.p,null,l.createElement(n.a,{href:"http://stackoverflow.com/questions/1107737/numeric-for-loop-in-django-templates"},"view에서 값을 넘겨주는 방법"),"이 있었다."),"\n",l.createElement(n.p,null,"혹은 정말 상수번 반복하고 싶으면,"),"\n",l.createElement(n.pre,null,l.createElement(n.code,null,'\\{% highlight html+django %\\}\n\n\\{% for i in "1234567" %\\}\n<option value=\\{\\{i\\}\\}> \\{\\{i\\}\\}</option>\n\\{% endfor %\\}\n\n\\{% endhighlight %\\}\n')),"\n",l.createElement(n.p,null,l.createElement(n.a,{href:"http://stackoverflow.com/questions/5242866/how-to-loop-7-times-in-the-django-templates"},"1234567을 쓰는 방법"),"이 있었다."),"\n",l.createElement(n.p,null,"실제로 반복문으로 만든 페이지!!\n![bingo]({{ site.images }}/bingo.jpg)"))}n.default=function(e){void 0===e&&(e={});const{wrapper:n}=Object.assign({},(0,o.ah)(),e.components);return n?l.createElement(n,e,l.createElement(r,e)):r(e)}},1151:function(e,n,t){t.d(n,{Zo:function(){return c},ah:function(){return r}});var o=t(7294);const l=o.createContext({});function r(e){const n=o.useContext(l);return o.useMemo((()=>"function"==typeof e?e(n):{...n,...e}),[n,e])}const a={};function c({components:e,children:n,disableParentContext:t}){let c;return c=t?"function"==typeof e?e({}):e||a:r(e),o.createElement(l.Provider,{value:c},n)}}}]);
//# sourceMappingURL=component---contents-posts-2017-04-28-django-template-for-loop-mdx-6fe848d109bd55ee5a0f.js.map