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
  private sessionStartTime: number;

  constructor(private analytics: Analytics) {
    this.deviceInfo = this.initializeDeviceInfo();
    this.sessionStartTime = this.initializeSessionStartTime();
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

  private initializeSessionStartTime(): number {
    // Try to get existing session start time from sessionStorage
    const existingStartTime = sessionStorage.getItem('analytics_session_start');
    if (existingStartTime) {
      return parseInt(existingStartTime, 10);
    }

    // Create new session start time
    const startTime = Date.now();
    sessionStorage.setItem('analytics_session_start', startTime.toString());
    return startTime;
  }

  /**
   * Get current session duration in seconds
   * @returns Session duration in seconds
   */
  getSessionDuration(): number {
    const currentTime = Date.now();
    const durationMs = currentTime - this.sessionStartTime;
    return Math.round(durationMs / 1000); // Convert to seconds
  }

  /**
   * Get current session duration in minutes
   * @returns Session duration in minutes
   */
  getSessionDurationMinutes(): number {
    const durationSeconds = this.getSessionDuration();
    return Math.round((durationSeconds / 60) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Log an analytics event with device information and session time automatically included
   * @param eventName - The name of the event to log
   * @param additionalData - Additional data to include with the event
   */
  logEvent(eventName: string, additionalData: AnalyticsEventData = {}): void {
    const eventData = {
      ...additionalData,
      ...this.deviceInfo,
      session_duration_seconds: this.getSessionDuration(),
      session_duration_minutes: this.getSessionDurationMinutes(),
    };

    logEvent(this.analytics, eventName, eventData);
  }

  /**
   * Log a page view event with device information and session time
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
   * Log a form view event with device information and session time
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
   * Log a button click event with device information and session time
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
   * Log a purchase event with device information and session time
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
   * Log a form interaction event with session time
   * @param formName - The name of the form
   * @param action - The action performed (view, submit, etc.)
   * @param additionalData - Additional data to include
   */
  logFormInteraction(
    formName: string,
    action: string,
    additionalData: AnalyticsEventData = {}
  ): void {
    this.logEvent('form_interaction', {
      form_name: formName,
      action: action,
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

  /**
   * Get session start time
   * @returns Session start timestamp
   */
  getSessionStartTime(): number {
    return this.sessionStartTime;
  }
}
