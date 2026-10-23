import TOCInline from 'pliny/ui/TOCInline'
import Pre from '@/components/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import GasMixCloud from './viz/GasMixCloud'
import AtmosphereTimeline from './viz/AtmosphereTimeline'
import BudgetTank from './viz/BudgetTank'
import TonneCubes from './viz/TonneCubes'
import MagicTaxStack from './viz/MagicTaxStack'
import StackedBars from './viz/StackedBars'
import PassthroughCompositor from './viz/PassthroughCompositor'
import PassthroughLayers from './viz/PassthroughLayers'
import BridgeSpectrum from './viz/BridgeSpectrum'
import PixelVsMesh from './viz/PixelVsMesh'
import FmgWorldBuilder from './viz/FmgWorldBuilder'
import FmgPipeline from './viz/FmgPipeline'
import VoronoiLab from './viz/VoronoiLab'
import BridgeLineage from './viz/BridgeLineage'
import YouTube from './YouTube'
import CarbonDay from './viz/CarbonDay'
import DayRoutine from './viz/DayRoutine'
import FoodMasses from './viz/FoodMasses'
import TravelLanes from './viz/TravelLanes'
import EmbodiedGoods from './viz/EmbodiedGoods'
import GridTiles from './viz/GridTiles'
import FrameTimeline from './viz/FrameTimeline'
import FrameLadder from './viz/FrameLadder'
import OccluderScan from './viz/OccluderScan'
import ChunkStrips from './viz/ChunkStrips'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  GasMixCloud,
  AtmosphereTimeline,
  BudgetTank,
  TonneCubes,
  MagicTaxStack,
  StackedBars,
  PassthroughCompositor,
  PassthroughLayers,
  BridgeSpectrum,
  PixelVsMesh,
  FmgWorldBuilder,
  FmgPipeline,
  VoronoiLab,
  BridgeLineage,
  YouTube,
  CarbonDay,
  DayRoutine,
  FoodMasses,
  TravelLanes,
  EmbodiedGoods,
  GridTiles,
  FrameTimeline,
  FrameLadder,
  OccluderScan,
  ChunkStrips,
}
