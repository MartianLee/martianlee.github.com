---
layout: post
title:  "220313 TIL"
crawlertitle: "220313 TIL"
summary: "220313 TIL"
date: 2022-03-13 20:16:45 +0900
categories: posts
tags: ['question']
author: MartianLee
---

# TIL : grid의 다양한 사용법 익히기

## 문제
같은 줄에 있는 요소를 하나는 width를 고정시키고 다른 요소는 width가 커져도 그에 따라 늘어나게 하려면 어떻게 해야 할까?

## 해결
-> css grid로 해결

1. 처음에는 flexbox + min-width로 해결하려고 했다. 하지만 min-width를 설정한 요소가 자꾸 width의 최대값을 벗어나는 문제를 발견했다.
2. 구글링 결과 grid를 사용하면 width의 크기를 지정할 수 있다는 것을 발견했다.

```html
<div style="display:grid; grid-template-columns: minmax(0,1fr) 100px;">
    <input type="text" placeholder="검색" />
    <button type="submit">
        검색하기
    </button>
</div>
```
위와 같이 스타일링하면, button의 width가 100px으로 고정되고 width의 변화에 따라 input은 꽉 차게 보인다.

## 정리

grid는 `grid-template-columns: 1fr 1fr 1fr 1fr;` 정도밖에 이해하지 못하고 있었는데 이번 기회에 더 다양한 layout을 생성할 수 있음을 알게 되었다.

* [grid fr의 사용법](https://www.digitalocean.com/community/tutorials/css-css-grid-layout-fr-unit)
