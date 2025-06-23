import { Injectable } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';

export interface DeviceInfo {
  deviceType: 'mobile' | 'web';
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  isTouchDevice: boolean;
}

export interface AnalyticsEventData {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private deviceInfo: DeviceInfo;

  constructor(private analytics: Analytics) {
    this.deviceInfo = this.initializeDeviceInfo();
  }

  private initializeDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      ) || window.innerWidth <= 768;

    return {
      deviceType: isMobile ? 'mobile' : 'web',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userAgent: userAgent.substring(0, 100), // Truncate for privacy
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  }

  /**
   * Log an analytics event with device information automatically included
   * @param eventName - The name of the event to log
   * @param additionalData - Additional data to include with the event
   */
  logEvent(eventName: string, additionalData: AnalyticsEventData = {}): void {
    const eventData = {
      ...additionalData,
      ...this.deviceInfo,
    };

    logEvent(this.analytics, eventName, eventData);
  }

  /**
   * Log a page view event with device information
   * @param pageName - The name of the page being viewed
   * @param additionalData - Additional data to include
   */
  logPageView(pageName: string, additionalData: AnalyticsEventData = {}): void {
    this.logEvent('page_view', {
      page_name: pageName,
      ...additionalData,
    });
  }

  /**
   * Log a form view event with device information
   * @param formName - The name of the form being viewed
   * @param additionalData - Additional data to include
   */
  logFormView(formName: string, additionalData: AnalyticsEventData = {}): void {
    this.logEvent('form_view', {
      form_name: formName,
      ...additionalData,
    });
  }

  /**
   * Log a button click event with device information
   * @param buttonName - The name of the button clicked
   * @param additionalData - Additional data to include
   */
  logButtonClick(
    buttonName: string,
    additionalData: AnalyticsEventData = {}
  ): void {
    this.logEvent('button_click', {
      button_name: buttonName,
      ...additionalData,
    });
  }

  /**
   * Log a purchase event with device information
   * @param productId - The ID of the product purchased
   * @param amount - The purchase amount
   * @param additionalData - Additional data to include
   */
  logPurchase(
    productId: string,
    amount: number,
    additionalData: AnalyticsEventData = {}
  ): void {
    this.logEvent('purchase', {
      product_id: productId,
      amount: amount,
      ...additionalData,
    });
  }

  /**
   * Get current device information
   * @returns Current device information
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * Check if current device is mobile
   * @returns True if device is mobile
   */
  isMobile(): boolean {
    return this.deviceInfo.deviceType === 'mobile';
  }

  /**
   * Check if current device is web/desktop
   * @returns True if device is web/desktop
   */
  isWeb(): boolean {
    return this.deviceInfo.deviceType === 'web';
  }

  /**
   * Check if current device supports touch
   * @returns True if device supports touch
   */
  isTouchDevice(): boolean {
    return this.deviceInfo.isTouchDevice;
  }
}
