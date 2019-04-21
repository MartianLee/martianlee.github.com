---
layout: post
title:  "Jekyll로 깃헙 블로그 멋대로 디자인하기"
crawlertitle: "Jekyll로 깃헙 블로그 멋대로 디자인하기"
summary: "Jekyll로 깃헙 블로그를 생성하고 스타일을 멋대로 입혀봅니다"
date:   2019-04-11 19:03:48 +0900
categories: posts
tags: ['algorithm']
author: MartianLee
---

## 문제 요약
오늘은 jekyll(지킬 이라고 읽습니다) 이라는 ruby 기반 정적 블로그 생성기를 활용해 github page를 만들어 보려고 합니다. 네이버, 티스토리, 워드프레스 등등 많은데 github에 굳이 blog를 만드는 장점은 무엇이 있을까요? 제가 경험한 바에 근거하자면, 우선 github에 파일이 모두 공개된다는 점이 좋습니다. 만약에 제가 새로 만든 javascript 라이브러리를 당장 동작시켜서 보여주고 싶다면 github 블로그에 바로 include해서 사용해볼 수 있습니다. 그리고 markdown 형식을 사용해 작성/편집이 용이합니다. 마지막으로 github에 commit log가 남습니다. 그러니까, github contribution에 초록색을 채울 수 있다는 뜻입니다(ㅋㅋ) 참. 마지막으로 google에서 검색이 꽤 잘됩니다. 기술 관련 자료를 검색하다 보면 쉽게 github.io로 끝나는 블로그의 게시물을 발견할 수 있습니다.



## Github Blog with Jekyll로 할 수 있는 것들
github에 파일을 push해서 게시글을 작성할 수 있습니다.
javascript/html/css를 자유롭게 사용하여 메인 페이지를 꾸밀 수 있습니다.
liquid의 문법을 사용해 pagination과 같이 간단한 기능을 구현할 수 있습니다.

