/**
 * Title: user.model.ts
 * Author: Brock Hemsouvanh
 * Date: 07/24/2024
 * Updated: 07/28/2024 by Brock Hemsouvanh
 * Description: User model for BCRS.
 */

'use strict';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  isDisabled?: boolean;
  role: string;
  selectedSecurityQuestions?: { questionText: string; answerText: string }[];
}
