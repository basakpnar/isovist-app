// Default viewer parameters, mirroring isovist_viewer_params.json structure.
// Each numeric param: { value, min, max, unit, description }
// Each option param:  { value, options, description }

export const DEFAULT_VIEWER_PARAMS = {
  lookDirection: 0, // degrees, 0 = +X axis; companion to fovHorizontal

  vision: {
    fovHorizontal:     { value: 360,  min: 60,  max: 360, unit: '°',    description: 'Horizontal field of view — 360 for full isovist' },
    viewRange:         { value: 50,   min: 5,   max: 300, unit: 'm',    description: 'Maximum visibility distance' },
    visualAcuity:      { value: 1.0,  min: 0.1, max: 1.0, unit: '',     description: 'Detail resolution — scales ray count' },
    peripheralAngle:   { value: 40,   min: 0,   max: 60,  unit: '°',    description: 'Extra low-detail cone beyond main FOV' },
    verticalFovOffset: { value: 0,    min: -30, max: 30,  unit: '°',    description: 'Gaze tilt — negative looks down, positive looks up' },
    lightSensitivity:  { value: 'normal', options: ['low', 'normal', 'high'], description: 'How well the viewer sees in dark environments' },
    occlusionThreshold:{ value: 0.5,  min: 0.1, max: 1.0, unit: 'm',    description: 'Minimum gap size the viewer can see through' },
    focusDistance:     { value: 10,   min: 1,   max: 100, unit: 'm',    description: 'Depth-of-field centre — affects attention modelling' },
    binocularOverlap:  { value: 90,   min: 60,  max: 120, unit: '°',    description: 'Stereo vision overlap zone for depth perception' },
  },

  physical: {
    eyeHeight:    { value: 1.7,     min: 0.5, max: 2.2, unit: 'm',   description: "Viewer's eye level from the ground" },
    bodyWidth:    { value: 0.5,     min: 0.3, max: 0.8, unit: 'm',   description: 'Affects movement through narrow spaces' },
    ageProfile:   { value: 'adult', options: ['child', 'adult', 'elderly'], description: 'Preset — influences acuity, FOV and reaction time' },
    maxHeadTilt:  { value: 45,      min: 10,  max: 90,  unit: '°',   description: 'Maximum vertical gaze range limit' },
    headTurnSpeed:{ value: 90,      min: 10,  max: 360, unit: '°/s', description: 'How fast the viewer can reorient their gaze' },
  },

  dynamicState: {
    fatigueLevel:  { value: 0,   min: 0,  max: 100, unit: '%',  description: 'Reduces FOV and range — causes tunnel vision' },
    stressLevel:   { value: 0,   min: 0,  max: 100, unit: '%',  description: 'Narrows FOV under stress' },
    blinkRate:     { value: 15,  min: 5,  max: 30,  unit: '/min', description: 'Frequency of momentary vision gaps' },
    blinkDuration: { value: 150, min: 50, max: 400, unit: 'ms', description: 'Duration of each blink' },
    reactionTime:  { value: 250, min: 100,max: 800, unit: 'ms', description: 'Delay before viewer registers a newly visible object' },
  },
};

// Age profile presets — override base values before applying modifiers
const AGE_PRESETS = {
  child:   { fovHorizontal: 80,  viewRange: 40,  visualAcuity: 0.8, eyeHeight: 1.2 },
  adult:   { fovHorizontal: null, viewRange: null, visualAcuity: null, eyeHeight: null }, // use raw values
  elderly: { fovHorizontal: 70,  viewRange: 60,  visualAcuity: 0.7, eyeHeight: 1.6 },
};

/**
 * Derive the effective computation params from raw viewer param state.
 * This is the single source of truth for modifier logic.
 */
export function computeEffectiveParams(params) {
  const { vision, physical, dynamicState, lookDirection } = params;

  const fatigue = dynamicState.fatigueLevel.value / 100; // 0..1
  const stress  = dynamicState.stressLevel.value  / 100; // 0..1

  // Apply age preset overrides first
  const preset = AGE_PRESETS[physical.ageProfile.value] || AGE_PRESETS.adult;
  const baseFovH   = preset.fovHorizontal  ?? vision.fovHorizontal.value;
  const baseRange  = preset.viewRange      ?? vision.viewRange.value;
  const baseAcuity = preset.visualAcuity   ?? vision.visualAcuity.value;
  const eyeHeight  = preset.eyeHeight      ?? physical.eyeHeight.value;

  // Apply fatigue / stress modifiers
  const fovH  = Math.max(10, baseFovH  * (1 - fatigue * 0.30) * (1 - stress * 0.20));
  const range = Math.max(5,  baseRange * (1 - fatigue * 0.20));

  // Ray count scales with acuity (min 36 so the polygon is never degenerate)
  const numRays = Math.max(36, Math.round(720 * baseAcuity));

  // Peripheral zone — clamped so total never exceeds 360
  const peripheralAngle = Math.min(
    vision.peripheralAngle.value,
    (360 - fovH) / 2
  );

  // Isovist fill opacity from light sensitivity
  const opacityMap = { low: 0.18, normal: 0.35, high: 0.52 };
  const opacity = opacityMap[vision.lightSensitivity.value] ?? 0.35;

  return {
    fovH,
    range,
    numRays,
    lookDirection,       // degrees
    peripheralAngle,
    eyeHeight,
    opacity,
    isDirectional: fovH < 355, // treat ~360 as full ring
  };
}
