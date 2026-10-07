// data/charts/passthrough-compositor.ts
// PassthroughCompositor의 문구. 계산용 상수는 컴포넌트 쪽에 있다.
//
// 출처: https://github.com/justbustin/minecraft-crossover-bridge
//       (elden-ring/er-bridge/src/compositor.cpp, 커밋 d172387)

export type Lang = 'en' | 'ko'

export type ThumbId =
  | 'hostColor'
  | 'hostDepth'
  | 'mcColor'
  | 'mcDepth'
  | 'hand'
  | 'gui'
  | 'mask'
  | 'afterOcc'
  | 'lightMap'
  | 'afterRelight'
  | 'hazeBg'
  | 'afterHaze'
  | 'final'

export interface LayerStep {
  badge: string
  title: string
  formula: string
  result: string
}

export interface LayerLabels {
  title: string
  caption: string
  inputs: string
  steps: string
  erGroup: string
  mcGroup: string
  thumbs: Record<ThumbId, string>
  step: LayerStep[]
  srAlt: string[]
}

export interface Labels {
  layers: LayerLabels
  title: string
  caption: string
  source: string
  sourceName: string
  presetOverlay: string
  presetPassthrough: string
  presetGroup: string
  toggleGroup: string
  occlusion: string
  relight: string
  haze: string
  depth: string
  canvasPrefix: string
  occlusionOn: string
  occlusionOff: string
  relightOn: string
  relightOff: string
  hazeOn: string
  hazeOff: string
  depthOn: string
  srAlt: string[]
}

export const SOURCE_URL =
  'https://github.com/justbustin/minecraft-crossover-bridge/blob/d1723873ec8f370389cf19f74fac455b9e581321/elden-ring/er-bridge/src/compositor.cpp'