## 설치
우선 jekyll을 위해서는 ruby 언어를 설치해야 합니다. [링크 참조](https://www.ruby-lang.org/ko/)
윈도우, 맥 모두 지원하므로 링크를 참조해서 설치하시면 됩니다. 잠깐 루비를 사용해 본 경험이 있는데요, 저와는 아주 잘 맞았습니다. 설명처럼 ‘프로그래머의 단짝 친구’ 라는 말이 전혀 아깝지 않을 정도로 정말 짧은 코드로 원하는 프로그램을 작성할 수 있습니다.

다시 jekyll로 돌아갑니다. jekyll은 ruby의 gem이므로 command line으로 설치할 수 있습니다. gem은 쉽게 이야기하면 ruby 라이브러리라고 할 수 있는데요, 설치가 어마어마하게 편하답니다. npm-install 을 사용하신 분이라면 익숙하실 것 같네요.

자세한 설치는 [지킬 홈페이지](https://jekyllrb.com/) 를 참조해 주세요. 사실 한 줄만 있으면 됩니다. 
```
gem install bundler jekyll
```
저희는 jekyll 블로그를 마음대로 뜯어고칠 것이기 때문에 minima라는 테마를 사용합니다.
```
jekyll new my-blog
```
위 명령어를 실행시키면 아래와 같은 파일들이 생성됩니다. (프로젝트 이름은 임의로 변경하셔도 됩니다)
```
my-blog
├── Gemfile
├── LICENSE.txt
├── README.md
├── _includes
├── _layouts
│   ├── default.html
│   ├── page.html
│   └── post.html
├── _sass
├── assets
└── minima.gemspec
```

이제 커맨드 라인에 ``jekyll serve`` 명령어를 실행하면 당신이 만든 블로그가 보입니다. 짝짝!! 

## 개발

minima는 말 그대로 최소한의 설정만을 제공하는 테마입니다. 이제 우리가 만들 페이지를 하나 하나 뜯어보려고 합니다.

폴더만
```
├── _includes : 홈페이지에 필요한 html 컴포넌트 파일들을 저장합니다.(ex 헤더, 푸터)
├── _layouts : 페이지별 레이아웃 파일을 저장합니다.
├── _posts : 게시글을 저장하는 폴더입니다.
└── assets : css/javascript/이미지와 같이 기타 구성요소들을 저장합니다.
    ├── _sass
    ├── css
    ├── images
    └── js
```
이제 제 [깃헙 블로그](https://github.com/MartianLee/martianlee.github.com)를 기준으로 설명드리겠습니다.

### 세부 파일들
```
├── LICENSE
├── README.md
├── _config.yml
├── _includes
│   ├── aside.html
│   ├── footer.html
│   ├── head.html
│   ├── header.html
│   ├── home-footer.html
│   └── main-header.html
├── _layouts
│   ├── compress.html
│   ├── default.html
│   ├── home.html
│   ├── page.html
│   └── post.html
├── _posts
│   ├── 게시물이 들어가는 폴더
├── about.md
├── archive.md
├── assets
│   ├── _sass
│   │   ├── _base.scss
│   │   ├── _home.scss
│   │   ├── _layout.scss
│   │   ├── _media-queries.scss
│   │   ├── _normalize.scss
│   │   ├── _syntax-highlighting.scss
│   │   └── _variables.scss
│   ├── css
│   │   ├── main.scss
│   │   └── syntax.css
│   ├── images
│   │   ├── 190312_ssh_key_github
│   │   │   ├── img1.png
│   │   ├── background1.jpg
│   └── js
│       └── scripts.js
├── feed.xml
├── index.html
├── posts.html
├── posts.md
├── problem_solving.md
├── question.md
├── sitemap.xml
└── tags.html
```

highlighter: rouge
relative_permalinks: false
permalink: /:categories/:title/

permalinks 는 https://martianlee.github.io/posts/ 의 뒤에  posts와 같이 페이지, 포스트, 콜렉션의 주소를 나타냅니다. 주소 설정에 대한 자세한 정보는 [지킬 공식 홈페이지](https://jekyllrb-ko.github.io/docs/permalinks/)를 참조해 주세요.

### 스타일 및 메인 페이지뜯어 고치기

1. 우선 자동으로 생성되는 index.md 파일을 삭제합니다.
index.html 과 index.md 가 동시에 있으면 index.md를 먼저 참조하기 때문입니다.
2. index.html 을 생성합니다. 이제 저희 마음대로 메인 페이지를 꾸밀 수 있습니다. 저는 bootstrap 테마를 가져와서 살짝 고쳤는데요, 제 index.html을 고쳐 쓰셔도 무방합니다. (home.scss의 background 파일에 유의하세요!)
3. assets/css 에 main.scss 파일을 생성합니다. 이제 이 파일에 메인 페이지을 포함해 우리가 적용하고 싶은 스타일을 저장할 것입니다.

main.scss 파일의 내용은 다음과 같습니다. 제일 위에는 메인 Sass 를 뜻하는 --- 를 넣어줍니다. 그리고 앞으로 변수로 사용한 baseurl을 정의합니다. 그리고 @import 를 사용해 우리가 import할 파일을 포함시켜 줍니다. 아예 0부터 디자인하실 분은 하나씩 만들 때마다 추가해 주시면 됩니다. 저와 비슷한 스타일로 시작하시려면 제 저장소에서 파일을 복사해 가시면 됩니다.
```
---
# Only the main Sass file needs front matter (the dashes are enough)
---
$baseurl: "{{ site.baseurl }}";

@charset "utf-8";


// Import partials from `sass_dir` (defaults to `assets/_sass`)
@import
  "normalize",
  "variables",
  "base",
  "layout",
  "media-queries",
  "syntax-highlighting"
;

@import "home"
```
4. assets/_sass/home.scss 파일을 수정합니다.

5. _includes/head.html 을 확인해 봅니다. 저는 css framework bootstrap을 사용합니다. 다른 framework를 사용하고 싶은 분들은 바꿔서 쓰시면 됩니다. 
```
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- viewport를 설정해 줍니다. 모바일 대응을 위해 device-width 크기로 width를 설정해 줍니다. -->

  <!-- title 설정 -->
  <title>
    {% if page.crawlertitle %}
      {{ page.crawlertitle | escape }}
    {% elsif page.title %}
      {{ page.title | escape }}
    {% else %}
      {{ site.title | escape }}
    {% endif %}
  </title>

  <meta name="description" content="{% if page.excerpt %}{{ page.excerpt | strip_html | strip_newlines | truncate: 160 }}{% else %}{{ site.description }}{% endif %}">

  <link rel="canonical" href="{{ page.url | replace:'index.html','' | prepend: site.baseurl | prepend: site.url }}">
  <link rel="alternate" type="application/rss+xml" title="{{ site.title }}" href="{{ "/feed.xml" | prepend: site.baseurl | prepend: site.url }}">

  <link href='https://fonts.googleapis.com/css?family=PT+Serif:400,400italic,700|Roboto+Condensed:700&subset=latin' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="{{ "/assets/css/main.css" | relative_url }}">
  
  <!-- 웹 폰트 설정 -->
  <link rel="stylesheet" 
  href="https://fonts.googleapis.com/earlyaccess/nanumgothic.css">

  <!-- Bootstrap & Fonts-->
  <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" rel="stylesheet" >
  <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700,300italic,400italic,700italic' rel='stylesheet' type='text/css'>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
  <!-- Optional theme -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
  <!-- Latest compiled and minified JavaScript -->
  <script src="http://code.jquery.com/jquery-3.3.1.slim.js" integrity="sha256-fNXJFIlca05BIO2Y5zh1xrShK3ME+/lYZ0j+ChxX2DA=" crossorigin="anonymous"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>

  <!-- syntax.css -->
  // meta tag 설정

  {% if page.bg %}
    // meta tag background 설정
  {% endif %}

  <script>
    <!--  구글 애널러틱스 -->
  </script>
  <script id="dsq-count-scr" src="//http-martianlee-github-io.disqus.com/count.js" async></script>
  <!--  disqus : 댓글 달 수 있는 서비스 -->
</head>

```

### 새로운 페이지 추가하기
home/about.md 파일은 about 페이지입니다.이 처럼 메인 경로에 파일을 추가하고 active: about 으로 설정하면 메뉴에 about 이 추가됩니다. 

_include/header.html 을 봅시다.
```

    {% for my_page in site.pages %}
      {% if my_page.active %}
        <a href="{{ my_page.url | prepend: site.baseurl }}">{{ my_page.title }}</a>
      {% endif %}
    {% endfor %}

```
여기서 site.pages 에 방금 우리가 active에 등록한 페이지가 포함된다는 것을 알 수 있습니다.

### 댓글 기능 추가하기
[이 게시글](https://xho95.github.io/blog/jekyll/disqus/migration/2017/01/20/Add-Disqus-to-Jekyll.html)과 [다른 게시글](https://17billion.github.io/jekyll/disqus/reply/2017/06/01/jekyll_disqus.html
)을 참조해서 개발하였습니다.

#### 시행착오
* 위 게시물을 참조하면 댓글이 포함될 페이지에 page.comments 를 true 로 표시하여야 하는데요 이것이 작동하지 않아서 애를 먹었습니다. 아직 해결하지 못하고 그냥 댓글이 필요한 곳에는 disqus의 javascript 조각을 포함시켜 놓았습니다.


## 깃헙에 연결하기
repository - setting - options - GitHub Pages 에서 github page 를 설정하실 수 있습니다.

![img1]({{ site.images }}/190415_jekyll-blog.png)

## 마무리

제 깃헙 블로그 repository는 https://github.com/MartianLee/martianlee.github.com 이곳에서 확인하실 수 있습니다.

프로그래밍 공부한 것을 정리해 놓고 싶은데 티스토리 초대장을 구하기도 힘들고 직접 개발에서 호스팅까지 하자니 귀찮고 하시는 분께 바로 깃헙 블로그를 추천합니다. 다른 지킬 블로그 예시는 [숭실대학교 SCCC 페이지](https://ssu-sccc.github.io/sccc-homepage/)를 참조해 주세요!
