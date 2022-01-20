---
layout: post
title:  "react-hook-form 시작하기 1"
crawlertitle: "react-hook-form 시작하기 1"
summary: "react-hook-form"
date: 2022-01-20 23:26:34 +0900
categories: posts
tags: ['javascript', 'form', 'react', 'hook']
author: MartianLee
---

* 목차
{:toc}


## 배경

회사에서 아주 작은 프로젝트에 들어있는 한 페이지를 새로 작성하는 일을 맡았다. 기존에 구현된 로직을 합치고 기존 플로우에 api를 호출하는 부분이 2개 추가되는 작업이었다. 얼핏 코드를 훑어보았을 때는 포함된 컴포넌트도 2,3개밖에 없고 플로우 자체는 어느정도 이해하고 있었기에 금방 할 것이라고 자신했다. 하지만, 모든 컴포넌트들은 완전히 react-hook-form으로 작성되었고 react-hook-form에 대해서 정말로 하나도 모르는 나는 예상한 기간보다 훨씬 초과해서 작업을 마무리하게 되었다. 요점은 2가지다. react-hook-form은 정말 강력하다. 그리고 앞으로 잘 모르는 코드베이스를 저평가하지 말자.

## react-hook-form이란?

한국어 번역으로 “유연하고 확장 가능한 사용하기 쉬운 고성능 폼 검증 라이브러리” 라고 소개한다. 

awesome react 에서 form 부문에서 [2번째로 소개](https://github.com/enaqx/awesome-react#forms) 되고 있는 라이브러리다. 1번째로 star가 많은 라이브러리는 formik이다. 기회가 되면 써보고 어떤 패턴으로 폼을 구현하면서 생기는 문제를 해결하는 지 공부하면 좋겠다. 공식문서가 [무려 한국어](https://react-hook-form.com/kr/) 로 번역도 되어 있다.

### 좋은 점

1. html5의 input tag를 그대로 사용한다.
2. 직접 소개한 것처럼 form validation이 매우 쉽다.
3. 왠만해서는 리렌더링 하지 않는다. (성능이 좋다는 뜻)
4. 하위 컴포넌트에서 상위 컴포넌트 form 접근이 쉽다. (useContext)
5. validation이 쉽다.
6. 초기값과 submit 함수 규격이 미리 만들어져 있다.

## 사용법

```tsx
import React from "react";
import { useForm } from "react-hook-form";

export default function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => console.log(data);
   
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} />
      <select {...register("gender")}>
        <option value="female">female</option>
        <option value="male">male</option>
        <option value="other">other</option>
      </select>
      <input type="submit" />
    </form>
  );
}
```

공식 문서 [https://react-hook-form.com/get-started](https://react-hook-form.com/get-started) 에서 가장 첫 번째 예제를 가져왔다.

처음으로 register라는 개념을 이해해야 한다. register 함수를 사용하면 우리가 생성한 hook-form의 useForm에 form의 필드들을 등록할 수 있다. 그리고 form의 onSubmit에 handleSubmit을 호출하게 하면 완성된다. 이 사용법이 기본적인 패턴인데, register 하면서 validation 규칙, require - 필수로 입력해야 하는지, 에러 메세지는 어떻게 띄울 것인지 설정할 수 있다. 이 부분만 해도 어마어마하다. 앵귤러의 form도 아주 강력했는데 거의 비슷한 정도의 사용성을 느꼈다. ( [https://angular.io/guide/forms](https://angular.io/guide/forms) 앵귤러 폼, 

```tsx
import React from "react";
import { useForm } from "react-hook-form";

// The following component is an example of your existing Input Component
const Input = ({ label, register, required }) => (
  <>
    <label>{label}</label>
    <input {...register(label, { required })} />
  </>
);

// you can use React.forwardRef to pass the ref too
const Select = React.forwardRef(({ onChange, onBlur, name, label }, ref) => (
  <>
    <label>{label}</label>
    <select name={name} ref={ref} onChange={onChange} onBlur={onBlur}>
      <option value="20">20</option>
      <option value="30">30</option>
    </select>
  </>
));

const App = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    alert(JSON.stringify(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="First Name" register={register} required />
      <Select label="Age" {...register("Age")} />
      <input type="submit" />
    </form>
  );
};
```

무엇보다 강력하다고 느꼈던 점은 **Integrating an existing form** 부분이다. 우리가 폼을 선언하지만 커스텀 옵션 컴포넌트, 커스텀 체크박스 필드 등등 직접 컴포넌트를 만드는 것을 선호하기 마련인데 이 컴포넌트들과 상호작용하기에 아주 용이하다. 미리 폼에 필수적인 onChange, onBlur, label 등등의 함수를 register 하면서 제공해 주어서 forwardRef로 통합하기, register 함수를 넘겨받아 상위 폼에 등록하기 2가지 방식으로 사용 가능하다. 개발속도 측면에서 이 점이 정말 매력적이었다.

validation도 빠질 수 없다. validation의 경우 내가 직접 구현한 경우, handleSubmit 시에 직접 if문으로 검증해서 alert를 띄워주거나 errorMessage state를 또 직접 구현해 그 state에 에러 메세지 유형을 표시하는 등 수많은 state를 만들고 조건문을 써야 하는데, 미리 pattern, required 여부를 설정하면 알아서 validation 해준다. 그래서 위 예제에는 없지만 formState의 isValid를 사용하면 모든 조건이 만족하기 전까지 제출하지 못하게 할 수 있다. api 요청을 해야 하는 경우 아주 좋다. (불필요한 값이 제출되지 않으니까)

```tsx
const { formState } = useForm();
return (
...
<input type="submit" disabled={!formstate.isValid}/>
)
```

내가 애를 먹었던 것은, formState에 setValue로 직접 값을 세팅해 주고 났을 때 hook-form 자체적으로 validation을 해주지 않아서 위의 submit 버튼에 isValid가 잘 작동하지 않았던 문제였다. 하지만 기가막히게도 hook-form은 그런 상황을 위해서 준비해 놓은 기능이 있었다. 바로 trigger이다. [https://react-hook-form.com/api/useform/trigger](https://react-hook-form.com/api/useform/trigger)

```tsx
import React from "react";
import { useForm } from "react-hook-form";

export default function App() {
  const { register, trigger, formState: { errors } } = useForm();

  return (
    <form>
      <input {...register("firstName", { required: true })} />
      <input {...register("lastName", { required: true })} />
      <button
        type="button"
        onClick={async () => {
          const result = await trigger("lastName");
          // const result = await trigger("lastName", { shouldFocus: true }); allowed to focus input
        }}
      >
        Trigger
      </button>
      <button
        type="button"
        onClick={async () => {
          const result = await trigger(["firstName", "lastName"]);
        }}
      >
        Trigger Multiple
      </button>
      <button
        type="button"
        onClick={() => {
          trigger();
        }}
      >
        Trigger All
      </button>
    </form>
  );
}
```

→ 공식 문서의 trigger 부분을 가져왔다.

위는 button을 눌렀을 때 lastName을 강제로 validation하게끔 만든 상황이다. 심지어 여러 개, 전체의 field도 trigger가 가능하다. 

## 앞으로 할 일

시간이 된다면 설치부터 간단한 회원가입 form 작성, 커스텀 컴포넌트까지 실습해 보는 나만의 튜토리얼을 작성해 보는 것도 좋을 것 같다.
끝!