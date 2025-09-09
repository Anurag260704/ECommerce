const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
exports.generateRandomString = (length = 10) => {
    return crypto.randomBytes(Math.ceil(length / 2))
                 .toString('hex')
                 .slice(0, length);
};

/**
 * Generate a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
exports.generateRandomNumber = (min = 1000, max = 9999) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Hash a string using SHA256
 * @param {string} text - Text to hash
 * @returns {string} Hashed string
 */
exports.hashString = (text) => {
    return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency
 */
exports.formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
exports.isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
exports.sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
exports.getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

/**
 * Check if file type is allowed
 * @param {string} filename - Filename
 * @param {Array} allowedTypes - Array of allowed extensions
 * @returns {boolean} True if file type is allowed
 */
exports.isAllowedFileType = (filename, allowedTypes = ['.jpg', '.jpeg', '.png', '.gif']) => {
    const extension = exports.getFileExtension(filename);
    return allowedTypes.includes(extension);
};

/**
 * Convert file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable file size
 */
exports.formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Create email transporter
 * @returns {Object} Nodemailer transporter
 */
exports.createEmailTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email text
 * @param {string} options.html - Email HTML
 * @returns {Promise} Email send result
 */
exports.sendEmail = async (options) => {
    try {
        const transporter = exports.createEmailTransporter();
        
        const mailOptions = {
            from: `${process.env.FROM_NAME || 'ECommerce App'} <${process.env.FROM_EMAIL}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Generate HTML email template
 * @param {Object} options - Template options
 * @param {string} options.title - Email title
 * @param {string} options.body - Email body
 * @param {string} options.buttonText - Button text
 * @param {string} options.buttonUrl - Button URL
 * @returns {string} HTML template
 */
exports.generateEmailTemplate = (options) => {
    const { title, body, buttonText, buttonUrl } = options;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8f9fa; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            <p>${body}</p>
            ${buttonText && buttonUrl ? `<a href="${buttonUrl}" class="button">${buttonText}</a>` : ''}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ECommerce App. All rights reserved.</p>
        </div>
    </body>
    </html>`;
};

/**
 * Create pagination object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination object
 */
exports.createPagination = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
};

/**
 * Generate slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
exports.generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
        .trim();
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
exports.capitalizeWords = (text) => {
    return text.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Generate order number
 * @returns {string} Unique order number
 */
exports.generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ORD-${dateStr}-${randomNum}`;
};

/**
 * Calculate estimated delivery date
 * @param {number} days - Number of days to add
 * @returns {Date} Estimated delivery date
 */
exports.calculateDeliveryDate = (days = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date
 */
exports.formatDate = (date, locale = 'en-US') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
};

/**
 * Calculate tax amount
 * @param {number} amount - Amount to calculate tax on
 * @param {number} taxRate - Tax rate (default 10%)
 * @returns {number} Tax amount
 */
exports.calculateTax = (amount, taxRate = 0.10) => {
    return Math.round(amount * taxRate * 100) / 100;
};

/**
 * Calculate shipping cost based on distance and weight
 * @param {number} distance - Distance in kilometers
 * @param {number} weight - Weight in kilograms
 * @returns {number} Shipping cost
 */
exports.calculateShipping = (distance, weight = 1) => {
    const baseRate = 5;
    const distanceRate = 0.1;
    const weightRate = 2;
    
    return Math.round((baseRate + (distance * distanceRate) + (weight * weightRate)) * 100) / 100;
};

/**
 * Validate and parse coordinates
 * @param {string|number} lat - Latitude
 * @param {string|number} lng - Longitude
 * @returns {Object|null} Parsed coordinates or null if invalid
 */
exports.parseCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
        return null;
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return null;
    }
    
    return { latitude, longitude };
};

/**
 * Check if a date is within a range
 * @param {Date} date - Date to check
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} True if date is within range
 */
exports.isDateInRange = (date, startDate, endDate) => {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return checkDate >= start && checkDate <= end;
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
exports.deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
