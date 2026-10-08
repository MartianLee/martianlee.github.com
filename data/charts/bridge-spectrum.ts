// data/charts/bridge-spectrum.ts
// BridgeSpectrum / PixelVsMesh / BridgeLineage의 문구와 데이터.
//
// 출처 커밋:
//   chasmlol/SkyCraft bfcaf17, justbustin/minecraft-crossover-bridge d172387,
//   hattozo/gtr bcc7a0d, BennettCode/Skyring 519649f,
//   Ezmanw/universal-doomer c271a16, Yaekai/OWCraft cd5f061
// 스타와 생성일은 GitHub API 2026-10-08 조회 기준.

export type Lang = 'en' | 'ko'

export type ModeId = 'pixel' | 'mesh' | 'logic' | 'none'
export type PmId = 'pixel' | 'shadow' | 'mesh'

/** 유형 색. 장면(어두운 배경) 안에서 쓴다. */
export const TYPE_COLORS: Record<ModeId, string> = {
  pixel: '#d9622b',
  mesh: '#2f8f8a',
  logic: '#c39a2a',
  none: '#8a7fb5',
}

export const MODE_ORDER: ModeId[] = ['pixel', 'mesh', 'logic', 'none']
export const PM_ORDER: PmId[] = ['pixel', 'shadow', 'mesh']

/** 모드별 구조 데이터(언어 무관). packets: 0이면 패킷 없음. */
export const MODE_META: Record<ModeId, { examples: string[]; packets: number }> = {
  pixel: {
    examples: [
      'justbustin/minecraft-crossover-bridge',
      'Xu060113/SekiroCraft-Passthrough',
      'VortexisTV/wither-storm-gta5-passthrough',
      'hattozo/gtr',
      'GooseMcGee/DyingLight-GMod',
      'madgamer98/CU-Hornet',
    ],
    packets: 7,
  },
  mesh: {
    examples: ['chasmlol/SkyCraft', 'Yaekai/OWCraft', 'yumekiru/callofwarcraft'],
    packets: 2,
  },
  logic: {
    examples: ['BennettCode/Skyring', 'dr4lera/CyberpunkStreetChem', 'Caffs/SkyDoom'],
    packets: 4,
  },
  none: {
    examples: [
      'Ezmanw/universal-doomer',
      'deltarooo/er-mario',
      'chasmlol/2010-rust-rewrite-mashup',
    ],
    packets: 0,
  },
}

export interface ModeText {
  label: string
  guest: string
  guestRole: string
  host: string
  note: string
  what: string
  freq: string
  size: string
  draw: string
  desc: string
  /** host 안에 그려지는 장면의 캡션 */
  hostCaption: string
}

export interface SpectrumLabels {
  group: string
  svgTitle: string
  guestTag: string
  hostTag: string
  pipeLabel: string
  procLabel: string
  factWhat: string
  factFreq: string
  factSize: string
  factDraw: string
  logicPackets: string[]
  noneChipTitle: string
  noneChipSub: string
  title: string
  caption: string
  source: string
  modes: Record<ModeId, ModeText>
}

export interface PmText {
  label: string
  blockLabel: string
}

export interface PmLabels {
  group: string
  svgTitle: string
  hostSun: string
  hostTree: string
  guestBlock: string
  tableHeads: [string, string, string, string]
  rows: { label: string; cells: [string, string, string]; on: [boolean, boolean, boolean] }[]
  note: string
  title: string
  caption: string
  source: string
  states: Record<PmId, PmText>
}

export interface LineageLabels {
  svgTitle: string
  legendEdges: string
  lanes: Record<ModeId, string>
  title: string
  caption: string
  source: string
  /** 노드 이름 중 번역이 필요한 것 */
  names: Partial<Record<string, string>>
}

export interface Labels {
  spectrum: SpectrumLabels
  pm: PmLabels
  lineage: LineageLabels
}

