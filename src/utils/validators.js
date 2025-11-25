class Validators {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate employee ID format (customize as needed)
   */
  static isValidEmployeeId(employeeId) {
    // Example: Employee ID should be alphanumeric, 3-10 characters
    const employeeIdRegex = /^[A-Za-z0-9]{3,10}$/;
    return employeeIdRegex.test(employeeId);
  }

  /**
   * Validate date format (dd/mm/yyyy)
   */
  static isValidDate(dateString) {
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Basic date validation
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 2020 || year > 2030) return false;

    // Create date object to validate
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  }

  /**
   * Validate that date is not in the past
   */
  static isDateInFuture(dateString) {
    if (!this.isValidDate(dateString)) return false;

    const [day, month, year] = dateString.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return inputDate >= today;
  }

  /**
   * Validate full name (should contain at least first and last name)
   */
  static isValidFullName(fullName) {
    if (!fullName || fullName.trim().length < 2) return false;

    // Should contain at least 2 words
    const words = fullName.trim().split(/\s+/);
    return words.length >= 2 && words.every(word => word.length > 0);
  }

  /**
   * Validate reason (should not be empty and have reasonable length)
   */
  static isValidReason(reason) {
    if (!reason || reason.trim().length < 5) return false;
    if (reason.trim().length > 500) return false;
    return true;
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate all form data
   */
  static validateLeaveRequestData(data) {
    const errors = [];

    // Email validation
    if (!this.isValidEmail(data.email)) {
      errors.push('Email không hợp lệ');
    }

    // Employee ID validation
    if (!this.isValidEmployeeId(data.employeeId)) {
      errors.push('Mã nhân viên không hợp lệ (3-10 ký tự, chỉ chữ và số)');
    }

    // Full name validation
    if (!this.isValidFullName(data.fullName)) {
      errors.push('Họ và tên phải có ít nhất 2 từ');
    }

    // Date validation
    if (!this.isValidDate(data.leaveDate)) {
      errors.push('Ngày nghỉ không hợp lệ (định dạng: dd/mm/yyyy)');
    }

    // Reason validation
    if (!this.isValidReason(data.reason)) {
      errors.push('Lý do nghỉ phải có ít nhất 5 ký tự và không quá 500 ký tự');
    }

    // Direct manager validation
    if (!data.directManager || data.directManager.trim().length < 2) {
      errors.push('Quản lý trực tiếp không được để trống');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Format date to dd/mm/yyyy
   */
  static formatDate(date) {
    if (date instanceof Date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date;
  }
}

module.exports = Validators;
