export function genderPreferenceAllows(
  lookingFor: string | null | undefined,
  candidateGender: string | null | undefined,
): boolean {
  if (!lookingFor || lookingFor === "Everyone") return true;
  if (lookingFor === "Women") return candidateGender === "Woman";
  if (lookingFor === "Men") return candidateGender === "Man";
  return candidateGender === lookingFor;
}

export function mutuallyGenderCompatible(
  firstGender: string | null | undefined,
  firstPreference: string | null | undefined,
  secondGender: string | null | undefined,
  secondPreference: string | null | undefined,
): boolean {
  return genderPreferenceAllows(firstPreference, secondGender)
    && genderPreferenceAllows(secondPreference, firstGender);
}