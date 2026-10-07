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
import YouTube from './YouTube'
import CarbonDay from './viz/CarbonDay'
import DayRoutine from './viz/DayRoutine'
import FoodMasses from './viz/FoodMasses'
import TravelLanes from './viz/TravelLanes'
import EmbodiedGoods from './viz/EmbodiedGoods'
import GridTiles from './viz/GridTiles'

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
  YouTube,
  CarbonDay,
  DayRoutine,
  FoodMasses,
  TravelLanes,
  EmbodiedGoods,
  GridTiles,
}
