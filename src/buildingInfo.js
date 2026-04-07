/**
 * OSM-style building function classifier.
 * Each entry returns { label, detail, category, icon }
 * where `icon` is an SVG path string for a 24×24 stroke icon.
 *
 * Categories suppressed from tooltip:
 *   residential, utility
 */

export const SKIP_CATEGORIES = new Set(['residential', 'utility']);

// ─── Monochrome 24×24 stroke icons (Feather-style) ────────────────────────────
const ICONS = {
  // Fork + knife
  food:        'M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2M7 11v11M21 2v20M16 2a5 5 0 000 10h5',
  // Price tag
  commercial:  'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
  // Greek temple / columns
  cultural:    'M2 22h20M6 22V9M18 22V9M10 22V9M14 22V9M2 9l10-7 10 7',
  // Institution building with flag indent
  civic:       'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10',
  // Graduation cap
  education:   'M22 10v6M6 12l6 4 10-7-10-7-10 7M6 12v5c0 2.2 2.7 4 6 4s6-1.8 6-4v-5',
  // Circle with plus
  healthcare:  'M12 8v8M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  // Cross
  religious:   'M12 2v20M6 8h12',
  // Bed
  hospitality: 'M2 4v20M22 4v20M2 11h20M7 11V7a5 5 0 0110 0v4',
  // Location pin
  transport:   'M12 22s-7-5.5-7-12a7 7 0 0114 0c0 6.5-7 12-7 12zM12 13a2 2 0 100-4 2 2 0 000 4z',
  // Warehouse/factory
  industrial:  'M2 20h20M4 20V10l8-7 8 7v10M10 20v-6h4v6',
  // Question circle
  unknown:     'M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM12 17v.5M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3',
};

function mk(label, detail, category) {
  return { label, detail, category, icon: ICONS[category] ?? ICONS.unknown };
}

