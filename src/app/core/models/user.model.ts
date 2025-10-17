export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserBloodPressure {
  systolic: number;
  diastolic: number;
  isManualPointing: boolean;
  timestamp: FirebaseTimestamp;
}

export interface UserHeartRate {
  bpm: number;
  executedAt: FirebaseTimestamp;
  isManualPointing: boolean;
  timestamp: FirebaseTimestamp;
}

export interface UserGlycemia {
  glycemia: number;
  mealOption: string;
  createdAt: FirebaseTimestamp;
  isManualPointing: boolean;
  timestamp: FirebaseTimestamp;
}

export interface UserOximetry {
  oximetry: number;
  createdAt: FirebaseTimestamp;
  isManualPointing: boolean;
  timestamp: FirebaseTimestamp;
}

export interface UserSteps {
  steps: number;
  start: FirebaseTimestamp;
  end: FirebaseTimestamp;
  executedAt: FirebaseTimestamp;
  isManualPointing: boolean;
  timestamp: FirebaseTimestamp;
}

export interface UserWeight {
  weight: number;
  createdAt: FirebaseTimestamp;
  isManualPointing: boolean;
  timestamp: FirebaseTimestamp;
}

export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}