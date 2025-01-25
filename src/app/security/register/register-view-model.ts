import { SelectedSecurityQuestionsViewModel } from '../../models/selected-security-questions-view-model';

/**
 * Title: register-view-model.ts
 * Authors: Mackenzie Lubben-Ortiz and Brock Hemsouvanh
 * Date: 10/2023
 * Updated: 7/19/2024 by Brock Hemsouvanh
 * Description: Interface for the RegisterViewModel
 * @property firstName
 * @property lastName
 * @property email
 * @property password
 * @property address
 * @property phoneNumber
 * @property selectedSecurityQuestions
 * @example:
 * {
 *    firstName: 'John',
 *    lastName: 'Doe',
 *    email: 'doe@nodebucket.com',
 *    password: 'Password01',
 *    address: '123 Main St',
 *    phoneNumber: '123-456-7890',
 *    selectedSecurityQuestions: [
 *      { question: 'What is your mother's maiden name?', answer: 'Smith' }
 *    ]
 * }
 */
export interface RegisterViewModel {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address: string;
    phoneNumber: string;
    selectedSecurityQuestions: SelectedSecurityQuestionsViewModel[];
}