function cap(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function describeBuildingFunction(info) {
  if (!info) return mk('Not defined', null, 'unknown');

  const { building: b, amenity, shop, office, tourism, historic, healthcare } = info;

  // ── Food & drink ──────────────────────────────────────────────────────────
  if (amenity === 'restaurant')    return mk('Restaurant',        'Dining',               'food');
  if (amenity === 'cafe')          return mk('Café',              'Coffee & light meals',  'food');
  if (amenity === 'bar')           return mk('Bar',               'Drinks & nightlife',    'food');
  if (amenity === 'pub')           return mk('Pub',               'Drinks',                'food');
  if (amenity === 'fast_food')     return mk('Fast Food',         'Quick service dining',  'food');
  if (amenity === 'biergarten')    return mk('Beer Garden',       'Outdoor dining',        'food');
  if (amenity === 'food_court')    return mk('Food Court',        'Multiple vendors',      'food');
  if (amenity === 'ice_cream')     return mk('Ice Cream',         'Desserts',              'food');

  // ── Commercial / retail ───────────────────────────────────────────────────
  if (shop === 'mall')             return mk('Shopping Mall',     'Retail complex',        'commercial');
  if (shop === 'supermarket')      return mk('Supermarket',       'Grocery retail',        'commercial');
  if (shop === 'department_store') return mk('Department Store',  'Multi-floor retail',    'commercial');
  if (shop)                        return mk(cap(shop),           'Retail shop',           'commercial');
  if (amenity === 'bank')          return mk('Bank',              'Financial services',    'commercial');
  if (amenity === 'marketplace')   return mk('Marketplace',       'Open market',           'commercial');
  if (amenity === 'fuel')          return mk('Petrol Station',    'Vehicle fuel',          'commercial');
  if (b === 'commercial' || b === 'retail' || b === 'kiosk')
                                   return mk('Commercial',        'Retail / commerce',     'commercial');

  // ── Office ────────────────────────────────────────────────────────────────
  if (office === 'government')     return mk('Government Office', 'Public administration', 'civic');
  if (office === 'company')        return mk('Company Office',    'Private business',      'commercial');
  if (office)                      return mk(cap(office)+' Office','Business premises',    'commercial');
  if (b === 'office')              return mk('Office',            'Business premises',     'commercial');

  // ── Cultural / heritage ───────────────────────────────────────────────────
  if (amenity === 'theatre')       return mk('Theatre',           'Performing arts',       'cultural');
  if (amenity === 'cinema')        return mk('Cinema',            'Film venue',            'cultural');
  if (amenity === 'arts_centre')   return mk('Arts Centre',       'Cultural venue',        'cultural');
  if (amenity === 'museum' || b === 'museum')
                                   return mk('Museum',            'Cultural heritage',     'cultural');
  if (tourism === 'museum')        return mk('Museum',            'Cultural heritage',     'cultural');
  if (tourism === 'attraction')    return mk('Tourist Attraction','Point of interest',     'cultural');
  if (tourism === 'artwork')       return mk('Artwork',           'Public art',            'cultural');
  if (historic === 'monument' || historic === 'memorial')
                                   return mk('Monument',          'Historic memorial',     'cultural');
  if (historic)                    return mk('Historic Building', 'Heritage site',         'cultural');

  // ── Civic / public services ───────────────────────────────────────────────
  if (amenity === 'townhall')      return mk('Town Hall',         'Municipal government',  'civic');
  if (amenity === 'library')       return mk('Library',           'Public library',        'civic');
  if (amenity === 'post_office')   return mk('Post Office',       'Postal services',       'civic');
  if (amenity === 'community_centre') return mk('Community Centre','Civic gathering space','civic');
  if (amenity === 'social_facility')  return mk('Social Facility','Social services',       'civic');
  if (amenity === 'police')        return mk('Police Station',    'Law enforcement',       'civic');
  if (amenity === 'fire_station')  return mk('Fire Station',      'Emergency services',    'civic');
  if (b === 'civic' || b === 'public' || b === 'government')
                                   return mk('Civic / Public',    'Public institution',    'civic');

  // ── Education ─────────────────────────────────────────────────────────────
  if (amenity === 'school'    || b === 'school')    return mk('School',      'Primary / secondary',  'education');
  if (amenity === 'university'|| b === 'university')return mk('University',  'Higher education',     'education');
  if (amenity === 'college'   || b === 'college')   return mk('College',     'Further education',    'education');
  if (amenity === 'kindergarten')  return mk('Kindergarten',      'Early education',       'education');
  if (b === 'dormitory')           return mk('Dormitory',         'Student housing',       'education');

  // ── Healthcare ────────────────────────────────────────────────────────────
  if (amenity === 'hospital'  || b === 'hospital')  return mk('Hospital',    'Medical centre',       'healthcare');
  if (amenity === 'doctors')       return mk("Doctor's Office",   'Primary care',          'healthcare');
  if (amenity === 'pharmacy')      return mk('Pharmacy',          'Medication / health',   'healthcare');
  if (amenity === 'clinic')        return mk('Clinic',            'Medical clinic',        'healthcare');
  if (amenity === 'dentist')       return mk('Dentist',           'Dental care',           'healthcare');
  if (healthcare)                  return mk(cap(healthcare),     'Healthcare facility',   'healthcare');

  // ── Religious ─────────────────────────────────────────────────────────────
  if (amenity === 'place_of_worship') {
    const sub = b === 'church' ? 'Church' : b === 'mosque' ? 'Mosque' : b === 'synagogue' ? 'Synagogue' : 'House of worship';
    return mk('Place of Worship', sub, 'religious');
  }
  if (b === 'church')              return mk('Church',            'Place of worship',      'religious');
  if (b === 'mosque')              return mk('Mosque',            'Place of worship',      'religious');
  if (b === 'cathedral')           return mk('Cathedral',         'Place of worship',      'religious');

  // ── Hospitality ───────────────────────────────────────────────────────────
  if (tourism === 'hotel'    || b === 'hotel')      return mk('Hotel',       'Accommodation',        'hospitality');
  if (tourism === 'hostel')        return mk('Hostel',            'Budget accommodation',  'hospitality');
  if (tourism === 'guest_house' || b === 'guest_house')
                                   return mk('Guest House',       'Accommodation',         'hospitality');
  if (tourism)                     return mk(cap(tourism),        'Tourism facility',      'hospitality');

  // ── Transport ─────────────────────────────────────────────────────────────
  if (amenity === 'bus_station')   return mk('Bus Station',       'Public transport hub',  'transport');
  if (amenity === 'parking' || b === 'parking')
                                   return mk('Parking',           'Vehicle parking',       'transport');
  if (b === 'garage' || b === 'garages' || b === 'carport')
                                   return mk('Garage',            'Vehicle storage',       'utility');

  // ── Industrial ────────────────────────────────────────────────────────────
  if (b === 'industrial' || b === 'warehouse' || b === 'factory')
                                   return mk('Industrial',        'Production / storage',  'industrial');

  // ── Residential (suppressed) ──────────────────────────────────────────────
  if (b === 'apartments' || b === 'residential' || b === 'dormitory' ||
      b === 'house' || b === 'detached' || b === 'semidetached_house' ||
      b === 'bungalow' || b === 'terrace')
                                   return mk('Residential',       'Housing',               'residential');

  // ── Utility (suppressed) ─────────────────────────────────────────────────
  if (b === 'shed' || b === 'hut' || b === 'roof' ||
      b === 'greenhouse' || b === 'service' || b === 'construction')
                                   return mk('Utility',           null,                    'utility');

  return mk('Not defined', null, 'unknown');
}
