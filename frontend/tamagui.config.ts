import { config } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'
import { createAnimations } from '@tamagui/animations-react-native'

// Create animations using React Native's Animated library instead of reanimated
const animations = createAnimations({
  bouncy: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    damping: 20,
    stiffness: 60,
  },
  quick: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  fast: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  slow: {
    damping: 20,
    stiffness: 60,
  },
})

const tamaguiConfig = createTamagui({
  ...config,
  // Override animations to use React Native Animated instead of reanimated
  animations,
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
} 