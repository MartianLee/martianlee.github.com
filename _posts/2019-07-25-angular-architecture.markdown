---
layout: post
title:  "AngularJS 7의 아키텍쳐 알아보기"
crawlertitle: "AngularJS 7의 아키텍쳐 알아보기"
summary: "두 프로젝트를 진행하면서 활용했던 AngularJS 7의 아키텍쳐를 알아봅니다."
date: 2019-07-25 22:42:15 +0900
categories: posts
tags: ['develop','AngularJS']
author: MartianLee
output:
  html_document:
    toc: true
---

![img]({{ site.images }}/190725_angular_architecture/overview.png)

* 목차
{:toc}

## 문제
앵귤러JS 버젼7으로 회원가입과 게시판, 이벤트 참석 기능이 있는 약간 규모가 있는 어플리케이션을 개발합니다.

개발환경
* Angular 7.2.11
* Rxjs 6.4
* Node v12.4.0

## 해결

![img1]({{ site.images }}/190725_angular_architecture/1.png)

### 1. view-service-model

앵귤러 튜토리얼에서 제안하는 아키텍쳐입니다. view-service-model을 활용합니다. 기존 패턴처럼 코딩한다면 redux pattern 에서 해결하고자 하는 문제인 view와 model이 아주 복잡하게 뒤섞이는 일이 발생합니다. 그렇지만 이 문제는 앵귤러의 RxJS를 활용하면 쉽게 풀립니다. 데이터 모델의 흐름이 달라서 작업이라서 시간이 좀 걸렸습니다.

![img2]({{ site.images }}/190725_angular_architecture/2.png)

### 2. view-service-repository-model

위 형태에서 service가 직접 api를 호출하지 않고 repository에서만 api를 호출합니다. 그리고 서버에서 받아온 request model과 실제로 view에서 사용되는 ui model을 분리해서 사용합니다. 두 모델을 매핑하는 helper class가 필요합니다. 이 구조를 보면 무언가 떠오르는데요, 바로 스프링입니다. 1번의 방법보다 조금 더 큰 프로젝트를 진행할 때 효과적인 구조입니다.

## 결론

약간 아이러니하게도, 첫 번째 구조를 규모가 더 작은 어플리케이션에 적용해서 프로젝트를 진행하였는데요, 어플리케이션 규모에 비해 구조가 복잡하다 보니 약간의 over-engineering 한 느낌이 들었습니다. 특히 모델을 ui 모델과 request 모델로 나누다 보니 복잡하지 않은 기능을 만들 때도 매번 두 모델을 생성해 주어야 하는 번거로움이 있었습니다.

어플리케이션이 커지면 커질수록 확실히 mvc model의 한계가 느껴졌습니다. 물론 Angular에서 기본적으로 RxJS를 사용하게 되어 있어서 서버 혹은 사용자의 입력에 의한 비동기 처리 후 데이터 변화를 전파하는 부분은 설계에 따라 아주 명쾌할 수 있습니다. 하지만 3개정도 모델을 바인딩하고 호출해서 결과를 뿌려주고 또 액션까지 처리하려고 하니 머릿속이 복잡해진 것은 사실입니다. (아직 RxJS가 익숙하지 않아서 그럴 수도 있습니다)

![img]({{ site.images }}/190725_angular_architecture/4.png)

코드가 복잡해지면 복잡해 질 수록 이전에 react와 vue.js에서 적극적으로 사용하고 있는 [flux 아키텍쳐](https://taegon.kim/archives/5288)가 생각나기도 했습니다. 각 컴포넌트에서 여러 개의 스트림이 열려 있고 그것에 따른 전파 로직이 너무 복잡하게 느껴졌기 때문입니다. 그냥 state에 다 때려넣고 싶은 마음이 불쑥불쑥 ㅋㅋ

더 자세한 내용은 [앵귤러 공식 튜토리얼](https://angular.io/tutorial)과 [앵귤러 아키텍쳐](https://v2.angular.io/docs/ts/latest/guide/architecture.html)를 참조해 주시기 바랍니다.
