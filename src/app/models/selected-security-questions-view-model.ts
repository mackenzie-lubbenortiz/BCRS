/**
 * Title: selected-security-questions-view-model.ts
 * Author: Brock Hemsouvanh
 * Date: 07/14/2024
 * Description: Interface for the selected security questions
 */

/**
 * Interface for the SelectedSecurityQuestionsViewModel
 * @property questionText
 * @property answerText
 * @example:
 * {
 *    questionText: 'What is your mother's maiden name?',
 *    answerText: 'Smith'
 * }
 */
export interface SelectedSecurityQuestionsViewModel {
  questionText: string;
  answerText: string;
}
