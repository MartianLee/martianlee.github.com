"use strict";(self.webpackChunknew_gatsby_blog=self.webpackChunknew_gatsby_blog||[]).push([[6891,5259],{202:function(e,n,t){t.r(n);var l=t(1151),a=t(7294);function r(e){const n=Object.assign({ul:"ul",li:"li",h2:"h2",p:"p",pre:"pre",code:"code",h3:"h3",a:"a",ol:"ol",span:"span"},(0,l.ah)(),e.components);return a.createElement(a.Fragment,null,a.createElement(n.ul,null,"\n",a.createElement(n.li,null,"목차"),"\n"),"\n",a.createElement(n.h2,null,"목표"),"\n",a.createElement(n.p,null,"작년 겨울, 만점프로젝트에서 뉴스 데이터를 활용한 가치평가 프로젝트를 진행했다. 기업에 대한 뉴스를 크롤링한 뒤 긍정/부정 기사들의 양을 비교하고 싶었다. 또한 kSDG(Korea Sustainable Development Goals) 기준으로 기사를 분류해서 특정 기업의 가치, 긍정/부정 행위 평가를 자동화하는 것이 목표다. 이번 글에서는 뉴스 본문 데이터를 크롤링하고 긍정/부정을 평가하는 머신러닝 모델을 만드는 방법을 소개한다."),"\n",a.createElement(n.h2,null,"방법"),"\n",a.createElement(n.pre,null,a.createElement(n.code,null,"이 글은 파이썬을 어느 정도 사용할 줄 알고 머신러닝에 대한 배경지식이 있는 독자를 대상으로 한다.\n")),"\n",a.createElement(n.h3,null,"사용한 도구"),"\n",a.createElement(n.ul,null,"\n",a.createElement(n.li,null,"Python 3.7.5"),"\n",a.createElement(n.li,null,"konlpy"),"\n",a.createElement(n.li,null,"keras"),"\n",a.createElement(n.li,null,"asyncio"),"\n",a.createElement(n.li,null,a.createElement(n.a,{href:"https://github.com/MartianLee/manjum"},"크롤링, 머신러닝에 사용한 코드")),"\n"),"\n",a.createElement(n.h3,null,"크롤링"),"\n",a.createElement(n.p,null,"python 3.7부터 기본적으로 제공하는 비동기 라이브러리 asyncio를 활용해 빠른 크롤링\n뉴스 데이터 플랫폼 빅카인즈에서는 뉴스 데이터 검색결과를 제공하는데, 본문 검색을 지원하지 않아 직접 크롤링하였다. 크롤링 이후 파싱한 데이터들이 예측에 어긋나는 것들이 많아 database가 가끔 터져서 애를 먹었다."),"\n",a.createElement(n.ul,null,"\n",a.createElement(n.li,null,"키워드가 5000바이트가 넘는 row가 있음"),"\n",a.createElement(n.li,null,"기사 입력 시간이 null인 row가 있음"),"\n",a.createElement(n.li,null,"그 외 null이거나 값이 이상한 데이터 다수.\n이후 파싱하는 로직이 완성되고 나서 asyncio를 도입해 비동기로 페이지를 요청해 파싱하니 크롤링 속도가 아주 빨랐다."),"\n"),"\n",a.createElement(n.h3,null,"형태소 분석"),"\n",a.createElement(n.p,null,"파이썬 한글 형태소분석 라이브러리인 konlpy를 사용했다. 신조어를 제외하면 아주 잘 작동한다. 명사 데이터베이스도 커스텀 가능하다. 태그는 Okt를 사용했다."),"\n",a.createElement(n.pre,null,a.createElement(n.code,{className:"language-python"},"# 불용어\nstopwords=['의','가','이','은','들','는','좀','잘','걍','과','도','를','으로','자','에','와','한','하다', 'br', '/><', '/>', '.<']\n\nfrom konlpy.tag import Okt\nfrom konlpy.utils import pprint\n\nokt = Okt()\n\nall_nouns = []\nall_nouns2 = []\nfor row in train_data:\n    temp_X = okt.morphs(row[3], stem=True) # 토큰화\n    temp_X = [word for word in temp_X if not word in stopwords] # 불용어 제거\n    all_nouns.append(temp_X)\n\nfor row in test_data:\n    temp_X = okt.morphs(row[3], stem=True) # 토큰화\n    temp_X = [word for word in temp_X if not word in stopwords] # 불용어 제거\n    all_nouns2.append(temp_X)\n")),"\n",a.createElement(n.p,null,"라이브러리 사용방법은 아주 쉽다. Okt를 인스턴스화한다음 okt.morphs(토큰화 할 string, stem여부)를 입력하면 string array를 반환한다."),"\n",a.createElement(n.h3,null,"데이터 모델링"),"\n",a.createElement(n.p,null,"형태소 분석은 생각보다 어렵지 않았다. 다음으로 텍스트 행렬을 머신러닝 모델에 학습시킬 수 있게 numpy array 형태로 예쁘게 가공해야 한다. 또한 raw text가 아니고 text의 번호를 붙여줘서 벡터화하는 작업이 필요하다."),"\n",a.createElement(n.pre,null,a.createElement(n.code,{className:"language-python"},"# 데이터 토큰화\nfrom keras.preprocessing.text import Tokenizer\nimport json\n\nmax_words = 10000\ntokenizer = Tokenizer(num_words = max_words)\ntokenizer.fit_on_texts(all_nouns)\n\nfrom datetime import datetime\nnow = datetime.now()\ncurrent_time = now.strftime(\"%H-%M-%S\")\noutputfilename = 'all_nouns' + current_time + '.json'\n\nwith open(outputfilename, 'w') as outfile:\n    json.dump(all_nouns, outfile)\n\nX_train = tokenizer.texts_to_sequences(all_nouns)\nX_test = tokenizer.texts_to_sequences(all_nouns2)\n\nprint(\"본문의 최대 길이 : \", max(len(l) for l in X_train))\nprint(\"본문의 평균 길이 : \", sum(map(len, X_train))/ len(X_train))\n\n# 결과를 차트로 출력\nimport matplotlib.pyplot as plt\nplt.hist([len(s) for s in X_train], bins=50)\nplt.xlabel('length of Data')\nplt.ylabel('number of Data')\nplt.show()\n\n# 학습 데이터, 테스트 데이터 분리\nimport numpy as np\ny_train = []\ny_test = []\n\ntype_of_result = 18\ny_result = []\nfor i in range(type_of_result):\n    temp = []\n    for j in range(type_of_result):\n        if j == i:\n            temp.append(1)\n        else:\n            temp.append(0)\n    y_result.append(temp.copy())\n\nfor i in range(len(train_data)):\n    for type in range(type_of_result):\n        if train_data[i][4] == type:\n            y_train.append(y_result[type].copy())\n\nfor i in range(len(test_data)):\n    for type in range(type_of_result):\n        if test_data[i][4] == type:\n            y_test.append(y_result[type].copy())\n\ny_train = np.array(y_train)\ny_test = np.array(y_test)\n")),"\n",a.createElement(n.h3,null,"머신러닝"),"\n",a.createElement(n.p,null,"최종적인 정확도에 가장 큰 영향을 끼치는 과정이다."),"\n",a.createElement(n.ol,null,"\n",a.createElement(n.li,null,"max_len으로 총 단어의 갯수 제한 (ex. 300)"),"\n",a.createElement(n.li,null,"Embedding을 몇차원으로 할 것인지 (ex. 60)"),"\n",a.createElement(n.li,null,"LSTM 레이어를 몇 개 둘 것인지 (ex. 30)"),"\n",a.createElement(n.li,null,"모델의 최적화를 어떤 optimizier를 사용할 것인지, 손실 모델은 무엇으로 할 것인지(ex. 'adam', 'categorical_crossentropy')"),"\n",a.createElement(n.li,null,"몇 번 반복해서 학습시킬 것인지 (ex. 10)"),"\n"),"\n",a.createElement(n.p,null,"자세한 keras.models의 사용법은 ",a.createElement(n.a,{href:"https://keras.io/api/"},"이곳"),"에서 확인할 수 있다."),"\n",a.createElement(n.pre,null,a.createElement(n.code,{className:"language-python"},"from keras.layers import Embedding, Dense, LSTM\nfrom keras.models import Sequential\nfrom keras.preprocessing.sequence import pad_sequences\nmax_len = 300 # 전체 데이터의 길이를 300으로 맞춘다\nX_train = pad_sequences(X_train, maxlen=max_len)\nX_test = pad_sequences(X_test, maxlen=max_len)\n\nmodel = Sequential()\nmodel.add(Embedding(max_words, 60))\nmodel.add(LSTM(30))\nmodel.add(Dense(type_of_result, activation='softmax'))\nmodel.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])\nhistory = model.fit(X_train, y_train, epochs=10, batch_size=10, validation_split=0.1)\nmodel.save('lstm_model_yn_'+ current_time + '.h5')\n")),"\n",a.createElement(n.h2,null,"결과"),"\n",a.createElement(n.h3,null,"크롤링 속도"),"\n",a.createElement(n.ul,null,"\n",a.createElement(n.li,null,"180회, 2700ms; 1 request: 15ms"),"\n",a.createElement(n.li,null,"9380회, 84000ms; 1 request: 9ms"),"\n",a.createElement(n.li,null,"17036회, 201449ms; 1 request: 12ms"),"\n"),"\n",a.createElement(n.p,null,"크롤링은 python + asyncio + beautifulsoup 입니다."),"\n",a.createElement(n.h3,null,"긍/부정 분석"),"\n",a.createElement(n.pre,null,a.createElement(n.code,{className:"language-python"},'res = model.evaluate(X_test, y_test)\nprint(f"테스트 정확도 : {res[1] * 100}%")\n\n# 예측한 값 비교하기\npredict = model.predict(X_test)\nimport numpy as np\npredict_labels = np.argmax(predict, axis=1)\noriginal_labels = np.argmax(y_test, axis=1)\nfor i in range(50):\n    print("기사제목 : ", test_data[i][2], "/\\t 원래 라벨 : ", original_labels[i], "/\\t예측한 라벨 : ", predict_labels[i])\n')),"\n",a.createElement(n.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 800px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/4dcb983e14533877ce0f89e351a1ba3f/df88b/pn.png"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 21.999999999999996%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAECAYAAACOXx+WAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAlklEQVR42lWPWw6FIAxE2Y+CGAUFfHAN+99Sb04TjX5MZqDtKZjWmpznKcuySIxRRQ4hSClF5nnWjMh3zzRNH79lav3Jvu+ybZsAv65LgQynlNS99+Kck2EYZBxHzYhMjXvO1loxx3EoGShAzoB4HRnPOeuS9y/WdX0WAuq6TmX4LkX8rVqrLmEIB0ofUDIC1vf9AwP4B8eggyEE7ETeAAAAAElFTkSuQmCC\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/4dcb983e14533877ce0f89e351a1ba3f/5a190/pn.png"\n        srcset="/static/4dcb983e14533877ce0f89e351a1ba3f/772e8/pn.png 200w,\n/static/4dcb983e14533877ce0f89e351a1ba3f/e17e5/pn.png 400w,\n/static/4dcb983e14533877ce0f89e351a1ba3f/5a190/pn.png 800w,\n/static/4dcb983e14533877ce0f89e351a1ba3f/c1b63/pn.png 1200w,\n/static/4dcb983e14533877ce0f89e351a1ba3f/29007/pn.png 1600w,\n/static/4dcb983e14533877ce0f89e351a1ba3f/df88b/pn.png 1906w"\n        sizes="(max-width: 800px) 100vw, 800px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",a.createElement(n.ul,null,"\n",a.createElement(n.li,null,"한 기사당 max_len에 따라서 정확도가 달라진다. 길수록 정확하지만 생성 속도는 느려진다."),"\n",a.createElement(n.li,null,"Embedding 차원과 LSTM Layer의 갯수는 모델의 크기에 큰 영향을 끼친다. 나는 GCP 혹은 Heroku에서 작동할 수 있는 크기 (메모리 300mb)로 만들기 위해 커스터마이징하였다. 차원과 레이어를 늘리면 정확도가 개선된다. 하지만 제한된 inpu에서 차원과 레이어만 늘린다고 해서 정확도가 개선되지는 않는다. (오히려 overfitting되어서 더 이상한 결과를 낼 수 있음.)"),"\n",a.createElement(n.li,null,"몇 번 반복해서 학습시킬지(epochs)는 10번 내외가 결과가 좋았다. 너무 적게 반복하거나 너무 많이 반복하면 정확도가 좋지 않았다.\n긍,부정 분석 결과는 아주 좋았다(평가 데이터 기준 96%). LSTM이 긍,부정 평가에 좋다는 글을 보고 적용해 보았는데 이렇게 좋을 줄은 몰랐다. 이정도 정확도면 가치 평가 이전에 어떤 기사가 긍정적인 기사인지 부정적인 기사인지 평가하는 일은 충분히 자동화할 수 있을 것 같다. 텍스트 본문 기반으로 긍,부정 평가 문제를 해결해야 하는 사람은 LSTM 모델 적용을 적극 추천한다."),"\n"),"\n",a.createElement(n.h3,null,"참고한 글"),"\n",a.createElement(n.ul,null,"\n",a.createElement(n.li,null,a.createElement(n.a,{href:"https://wikidocs.net/22933"},"딥 러닝을 이용한 자연어 처리 입문 - 로이터 뉴스 분류하기(Reuters News Classification)")),"\n",a.createElement(n.li,null,a.createElement(n.a,{href:"https://lsjsj92.tistory.com/409"},"케라스로 딥러닝하자")),"\n"),"\n",a.createElement(n.h3,null,"다음"),"\n",a.createElement(n.p,null,"다음은 위에서 학습시킨 머신러닝 모델을 클라우드(GAE + Heroku)에 배포하는 방법을 알아본다."))}n.default=function(e){void 0===e&&(e={});const{wrapper:n}=Object.assign({},(0,l.ah)(),e.components);return n?a.createElement(n,e,a.createElement(r,e)):r(e)}},4819:function(e,n,t){t.r(n),t.d(n,{default:function(){return A}});var l=t(202),a=t(7462),r=t(4316),o=t(7294),i=t(1151),s=t(8899),m=t(917);const p=(0,r.Z)("h1",{target:"e5jkt9i12"})(""),c=(0,r.Z)("h2",{target:"e5jkt9i11"})({name:"7va4f6",styles:"margin:2rem 0 1rem"}),u=(0,r.Z)("h3",{target:"e5jkt9i10"})(""),d=(0,r.Z)("p",{target:"e5jkt9i9"})({name:"17ebupe",styles:"line-height:1.5rem;&>code{display:inline-block;background:transparent;padding:0 0.4rem;background:#fcf55f;border-radius:0;border:none;font-weight:bold;word-break:break-all;}"}),g=(0,r.Z)("code",{target:"e5jkt9i8"})(""),f=((0,r.Z)("pre",{target:"e5jkt9i7"})(""),(0,r.Z)("code",{target:"e5jkt9i6"})({name:"1gkxtoh",styles:"display:block;white-space:pre-wrap;word-wrap:break-word;background:#fbfbf4;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"})),_=(0,r.Z)("strong",{target:"e5jkt9i5"})({name:"1beyxqc",styles:"background:red;padding:1rem 1rem;line-height:1.1rem;border:1px solid #999999;border-radius:8px;margin:0.5rem auto"}),y=(0,r.Z)("img",{target:"e5jkt9i4"})({name:"1oax00r",styles:"margin:1rem 0"}),b=(0,r.Z)("a",{target:"e5jkt9i3"})({name:"1m5hyg0",styles:"word-break:break-all"}),E={h1:p,h2:c,h3:u,p:d,code:f,strong:_,blockquote:_,pre:g,img:y,a:e=>(0,m.tZ)(b,(0,a.Z)({},e,{target:"_blank",rel:"noopener noreferrer"}))},h=(0,r.Z)("div",{target:"e5jkt9i2"})({name:"d47c8v",styles:"padding:2.5rem 1rem 0.5rem 1rem;background:#e9e9e9"}),k=(0,r.Z)("section",{target:"e5jkt9i1"})({name:"okspu",styles:"padding:1rem;line-height:1.4rem"}),w=(0,r.Z)("div",{target:"e5jkt9i0"})({name:"2qga7i",styles:"text-align:right"});function x(e){let{data:n,pageContext:t,children:l}=e;const{frontmatter:a}=n.mdx,{title:r,summary:o,featuredImg:p,tags:c,date:u}=a,[d,g]=new Date(u.replace(" ","T").replace(" ","")).toLocaleString().split("T");return(0,m.tZ)(s.Z,null,(0,m.tZ)(h,null,(0,m.tZ)("h1",null,r),(0,m.tZ)(w,null,"발행일: ",d)),(0,m.tZ)(k,null,(0,m.tZ)(i.Zo,{components:E},l)))}function A(e){return o.createElement(x,e,o.createElement(l.default,e))}},1151:function(e,n,t){t.d(n,{Zo:function(){return i},ah:function(){return r}});var l=t(7294);const a=l.createContext({});function r(e){const n=l.useContext(a);return l.useMemo((()=>"function"==typeof e?e(n):{...n,...e}),[n,e])}const o={};function i({components:e,children:n,disableParentContext:t}){let i;return i=t?"function"==typeof e?e({}):e||o:r(e),l.createElement(a.Provider,{value:i},n)}}}]);
//# sourceMappingURL=component---src-templates-post-details-tsx-content-file-path-contents-posts-2020-06-28-manjum-result-mdx-fb20f811c14d0f2d561d.js.map