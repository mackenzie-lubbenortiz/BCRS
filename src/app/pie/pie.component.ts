/**
 * Title: Pie Chart
 * Author: Mackenzie Lubben-Ortiz
 * Date: 18 July 2024
 * Updated: 07/28/2024 by Brock Hemsouvanh
 * Description: Purchase by service pie graph
 */

'use strict';

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.css']
})
export class PieComponent implements OnInit {
  // Define the Theme colors
  private readonly themeColors = [
    '#0F1D4A', // Dark Blue
    '#C0C0C0', // Silver
    '#223164', // ThemeBlue
    '#95a5a5', // BCRS Grey
    '#3598db', // Light Blue
    '#333333', // Dark Grey
    '#5165a2'  // BCRS Blue
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch purchase data from the backend
    this.http.get<any[]>('http://localhost:3000/api/invoices/purchases-graph').subscribe(data => {
      // Map to store the total amounts for each service
      const serviceMap = new Map<string, number>();

      // Process each item in the fetched data
      data.forEach(item => {
        if (serviceMap.has(item.serviceName)) {
          // If the service already exists in the map, add the amount to the existing total
          serviceMap.set(item.serviceName, serviceMap.get(item.serviceName)! + item.totalAmount);
        } else {
          // If the service does not exist in the map, add it with the current amount
          serviceMap.set(item.serviceName, item.totalAmount);
        }
      });

      // Extract labels (service names) and amounts (total amounts per service) from the map
      const labels = Array.from(serviceMap.keys());
      const amounts = Array.from(serviceMap.values());

      // Ensure the number of colors matches the number of labels
      const backgroundColor = labels.map((_, index) => this.themeColors[index % this.themeColors.length]);
      const hoverBackgroundColor = labels.map(() => '#946B2D'); // Theme bronze for all segments on hover

      // Create a pie chart with the extracted data
      const myPie = new Chart('myPieChart', {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: amounts,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: hoverBackgroundColor
          }]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: '#0F1D4A', // Dark Blue
                font: {
                  size: 25 // Legend font size
                },
              }
            },
            tooltip: {
              callbacks: {
                // Format the tooltip label with service name and amount in USD
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw ? `$${(context.raw as number).toFixed(2)}` : '';
                  return `${label}: ${value}`;
                }
              },
              titleFont: {
                size: 18 // Increase tooltip title font size
              },
              bodyFont: {
                size: 18 // Increase tooltip font size
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false // Disable aspect ratio maintenance to fit container
        }
      });
    }, error => {
      console.error('Error fetching data', error);
    });
  }
}
