// src/lib/audio-recorder.ts

import { audioContext } from "./utils";
import AudioRecordingWorklet from "./worklets/audio-processing";
import SafariAudioRecordingWorklet from "./worklets/safari-audio-processing";
import VolMeterWorket from "./worklets/vol-meter";
import { createWorketFromSrc } from "./audioworklet-registry";
import EventEmitter from "eventemitter3";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function createSafariAudioContext(sampleRate: number): Promise<AudioContext> {
  const AudioContextClass = (window as any).webkitAudioContext || window.AudioContext;
  const ctx = new AudioContextClass({ sampleRate, latencyHint: 'interactive' });
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

export class AudioRecorder extends EventEmitter {
  stream?: MediaStream;
  audioContext?: AudioContext;
  source?: MediaStreamAudioSourceNode;
  recording: boolean = false;
  recordingWorklet?: AudioWorkletNode;
  vuWorklet?: AudioWorkletNode;
  private starting: Promise<void> | null = null;
  isSafari: boolean;

  constructor(public sampleRate = 16000) {
    super();
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  async start() {
    if (this.recording || this.starting) return;
    this.starting = new Promise(async (resolve, reject) => {
      try {
        const constraints = {
          audio: this.isSafari 
            ? { sampleRate: this.sampleRate, channelCount: 1 } 
            : { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: this.sampleRate }
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        this.audioContext = this.isSafari 
            ? await createSafariAudioContext(this.sampleRate)
            : await audioContext({ sampleRate: this.sampleRate });

        this.source = this.audioContext.createMediaStreamSource(this.stream);

        const recordingWorkletSrc = this.isSafari ? SafariAudioRecordingWorklet : AudioRecordingWorklet;
        await this.audioContext.audioWorklet.addModule(createWorketFromSrc("recorder", recordingWorkletSrc));
        await this.audioContext.audioWorklet.addModule(createWorketFromSrc("vumeter", VolMeterWorket));

        this.recordingWorklet = new AudioWorkletNode(this.audioContext, "recorder", { processorOptions: { sampleRate: this.sampleRate } });
        this.vuWorklet = new AudioWorkletNode(this.audioContext, "vumeter");

        let lastVolume = 0;
        
        this.recordingWorklet.port.onmessage = (ev: MessageEvent) => {
          const arrayBuffer = ev.data.data?.int16arrayBuffer;
          if (arrayBuffer) {
            const base64 = arrayBufferToBase64(arrayBuffer);
            // ارسال همزمان دیتا و آخرین حجم صدای دریافتی
            this.emit("data", base64, lastVolume);
          }
        };

        this.vuWorklet.port.onmessage = (ev: MessageEvent) => {
          if (typeof ev.data.volume === 'number') {
            lastVolume = ev.data.volume;
          }
        };

        this.source.connect(this.recordingWorklet);
        this.source.connect(this.vuWorklet);
        
        this.recording = true;
        resolve();
      } catch (error) {
        console.error('Failed to start recording:', error);
        this.stop();
        reject(error);
      } finally {
        this.starting = null;
      }
    });
    return this.starting;
  }

  stop() {
    if (!this.recording && !this.starting) return;
    const handleStop = () => {
        this.recording = false;
        this.source?.disconnect();
        this.stream?.getTracks().forEach(track => track.stop());
        if (this.audioContext?.state === 'running') {
            this.audioContext.close();
        }
        this.stream = undefined;
        this.audioContext = undefined;
        this.source = undefined;
        this.recordingWorklet = undefined;
        this.vuWorklet = undefined;
        this.emit("stop");
    };
    if (this.starting) {
      this.starting.then(handleStop).catch(handleStop);
    } else {
      handleStop();
    }
  }
}