import { IntersectionStats, Way } from "../../types";

  const nswStateRoadNames = [
    'Railway Road',
    'Joyce Drive',
    'South Dowling Street',
    'Oxford Street',
    'Flinders Street',
    'Abercrombie Street',
    'Bumborah Point Road',
    'Cahill Expressway',
    'Lyons Road',
    'Bradfield Highway',
    'Bunnerong Road',
    'McEvoy Street',
    'Wyndham Street',
    'Anzac Parade',
    'Broadway',
    'Sydenham Road',
    'Gardeners Road',
    'Harris Street',
    'Fountain Street',
    'Sydney Park Road',
    'Swanson Street',
    'Parramatta Road',
    'Regent Street',
    'Avoca Street',
    'Canterbury Road',
    'Moore Park Road',
    'Wyndham Street',
    'Frenchmans Road',
    'Craigend Street',
    'Dacey Avenue',
    'Sydney Park Road',
    'New South Head Road',
    'Foreshore Road',
    'Princes Highway',
    'Beauchamp Road',
    'Lachlan Street',
    'General Holmes Drive',
    'Allison Road',
    'Pyrmont Bridge Road',
    'Pittwater Road',
    'Syd Einfeld Drive',
    'Lachlan Street',
    'The Crescent',
    'Wattle Street',
    'King Street',
    'Victoria Road',
    'Wentworth Avenue',
    'Pacific Highway',
    'Bondi Road',
    'Rainbow Street',
    'Dobroyd Parade',
    'Warringah Road',
    'Dacey Avenue',
    'William Street',
    'Bridge Road',
    'Cleveland Street',
    'Balmain Road',
    'Old South Head Road',
    'Lee Street',
    'Botany Road',
    // TOOD
  ];
  const allLowercaseRoadNames = nswStateRoadNames.map(name => name.toLowerCase());
/**
 * This is a manual list as I'm not aware of a machine readable resource for NSW state roads.
 * Improvements very welcome!
 * 
 * Returns true or null - not confident enough to ever return false at this stage.
 */
export function isIntersectionOnNSWStateRoad(intersection: IntersectionStats, mainWay: Way | null): boolean | null{
  if(!mainWay) {
    return null;
  }
  return allLowercaseRoadNames.includes((mainWay.tags.name).toLowerCase()) ? true : null;
}