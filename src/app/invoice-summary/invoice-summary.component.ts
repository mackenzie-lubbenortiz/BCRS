/**
 * Title: invoice-summary.component.ts
 * Author: Brock Hemsouvanh
 * Date: 07/21/2024
 * Description: Invoice Summary component logic for BCRS application
 */

'use strict';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-summary',
  templateUrl: './invoice-summary.component.html',
  styleUrls: ['./invoice-summary.component.css']
})
export class InvoiceSummaryComponent implements OnInit {
  customerName!: string;
  customerEmail!: string;
  orderDate!: string;
  lineItems: { name: string, price: number }[] = [];
  partsAmount!: number;
  laborAmount!: number;
  invoiceTotal!: number;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      invoice: {
        fullName: string,
        email: string,
        orderDate: string,
        lineItems: { name: string, price: number }[],
        partsAmount: number,
        laborAmount: number,
        invoiceTotal: number
      }
    };
    if (state) {
      this.customerName = state.invoice.fullName;
      this.customerEmail = state.invoice.email;
      this.orderDate = state.invoice.orderDate;
      this.lineItems = state.invoice.lineItems;
      this.partsAmount = state.invoice.partsAmount;
      this.laborAmount = state.invoice.laborAmount;
      this.invoiceTotal = state.invoice.invoiceTotal;
    }
  }

  ngOnInit(): void {}

  printInvoice(): void {
    window.print();
  }
}
