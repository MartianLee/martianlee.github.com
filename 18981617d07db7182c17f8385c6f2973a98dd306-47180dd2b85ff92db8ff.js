"use strict";(self.webpackChunknew_gatsby_blog=self.webpackChunknew_gatsby_blog||[]).push([[2004],{6820:function(e,n,t){t.r(n);var a=t(1151),l=t(7294);function s(e){const n=Object.assign({span:"span",ul:"ul",li:"li",h2:"h2",p:"p",h3:"h3",h4:"h4",a:"a",code:"code",pre:"pre"},(0,a.ah)(),e.components);return l.createElement(l.Fragment,null,l.createElement(n.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 267px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/b023cf4cf925a89dd589bf02b54a5581/19e8f/react.png"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 71.00000000000001%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAIAAACgpqunAAAACXBIWXMAAAsTAAALEwEAmpwYAAABSklEQVR42o1Sa0vDUAzdLxcRBFERwW0iPn6AQ4ev+fimXxR039X52qxttbdd2Wa7tcmp6aqjskd3CSVJz0nuTU4uGjpIORhKpk9uOEWIHjx8Br94M8C9B0YWOUFct7CvuKxYHLGyzRLetDAATCKfOGz2267pXNBJnK8AhzYnl8ogH9t85eLA5rxBeZ2EduniaAI5SbohzhzeNGlRo22T5OViOyYtvNOWyacOCyA9vH+dSxa/diGAZY2efMzUw9k61TysaNTj6K2LXYvHkmUw0srnaEmjmo+5RjjfiMlS65ujRw97ahQ5iTsUXTR53SBBy/fFh9iGQVKraJD86tD4aycDqziyJD5v8uqHGIkje5p62g7rvdgr6Fzsr8oK4s1PtedqO36boO/aqHZiWknxbTtLJIMSMmr1J08V4tkHT6ltpEQuhZIQo7T9A8f2I2eSrMXHAAAAAElFTkSuQmCC\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/b023cf4cf925a89dd589bf02b54a5581/19e8f/react.png"\n        srcset="/static/b023cf4cf925a89dd589bf02b54a5581/772e8/react.png 200w,\n/static/b023cf4cf925a89dd589bf02b54a5581/19e8f/react.png 267w"\n        sizes="(max-width: 267px) 100vw, 267px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",l.createElement(n.ul,null,"\n",l.createElement(n.li,null,"목차"),"\n"),"\n",l.createElement(n.h2,null,"문제"),"\n",l.createElement(n.p,null,"리엑트ReactJS로 약간 규모가 있는 어플리케이션을 개발합니다. 리엑트는 추상화가 잘 되어 있어서 거의 모든 부분에 다른 종류의 라이브러리를 사용할 수 있습니다. 개발자가 선택해야 하는 부분과 옵션에 대해서 정리합니다."),"\n",l.createElement(n.p,null,"개발환경"),"\n",l.createElement(n.ul,null,"\n",l.createElement(n.li,null,"ReactJS"),"\n",l.createElement(n.li,null,"Node v10"),"\n"),"\n",l.createElement(n.h2,null,"해결"),"\n",l.createElement(n.p,null,"처음 리엑트 프로젝트를 시작하고 정말 놀랐다. 어플리케이션의 모든 핵심적인 영역에서 다른 라이브러리가 있었기 때문이다. 대박. 리엑트라는 프레임워크 자체가 확장성을 고려해서 만들어졌다는 걸 느낄 수 있었다. 이 글에서는 프론트엔드 어플리케이션의 난제인 4가지 영역과 라이브러리를 소개한다."),"\n",l.createElement(n.h3,null,"상태 관리"),"\n",l.createElement(n.h4,null,"Redux vs MobX vs Hook + context"),"\n",l.createElement(n.p,null,"처음 리엑트 튜토리얼을 검색했는데 너무 헷갈렸다. 리엑트에 대해서 개념이 제대로 잡히지도 않은 상태에서 redux도 있고 mobX도 있고 잘 모르겠는데 추천한다고 하고 그런데 이 튜토리얼에 있는 것은 다른 튜토리얼에 없고 대체 뭐가 정답이지??? 이랬던 것이다."),"\n",l.createElement(n.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 225px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/97ffbaa6506c96adc60032d4c1751bb2/3684f/redux.png"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 100%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAACXBIWXMAAAsTAAALEwEAmpwYAAACdElEQVR42oVUa2/SUBjub/F3+MF/oH7SaLzEW5waTTSLyUjMZJnTKTiSjWnM3NhmFnQONNMJMRjubOBGmcAQCnbIoCAdlwKlLcW3nqUQBnjSD+95z/uc5708p1izxxJFsSFIX1PsFdLEeiD7bfuBxYYUm09Xvea9TUuaKdRRIv8HoyDzm/ijC46ZB1uzw/5n11yh9Zx8aU8wOjYvxlUD7mKeRU4Cp5VnbSmifJgf6yhsP1sbPWenSAZsgRd5rgGGaZ7QKXEwGo0eYHRgN5BzbXGIKpeqQhVMketoXhtYkNx6VfDrUgIMozayMhlOhAoZkmErfMT3px9Y4KUMgda1moRs7xwz3Ty6NnnXO3FrXXXd/W4itBcvd2TeAnP1RpXh9eqgeZGALW6nAjYKVZ5LVtbmYsOnrFB8OzkmN/nTTPStOrhhSsGEOhhg1GyVLxe45zc8hqkduRcYQhIBeuyio1LiCzn28SUnTdUkzn+thlJHz9uVZ2yVEgflwCluyyBKDDEsjf9wfNhFPMuaEFz0cyt/QFvkFCe/PbnsLO9LUgPZaQd9iBxDCUzd8/6OllC09T15+sgKGiysgIMCJGo1LDpT09zeqDF8K+1Xis1tZxbdV6JZiz5B7Uo6ieH00HFL0CPJk69LVWR+MVA5Es9B2u7VpHrAw7GC3Iw6K3zRxRQnLH5rBvUPNVk3gi9rwsjTGpVRuzN+xQXC+Pw6uji2/fSqa3rQl01WQB6zD/12I2kzkC/uf58fwREHvHOsXdhkuGheID6+jEBcOlFGR6lYybRAwPyN05GgO9tdYYcfLHi6OptitycJZaBfD3wyDAzZ2fGq/gJMg0RLJWoXSwAAAABJRU5ErkJggg==\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/97ffbaa6506c96adc60032d4c1751bb2/3684f/redux.png"\n        srcset="/static/97ffbaa6506c96adc60032d4c1751bb2/772e8/redux.png 200w,\n/static/97ffbaa6506c96adc60032d4c1751bb2/3684f/redux.png 225w"\n        sizes="(max-width: 225px) 100vw, 225px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",l.createElement(n.h4,null,"Redux"),"\n",l.createElement(n.p,null,"Redux는 아주 옛날부터 리엑트와 함께 사용되어 온 라이브러리다.\n상태 관리 패턴인 Flux 패턴으로 작성된 라이브러리다. store의 변화에 대해 엄격한 규칙을 가지고 있다. action과 reducer가 분리되어 있다. 그러니까 명령의 호출과 상태의 변경이 분리되어 있다. 그리고 상태는 일부만 update 하는 것이 아니고 새로운 object로 덮어씌워서 적용할 수밖에 없다."),"\n",l.createElement(n.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 200px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/6a91c2819d6869cf1dc98bf7d251cd29/772e8/mobx.png"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 100%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEuklEQVR42l2VWWxUVRjHb6EgLm1nuXNnLZL4gjFp4vbikw9u0QBCcJZOZ+7MdGZaWskUqBHwAUlMjBgWfWDzwRjBxAdUQoUokJD4ZCTGWIH2dubOcqftdPax0E7h1L/fuUNxefgnN/ee87vf+Zb/Ea7Hn12T9Iu+Gx7z6A2PmBh3iyPjbpOum17TiOJvacLfpeuml6tD17ib5Hk08dtbj4wWopIPxBKSPtFbjkiYC0nLBVnCrGzRNR0woxAyoxozoxw1odRPihhRDBsxFzbQty5a14V84DHUYuIydq9HcdDlFZIBaaQYlqD6Lc1Ur4VN9YokM1N8LeVCJpaVTSwjG1k6YGRqwMDUvi6WIim9HfTdzOrDrubyrvUoDzpHBMUnJkoRK5J9FpbyW5D0GKC4u6D4TCQzMkEzaBMysomejSAo1L5OTHkeRi7QifpwN6pDLnYv0Y3pmD1BQClRjtiQ4sA+CZmdPUgP9yApO6F4TQQwQwubkeVAroAB6bAV+cRTaOx/DjUCUmTsbsL1L2A/Af0iU0MO1C6cxL1iHqXP92Ji82qkZJsOzBEsRydJbWtD+Yt38Vclj+bl06ju3IDSgI0t7XQSUEoISb+UqBBQDUhMlR1QNrWhfvEEqt8cwa1XBSiUglxIJKiIDB01u0XAwvfH0Lz6GSqBdagMP47igJ0133ZAixBQeQC0snSIAwUCHkfl6w+hRp+AduA1AhmhBamqB19Gbc+TaF44hMUrp1Hyr0F5aD3m4ja2OGz/LzCtA52Y4sBLJ1A+exDa/pewqI5TEczIy0YsTf2C+Y/ewMK5D7B49TSKve0o7ehGIWZjd4ZsyIZWgNEWMMOBm1sRVs99jKk3H0JTU6C98wKq+57H8vQEKuFOLIwdxsLlk5jzrUZxhwuzMSu7vcNKQLGVw2rUjnSwBUzeB9bOH8PEi/R85QzqXx3A/Jm9WPrpLIpbKYcXP8WdH0+g4FmFwoALM1GJzRNQfQCM2anHVoBtaHDgd0cx+YqA2fdfx1LyVzQnfkbj0CbMbedF+YSAxzHjacPsAFU3YmF/DlqgBk0caE/UYg4dmA07kVoBfnsY6tZ2aH0iFn6/hrt/XEO5X8Rc71rcGTuC2z8cx7RbwEycV1dk9fj/gbKtBdzSjsalk2icP4rstrXUf7RhaCPywxup3xwo+NpbQDpy3r2KNzNyYZHV4iKSfg4McqBTjzDX343G2ClqbA21L99DZvs6+ns3TYeItF/U8zVLETbO7gOj5p+/eAp5yn+W5pybiOI33AfGnfSSIpTtmN71NGZ2PQOtfwNyQaqcbKWfURf00bjRyBVi5EgD3Zjd04OZ3T1603PjqJAb3fLdB9bjLtpoZzkCakELcpS3FsxG0Vl10awTmKwtKmGaRpE3OjcHPuPpoJGV+o0E7EgIWtg+woFayN7Uwg6yI5IeLVWd0sD7Uw1w49DdiOUjXKJuW1myNnIgWmNoFiMGymHHiJCWHd55Kn097lzmuaxGHahQXrhhcBcqkiFwv1wx30rUQmtFWkfG+8B0DcslMt1Jd6dX4FdALmz3TQVtowpVXCHD5ZrwrkgkuyfpV4NI1wBdCYF/rgWetxuejtFJf6fvelxY8zdmirDbcSVb1AAAAABJRU5ErkJggg==\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/6a91c2819d6869cf1dc98bf7d251cd29/772e8/mobx.png"\n        srcset="/static/6a91c2819d6869cf1dc98bf7d251cd29/772e8/mobx.png 200w"\n        sizes="(max-width: 200px) 100vw, 200px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",l.createElement(n.h4,null,"MobX"),"\n",l.createElement(n.p,null,l.createElement(n.a,{href:"https://mobx.js.org/"},"MobX"),"는 RxJS를 사용할 수 있게 해주는 라이브러리다. Redux보다 덜 엄격해서 작은 어플리케이션을 만들 때 더 유리하다. MobX는 반응형 프로그래밍 개념을 적용해서 Observable을 사용한다."),"\n",l.createElement(n.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 800px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/ccbcf28c29726f527f30f9f99e8c94fe/d5eae/mobx-flow.png"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 34.5%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAHCAIAAACHqfpvAAAACXBIWXMAAAsTAAALEwEAmpwYAAABR0lEQVR42j2Pv07DMBDG866IF+ABGGEGJsQEQhViQkUUgTq0SLBUKi0LlDLQNFH+OY4TbCe2Yx+XVuo3WPf77ruzzgPgl0/B/tnv4ZXP/6qCpgcX472T55vxJ7hm6o+Gy7vRsj/+uZdK2OxLz3t6du2YDwAegB1M6HFveT6IZWO4rE/7s6PbyXDetRfpx2T9Mg1e34M3ZVtXRWbxYL4fHU+2wxtZAU5YzcE2AK5znIFWgrOwU4carN6ZnhSCsZJQRikV/K9kBSEZIYRS0lFJaZ4VlBQdViWj2GcFrapSCOHhTJIkq9UqCMKc0iiOgzBcrwNE3BFFse8jhPiSPI9jxE4Yy/Pc01pXVcUYw01YN02DblkypbQxBv0sy0iaSinRQWQFflzITbi72WijlMKoc85au8mp7VVYcM7rut6ilDU6WjVt2wLAP3Eggjql8FpKAAAAAElFTkSuQmCC\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/ccbcf28c29726f527f30f9f99e8c94fe/5a190/mobx-flow.png"\n        srcset="/static/ccbcf28c29726f527f30f9f99e8c94fe/772e8/mobx-flow.png 200w,\n/static/ccbcf28c29726f527f30f9f99e8c94fe/e17e5/mobx-flow.png 400w,\n/static/ccbcf28c29726f527f30f9f99e8c94fe/5a190/mobx-flow.png 800w,\n/static/ccbcf28c29726f527f30f9f99e8c94fe/c1b63/mobx-flow.png 1200w,\n/static/ccbcf28c29726f527f30f9f99e8c94fe/d5eae/mobx-flow.png 1407w"\n        sizes="(max-width: 800px) 100vw, 800px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",l.createElement(n.h4,null,"Hook + context API"),"\n",l.createElement(n.p,null,l.createElement(n.a,{href:"https://reactjs.org/docs/hooks-intro.html"},"React Hook"),"은 리엑트 버젼 16.8에 적용된 기능이다. 다른 라이브러리를 import하지 않고 바로 쓸 수 있다는 장점이 있다. 그렇다 보니 당연히 작은 규모의 어플리케이션에 유리하다. Context.Provider를 이용해 변경 사항을 자식 트리에 전달할 수 있다. 그리고 .Consumer선언해서 변경 사항을 구독한다.\n아직 사용해 보지 않아서 좀 더 연구가 필요하다."),"\n",l.createElement(n.h3,null,"미들웨어 Middleware (비동기 처리 Asyncrhonous)"),"\n",l.createElement(n.h4,null,"Thunk vs Saga vs Observable"),"\n",l.createElement(n.p,null,"사실 프론트엔드 개발자의 고민의 전부라고 할 정도로 귀찮은 문제다. 많은 언어들이 synchronous하게 실행되기 때문에 개발자가 익숙해지기 쉽지 않은 문제다. 원론적인 고민은 접어놓더라도 중요한 부분이다. 프론트엔드에서 뿌려줄 정보를 서버에 요청하거나 새로운 정보를 전송하고 ",l.createElement(n.code,null,"(가장중요) 변화를 어떻게 사용자 경험의 끊김 없이 새로고침할 것인지!!")," 이것이 문제인 것이다."),"\n",l.createElement(n.p,null,"여기서 Thunk와 Saga는 Redux와 조합으로 사용한다."),"\n",l.createElement(n.h4,null,"Thunk"),"\n",l.createElement(n.p,null,"Redux에서 dispatch할 때는 무조건 action 객체가 필요하다. 하지만 Redux-thunk를 사용하면 '액션 생성 함수'를 dispatch할 수 있습니다. 간단하게 이야기해서 당장 action을 실행하는 것이 아니라 내가 원하는 작업을 무언가 실행하고 그 뒤에 action을 실행할 수 있게 해 주는 것입니다. redux 튜토리얼에도 포함되어 있을 만큼 쉬운 미들웨어입니다."),"\n",l.createElement(n.h4,null,"Saga"),"\n",l.createElement(n.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 700px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/1f8c92dae674abb2dda898c7b44ef8ba/8c557/redux-saga.png"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 21%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAECAYAAACOXx+WAAAACXBIWXMAAAsTAAALEwEAmpwYAAABJklEQVR42mM4c+YM68yZM71nTZ8VMnPpJI36//4CXSezJBj+MzAuWrSIe+LEiewMQLBq1SpmEGaAglX/VzFPvJXLB1LHgAzmzZunOnfu3Mxpk2bZTl3VV9Z1N8el82aBbcejNN1Z0+ekzpo1K3vOnDl206dPTway3WfPnm42p2ehYc+FcsOumzkJndezTTpuZ7t338lx6riRZcMAdF3szDkzHedNnSc7bemEqmnLegzrX4bydN7MiQQaAsIlQIMagbgcqDYLSJcCfZM8bW23Tuft7JSuGzllPffy53Xdzu3rvJ5TAzIwAqgoYca0WdmTV/Wk9Z2piO68nenYdQXobSCo31/PAvUuG8j78+fP5wDxQeIzn9ZzgdT03svR77yTbfL/PwMjALUCk2hF/x1GAAAAAElFTkSuQmCC\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/1f8c92dae674abb2dda898c7b44ef8ba/8c557/redux-saga.png"\n        srcset="/static/1f8c92dae674abb2dda898c7b44ef8ba/772e8/redux-saga.png 200w,\n/static/1f8c92dae674abb2dda898c7b44ef8ba/e17e5/redux-saga.png 400w,\n/static/1f8c92dae674abb2dda898c7b44ef8ba/8c557/redux-saga.png 700w"\n        sizes="(max-width: 700px) 100vw, 700px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",l.createElement(n.p,null,"Redux-Saga는 애플리케이션의 사이드 이펙트들(데이터 요청(fetch) 등의 비동기 작업, 브라우저 캐시 같은 순수하지 않은 것들)을 쉽게 관리하고 효과적으로 실행하고 간단한 테스트와 쉬운 실패 처리를 목적으로 한다. Saga는 자체적인 몇 가지 기능을 제공한다. 비동기 처리가 필요한 부분에 yield만 붙여주면 마치 동기적으로 작성된 것 처럼 작동한다. asnyc / awiat가 생각날 수도 있는데 실제로 비슷하다. redux store에 saga를 결합하고 takeLatest로 action의 실행과 saga 함수를 bindng하면 된다. binding된 saga 함수는 특정한 액션이 끝나자마자 실행된다."),"\n",l.createElement(n.h3,null,"서버 사이드 렌더링 Server Side Rendering"),"\n",l.createElement(n.h4,null,"NextJS vs. Gastby vs. CRA"),"\n",l.createElement(n.p,null,"엔터프라이즈 어플리케이션이 아닌 경우에는 여기까지 고민할 필요가 없는 경우가 많다. 프론트엔드에서 렌더링해도 보통 속도가 문제가 없는 경우가 많기 때문이다. 하지만 페이지별 썸네일, 조금 많은 양의 정보를 렌더링해야 하는 경우에 서버 사이드 렌더링을 사용하게 된다."),"\n",l.createElement(n.h4,null,"NextJS"),"\n",l.createElement(n.p,null,l.createElement(n.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 224px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/07697f1900b835624c3e868ca0b886ad/80b2d/nextjs.png"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 64.5%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAANCAIAAAAmMtkJAAAACXBIWXMAAAsTAAALEwEAmpwYAAABZElEQVR42o1SzcqCUBC9j9vbtHUf0qaEjBYSVkihQhZmtiii0qiEoF9Nyz6/Q0MmRdAsrmfmzpl7ZhyW/GB/T3uLs2wU4P60bBDn+XwOgoASXuT0+tuDAKCtVqvPBOZ5HpWk8qZpWpY1HA6Xy+XlciEVzWZT1/XRaITb2Wz2IufzeVmWyen1eqIoOo6DDNu2a7Uagqqq9vv9zWZTKBQajQZAqpRVKhVJkubzORzDMLrdLkAYhjg7nQ5qKYpCqa1Wa7FYAKRDYYIg7HY78BEFk+O4drsNLVEUHY/HXC43mUyIDPH0RjozViqV8JlOp9bDoDC9rlarg8GgXC6TkJTs+/54PD4cDgwZeAQharJYLOoPq9fr6JYGARoA9LuuC7WI8DyPoTIwaQAAmqZhyBjJer3ebrdxHEMCztPphITr9Qr3druhHWgBYNlN2O/3+HPZhaEWvi0Ce/PRD0omvxn73KrkZ/sHs1jU/9e2XBkAAAAASUVORK5CYII=\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/07697f1900b835624c3e868ca0b886ad/80b2d/nextjs.png"\n        srcset="/static/07697f1900b835624c3e868ca0b886ad/772e8/nextjs.png 200w,\n/static/07697f1900b835624c3e868ca0b886ad/80b2d/nextjs.png 224w"\n        sizes="(max-width: 224px) 100vw, 224px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\nNextJS는 폴더 구조가 조금 정해지고 라우팅 규칙도 미리 정해진 리엑트라고 생각하면 된다. 소스 폴더에 pages 폴더가 있어야 하고 그 밑에 다시 라우팅될 페이지들을 생성해주면 된다. _App.js와 _Document.js 파일을 설정해 공통적으로 필요한 정보를 import할 수 있다.\n리엑트 클래스 내에"),"\n",l.createElement(n.pre,null,l.createElement(n.code,null,"static async getInitialProps (props) {\n    const { store, isServer } = props.ctx\n    return { isServer }\n}\n")),"\n",l.createElement(n.p,null,"함수를 선언해 server에서 렌더링 될 때 해줘야 할 특정한 작업을 정의할 수 있다."),"\n",l.createElement(n.h3,null,"스타일링 Styling"),"\n",l.createElement(n.p,null,"jsx style vs Styled Component vs CSS Module vs etc...\n아 프론트엔드 개발자는 할 게 너무 많다. 이렇게 복잡한 리엑트의 구조를 넘어서 style도 적용해야 하기 때문이다. 모든 div에 className을 지어야 하고 그 className에 해당하는 스타일을 붙이다 보면 해가 몇번이나 저무는 걸 볼 수 있다."),"\n",l.createElement(n.h4,null,"jsx style"),"\n",l.createElement(n.p,null,"jsx style은 다른 라이브러리 없이 기본으로 제공하는 방법이다."),"\n",l.createElement(n.pre,null,l.createElement(n.code,null,"return (\n    <div className={light ? 'light' : ''}>\n      {format(new Date(lastUpdate))}\n      <style jsx>{`\n        div {\n          padding: 15px;\n          display: inline-block;\n          color: #82fa58;\n          font: 50px menlo, monaco, monospace;\n          background-color: #000;\n        }\n        .light {\n          background-color: #999;\n        }\n      `}</style>\n    </div>\n  )\n")),"\n",l.createElement(n.p,null,"위와 같이 jsx 문법 내에 선언되며 className을 지정해 주어야 한다. 당장 스타일을 붙일 수 있어서 가장 쉽고 간단하다. 어플리케이션이 점점 커질 수록 문제가 발생할 수 있다. 스타일의 복제, 분리가 쉽지 않기 때문이다."),"\n",l.createElement(n.h4,null,"Styled Component"),"\n",l.createElement(n.pre,null,l.createElement(n.code,null,"const ButtonWrapper = styled.div`\n    text-align: center;\n  `\n\nconst Button = styled.button`\n  width: 40%;\n  &:not(:last-child) {\n    margin-right: 10%;\n  }\n  `\n\nreturn (\n  <ButtonWrapper>\n    <Button>\n        상세보기\n    </Button>\n    <Button>\n        구매하기\n    </Button>\n  </ButtonWrapper>\n)\n")),"\n",l.createElement(n.p,null,"위에서 계속 className 이야기를 한 것은 바로 이 Styled Component의 강력함을 홍보하기 위해서였다. 스타일 컴포넌트를 선언해서 감싸주는 방법으로 스타일을 적용한다. 같은 파일 안에서 선언해도 되고, Wrapper 컴포넌트를 따로 구현해서 감싸주어도 된다. 컴포넌트의 className은 실제 렌더링할 때 자동으로 알아서 생성해서 스타일을 적용해 준다. styled componnet는 ES6의 Template literals 기능을 사용합니다."),"\n",l.createElement(n.p,null,"그 외 다른 라이브러리는 Radium, Aphrodite 등등 많은데 ",l.createElement(n.a,{href:"https://blog.bitsrc.io/9-css-in-js-libraries-you-should-know-in-2018-25afb4025b9b"},"9가지 React 스타일링 방법"),"이라는 게시글을 참조해 주시면 좋습니다."),"\n",l.createElement(n.h3,null,"덤) 폴더 구조"),"\n",l.createElement(n.p,null,"많은 튜토리얼을 읽다 보면 '개발자 취향대로' 라는 말이 많이 보인다. 자신이 편한 방법대로 폴더 이름/계층을 만들어 쓰면 된다. 나도 아직 확신은 없어서 그 때 그 때 편한 방법으로 개발하고 있다. 가장 크게 나누어 보자면, 컴포넌트를 ",l.createElement(n.code,null,"기능별로")," 나눌 것인지, ",l.createElement(n.code,null,"관심사별로")," 나눌 것인지 정도 되겠다. 개인적으로는 기능별로 나누는 편을 선호한다."),"\n",l.createElement(n.h3,null,"덤) 테스트 프레임워크"),"\n",l.createElement(n.p,null,"뭔가 빠진 것 같다면 바로 테스트다. 아직 프로젝트가 테스트 할 사이즈가 아니(라는 의견도 논란의 여지가 있다)라고 생각해서 아직 테스트가 없다. 테스트 프레임워크는 다른 글에서 찾아봽도록 하겠다."),"\n",l.createElement(n.h2,null,"결론"),"\n",l.createElement(n.p,null,"처음 리엑트 프로젝트를 고민하시는 분께 어떤 라이브러리를 사용해야 하는 지 길잡이가 되었으면 하는 마음으로 작성했다. 하나씩 리서치하는 데 품이 좀 들어서 그런 시간이 줄었으면 하는 마음이다. 어느 것이 좋다 나쁘다 보다는 프로젝트의 특성에 따라서 사용하면 된다."),"\n",l.createElement(n.p,null,"현재는 Redux + Saga + Styled Component로 현재 개발하고 있는데, 약간 큰 어플리케이션을 개발해야 해서 이렇게 선택했다. 아직까지는 큰 불편함 없이 잘 개발하고 있다."),"\n",l.createElement(n.p,null,l.createElement(n.code,null,"혹시 잘못된 지식이나 새로운 라이브러리가 있으면 댓글로 달아주시면 감사하겠습니다.")),"\n",l.createElement(n.p,null,l.createElement(n.code,null,"그럼 즐거운 프론트엔드 개발 하시길!")),"\n",l.createElement(n.h2,null,"참고자료"),"\n",l.createElement(n.ul,null,"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"https://reactjs.org/"},"리엑트 공식 페이지")),"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"http://woowabros.github.io/experience/2019/01/02/kimcj-react-mobx.html"},"React에서 Mobx 경험기 (Redux와 비교기)")),"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"https://github.com/redux-saga/redux-saga"},"리덕스 사가 github")),"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"https://medium.com/@han7096/redux-saga%EC%97%90-%EB%8C%80%ED%95%98%EC%97%AC-5e39b72380af"},"Redux-saga에 대하여")),"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"https://velopert.com/3401"},"리덕스 미들웨어, 그리고 비동기 작업 (외부데이터 연동)")),"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"https://github.com/reactkr/learn-react-in-korean"},"한국어로 배우는 리엑트")),"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"https://medium.com/finiteloop-systems/building-scalable-applications-using-react-part-1-choosing-the-right-mix-of-tools-74d5afd9e854"},"Building Scalable Applications using React — Part 1: Choosing the right mix of tools")),"\n",l.createElement(n.li,null,l.createElement(n.a,{href:"https://medium.com/@pks2974/react-context-%EA%B0%84%EB%8B%A8-%EC%A0%95%EB%A6%AC-9c35ce6617fc"},"React Context 간단 정리")),"\n"))}n.default=function(e){void 0===e&&(e={});const{wrapper:n}=Object.assign({},(0,a.ah)(),e.components);return n?l.createElement(n,e,l.createElement(s,e)):s(e)}},1151:function(e,n,t){t.d(n,{Zo:function(){return i},ah:function(){return s}});var a=t(7294);const l=a.createContext({});function s(e){const n=a.useContext(l);return a.useMemo((()=>"function"==typeof e?e(n):{...n,...e}),[n,e])}const c={};function i({components:e,children:n,disableParentContext:t}){let i;return i=t?"function"==typeof e?e({}):e||c:s(e),a.createElement(l.Provider,{value:i},n)}}}]);
//# sourceMappingURL=18981617d07db7182c17f8385c6f2973a98dd306-47180dd2b85ff92db8ff.js.map