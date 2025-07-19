// Unit conversion utilities for height and weight

// Height conversions
export const feetInchesToCm = (feet: number, inches: number): number => {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
};

export const cmToFeetInches = (
  cm: number
): { feet: number; inches: number } => {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
};

// Weight conversions
export const poundsToKg = (pounds: number): number => {
  return Math.round((pounds / 2.205) * 10) / 10; // Round to 1 decimal place
};

export const kgToPounds = (kg: number): number => {
  return Math.round(kg * 2.205);
};

// Formatting helpers
export const formatHeight = (
  heightFeet?: number,
  heightInches?: number,
  heightCm?: number,
  preferredUnits: 'metric' | 'imperial' = 'imperial'
): string => {
  if (preferredUnits === 'metric') {
    if (heightCm) {
      return `${heightCm} cm`;
    }
    if (heightFeet && heightInches !== undefined) {
      const cm = feetInchesToCm(heightFeet, heightInches);
      return `${cm} cm`;
    }
  } else {
    if (heightFeet && heightInches !== undefined) {
      return `${heightFeet}'${heightInches}"`;
    }
    if (heightCm) {
      const { feet, inches } = cmToFeetInches(heightCm);
      return `${feet}'${inches}"`;
    }
  }
  return '';
};

export const formatWeight = (
  weightPounds?: number,
  weightKg?: number,
  preferredUnits: 'metric' | 'imperial' = 'imperial'
): string => {
  if (preferredUnits === 'metric') {
    if (weightKg) {
      return `${weightKg} kg`;
    }
    if (weightPounds) {
      const kg = poundsToKg(weightPounds);
      return `${kg} kg`;
    }
  } else {
    if (weightPounds) {
      return `${weightPounds} lbs`;
    }
    if (weightKg) {
      const pounds = kgToPounds(weightKg);
      return `${pounds} lbs`;
    }
  }
  return '';
};

// Convert between unit systems for database storage
export const convertHeightToPreferred = (
  targetUnits: 'metric' | 'imperial',
  heightFeet?: number,
  heightInches?: number,
  heightCm?: number
): { heightFeet?: number; heightInches?: number; heightCm?: number } => {
  if (targetUnits === 'metric') {
    if (heightFeet && heightInches !== undefined) {
      return { heightCm: feetInchesToCm(heightFeet, heightInches) };
    }
    return { heightCm };
  } else {
    if (heightCm) {
      const { feet, inches } = cmToFeetInches(heightCm);
      return { heightFeet: feet, heightInches: inches };
    }
    return { heightFeet, heightInches };
  }
};

export const convertWeightToPreferred = (
  targetUnits: 'metric' | 'imperial',
  weightPounds?: number,
  weightKg?: number
): { weightPounds?: number; weightKg?: number } => {
  if (targetUnits === 'metric') {
    if (weightPounds) {
      return { weightKg: poundsToKg(weightPounds) };
    }
    return { weightKg };
  } else {
    if (weightKg) {
      return { weightPounds: kgToPounds(weightKg) };
    }
    return { weightPounds };
  }
};
