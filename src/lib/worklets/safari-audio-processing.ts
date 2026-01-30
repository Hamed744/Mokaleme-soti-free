/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const SafariAudioRecordingWorklet = `
class AudioProcessingWorklet extends AudioWorkletProcessor {
  // Safari seems to work better with smaller buffer sizes
  // and more frequent updates
  buffer = new Int16Array(1024);
  bufferWriteIndex = 0;
  lastProcessTime = 0;
  sampleRate = 0;

  constructor(options) {
    super();
    console.log('Safari AudioProcessingWorklet constructed with options:', options);
    this.sampleRate = options.processorOptions?.sampleRate || sampleRate;
    console.log('Using sample rate:', this.sampleRate);
  }

  process(inputs) {
    // Log processing details periodically
    const now = currentTime;
    if (now - this.lastProcessTime > 1) {
      console.log('Safari AudioProcessingWorklet processing:', {
        inputChannels: inputs[0]?.length,
        inputSamples: inputs[0]?.[0]?.length,
        bufferWriteIndex: this.bufferWriteIndex,
        time: now
      });
      this.lastProcessTime = now;
    }

    if (!inputs[0]?.length) {
      console.warn('No input channels available');
      return true;
    }

    const channel0 = inputs[0][0];
    if (!channel0?.length) {
      console.warn('Empty input channel');
      return true;
    }

    this.processChunk(channel0);
    return true;
  }

  sendAndClearBuffer() {
    if (this.bufferWriteIndex > 0) {
      this.port.postMessage({
        event: "chunk",
        data: {
          int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
        },
      });
      this.bufferWriteIndex = 0;
    }
  }

  processChunk(float32Array) {
    // Safari can sometimes send empty arrays or undefined
    if (!float32Array?.length) {
      return;
    }

    const l = float32Array.length;
    for (let i = 0; i < l; i++) {
      // Convert float32 -1 to 1 to int16 -32768 to 32767
      // Add some additional gain for Safari which tends to be quieter
      const int16Value = Math.max(-32768, Math.min(32767, float32Array[i] * 32768 * 1.5));
      this.buffer[this.bufferWriteIndex++] = int16Value;
      
      if (this.bufferWriteIndex >= this.buffer.length) {
        this.sendAndClearBuffer();
      }
    }

    // Make sure to send any remaining data
    if (this.bufferWriteIndex > 0) {
      this.sendAndClearBuffer();
    }
  }
}
`;

export default SafariAudioRecordingWorklet; 