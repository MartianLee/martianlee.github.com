"use strict";(self.webpackChunknew_gatsby_blog=self.webpackChunknew_gatsby_blog||[]).push([[4889],{5821:function(e,A,n){n.r(A);var t=n(1151),a=n(7294);function l(e){const A=Object.assign({span:"span",ul:"ul",li:"li",h2:"h2",p:"p",h3:"h3",a:"a",code:"code",pre:"pre",img:"img"},(0,t.ah)(),e.components);return a.createElement(a.Fragment,null,a.createElement(A.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 800px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/91924fa32cab65289f4e40ea0657df69/c58a3/0.jpg"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 27%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAFABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQD/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhADEAAAAbLBNwv/xAAXEAEBAQEAAAAAAAAAAAAAAAACARAS/9oACAEBAAEFAmL2DZn/xAAUEQEAAAAAAAAAAAAAAAAAAAAQ/9oACAEDAQE/AT//xAAUEQEAAAAAAAAAAAAAAAAAAAAQ/9oACAECAQE/AT//xAAZEAACAwEAAAAAAAAAAAAAAAABIgAQQbH/2gAIAQEABj8CL9gbK//EABoQAQEAAgMAAAAAAAAAAAAAAAERABAhMdH/2gAIAQEAAT8hXzpV79Yc1sma/9oADAMBAAIAAwAAABB7z//EABURAQEAAAAAAAAAAAAAAAAAABAR/9oACAEDAQE/EIf/xAAWEQEBAQAAAAAAAAAAAAAAAAABEBH/2gAIAQIBAT8QHJ//xAAcEAEAAQQDAAAAAAAAAAAAAAABABEhMUFRofD/2gAIAQEAAT8QbKKIAUHBYnUA1glt5uvtwKGVn//Z\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/91924fa32cab65289f4e40ea0657df69/4b190/0.jpg"\n        srcset="/static/91924fa32cab65289f4e40ea0657df69/e07e9/0.jpg 200w,\n/static/91924fa32cab65289f4e40ea0657df69/066f9/0.jpg 400w,\n/static/91924fa32cab65289f4e40ea0657df69/4b190/0.jpg 800w,\n/static/91924fa32cab65289f4e40ea0657df69/e5166/0.jpg 1200w,\n/static/91924fa32cab65289f4e40ea0657df69/c58a3/0.jpg 1500w"\n        sizes="(max-width: 800px) 100vw, 800px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",a.createElement(A.ul,null,"\n",a.createElement(A.li,null,"목차"),"\n"),"\n",a.createElement(A.h2,null,"목표"),"\n",a.createElement(A.p,null,"장고Django 프로젝트를 생성하고 Google Appe Engine에 배포해 봅니다."),"\n",a.createElement(A.p,null,"개발환경"),"\n",a.createElement(A.ul,null,"\n",a.createElement(A.li,null,"MacOS Mojave 10.14.6"),"\n",a.createElement(A.li,null,"Python 3.7.4"),"\n",a.createElement(A.li,null,"Django 3.0"),"\n",a.createElement(A.li,null,"Gooogle Cloud Platform SDK"),"\n"),"\n",a.createElement(A.p,null,"이 문서는 Django 프레임워크와 커맨드 라인, mysql 사용에 능숙한 분을 대상으로 쓰여졌습니다."),"\n",a.createElement(A.h2,null,"해결과정"),"\n",a.createElement(A.p,null,"회사에서 어플리케이션 배포를 위해 Google Cloud Platform을 입문했습니다. Amazon의 Elastic Beans Talk와 비슷하다고 하는데, 저는 Elastic Beans Talk보다 GAE(Google App Engine)을 먼저 입문해서 그런지 적응하니 상당히 편하게 사용하고 있습니다. 스케일링 가능한 웹앱을 쉽게 배포할 수 있다는 점이 큰 장점입니다."),"\n",a.createElement(A.h3,null,"Google Cloud Platform SDK 설치"),"\n",a.createElement(A.p,null,a.createElement(A.a,{href:"https://cloud.google.com/sdk/docs/quickstarts"},"구글 클라우드 공식 문서"),"에 자세한 설명이 나와 있습니다. 홈페이지에서 sdk를 다운받은 후 압축을 해제합니다. 그리고 그 안의 ",a.createElement(A.code,null,"install.sh"),"를 실행하면 됩니다.\n",a.createElement(A.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 800px; "\n    >\n      <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 12%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAACCAYAAABYBvyLAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAlUlEQVR42h3NSwqCYABF4VbQqEDR0lLzkebzT1MRFApqEBEENWkQEe1/AydzcOFMPu4orDo2ZYcR5czXKWZW4+UNVlojzq9h1eVNcXoSHh74+zvV9UNz++L1TrJ81L9Ldr1PGIn2SFC2aEHGZOFgZBV+f2KEWzQ3QLEcXNtjqRtMZzpjWe2xwBYFZlwgrQJkN0Lx4qF/n7w/bwyN4fEAAAAASUVORK5CYII=\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/9dd03ba812fcfc887559be36df641494/5a190/1.png"\n        srcset="/static/9dd03ba812fcfc887559be36df641494/772e8/1.png 200w,\n/static/9dd03ba812fcfc887559be36df641494/e17e5/1.png 400w,\n/static/9dd03ba812fcfc887559be36df641494/5a190/1.png 800w,\n/static/9dd03ba812fcfc887559be36df641494/c1b63/1.png 1200w,\n/static/9dd03ba812fcfc887559be36df641494/6f464/1.png 1464w"\n        sizes="(max-width: 800px) 100vw, 800px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n    </span>'}})),"\n",a.createElement(A.pre,null,a.createElement(A.code,null,"./google-cloud-sdk/install.sh\n")),"\n",a.createElement(A.p,null,"그리고 변경사항 적용을 위해 쉘을 다시 시작합니다. 사용하는 커맨드라인에 따라서 ",a.createElement(A.code,null,"source ~/.zshrc")," 혹은 ",a.createElement(A.code,null,"source ~/.bashrc")," 를 입력합니다."),"\n",a.createElement(A.pre,null,a.createElement(A.code,null,"gcloud auth login\n")),"\n",a.createElement(A.p,null,"이제 google cloud sdk에 로그인할 수 있습니다. 이 명령어를 입력하면 브라우저 창이 떠서 로그인 정보를 입력해야 합니다."),"\n",a.createElement(A.h3,null,"Google Cloud Platform 프로젝트 세팅"),"\n",a.createElement(A.p,null,"이 튜토리얼에서는 빠른 설정과 배포를 위해 Google App Engine을 사용합니다."),"\n",a.createElement(A.p,null,"App engine을 만들기 전에 Project를 만들어주어야 합니다. GCP는 모든 앱이 프로젝트 단위로 관리합니다."),"\n",a.createElement(A.p,null,"다음과 같이 프로젝트를 생성합니다."),"\n",a.createElement(A.img,{src:"../images/200209_django-gae-deploy/3.jpg",alt:"img"}),"\n",a.createElement(A.pre,null,a.createElement(A.code,null,"gcloud config set project mysite\n")),"\n",a.createElement(A.p,null,"그리고 방금 만든 project를 현재 작업중인 project로 설정합니다."),"\n",a.createElement(A.h3,null,"Django App Initialze"),"\n",a.createElement(A.p,null,"장고 기본 어플리케이션 설치는 ",a.createElement(A.a,{href:"https://docs.djangoproject.com/en/3.0/intro/tutorial01/"},"장고 공식 튜토리얼"),"을 참고하였습니다."),"\n",a.createElement(A.pre,null,a.createElement(A.code,{className:"language-bash"},"django-admin startproject mysite\n")),"\n",a.createElement(A.p,null,"startproject 명령어를 사용하여 mysite를 만듭니다."),"\n",a.createElement(A.h3,null,"데이터베이스 생성 및 연결"),"\n",a.createElement(A.pre,null,a.createElement(A.code,{className:"language-mysql"},"CREATE DATABASE mysite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n")),"\n",a.createElement(A.p,null,"이모지가 입력 가능한 utf8mb4 타입으로 데이터베이스를 생성합니다. 저는 mysql이 편해서 mysql을 사용하였는데요, Google SQL에서는 2020년 3월 현재 MySQL, PostgreSQL, SQL Server를 지원합니다."),"\n",a.createElement(A.span,{dangerouslySetInnerHTML:{__html:'<span\n      class="gatsby-resp-image-wrapper"\n      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 800px; "\n    >\n      <a\n    class="gatsby-resp-image-link"\n    href="/static/879477f257d4eef0ae8bbed2182b6083/437bf/2.jpg"\n    style="display: block"\n    target="_blank"\n    rel="noopener"\n  >\n    <span\n    class="gatsby-resp-image-background-image"\n    style="padding-bottom: 20.5%; position: relative; bottom: 0; left: 0; background-image: url(\'data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAEABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEF/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB3aFB/8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAwEBPwE//8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAgEBPwE//8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQAGPwJ//8QAFRABAQAAAAAAAAAAAAAAAAAAARD/2gAIAQEAAT8hL//aAAwDAQACAAMAAAAQ88//xAAUEQEAAAAAAAAAAAAAAAAAAAAQ/9oACAEDAQE/ED//xAAUEQEAAAAAAAAAAAAAAAAAAAAQ/9oACAECAQE/ED//xAAZEAACAwEAAAAAAAAAAAAAAAABEQAQIUH/2gAIAQEAAT8QLEhOCv/Z\'); background-size: cover; display: block;"\n  ></span>\n  <img\n        class="gatsby-resp-image-image"\n        alt="img"\n        title=""\n        src="/static/879477f257d4eef0ae8bbed2182b6083/4b190/2.jpg"\n        srcset="/static/879477f257d4eef0ae8bbed2182b6083/e07e9/2.jpg 200w,\n/static/879477f257d4eef0ae8bbed2182b6083/066f9/2.jpg 400w,\n/static/879477f257d4eef0ae8bbed2182b6083/4b190/2.jpg 800w,\n/static/879477f257d4eef0ae8bbed2182b6083/e5166/2.jpg 1200w,\n/static/879477f257d4eef0ae8bbed2182b6083/b17f8/2.jpg 1600w,\n/static/879477f257d4eef0ae8bbed2182b6083/437bf/2.jpg 2872w"\n        sizes="(max-width: 800px) 100vw, 800px"\n        style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"\n        loading="lazy"\n        decoding="async"\n      />\n  </a>\n    </span>'}}),"\n",a.createElement(A.p,null,a.createElement(A.code,null,"mysite/settings.py"),"를 열고 다음과 같이 설정해 줍니다."),"\n",a.createElement(A.pre,null,a.createElement(A.code,{className:"language-python"},"if os.getenv('GAE_INSTANCE'):\n    DATABASES = {\n        'default': {\n            'ENGINE': 'django.db.backends.mysql',\n            'NAME': os.getenv('DB_NAME'),\n            'HOST': os.getenv('DB_HOST'),\n            'USER': os.getenv('DB_USER'),\n            'PASSWORD': os.getenv('DB_PASSWORD'),\n            # For MySQL, set 'PORT': '3306' instead of the following. Any Cloud\n            # SQL Proxy instances running locally must also be set to tcp:3306.\n            'PORT': os.getenv('DB_PORT'),\n        }\n    }\nelse:\n    DATABASES = {\n        'default': {\n            'ENGINE': 'django.db.backends.mysql',\n            'OPTIONS': {\n                'read_default_file': os.path.join(BASE_DIR, 'prod.cnf'),\n            },\n        }\n    }\n")),"\n",a.createElement(A.p,null,a.createElement(A.code,null,"prod.cnf")),"\n",a.createElement(A.pre,null,a.createElement(A.code,null,"host = 000.000.000.000\ndatabase = mysite\nuser = root\npassword =\nport = 3306\ndefault-character-set = utf8mb4\n")),"\n",a.createElement(A.p,null,a.createElement(A.code,null,"prod.cnf"),"를 프로젝트 루트에 생성해 주세요. 이 파일은 로컬 데이터베이스 접속정보를 설정하는 파일입니다."),"\n",a.createElement(A.h3,null,"app.yaml 설정"),"\n",a.createElement(A.p,null,"앞서 데이터베이스를 설정할 때 ",a.createElement(A.code,null,"os.getenv()"),"를 사용해서 설정을 주입하였는데요, 이 데이터는 어디서 올까요? 먼저 GAE 튜토리얼을 읽어보신 분이라면 아시겠지만 app.yaml 파일에 저장됩니다. GAE 배포에 관련된 거의 모든 설정을 작성하는 app.yaml 파일을 작성해 보겠습니다."),"\n",a.createElement(A.pre,null,a.createElement(A.code,null,"runtime: python37\ninstance_class: F4\nentrypoint: gunicorn -b :$PORT main:app\n\nbeta_settings:\n  cloud_sql_instances: mysite:asia-northeast2:mysite\n\nhandlers:\n  # This configures Google App Engine to serve the files in the app's static\n  # directory.\n  - url: /static\n    static_dir: mysite/static/\n\n  # This handler routes all requests not caught above to your main app. It is\n  # required when static routes are defined, but can be omitted (along with\n  # the entire handlers section) when there are no static files defined.\n  - url: /.*\n    script: auto\n\nenv_variables:\n  DB_PROD: 'TRUE'\n  DB_HOST: '/cloudsql/mysite:asia-northeast2:mysite'\n  DB_PORT: '3306'\n  DB_NAME: 'mysite'\n  DB_USER: 'root'\n  DB_PASSWORD: 'password'\n")),"\n",a.createElement(A.h3,null,"Google App Engine을 위한 설정"),"\n",a.createElement(A.pre,null,a.createElement(A.code,{className:"language-python"},"from mysite.wsgi import application\n\napp = application\n")),"\n",a.createElement(A.p,null,a.createElement(A.code,null,"app.yaml")," 파일의 entrypoint 항목을 보면 ",a.createElement(A.code,null,"main:app"),"이라고 설정하였습니다. 이 뜻은 main.py의 app을 실행하겠다는 뜻인데요, django app에서 기본적으로 생성한 ",a.createElement(A.code,null,"wsgi.py"),"의 application가 방금 생성한 프로젝트입니다."),"\n",a.createElement(A.h3,null,"배포하기"),"\n",a.createElement(A.pre,null,a.createElement(A.code,{className:"language-bash"},"gcloud app deploy\n")),"\n",a.createElement(A.p,null,"놀랍게도 이 한 문장이면 됩니다. 이 명령어는 자동으로 app.yaml을 설정합니다. 여러 버전으로 배포하고 싶다면 뒤에 ",a.createElement(A.code,null,"dev.yaml")," 이런 식으로 덧붙이면 해당 설정으로 배포할 수 있습니다."),"\n",a.createElement(A.h2,null,"참고자료"),"\n",a.createElement(A.ul,null,"\n",a.createElement(A.li,null,a.createElement(A.a,{href:"https://cloud.google.com/gcp/getting-started/?hl=ko"},"구글 클라우드 플랫폼 공식 튜토리얼")),"\n",a.createElement(A.li,null,a.createElement(A.a,{href:"https://amanokaze.github.io/blog/Construct-Django-Application-using-GAE-Storage/"},"구글 스토리지 사용법이 포함된 다른 한국어 튜토리얼")),"\n"))}A.default=function(e){void 0===e&&(e={});const{wrapper:A}=Object.assign({},(0,t.ah)(),e.components);return A?a.createElement(A,e,a.createElement(l,e)):l(e)}},1151:function(e,A,n){n.d(A,{Zo:function(){return s},ah:function(){return l}});var t=n(7294);const a=t.createContext({});function l(e){const A=t.useContext(a);return t.useMemo((()=>"function"==typeof e?e(A):{...A,...e}),[A,e])}const c={};function s({components:e,children:A,disableParentContext:n}){let s;return s=n?"function"==typeof e?e({}):e||c:l(e),t.createElement(a.Provider,{value:s},A)}}}]);
//# sourceMappingURL=2526ebf9f3c5f64be185dff542fe3f2f34b23a73-c2a130cc27bcfc7553f8.js.map