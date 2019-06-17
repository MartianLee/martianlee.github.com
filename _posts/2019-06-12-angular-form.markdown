---
layout: post
title:  "NAVER 기술 면접 리뷰"
crawlertitle: "NAVER 기술 면접 리뷰"
summary: "NAVER 기술 면접 질문과 답변을 정리합니다."
date:   2019-04-22 16:08:45 +0900
categories: posts
tags: ['develop','interview']
author: MartianLee
output:
  html_document:
    toc: true
---

![img1]({{ site.images }}/190422_interviews/naver.png)

* 목차
{:toc}

## 배경
지난 3월 네이버 수시모집에 지원하였습니다. 그리고 서류-전화기술면접 에서 탈락하고 말았습니다. 아쉬운 대로 면접에서 나왔던 질문을 정리합니다.

## 질문 & 답변
* HTTP 프로토콜에 대해 설명해 보세요
  * 헤더가 있고 리퀘스트 할 떄는 메소드가 있고 그 아래 컨텐츠가 있다 이렇게 설명했습니다. 더 디테일하게 물어봤지만 답하지 못했습니다.
* Restful API에 대해 설명해 보세요.
  * 자원의 상태를 표현하는 기법으로 현재 대부분의 웹서버에 적용되는 규칙이라고 설명했습니다.
* 우리가 웹서비스에 접근할 때 어떤 경로를 거치는 지 아는 만큼 설명해 보세요
  * 클라이언트가 url 입력 -> 도메인 서버 -> 도메인 서버가 가지고 있는 실제 서버 주소 -> 서버의 로드밸런서 -> 실제 서버 -> 응답. 이정도로 설명했습니다. 더 물어보지는 않았습니다.
* 서버에 트래픽이 주어졌을 때 어떻게 응답속도를 개선할 수 있는가?
  * 솔직히 실제로 개선시켜 본 경험이 없어서 원론적인 이야기를 한 것 같습니다. 응답하는 로직을 개선한다~ 이렇게 두리뭉실하게 설명한 것 같습니다.
* MVC 패턴에 대해서 설명해 보세요.
  * 모델, 뷰, 컨트롤러로 대부분의 웹 프레임워크에서 사용하고 있는 개념입니다. 모델은 DB와 통신하고 컨트롤러는 모델에서 받아 온 결과를 뷰와 매칭시킵니다. 뷰는 사용자에게 실제 보여줄 화면입니다.
* React와 Vue의 차이점에 대해서 설명해 보세요.
  * 둘다 프론트엔드 자바스크립트 프레임워크인데, 속도나 문법의 차이가 있다. 이러고 말았던 것 같습니다.
* Java 버젼 8에서는 어떤 변화가 있었는지?
  * 모르는 내용이라서 넘어갔습니다.
* JVM에서 가비지 컬렉터가 어떻게 작동하는지?
  * 역시 자세히 답하기 힘들어 넘어갔습니다.
* Table에 Index을 걸면 어떤 장점이 있나요?
  * 당연히 select하는 속도가 빨라집니다. 하지만 index를 많이 걸게 되면 예를 들어서 책이 있으면 목차가 뒤에 계속 여러 개 달리면 속도가 점점 느려질 수 있고 특히 insert update 할 때 속도가 느려진다고 답하였습니다.

## 면접 후기
네이버의 전화면접은 굉장히 dry했습니다. 인사 이후에 바로 질문세례가 이어졌구요 마지막 질문 이후 바로 통화가 끝났습니다. 어버버 하다가 전화가 끊어졌습니다. 언제 답을 준다 이런 내용도 없이 대충 3~5일 정도 있다가 불합격 메일이 왔습니다. 질문 하나하나가 날카로워서 긴장을 많이하고 답변도 제대로 못했습니다. 원론적인 개념을 더 잘 알아야겠다는 생각이 들었습니다.

## 앞으로 공부할 것들
* HTTP 프로토콜이란?
  * ``Hyper Text Transfer Protocol``의 줄임말.
  * TCP/IP를 이용하는 응용 프로토콜
  * 연결상태를 유지하지 않는 비연결성 프로토콜
  * HTTP1.1의 구성
    * Request(Response) line
    * Header
      * General Header
      * Request/Response Header
      * Entity Header
    * (blank line)
    * Body

* REST란?
  * ``Representational State Transfer`` 의 줄임말로 자원을 이름(자원의 표현)으로 구분하여 해당 자원의 상태(정보)를 주고 받는 모든 것을 의미한다. [출처](https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html)
  * 구성
    * 자원(Resource) : URI
    * 행위(Verb) : HTTP Method
    * 표현(Representation of Resource) : 서버의 응답
  * 특징
    * Stateless (무상태성) : HTTP는 Stateless Protocol 이므로, REST 역시 무상태성을 갖는다. 즉, HttpSession과 같은 컨텍스트 저장소에 상태정보를 따로 저장하고 관리하지 않고, API 서버는 들어오는 요청만을 단순 처리하면 된다. 세션과 같은 컨텍스트 정보를 신경쓸 필요가 없어 구현이 단순해진다.
      * 컨텍스트 저장소에 저장된 상태정보에는 무엇이 있나요? 예를 들어서.
    * Cacheable
    * Layered System : Client는 REST API Server만 호출한다. 하지만 실제로 서버는 다양한 계층으로 구성될 수 있다. 예를 들어 인증/암호화 등등 계층이 있을 수 있다.