export const t: Record<Lang, Labels> = {
  en: {
    layers: {
      title: 'Passthrough compositing, layer by layer.',
      caption:
        'The same stand-in scene as the interactive version below, split into its input layers and the intermediate result of each step. This is not real game footage.',
      inputs: 'Inputs',
      steps: 'Steps',
      erGroup: 'What Elden Ring rendered',
      mcGroup: 'What Minecraft sent (frames.shm)',
      thumbs: {
        hostColor: 'Elden Ring color',
        hostDepth: 'Elden Ring depth (brighter = closer)',
        mcColor: 'World color',
        mcDepth: 'World depth (brighter = closer)',
        hand: 'Hand',
        gui: 'HUD',
        mask: 'Mask (green = kept, red = dropped)',
        afterOcc: 'After occlusion',
        lightMap: 'Light map (brightness multiplier)',
        afterRelight: 'After relighting',
        hazeBg: 'Blurred background',
        afterHaze: 'After haze',
        final: 'Final frame',
      },
      step: [
        {
          badge: '①',
          title: 'Occlusion (depth test)',
          formula: 'mc > er + bias + mc·0.004 → drop',
          result: 'The left column of the 13 m stack, behind the 9 m pillar, is dropped.',
        },
        {
          badge: '②',
          title: 'Relighting',
          formula: 'rgb × clamp(min + lum·gain, 0, 1.15)',
          result:
            'The block by the torch turns brighter and warmer, and the stack in the dark gets darker.',
        },
        {
          badge: '③',
          title: 'Distance haze',
          formula: 'lerp(rgb, background, saturate((d−15)/65)·0.85)',
          result: 'The 60 m block blends into the background color behind it.',
        },
        {
          badge: '④',
          title: 'Layering',
          formula: 'gui + (hand + world·(1−hand.a))·(1−gui.a)',
          result:
            'The hand only receives light and is never occluded, and the HUD sits on top untouched.',
        },
      ],
      srAlt: [
        'Inputs: the Elden Ring color and depth frames, and four layers from Minecraft: world color, world depth, hand and HUD.',
        'Step 1, occlusion: Minecraft depth is compared with Elden Ring depth per pixel, and block pixels that are farther are dropped. The part of the 13 m stack behind the 9 m pillar disappears.',
        'Step 2, relighting: block colors are multiplied by a light map made from the blurred Elden Ring frame. The block by the torch gets brighter and warmer, and the stack far from it gets darker.',
        'Step 3, distance haze: far blocks are blended toward the blurred background. The 60 m block fades.',
        'Step 4, layering: the hand and HUD are stacked over the world, and the result is placed over the Elden Ring frame to give the final image.',
      ],
    },
    title: 'Toggle the passthrough compositing yourself.',
    caption:
      "The bridge's shader math, applied per pixel to a simple stand-in scene (a pillar at 9 m, blocks at 13 m, a torch) instead of Elden Ring. This is not real game footage.",
    source: 'Source',
    sourceName: 'compositor.cpp (minecraft-crossover-bridge)',
    presetOverlay: 'Overlay mode (F6)',
    presetPassthrough: 'Passthrough (default)',
    presetGroup: 'Presets',
    toggleGroup: 'Effects',
    occlusion: 'Occlusion (depth test)',
    relight: 'Relighting',
    haze: 'Distance haze',
    depth: 'Show depth buffer',
    canvasPrefix: 'Composited stand-in scene.',
    occlusionOn: 'The block at 13 m behind the 9 m pillar is hidden.',
    occlusionOff:
      'With occlusion off, the block behind the pillar (13 m) is drawn in front of it (9 m).',
    relightOn:
      'Blocks and the hand pick up the host frame’s light: bright and warm by the torch, dark far from it.',
    relightOff: 'Relighting is off, so blocks keep their original colors everywhere.',
    hazeOn: 'The far block (60 m) fades toward the host frame’s color.',
    hazeOff: 'With haze off, the far block (60 m) stays crisp.',
    depthOn:
      'Depth view: brightness wraps every 10 m, so each gray band is one distance range. Other layers are ignored.',
    srAlt: [
      'A small stand-in scene: a stone pillar at 9 m, a stack of blocks at 13 m partly behind the pillar, a block next to a torch, a far block at 60 m, a hand at the lower right and a hotbar at the bottom.',
      'Occlusion hides the parts of blocks that are farther than the host scene at that pixel.',
      'Relighting multiplies block and hand colors by the light of the blurred host frame.',
      'Distance haze blends far blocks toward the host frame color.',
      'The depth view shows the host depth in 10 m gray bands.',
    ],
  },
  ko: {
    layers: {
      title: '패스스루 합성 분해도',
      caption:
        '아래 인터랙티브 시각화와 같은 도형 장면을 입력 레이어와 단계별 중간 결과로 나눠 그렸습니다. 실제 게임 화면이 아닙니다.',
      inputs: '입력',
      steps: '단계',
      erGroup: 'Elden Ring이 그린 것',
      mcGroup: 'Minecraft가 보낸 것 (frames.shm)',
      thumbs: {
        hostColor: 'Elden Ring 색',
        hostDepth: 'Elden Ring 깊이 (밝을수록 가까움)',
        mcColor: '월드 색',
        mcDepth: '월드 깊이 (밝을수록 가까움)',
        hand: '손',
        gui: 'HUD',
        mask: '마스크 (초록 = 통과, 빨강 = 지움)',
        afterOcc: '가린 뒤',
        lightMap: '흐린 조명 맵 (곱할 밝기)',
        afterRelight: '재조명 뒤',
        hazeBg: '흐린 배경',
        afterHaze: '안개 뒤',
        final: '최종 화면',
      },
      step: [
        {
          badge: '①',
          title: '가림 (깊이 테스트)',
          formula: 'mc > er + bias + mc·0.004 → 지움',
          result: '기둥(9 m)보다 먼 블록 더미(13 m)의 왼쪽 열이 지워집니다.',
        },
        {
          badge: '②',
          title: '재조명',
          formula: 'rgb × clamp(min + lum·gain, 0, 1.15)',
          result: '횃불 옆 블록은 밝고 따뜻해지고, 어두운 곳의 블록 더미는 어두워집니다.',
        },
        {
          badge: '③',
          title: '원거리 안개',
          formula: 'lerp(rgb, 배경, saturate((d−15)/65)·0.85)',
          result: '60 m 블록이 뒤쪽 배경 색에 섞여 흐려집니다.',
        },
        {
          badge: '④',
          title: '겹치기',
          formula: 'gui + (hand + world·(1−hand.a))·(1−gui.a)',
          result: '손은 조명만 받고 가려지지 않으며, HUD는 그대로 맨 위에 얹힙니다.',
        },
      ],
      srAlt: [
        '입력은 Elden Ring의 색과 깊이, 그리고 Minecraft가 보낸 월드 색, 월드 깊이, 손, HUD 네 레이어입니다.',
        '1단계 가림: 픽셀마다 Minecraft 깊이를 Elden Ring 깊이와 비교해 더 먼 블록 픽셀을 지웁니다. 9 m 기둥 뒤에 있는 13 m 블록 더미의 일부가 사라집니다.',
        '2단계 재조명: 흐리게 만든 Elden Ring 화면으로 조명 맵을 만들어 블록 색에 곱합니다. 횃불 옆 블록은 밝고 따뜻해지고, 먼 곳의 블록 더미는 어두워집니다.',
        '3단계 원거리 안개: 먼 블록을 흐린 배경 색 쪽으로 섞습니다. 60 m 블록이 흐려집니다.',
        '4단계 겹치기: 월드 위에 손과 HUD를 쌓고, 그 결과를 Elden Ring 화면 위에 얹어 최종 화면을 만듭니다.',
      ],
    },
    title: '패스스루 합성을 직접 켜고 꺼 보기',
    caption:
      'Elden Ring 대신 단순한 도형 장면(기둥 9 m, 블록 13 m, 횃불)에 브릿지 셰이더와 같은 계산을 픽셀마다 적용했습니다. 실제 게임 화면이 아닙니다.',
    source: '출처',
    sourceName: 'compositor.cpp (minecraft-crossover-bridge)',
    presetOverlay: '오버레이 모드 (F6)',
    presetPassthrough: '패스스루 (기본)',
    presetGroup: '프리셋',
    toggleGroup: '효과',
    occlusion: '가림(깊이 테스트)',
    relight: '재조명',
    haze: '원거리 안개',
    depth: '깊이 버퍼 보기',
    canvasPrefix: '합성된 대체 장면.',
    occlusionOn: '기둥(9 m) 뒤의 블록(13 m)은 가려집니다.',
    occlusionOff: '가림을 끄면 기둥 뒤(13 m)의 블록이 기둥(9 m) 앞에 그려집니다.',
    relightOn: '블록과 손이 호스트 화면의 빛을 받아 횃불 근처는 밝고 따뜻하며, 먼 곳은 어둡습니다.',
    relightOff: '재조명을 끄면 블록이 어디서나 원래 색 그대로입니다.',
    hazeOn: '먼 블록(60 m)은 호스트 화면 색으로 흐려집니다.',
    hazeOff: '안개를 끄면 먼 블록(60 m)도 또렷합니다.',
    depthOn:
      '깊이 보기에서는 10 m마다 밝기가 한 바퀴 돕니다. 같은 회색 띠는 같은 거리 구간이며, 다른 레이어는 표시하지 않습니다.',
    srAlt: [
      '단순한 대체 장면입니다. 9 m 거리의 돌기둥, 기둥에 일부 가려지는 13 m 거리의 블록 더미, 횃불 옆 블록, 60 m 거리의 먼 블록, 오른쪽 아래의 손, 아래쪽 핫바가 있습니다.',
      '가림은 해당 픽셀의 호스트 장면보다 먼 블록 부분을 숨깁니다.',
      '재조명은 블록과 손의 색에 흐리게 만든 호스트 화면의 빛을 곱합니다.',
      '원거리 안개는 먼 블록을 호스트 화면 색 쪽으로 섞습니다.',
      '깊이 버퍼 보기는 호스트 깊이를 10 m 간격의 회색 띠로 보여 줍니다.',
    ],
  },
}
