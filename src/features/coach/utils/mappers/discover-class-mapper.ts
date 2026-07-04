import type { DiscoverClassItemDTO } from '../../types/dto/discover-class-dto'
import type { DiscoverClassItemModel } from '../../types/models/discover-class-model'

export function mapDiscoverClass(dto: DiscoverClassItemDTO): DiscoverClassItemModel {
  return {
    ...dto,
    coachProfile: {
      ...dto.coachProfile,
    },
  }
}
