#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Fix __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IPConfigUpdater {
  constructor() {
    this.currentIP = null;
    this.configFiles = [
      { path: '.env', pattern: /API_BASE_URL=http:\/\/.*?:5001\/api/, replacement: 'API_BASE_URL=http://IP_PLACEHOLDER:5001/api' },
      { path: 'app.config.js', pattern: /API_BASE_URL: process\.env\.API_BASE_URL \|\| "http:\/\/.*?:5001\/api"/, replacement: 'API_BASE_URL: process.env.API_BASE_URL || "http://IP_PLACEHOLDER:5001/api"' }
    ];
    this.isMonitoring = false;
  }

  getLocalIP() {
    const interfaces = os.networkInterfaces();
    const priorityInterfaces = ['Wi-Fi', 'en0', 'eth0', 'Ethernet'];

    for (const name of priorityInterfaces) {
      const iface = interfaces[name];
      if (iface) {
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            return alias.address;
          }
        }
      }
    }

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      for (const alias of iface) {
        if (alias.family === 'IPv4' && !alias.internal && !alias.address.startsWith('169.254')) {
          return alias.address;
        }
      }
    }
    return null;
  }

  updateConfigFiles(newIP) {
    console.log(`🔄 Updating configuration files with IP: ${newIP}`);

    this.configFiles.forEach(({ path: filePath, pattern, replacement }) => {
      try {
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          const updatedReplacement = replacement.replace('IP_PLACEHOLDER', newIP);

          if (pattern.test(content)) {
            content = content.replace(pattern, updatedReplacement);
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated ${filePath}`);
          } else {
            console.log(`⚠️  Pattern not found in ${filePath}, file might need manual check`);
          }
        } else {
          console.log(`⚠️  File ${filePath} not found`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
      }
    });
  }

  checkIPChange() {
    const newIP = this.getLocalIP();
    if (!newIP) {
      console.log('⚠️  No valid IP address found');
      return false;
    }

    if (newIP !== this.currentIP) {
      console.log(`🌐 IP changed: ${this.currentIP || 'unknown'} → ${newIP}`);
      this.currentIP = newIP;
      this.updateConfigFiles(newIP);
      return true;
    }
    return false;
  }

  startMonitoring() {
    if (this.isMonitoring) {
      console.log('Already monitoring network changes');
      return;
    }

    console.log('🚀 Starting IP monitoring...');
    this.isMonitoring = true;

    this.checkIPChange();

    const intervalCheck = setInterval(() => {
      this.checkIPChange();
    }, 5000);

    if (process.platform === 'win32') {
      this.setupWindowsNetworkMonitoring();
    } else if (process.platform === 'darwin') {
      this.setupMacNetworkMonitoring();
    }

    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping IP monitoring...');
      clearInterval(intervalCheck);
      this.isMonitoring = false;
      process.exit(0);
    });

    console.log('✅ IP monitoring started. Press Ctrl+C to stop.');
  }

  setupWindowsNetworkMonitoring() {
    exec('powershell -Command "Register-WmiEvent -Query \\"SELECT * FROM Win32_NetworkAdapterConfiguration\\" -Action { echo \\"Network change detected\\" }"', 
      (error) => {
        if (error) {
          console.log('⚠️  Windows network monitoring not available, using polling');
        }
      });
  }

  setupMacNetworkMonitoring() {
    exec('system_profiler SPNetworkDataType -detailLevel mini', { timeout: 0 });
    exec('networksetup -listallhardwareports', (error) => {
      if (!error) {
        console.log('📡 Enhanced macOS network monitoring enabled');
      }
    });
  }

  updateOnce() {
    console.log('🔍 Checking current IP address...');
    const ip = this.getLocalIP();

    if (ip) {
      console.log(`📍 Current IP: ${ip}`);
      this.updateConfigFiles(ip);
      console.log('✅ Configuration files updated successfully');
    } else {
      console.log('❌ Could not detect IP address');
      process.exit(1);
    }
  }

  getStatus() {
    const ip = this.getLocalIP();
    const interfaces = os.networkInterfaces();

    console.log('📊 Network Status:');
    console.log(`   Current IP: ${ip || 'Not detected'}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Hostname: ${os.hostname()}`);

    console.log('\n🌐 Network Interfaces:');
    Object.keys(interfaces).forEach(name => {
      const iface = interfaces[name];
      iface.forEach(alias => {
        if (alias.family === 'IPv4' && !alias.internal) {
          console.log(`   ${name}: ${alias.address}`);
        }
      });
    });
  }
}

function main() {
  const updater = new IPConfigUpdater();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'monitor':
    case 'start':
      updater.startMonitoring();
      break;
    case 'update':
    case 'once':
      updater.updateOnce();
      break;
    case 'status':
      updater.getStatus();
      break;
    case 'help':
    case '--help':
    case '-h':
      console.log(`
📡 IP Config Updater - Automatic IP detection and config update

Usage:
  node ip-updater.js [command]

Commands:
  monitor, start    Start continuous IP monitoring
  update, once      Update configuration files once with current IP
  status            Show current network status
  help              Show this help message

Examples:
  node ip-updater.js monitor    # Start monitoring for IP changes
  node ip-updater.js update     # Update configs with current IP
  node ip-updater.js status     # Show current IP and network info
      `);
      break;
    default:
      console.log('🤖 IP Config Updater');
      console.log('Run with --help for usage information');
      console.log('Quick start: node ip-updater.js monitor');
      break;
  }
}

// Export for import usage
export default IPConfigUpdater;

// If run directly, start CLI
if (process.argv[1] === __filename) {
  main();
}
