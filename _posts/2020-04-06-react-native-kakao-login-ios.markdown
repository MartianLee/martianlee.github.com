---
layout: post
title:  "리엑트 네이티브 IOS에서 카카오 SDK를 적용하면서 겪은 문제와 해결"
crawlertitle: "리엑트 네이티브 iOS에서 카카오 SDK를 적용하면서 겪은 문제와 해결"
summary: "리엑트 네이티브 IOS 프로젝트에서 카카오 SDK를 적용하면서 겪은 문제와 해결 방법을 알아봅니다."
date: 2020-04-06 22:34:32 +0900
categories: posts
tags: ['develop','react-native', 'iOS']
author: MartianLee
output:
  html_document:
    toc: true
---

![img]({{ site.images }}/200406_react-native-kakao-login/0.jpg)

* 목차
{:toc}

## 목표
리엑트 네이티브 iOS 네이티브 프로젝트에서 카카오 SDK를 적용하면서 겪은 문제와 해결방안을 정리합니다.

개발환경
* MacOS Mojave 10.14.6 -> MacOS Catalina 10.15.3
* React-Native 0.61.5
* iOS ?

## 해결과정

리엑트 네이티브React Native 프로젝트에서 카카오톡에 공유하기 기능을 개발하던 중이었습니다. 카카오의 iOS Native SDK를 적용하여 쉽게 만들 수 있을 것이라 생각했습니다.
하지만 예상은 보기좋게 빗나가고 이틀이 넘는 시간을 삽질하게 되었습니다. 부디 다른 분은 그러지 않으시길 바라며 해결방법을 공유합니다.

### Project init
```
npm install -g react-native-cli@2.0.1
react-native init KakaoShareApp
react-native run-ios
npm install -g react-native-create-library
react-native-create-library KakaoModule
npm install ./KakaoModule
```

