/**
 * AI Service Manager
 * Automatically starts and manages the Python AI service
 */

import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIServiceManager {
  constructor() {
    this.aiProcess = null;
    this.isRunning = false;
    this.startupAttempts = 0;
    this.maxStartupAttempts = 3;
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
  }

  /**
   * Start the Python AI service
   */
  async start() {
    console.log('🤖 Starting AI Service...');

    // Check if already running
    if (await this.checkHealth()) {
      console.log('✅ AI Service is already running');
      this.isRunning = true;
      return true;
    }

    // Start the Python service
    const aiBackendPath = path.join(__dirname, '../../../homeless-aid-platform/ai_implementations');
    const pythonScript = path.join(aiBackendPath, 'api/app.py');
    const venvPython = path.join(aiBackendPath, 'venv/bin/python');

    console.log(`📍 AI Service path: ${aiBackendPath}`);
    console.log(`🐍 Python: ${venvPython}`);
    console.log(`📄 Script: ${pythonScript}`);

    try {
      this.aiProcess = spawn(venvPython, [pythonScript], {
        cwd: aiBackendPath,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      // Handle output
      this.aiProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[AI Service] ${output}`);
        }
      });

      this.aiProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('WARNING')) {
          console.error(`[AI Service Error] ${output}`);
        }
      });

      this.aiProcess.on('error', (error) => {
        console.error('❌ Failed to start AI Service:', error.message);
        this.isRunning = false;
      });

      this.aiProcess.on('exit', (code, signal) => {
        console.log(`⚠️  AI Service exited with code ${code}, signal ${signal}`);
        this.isRunning = false;
        this.aiProcess = null;
      });

      // Wait for service to be ready
      console.log('⏳ Waiting for AI Service to start...');
      const ready = await this.waitForReady(60000); // 60 second timeout (models take time to load)

      if (ready) {
        console.log('✅ AI Service started successfully!');
        this.isRunning = true;
        return true;
      } else {
        console.error('❌ AI Service failed to start within timeout');
        this.stop();
        return false;
      }
    } catch (error) {
      console.error('❌ Error starting AI Service:', error.message);
      return false;
    }
  }

  /**
   * Wait for AI service to be ready
   */
  async waitForReady(timeout = 60000) {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds
    let attempts = 0;

    while (Date.now() - startTime < timeout) {
      attempts++;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      if (await this.checkHealth()) {
        console.log(`✅ AI Service responded after ${elapsed} seconds`);
        return true;
      }
      
      if (attempts % 5 === 0) {
        console.log(`   Still waiting... (${elapsed}s elapsed)`);
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    console.log(`   Timeout after ${Math.round(timeout / 1000)} seconds`);
    return false;
  }

  /**
   * Check if AI service is healthy
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, {
        timeout: 3000,
      });
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop the AI service
   */
  stop() {
    if (this.aiProcess) {
      console.log('🛑 Stopping AI Service...');
      this.aiProcess.kill('SIGTERM');
      this.aiProcess = null;
      this.isRunning = false;
    }
  }

  /**
   * Restart the AI service
   */
  async restart() {
    console.log('🔄 Restarting AI Service...');
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    return await this.start();
  }

  /**
   * Get service status
   */
  async getStatus() {
    const healthy = await this.checkHealth();
    return {
      running: this.isRunning,
      healthy: healthy,
      url: this.aiServiceUrl,
      pid: this.aiProcess ? this.aiProcess.pid : null,
    };
  }
}

// Singleton instance
const aiServiceManager = new AIServiceManager();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  aiServiceManager.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  aiServiceManager.stop();
  process.exit(0);
});

export default aiServiceManager;