export const t: Record<Lang, Labels> = {
  ko: {
    spectrum: {
      group: '브릿지 유형',
      svgTitle: 'guest 게임과 host 게임 사이의 브릿지로 넘어가는 데이터',
      guestTag: 'GUEST · 뒤에서 실행',
      hostTag: 'HOST · 화면에 보이는 쪽',
      pipeLabel: '브릿지 (공유 메모리)',
      procLabel: '한 프로세스',
      factWhat: '넘기는 것',
      factFreq: '얼마나 자주',
      factSize: '크기',
      factDraw: '그림은 누가',
      logicPackets: ['HP 87', '무적 ON', 'STA 40', '뼈 ×24', '공격 판정'],
      noneChipTitle: 'libportadoom.a',
      noneChipSub: '게임 로직만 들어 있음',
      title: '브릿지 스펙트럼.',
      caption: '오른쪽으로 갈수록 브릿지로 넘기는 양이 줄고 host가 직접 하는 일이 늘어납니다.',
      source: '출처: 각 저장소 코드 (2026-10-08 기준 커밋)',
      modes: {
        pixel: {
          label: '픽셀',
          guest: 'Minecraft',
          guestRole: '시뮬레이션 + 그리기',
          host: 'Elden Ring',
          note: '매 프레임 ≈ 37MB',
          what: '색 + 깊이 + HUD 그림',
          freq: '매 프레임',
          size: '≈ 37MB',
          draw: 'guest가 그림',
          desc: 'guest가 host 카메라로 장면을 그린 뒤 그 그림을 통째로 넘깁니다. host는 깊이를 비교해 자기 벽 뒤는 가리고 나머지를 덧칠합니다. 전편에서 본 방식입니다.',
          hostCaption: '붙여 넣은 그림 · 그림자 없음',
        },
        mesh: {
          label: '메시',
          guest: 'Minecraft',
          guestRole: '시뮬레이션 + 메시 만들기',
          host: 'Skyrim',
          note: '블록이 바뀔 때만 · 정점 하나 32B',
          what: '블록 메시 + 텍스처',
          freq: '바뀔 때만',
          size: '정점당 32B',
          draw: 'host가 그림',
          desc: 'guest는 블록의 모양(메시)과 텍스처만 넘깁니다. host가 그 모양을 자기 엔진으로 그리므로 host의 태양, 그림자, 안개가 그대로 적용됩니다.',
          hostCaption: 'host가 직접 그림 · 태양·그림자',
        },
        logic: {
          label: '로직',
          guest: 'Elden Ring',
          guestRole: '숨긴 채 전투 계산만',
          host: 'Skyrim',
          note: '매 프레임 ≈ 0.6KB',
          what: 'HP·스태미나·무적·뼈 회전',
          freq: '매 프레임',
          size: '≈ 0.6KB',
          draw: 'host만 그림',
          desc: 'guest 화면은 아무도 보지 않습니다. host 입력을 받아 guest가 계산한 숫자(스태미나, 무적 프레임, 뼈 24개의 회전)만 돌아옵니다. 37MB와 비교하면 약 6만분의 1입니다.',
          hostCaption: 'host 캐릭터가 guest 규칙대로 움직임',
        },
        none: {
          label: '브릿지 없음',
          guest: 'Doom',
          guestRole: 'C 라이브러리로 컴파일',
          host: '아무 엔진',
          note: '넘기는 것 없음',
          what: '없음',
          freq: '—',
          size: '0',
          draw: 'host가 그림',
          desc: 'guest를 별도 프로세스로 띄우지 않고 라이브러리로 만들어 host 안에 넣습니다. host는 함수를 불러 벽, 바닥, 몬스터 목록을 받아 자기 방식으로 그립니다.',
          hostCaption: '함수 호출로 월드 상태를 받아 그림',
        },
      },
    },
    pm: {
      group: '블록을 받는 방식',
      svgTitle: '같은 블록을 그림으로 받을 때와 메시로 받을 때의 차이',
      hostSun: 'host 태양',
      hostTree: 'host 나무',
      guestBlock: 'guest 블록',
      tableHeads: ['', '그림으로 받기', '+ 그림자 맵', '메시로 받기'],
      rows: [
        {
          label: 'host 벽 뒤에 가려짐',
          cells: ['깊이 비교', '깊이 비교', 'host 깊이 버퍼'],
          on: [true, true, true],
        },
        {
          label: 'host 태양 방향 빛',
          cells: ['근사로 다시 칠함', '근사로 다시 칠함', 'host 엔진 그대로'],
          on: [false, false, true],
        },
        {
          label: 'host 땅에 그림자',
          cells: ['없음', 'guest가 그림자 깊이 맵을 따로 넘김', 'host 엔진 그대로'],
          on: [false, true, true],
        },
        {
          label: '매 프레임 넘기는 양',
          cells: ['색+깊이 전체', '색+깊이+그림자 맵', '바뀐 블록 섹션만'],
          on: [false, false, false],
        },
      ],
      note: 'SkyCraft의 설계 문서(docs/DESIGN.md §9)는 원래 "색+깊이 텍스처를 GPU로 공유해 합성"하는 픽셀 방식이었습니다. 실제 코드는 render ring으로 블록 메시와 아틀라스를 넘기고, README는 블록이 "Skyrim의 프레임 안에서 Skyrim의 태양, 그림자, 안개, 날씨와 함께 그려진다"고 씁니다. 바꾼 이유를 직접 적은 문장은 없습니다.',
      title: '같은 블록, 두 가지 브릿지.',
      caption:
        '그림으로 받으면 guest가 칠한 빛이 그대로 따라오고 host 땅에 그림자를 드리우지 못합니다. 메시로 받으면 host 엔진이 자기 태양으로 다시 그립니다.',
      source:
        '출처: chasmlol/SkyCraft bfcaf17, hattozo/gtr bcc7a0d, justbustin/minecraft-crossover-bridge d172387',
      states: {
        pixel: { label: '그림으로 받기', blockLabel: 'guest가 칠한 빛 그대로' },
        shadow: { label: '그림 + 그림자 맵 (gtr)', blockLabel: '그림자만 host 땅에' },
        mesh: { label: '메시로 받기 (SkyCraft)', blockLabel: 'host 태양으로 다시 그림' },
      },
    },
    lineage: {
      svgTitle: '9월 27일부터 10월 7일까지 공개된 패스스루 저장소의 계보',
      legendEdges: '── 코드를 가져옴 · ┄ 참고했다고 밝힘 · 원 크기 = 스타',
      lanes: { pixel: '픽셀', mesh: '메시', logic: '로직', none: '없음' },
      title: '열하루 동안의 계보.',
      caption:
        '픽셀 계열(justbustin)과 메시 계열(SkyCraft)은 서로를 언급하지 않습니다. 가장 많이 가져다 쓰인 원형은 메시 쪽입니다.',
      source:
        '출처: GitHub API 생성일(UTC)·스타(2026-10-08 조회), 각 저장소 README·NOTICES·코드 주석',
      names: { um: 'universal-modder GTA 예제' },
    },
  },
  en: {
    spectrum: {
      group: 'Bridge type',
      svgTitle: 'What passes through the bridge between a guest game and a host game',
      guestTag: 'GUEST · runs behind',
      hostTag: 'HOST · on screen',
      pipeLabel: 'Bridge (shared memory)',
      procLabel: 'One process',
      factWhat: 'What crosses',
      factFreq: 'How often',
      factSize: 'Size',
      factDraw: 'Who draws',
      logicPackets: ['HP 87', 'i-frames', 'STA 40', 'Bone ×24', 'Hit box'],
      noneChipTitle: 'libportadoom.a',
      noneChipSub: 'Game logic only',
      title: 'The bridge spectrum.',
      caption: 'Moving right, less crosses the bridge and the host does more of the work itself.',
      source: 'Source: code in each repository (commits as of 2026-10-08)',
      modes: {
        pixel: {
          label: 'Pixel',
          guest: 'Minecraft',
          guestRole: 'Simulation + drawing',
          host: 'Elden Ring',
          note: '≈ 37MB every frame',
          what: 'Color + depth + HUD image',
          freq: 'Every frame',
          size: '≈ 37MB',
          draw: 'Guest draws',
          desc: 'The guest renders the scene from the host camera and hands over the whole picture. The host compares depths, hides what falls behind its own walls, and paints the rest on top. This is the approach from the previous post.',
          hostCaption: 'Pasted picture · no shadows',
        },
        mesh: {
          label: 'Mesh',
          guest: 'Minecraft',
          guestRole: 'Simulation + building meshes',
          host: 'Skyrim',
          note: 'Only when blocks change · 32B per vertex',
          what: 'Block meshes + textures',
          freq: 'On change only',
          size: '32B per vertex',
          draw: 'Host draws',
          desc: 'The guest sends only the shape (mesh) and textures of its blocks. The host draws that shape with its own engine, so the host’s sun, shadows, and fog apply as they are.',
          hostCaption: 'Drawn by host · sun and shadows',
        },
        logic: {
          label: 'Logic',
          guest: 'Elden Ring',
          guestRole: 'Hidden, only runs combat math',
          host: 'Skyrim',
          note: '≈ 0.6KB every frame',
          what: 'HP, stamina, i-frames, bone rotations',
          freq: 'Every frame',
          size: '≈ 0.6KB',
          draw: 'Only the host draws',
          desc: 'Nobody looks at the guest’s screen. It takes the host’s input and sends back only the numbers it computed: stamina, invincibility frames, and the rotations of 24 bones. Compared with 37MB, that is about 1/60,000.',
          hostCaption: 'Host character moves by guest rules',
        },
        none: {
          label: 'No bridge',
          guest: 'Doom',
          guestRole: 'Compiled as a C library',
          host: 'Any engine',
          note: 'Nothing crosses',
          what: 'Nothing',
          freq: '—',
          size: '0',
          draw: 'Host draws',
          desc: 'The guest is not launched as a separate process. It is built as a library and lives inside the host. The host calls functions to get the walls, floors, and monsters, then draws them its own way.',
          hostCaption: 'Calls functions, draws it itself',
        },
      },
    },
    pm: {
      group: 'How blocks are received',
      svgTitle: 'The difference between receiving the same block as a picture and as a mesh',
      hostSun: 'Host sun',
      hostTree: 'Host tree',
      guestBlock: 'Guest block',
      tableHeads: ['', 'Receive a picture', '+ Shadow map', 'Receive a mesh'],
      rows: [
        {
          label: 'Hidden behind host walls',
          cells: ['Depth compare', 'Depth compare', 'Host depth buffer'],
          on: [true, true, true],
        },
        {
          label: 'Light from the host sun',
          cells: ['Approximate repaint', 'Approximate repaint', 'Host engine as is'],
          on: [false, false, true],
        },
        {
          label: 'Shadow on host ground',
          cells: ['None', 'Guest sends a separate shadow depth map', 'Host engine as is'],
          on: [false, true, true],
        },
        {
          label: 'Sent every frame',
          cells: [
            'Full color + depth',
            'Color + depth + shadow map',
            'Changed block sections only',
          ],
          on: [false, false, false],
        },
      ],
      note: 'SkyCraft’s design doc (docs/DESIGN.md §9) originally described the pixel approach: share color and depth textures over the GPU and composite. The actual code sends block meshes and an atlas through a render ring, and the README says blocks are “drawn inside Skyrim’s frame with its sun, shadows, fog and weather.” No sentence states why it changed.',
      title: 'One block, two bridges.',
      caption:
        'Received as a picture, the guest’s baked lighting comes along and the block casts no shadow on the host’s ground. Received as a mesh, the host engine redraws it under its own sun.',
      source:
        'Source: chasmlol/SkyCraft bfcaf17, hattozo/gtr bcc7a0d, justbustin/minecraft-crossover-bridge d172387',
      states: {
        pixel: { label: 'Receive a picture', blockLabel: 'Guest’s lighting as is' },
        shadow: {
          label: 'Picture + shadow map (gtr)',
          blockLabel: 'Only the shadow on host ground',
        },
        mesh: { label: 'Receive a mesh (SkyCraft)', blockLabel: 'Redrawn under the host sun' },
      },
    },
    lineage: {
      svgTitle: 'Lineage of the passthrough repositories published from September 27 to October 7',
      legendEdges: '── code copied · ┄ credited as reference · circle size = stars',
      lanes: { pixel: 'Pixel', mesh: 'Mesh', logic: 'Logic', none: 'No bridge' },
      title: 'Eleven days of lineage.',
      caption:
        'The pixel line (justbustin) and the mesh line (SkyCraft) never mention each other. The most reused original is on the mesh side.',
      source:
        'Source: creation dates (UTC) and stars from the GitHub API (fetched 2026-10-08); each repository’s README, NOTICES, and code comments',
      names: { um: 'universal-modder GTA example' },
    },
  },
}

