import { DocumentReference } from "firebase/firestore";
import { UserProfile } from "./user.model";

export interface ClinicPatients {
  clinicReference: DocumentReference;
  patientReference: DocumentReference;
  allowsBpm: boolean;
  allowsBloodPressure: boolean;
  allowsGlycemia: boolean;
  allowsOximetry: boolean;
  allowsSteps: boolean;
  allowsWeight: boolean;
  userProfile?: UserProfile;
}