### 카카오 SDK를 import하여 카카오링크 적용하기
처음부터 쉽게 다른 오픈소스 라이브러리를 import하지 않고 직접 모듈을 만들 생각이었습니다. 구글링을 하던 중 [React Native 앱에 카카오링크 적용하기](https://medium.com/@zeroweb.tech/react-native-앱에-카카오링크-적용하기-d170d31b780b) 글을 발견해서 하나씩 따라하기 시작했습니다.
1. 위 게시글의 가장 첫 번째 실습. Native module method 실행에 성공하였습니다.

KakaoModule/ios/RNKakaoTest.m

```
#import "RNKakaoTest.h"

@implementation RNKakaoTest

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE() //이 부분을 추가해주세요.
RCT_EXPORT_METHOD(foo:(RCTResponseSenderBlock)callback)
{
    callback(@[[NSNull null], [NSNull null]]);
}

@end
```

위 게시글의 소스를 가져왔습니다. iOS를 전혀 모르시는 분도 foo라는 함수를 export하겠다는 뜻을 짐작할 수 있습니다.

```
...
import RNKakaoTest from 'react-native-kakao-module';
...<TouchableWithoutFeedback onPress={()=> {
  RNKakaoTest.foo(() => console.log('hi'));
}}>
  <View style={styles.button}>
    <Text style={styles.content}>제로웹 카카오톡 공유하기</Text>
  </View>
</TouchableWithoutFeedback>
...
```
이렇게 import한 foo를 이제 react-native 프로젝트 안에서 언제든지 사용할 수 있습니다.
생각보다 native module을 만드는 일이 어렵지 않다는 것을 알 수 있습니다.

2. 다음으로 KAKAO APP KEY와 같이 환경설정을 진행합니다.
3. 그리고 다음으로 KakaoOpenSDK, KakaoLinkSDK 등 필요한 SDK를 직접 import하는 단계입니다. 하지만 여기서 문제가 생겼습니다.
    1. framework 파일 다운로드
    2. 파일로 framework add 하기 [http://docs.onemobilesdk.aol.com/ios-ad-sdk/adding-frameworks-xcode.html](http://docs.onemobilesdk.aol.com/ios-ad-sdk/adding-frameworks-xcode.html)
    3. 파일로 framework add하는 방법은 카카오톡 공식 개발문서에도 언급되어 있는데요, 시키는 대로 프로젝트를 빌드했지만 실패했습니다.
    4. 에러 내용은 "Cannot include <KakaoLinkSDK.h> 였습니다. 물론 다른 SDK를 import해도 마찬가지였습니다 ㅠㅠㅠ
      검색 결과로는 파일의 참조가 문제라서 copy if need 와 같은 체크박스에 체크를 하고 직접 프로젝트에 import도 하고 build phase에 추가된 것을 아무리 확인해도 import가 되지 않았습니다.


### 싹 지우고 새로운 프로젝트에서 도전

원래 프로젝트에는 @react-native-seoul/kakao-login 라이브러리가 import되어 있어서 SDK가 계속 충돌하는 일도 있었습니다. 그래서 새 프로젝트에서 한 땀 한 땀 다시 프로젝트를 설정하였습니다. 구글링을 해 보니 Build Paths, Header Paths, Framework Path에 sdk의 경로를 추가해주면 된다고 해서 가능한 모든 조합을 시도해서 build 하였지만 여전히 sdk를 import하지 못하였습니다. ㅠㅠ
search path에 추가하고 난리 - 실패

search path 설정을 여러 번 설정하자 linker error가 나면서 프로젝트가 완전히 빌드되지 않는 상태가 되기도 하였습니다. 아무리 other link flags를 바꾸어도 linker error는 해결되지 않았습니다ㅠㅠ 그래서 결국 새로운 프로젝트로 또 설정!

제가 변경/시도해 보았던 설정은 다음과 같습니다.
1. xcode clean build
2. pod install
3. other linker flags 설정
4. Framework Search Path, Header Search Path 설정

### XCode 재설치
계속 된 실패로 시간을 엄청 날린 저는 XCode를 재설치하기로 마음먹었습니다. 주변의 iOS 개발자에게 물어보니 실제로 XCode가 설정이 꼬이는 것으로 유명하다고 합니다. XCode를 재설치 하려고 삭제하고 나서 App store에 갔더니 이런. Mac OS를 모하비에서 카탈리나로 업그레이드해야 다운받을 수 있었습니다. 그래서 OS를 업그레이드 하였습니다. (불안불안 ㅜㅜ)

### React native kakao link 모듈만 설치하기
계속된 실패로 자신감을 잃은 저는 무조건 되는 방법을 찾는 전략을 도입했습니다. 그래서 빈 프로젝트에 react-native-kakao-link라는 npm 모듈을 설치하여 적용해 보았습니다. 결과는.... 성공!!!

여기서 영감을 받아 어떻게 이 프로젝트가 KakaoSDK.framework를 import하는지 관찰했습니다. 이 프로젝트는 제가 하려고 했던 방법에 성공한 모양입니다. github에서 프로젝트를 뜯어보았더니 제일 상위폴더에 KakaoSDK가 file로 import되어 있었습니다.

그래서 신나서 기존 프로젝트의 package.json에 허겁지겁 추가하였지만 이런... @seoul kakologin과 새로운 link 페이지 둘 다 Kakao SDK를 import하여 framework 이름이 같다는 에러가 났습니다. ㅠㅠㅠ 이럴수가...

그렇다면 KakaoOpenSDK를 pod에서 가져오는 @react-native-seoul/kakao-login 모듈은 대체 어떻게 SDK를 가져오는 지 확인해 보기로 하였습니다.

### React-native-kakao-login 모듈 분석하기

  1. React native kakao login library에서 opensdk를 pod에서 가져오는 것을 발견.
  2. Link에서는 파일을 직접 import
  3. 파일대신 pod에서 가져온 kakao sdk쓰게 해보자!
  4. Link 모듈을 그대로 가져오고 podspec file에서 kakao 의존성을 등록
  5. 빌드 성공

### 카카오 메시지 템플릿 공유 성공!
마침내 KakaoSDK를 활용해 카카오 메시지를 공유하는 데 성공하였습니다. ㅠㅠㅠ



## 교훈


1. 다른 사람들이 만들어 놓은 모듈을 눈여겨서 보자.
2. 포기하지 않으면 답이 있다.

아쉬운 점은 file로 import해서 KakaoSDK를 사용하는 방법을 결국 찾지 못했다는 것입니다. 프로젝트 일정 상 성공한 방법으로 계속해서 진행해야 하지만 추후에 시간이 되면 file로 import하는 방법도 찾아서 글로 작성해 보려고 합니다. (혹시 아는 분이 있으면 알려주셔도 좋습니다)


## 참고자료

* kakao message 공식 문서 [https://developers.kakao.com/docs/latest/ko/message/ios](https://developers.kakao.com/docs/latest/ko/message/ios)
* iOS SDK v1 공식 설치 문서 [https://developers.kakao.com/docs/latest/ko/getting-started/sdk-ios-v1](https://developers.kakao.com/docs/latest/ko/getting-started/sdk-ios-v1)