* Restful API란?
  * API는 ``Application Programming Interface``의 줄임말로 REST 철학을 기반으로 API를 구현한 것을 말한다.
* MVC 패턴에 대해서 설명해 보세요
  * ![img1]({{ site.images }}/190422_interviews/mvc.png)
  * MVC란 ``Model View Controller``의 약자로 에플리케이션을 세가지의 역할로 구분한 소프트웨어 디자인 패턴이다.
* React와 Vue의 차이점은?
  * 공통점
    * Javascript 기반의 Frontend Framework입니다.
    * 가상 DOM을 활용합니다. 
    * 반응적이고 조합 가능한 컴포넌트를 제공합니다. 
    * 코어 라이브러리에만 집중하고 있고 라우팅 및 전역 상태를 관리하는 컴패니언 라이브러리가 있습니다.
  * 차이점
    * 런타임 퍼포먼스	
    * HTML & CSS
    * React에서는 모든 것이 JavaScript입니다. JSX를 통해서 HTML 구조가 들어와있을 뿐만 아니라 요즘에는 CSS 관리도 JavaScript에서 하는 추세죠. 이 접근 법도 나름대로 장점이 있습니다만 모든 개발자들에게 적합하다고 하기에는 단점이 좀 있습니다.
    * Vue는 고전적인 웹기술들을 받아들여서 그 기반 위에 만들어졌습니다.
  * Vue 의 장점은
    * Template 과 Render Function 을 모두 사용할 수 있는 옵션
    * 간편한 Syntax 와 프로젝트 설정
    * 빠른 렌더링과 더 작은 용량
  * React 의 장점은
    * 큰 규모에서 더 빛을 발하고, 테스팅이 수월
    * Web 과 Native 앱 개발에 모두 사용 가능
    * 더 큰 개발자 생태계에서 오는 많은 레퍼런스와 도구들
* Java에서 람다 함수란?
  * ``식별자 없이 실행 가능한 함수 표현식``
  * Functional Language 함수형 프로그래밍에서 온 개념으로 매개변수parameter를 가진 코드 블록이지만, 런타임 시에는 익명 구현 객체(추상메소드를 한개 포함한)를 생성합니다.
  * 왜 사용하나요?
    * 람다식은 결국 로컬 익명 구현객체를 생성하게 되지만, 이 람다식의 사용 목적은 인터페이스가 가지고 있는 메소드를 간편하게 즉흥적으로 구현해서 사용하는 것이 목적입니다.
    * 코드를 간결하게 만들고 가독성이 향상됩니다.
  * ```
    기존의 익명 클래스방식
      new Thread(new Runnable() { 
        public void run() {
          System.out.println("Annoymous Thread");
        }
      }).start();
    람다방식
      new Thread(()->System.out.println("Lambda Thread")).start();
    ```
  * 사실 자바의 익명함수는 인터페이스 기반으로 직동합니다.
  * @FunctionalInterface 어노테이션을 붙이면 익명 클래스용 인터페이스를 생성할 수 있습니다.
* JVM에서 가비지 컬렉터가 어떻게 작동하는지?
  * Java의 메모리 영역은 어떻게 생겼지?
    * Java는 JVM 이라는 가상머신을 이용해서 OS의 메모리에 간접적으로 접근한다. 따라서 OS Level에서 Memory Leak이 발생하지 않는다.
    * Stack
      * 지역변수와 같이 스코프별로 할당되는 영역
    * Heap
      * 긴 생명주기를 가진 데이터 저장
  * 가비지 컬렉터는 왜 필요하지?
    * ,
  * 어떻게 작동하지?
    * 프로그래머는 힙 영역을 마음대로 사용하고 더 이상 사용하지 않는 오브텍트들은 가비지 컬렉터가 메모리에서 제거한다.
    * Heap 영역의 오브젝트 중 stack 에서 도달 불가능한 (Unreachable) 오브젝트들은 가비지 컬렉션의 대상이 된다.
    * 스택의 모든 변수를 스캔하면서 각각 어떤 오브젝트를 레퍼런스 하고 있는지 찾는과정이 Mark 다. Reachable 오브젝트가 레퍼런스하고 있는 오브젝트 또한 marking 한다. 그리고 나서 mark 되어있지 않은 모든 오브젝트들을 힙에서 제거하는 과정이 Sweep 이다.
* Vue.js에서 상태 관리 패턴에 대해서 설명하기
  * ![img1]({{ site.images }}/190422_interviews/vuex-diagram.png)
  * 왜 상태 관리 패턴이 필요하지?
    * 앱의 규모가 커지면 커 질수록 컴포넌트의 종류가 많아지고 여러 단계 중첩됩니다. 이런 경우 데이터의 흐름을 추측하기가 몹시 힘듭니다. 그래서 중앙 집중식으로 하나의 데이터를 관리하는 패턴이 필요합니다.
  * 상태 관리의 구성요소
    * state : 컴포넌트 간 공유될 data
    * view : 데이터가 표현될 template
    * actions : 사용자의 입력에 따라 반응할 methods
  * 어떻게 적용하지?
    * Vuex를 import하면 됩니다.
    * 이제 모든 데이터를 하나의 state로 관리하게 됩니다.
  * state를 관리하기 위한 방법은 무엇이 있을까요?
    * Getters : 변경된 state 값을 받아옵니다.
    * Mutations : state 값을 변경합니다. setter라고 생각하면 됩니다.
    * Actions : 비동기 mutations 로직을 실행합니다.
