export function fieldIdForQuestion(questionId: string): string {
  return `field-${questionId}`;
}

export function fieldErrorIdForQuestion(questionId: string): string {
  return `field-${questionId}-error`;
}
