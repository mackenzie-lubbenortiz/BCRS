/**
 * Title: service-request.component.ts
 * Author: Brock Hemsouvanh
 * Date: 07/21/2024
 * Updated: 07/28/2024 by Brock Hemsouvanh
 * Description: Service Request component logic for BCRS application. This component handles the form for service requests
 * where users can select services and enter additional costs, automatically updating the invoice total.
 */

'use strict';

import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from '../services/invoice.service';

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.css']
})
export class ServiceRequestComponent implements OnInit {
  serviceRequestForm: FormGroup;
  lineItemTotal: number = 0;
  invoiceTotal: number = 0;

  constructor(
    private fb: FormBuilder, 
    private invoiceService: InvoiceService, 
    private renderer: Renderer2,
    private router: Router
  ) { 
    // Form initialization with validation rules
    this.serviceRequestForm = this.fb.group({
      customerFirstName: ['', Validators.required],
      customerLastName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      orderDate: ['', Validators.required],
      partsAmount: [0, Validators.min(0)],
      laborAmount: [0, Validators.min(0)],
      additionalPartsServices: ['']
    });
  }

  ngOnInit(): void {
    // Subscribe to form changes to recalculate totals
    this.serviceRequestForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
    this.setupCheckboxListeners();
  }

  // Setup real-time calculation when checkboxes change
  setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.form-check-input');
    checkboxes.forEach((checkbox) => {
      this.renderer.listen(checkbox, 'change', () => {
        this.calculateTotals();
      });
    });
  }

  onSubmit(): void {
    if (this.serviceRequestForm.valid) {
      const formValues = this.serviceRequestForm.value;
      const selectedServices = this.getSelectedServices();
      const invoiceData = {
        email: formValues.customerEmail,
        fullName: `${formValues.customerFirstName} ${formValues.customerLastName}`,
        lineItems: selectedServices,
        partsAmount: formValues.partsAmount,
        laborAmount: formValues.laborAmount,
        additionalPartsServices: formValues.additionalPartsServices,
        lineItemTotal: this.lineItemTotal,
        invoiceTotal: this.invoiceTotal,
        orderDate: formValues.orderDate
      };
      console.log('Form Submitted', invoiceData);
      this.createInvoice(invoiceData);
    } else {
      console.log('Form is invalid');
    }
  }

  getSelectedServices(): { name: string, price: number }[] {
    const selectedServices: { name: string, price: number }[] = [];
    const checkboxes = document.querySelectorAll('.form-check-input');
    checkboxes.forEach((checkbox: any) => {
      if (checkbox.checked) {
        selectedServices.push({
          name: checkbox.getAttribute('data-service-name'),
          price: parseFloat(checkbox.getAttribute('data-service-price'))
        });
      }
    });
    return selectedServices;
  }

  calculateLineItemTotal(services: { name: string, price: number }[]): number {
    return services.reduce((total, service) => total + service.price, 0);
  }

  calculateInvoiceTotal(partsAmount: number, laborAmount: number, services: { name: string, price: number }[]): number {
    return partsAmount + laborAmount + this.calculateLineItemTotal(services);
  }

  calculateTotals(): void {
    const formValues = this.serviceRequestForm.value;
    const selectedServices = this.getSelectedServices();
    const additionalCosts = this.parseAdditionalCosts(formValues.additionalPartsServices);

    this.lineItemTotal = this.calculateLineItemTotal(selectedServices) + additionalCosts;
    this.invoiceTotal = this.calculateInvoiceTotal(formValues.partsAmount, formValues.laborAmount, selectedServices) + additionalCosts;
  }

  parseAdditionalCosts(additionalText: string): number {
    const costMatches = additionalText.match(/\d+/g);
    const costs = costMatches ? costMatches.map(Number) : [];
    return costs.reduce((acc, cur) => acc + cur, 0);
  }

  createInvoice(invoiceData: any): void {
    this.invoiceService.createInvoice(invoiceData).subscribe({
      next: (response) => {
        console.log('Invoice created successfully', response);
        this.router.navigate(['/invoice-summary'], { state: { invoice: invoiceData } });
      },
      error: (err) => {
        console.error('Error creating invoice', err);
      }
    });
  }
}
