#!/usr/bin/env python3
"""
Simple script to test logging configuration.
Run this directly to see if logging works without Flask.
"""

import logging
import os
from logging.handlers import RotatingFileHandler

# Ensure logs directory exists
if not os.path.exists('logs'):
    os.makedirs('logs')

# Configure root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.DEBUG)
root_handler = logging.StreamHandler()
root_formatter = logging.Formatter('ROOT: %(levelname)s - %(name)s - %(message)s')
root_handler.setFormatter(root_formatter)
root_logger.addHandler(root_handler)

# Configure app logger
app_logger = logging.getLogger('strategist')
app_logger.setLevel(logging.DEBUG)

# Remove any existing handlers
for handler in app_logger.handlers[:]:
    app_logger.removeHandler(handler)

# Add file handler
file_handler = RotatingFileHandler('logs/test.log', maxBytes=10485760, backupCount=10)
file_formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
file_handler.setFormatter(file_formatter)
file_handler.setLevel(logging.DEBUG)
app_logger.addHandler(file_handler)

# Add console handler
console_handler = logging.StreamHandler()
console_formatter = logging.Formatter('APP: %(levelname)s - %(name)s - %(message)s')
console_handler.setFormatter(console_formatter)
console_handler.setLevel(logging.DEBUG)
app_logger.addHandler(console_handler)

# Create auth logger
auth_logger = logging.getLogger('strategist.auth')

# Test all log levels
print("\n--- Testing root logger ---")
root_logger.debug("Root DEBUG message")
root_logger.info("Root INFO message")
root_logger.warning("Root WARNING message")
root_logger.error("Root ERROR message")
root_logger.critical("Root CRITICAL message")

print("\n--- Testing app logger ---")
app_logger.debug("App DEBUG message")
app_logger.info("App INFO message")
app_logger.warning("App WARNING message")
app_logger.error("App ERROR message")
app_logger.critical("App CRITICAL message")

print("\n--- Testing auth logger ---")
auth_logger.debug("Auth DEBUG message")
auth_logger.info("Auth INFO message")
auth_logger.warning("Auth WARNING message")
auth_logger.error("Auth ERROR message")
auth_logger.critical("Auth CRITICAL message")

print("\nCheck logs/test.log for file output") 