import commonMockData from './common'
import userMockData from './user'
import musicMockData from './music'
import videoMockData from './video'
import articleMockData from './article'
import taskMockData from './task'
import bookMockData from './book'

export const mockData = {
  ...userMockData,
  ...commonMockData,
  ...musicMockData,
  ...videoMockData,
  ...articleMockData,
  ...taskMockData,
  ...bookMockData
}