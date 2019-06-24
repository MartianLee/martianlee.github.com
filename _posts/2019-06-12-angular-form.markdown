---
layout: post
title:  "AngularJS form binding Input에 기본값 설정하기"
crawlertitle: "AngularJS form binding Input에 기본값 설정하기"
summary: "AngularJS의 폼을 사용할 때 option 기본값을 설정합니다."
date:   2019-06-12 20:16:32 +0900
categories: posts
tags: ['develop','frontend']
author: MartianLee
output:
  html_document:
    toc: true
---

![img1]({{ site.images }}/190612_angular_form/form.png)

* 목차
{:toc}

## 문제
AngularJS를 사용할 때 selectbox를 form binding해서 사용하게 된다. 이 때 분명 html의 selected 속성을 사용하였는데, 기본값을 설정할 수 없는 문제가 발생하였다.

## 해결
모든 option의 value와 model, 렌더링되는 시점을 확인해 보아도 문제가 없었다. 분명히 selected가 설정되어야 했다.

```
<div class="form-select-area">
  <label class="form-label" for="gender">성별</label>
  <select id="gender" name="gender" class="form-select"
          required
          [(ngModel)]="data.sex"
          #sex="ngModel">
    <option value="" selected disabled>성별을 선택하세요</option>
    <option *ngFor="let sex of [1, 2]" [ngValue]="sex">
      {{sex === 1 ? '남자' : '여자'}}
    </option>
  </select>
  <p class="form-msg error"
      [hidden]="isValidForm(f, sex)">
    This field is required
  </p>
</div>
```
위에서 option을 하나 추가해서 그것을 기본 선택자로 해두고 그것은 선택할 수 없게 했다. 그리고 value에 "" 빈 string을 입력해 두었다. 하지만 여기서 문제를 발견했다. 내가 value를 입력했지만 이 값이 binding된 ``[(ngModel)]="data.sex"`` 값과 달랐기 때문이었다. 두 값이 다른 경우 어떠한 경우에도 selected가 설정되지 않았다. 심지어 
수동으로 selected 설정을 해도 전혀 작동하지 않았다 !!

참고로 data에 해당하는 model이다.

```
export class UserUpdateUI {
  constructor(
    public name: string = '',
    public email: string = '',
    public phone: string = '',
    public sex: number = 0,
    public password: string = '',
    public confirmPassword: string = ''
  ) {
  }
}
```

## 결론
option의 value를 null 이든 undefined이든 model의 초기값과 일치시켜 주어야 한다. model의 변수가 number인 경우도 특히 유의해야 하는데 undefined라는 value로 초기화되어 있을 가능성이 크다. AngularJS 폼을 selected 하려거든 항상 초기값을 조심하자.