// ── 계보 데이터 (BridgeLineage) ──────────────────────────────

export interface LineageNode {
  id: string
  name: string
  /** GitHub 저장소 생성 시각 (UTC, ISO 8601) */
  at: string
  t: ModeId
  s: number
  /** 라벨 세로 위치(노드 기준). 음수면 위, 양수면 아래 */
  dy?: number
  /** 라벨 가로 이동 */
  lx?: number
  /** 라벨 정렬. 'end'면 노드 왼쪽에 붙인다 */
  anchor?: 'middle' | 'end'
}

// um은 universal-modder 저장소 생성 시각(예제가 처음부터 함께 들어 있었음)
export const LINEAGE_NODES: LineageNode[] = [
  { id: 'rust', name: '2010-rust-rewrite-mashup', at: '2026-09-27T23:47:01Z', t: 'none', s: 793 },
  { id: 'sky', name: 'SkyCraft', at: '2026-09-30T16:40:20Z', t: 'mesh', s: 1039, dy: -14 },
  {
    id: 'um',
    name: 'universal-modder GTA 예제',
    at: '2026-09-30T05:00:35Z',
    t: 'pixel',
    s: 0,
    dy: 4,
    lx: -9,
    anchor: 'end',
  },
  { id: 'mario', name: 'er-mario', at: '2026-09-30T22:41:11Z', t: 'none', s: 156, dy: 22 },
  { id: 'jb', name: 'justbustin', at: '2026-10-01T01:22:28Z', t: 'pixel', s: 22, dy: -22 },
  { id: 'mr', name: 'Minecraft-Ring', at: '2026-10-02T19:36:23Z', t: 'pixel', s: 20, dy: -22 },
  { id: 'ow', name: 'OWCraft', at: '2026-10-02T11:50:21Z', t: 'mesh', s: 3, dy: 20 },
  { id: 'ws', name: 'wither-storm', at: '2026-10-02T08:28:49Z', t: 'pixel', s: 12, dy: 20 },
  { id: 'gtr', name: 'gtr', at: '2026-10-03T14:59:38Z', t: 'pixel', s: 0, dy: 20 },
  { id: 'skr', name: 'Skyring', at: '2026-10-03T23:16:28Z', t: 'logic', s: 1, dy: -18 },
  { id: 'doom', name: 'universal-doomer', at: '2026-10-03T20:57:12Z', t: 'none', s: 0, dy: -18 },
  { id: 'dl', name: 'DyingLight-GMod', at: '2026-10-04T20:11:14Z', t: 'pixel', s: 0, dy: 20 },
  { id: 'cu', name: 'CU-Hornet', at: '2026-10-04T00:46:02Z', t: 'pixel', s: 0, dy: -22, lx: 10 },
  { id: 'sc', name: 'StreetChem', at: '2026-10-05T06:37:06Z', t: 'logic', s: 2, dy: 22 },
  { id: 'sek', name: 'SekiroCraft', at: '2026-10-06T09:51:05Z', t: 'pixel', s: 2, dy: -22 },
  { id: 'cow', name: 'callofwarcraft', at: '2026-10-06T10:55:30Z', t: 'mesh', s: 1, dy: 20 },
  { id: 'sd', name: 'SkyDoom', at: '2026-10-07T09:56:53Z', t: 'logic', s: 1, dy: -18 },
]

/** [원본, 파생, 종류] code = 코드를 가져옴, ref = 참고했다고 밝힘 */
/** 네 번째 값은 같은 줄 안의 선을 휘게 하는 제어점 오프셋(px). 중간 노드를 관통하지 않게 한다 */
export const LINEAGE_EDGES: [string, string, 'code' | 'ref', number?][] = [
  ['sky', 'ow', 'code'],
  ['sky', 'skr', 'code'],
  ['jb', 'mr', 'code', -26],
  ['um', 'ws', 'code', 26],
  ['sky', 'sek', 'ref'],
  ['um', 'sek', 'ref', 96],
  ['sky', 'cu', 'ref'],
]
