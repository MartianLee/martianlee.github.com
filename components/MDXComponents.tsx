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
import CarbonDay from './viz/CarbonDay'
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
  CarbonDay,
  FoodMasses,
  TravelLanes,
  EmbodiedGoods,
  GridTiles,
}
