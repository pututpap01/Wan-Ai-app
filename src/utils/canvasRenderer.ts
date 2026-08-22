import { AspectRatio, CameraMotion, VideoStyle } from "../types";

export interface RenderConfig {
  prompt: string;
  style: VideoStyle;
  cameraMotion: CameraMotion;
  aspectRatio: AspectRatio;
  duration: number; // in seconds
  motionIntensity: number; // 1 to 10
  imageUrl?: string;
  subtitles?: string;
  fps?: number;
}

export class VideoRendererEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private imageElement: HTMLImageElement | null = null;
  private particles: Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    opacity: number;
    life: number;
    maxLife: number;
  }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get 2d canvas context");
    this.ctx = context;
  }

  public setDimensions(aspectRatio: AspectRatio, baseWidth: number = 720) {
    let width = baseWidth;
    let height = baseWidth;

    if (aspectRatio === "9:16") {
      width = 405; // 720 * (9/16)
      height = 720;
    } else if (aspectRatio === "16:9") {
      width = 720;
      height = 405;
    } else {
      width = 600;
      height = 600;
    }

    this.canvas.width = width;
    this.canvas.height = height;
  }

  public async loadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.imageElement = img;
        resolve();
      };
      img.onerror = () => {
        this.imageElement = null;
        resolve();
      };
      img.src = url;
    });
  }

  private initParticles(count: number, width: number, height: number, style: VideoStyle) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      let color = "rgba(255, 255, 255, 0.6)";
      if (style === "Cyberpunk Neon") {
        color = i % 2 === 0 ? "rgba(6, 182, 212, 0.8)" : "rgba(236, 72, 153, 0.8)";
      } else if (style === "Anime & Manga") {
        color = i % 3 === 0 ? "rgba(244, 114, 182, 0.7)" : "rgba(253, 224, 71, 0.6)";
      } else if (style === "Cinematic" || style === "Photorealistic") {
        color = "rgba(251, 191, 36, 0.5)";
      }

      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5 - 0.5,
        color,
        opacity: Math.random() * 0.7 + 0.3,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 50,
      });
    }
  }

  /**
   * Render single frame at normalized time t (0.0 to 1.0)
   */
  public drawFrame(t: number, config: RenderConfig) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const intensity = (config.motionIntensity || 5) / 5;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Base Background Gradient based on Style
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (config.style === "Cyberpunk Neon") {
      grad.addColorStop(0, "#090d16");
      grad.addColorStop(0.5, "#1e1b4b");
      grad.addColorStop(1, "#31103f");
    } else if (config.style === "Anime & Manga") {
      grad.addColorStop(0, "#38bdf8");
      grad.addColorStop(0.6, "#f472b6");
      grad.addColorStop(1, "#fbbf24");
    } else if (config.style === "FPV Drone Aerial") {
      grad.addColorStop(0, "#0284c7");
      grad.addColorStop(0.4, "#38bdf8");
      grad.addColorStop(0.8, "#059669");
      grad.addColorStop(1, "#047857");
    } else if (config.style === "Vintage 35mm Film") {
      grad.addColorStop(0, "#78350f");
      grad.addColorStop(0.5, "#92400e");
      grad.addColorStop(1, "#1c1917");
    } else {
      // Cinematic / Default
      grad.addColorStop(0, "#0b1120");
      grad.addColorStop(0.5, "#172554");
      grad.addColorStop(1, "#1e1b4b");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Apply Camera Motion Transformation
    ctx.save();
    let scale = 1.0;
    let translateX = 0;
    let translateY = 0;
    let rotation = 0;

    switch (config.cameraMotion) {
      case "Slow Push-In (Zoom In)":
        scale = 1.0 + t * 0.25 * intensity;
        break;
      case "Dolly Pull-Out (Zoom Out)":
        scale = 1.25 - t * 0.25 * intensity;
        break;
      case "Pan Left to Right":
        translateX = (t - 0.5) * 60 * intensity;
        scale = 1.08;
        break;
      case "Pan Right to Left":
        translateX = (0.5 - t) * 60 * intensity;
        scale = 1.08;
        break;
      case "Tilt Up to Sky":
        translateY = (t - 0.5) * 50 * intensity;
        scale = 1.06;
        break;
      case "360 Orbital Rotation":
        rotation = Math.sin(t * Math.PI * 2) * 0.04 * intensity;
        translateX = Math.cos(t * Math.PI * 2) * 20 * intensity;
        scale = 1.12;
        break;
      case "FPV Drone Flight":
        scale = 1.0 + t * 0.4 * intensity;
        rotation = Math.sin(t * Math.PI * 3) * 0.05 * intensity;
        translateX = Math.sin(t * Math.PI * 2) * 25 * intensity;
        translateY = Math.cos(t * Math.PI * 2) * 15 * intensity;
        break;
      default:
        // Subtle organic breathing
        scale = 1.0 + Math.sin(t * Math.PI) * 0.03;
        break;
    }

    // Apply center transform
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2 + translateX, -height / 2 + translateY);

    // 3. Render Source Image if Image-to-Video mode
    if (this.imageElement && this.imageElement.complete) {
      const img = this.imageElement;
      // cover fit
      const hRatio = width / img.width;
      const vRatio = height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (width - img.width * ratio) / 2;
      const centerShiftY = (height - img.height * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShiftX,
        centerShiftY,
        img.width * ratio,
        img.height * ratio
      );

      // Subtle dynamic lighting blend overlay
      ctx.globalCompositeOperation = "overlay";
      const lightPulse = ctx.createRadialGradient(
        width * (0.3 + 0.4 * Math.sin(t * Math.PI * 2)),
        height * 0.4,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );
      lightPulse.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      lightPulse.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = lightPulse;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    } else {
      // 4. Procedural Generative Scenic Elements
      this.drawGenerativeScene(ctx, width, height, t, config);
    }

    // 5. Draw Dynamic Particle Systems (Light dust, cherry petals, neon sparks)
    if (this.particles.length === 0) {
      this.initParticles(40, width, height, config.style);
    }

    for (const p of this.particles) {
      p.x += p.speedX * intensity;
      p.y += p.speedY * intensity;
      p.life++;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    ctx.restore(); // Restore camera transform

    // 6. Cinematic Lens Flare & Letterbox / Vignette
    this.drawCinematicVignette(ctx, width, height, t, config.style);

    // 7. Subtitles / Prompt overlay if specified
    if (config.subtitles) {
      this.drawSubtitles(ctx, width, height, config.subtitles, t);
    }

    // 8. Watermark badge (AI Generated 4K)
    this.drawWatermark(ctx, width, height);

    ctx.restore();
  }

  private drawGenerativeScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number,
    config: RenderConfig
  ) {
    const horizon = height * 0.6;

    // Glowing Horizon Sun / Neon Ring
    const sunGrad = ctx.createRadialGradient(
      width * 0.5,
      horizon * 0.85,
      10,
      width * 0.5,
      horizon * 0.85,
      width * 0.45
    );
    if (config.style === "Cyberpunk Neon") {
      sunGrad.addColorStop(0, "rgba(244, 63, 94, 0.9)");
      sunGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.5)");
      sunGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else if (config.style === "Anime & Manga") {
      sunGrad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
      sunGrad.addColorStop(0.4, "rgba(251, 146, 60, 0.6)");
      sunGrad.addColorStop(1, "rgba(244, 114, 182, 0)");
    } else {
      sunGrad.addColorStop(0, "rgba(251, 191, 36, 0.85)");
      sunGrad.addColorStop(0.6, "rgba(245, 158, 11, 0.4)");
      sunGrad.addColorStop(1, "rgba(30, 27, 75, 0)");
    }
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, width, height);

    // Mountains / Skyline Silhouettes with parallax
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    const mtnCount = 6;
    for (let i = 0; i <= mtnCount; i++) {
      const x = (width / mtnCount) * i;
      const peakHeight = Math.sin(i * 1.5 + 2) * 50 + 40;
      const waveShift = Math.sin(t * Math.PI + i) * 6;
      ctx.lineTo(x, horizon - peakHeight + waveShift);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const mtnGrad = ctx.createLinearGradient(0, horizon - 80, 0, height);
    if (config.style === "Cyberpunk Neon") {
      mtnGrad.addColorStop(0, "#1e1b4b");
      mtnGrad.addColorStop(1, "#030712");
    } else {
      mtnGrad.addColorStop(0, "rgba(15, 23, 42, 0.9)");
      mtnGrad.addColorStop(1, "rgba(2, 6, 23, 1)");
    }
    ctx.fillStyle = mtnGrad;
    ctx.fill();

    // Cyberpunk grid / Water reflection lines
    ctx.strokeStyle =
      config.style === "Cyberpunk Neon" ? "rgba(6, 182, 212, 0.4)" : "rgba(251, 191, 36, 0.25)";
    ctx.lineWidth = 1.5;
    for (let y = horizon + 10; y < height; y += (y - horizon) * 0.35 + 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Perspective lines
    const vanishX = width / 2;
    const vanishY = horizon;
    for (let x = -width * 0.5; x <= width * 1.5; x += width * 0.25) {
      const offsetX = Math.sin(t * Math.PI * 2) * 15;
      ctx.beginPath();
      ctx.moveTo(vanishX, vanishY);
      ctx.lineTo(x + offsetX, height);
      ctx.stroke();
    }
  }

  private drawCinematicVignette(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number,
    style: VideoStyle
  ) {
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.35,
      width / 2,
      height / 2,
      width * 0.75
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.65)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Film grain simulation for vintage / cinematic
    if (style === "Vintage 35mm Film" || style === "Cinematic") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let i = 0; i < 60; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        ctx.fillRect(gx, gy, 2, 2);
      }
    }
  }

  private drawSubtitles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string,
    t: number
  ) {
    ctx.save();
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const posY = height - 42;
    const padding = 12;
    const metrics = ctx.measureText(text);
    const textWidth = Math.min(metrics.width, width - 40);

    // Dark glass pill behind subtitle
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - textWidth / 2 - padding, posY - 28, textWidth + padding * 2, 34, 8);
    ctx.fill();

    // Glowing text
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 8;
    ctx.fillText(text, width / 2, posY);
    ctx.restore();
  }

  private drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.font = "600 11px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "right";
    ctx.fillText("AI Studio 4K Engine", width - 14, 22);
    ctx.restore();
  }

  /**
   * Start preview loop animation on canvas
   */
  public startPreview(config: RenderConfig) {
    this.stopPreview();
    const durationMs = config.duration * 1000;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) % durationMs;
      const progress = elapsed / durationMs;
      this.drawFrame(progress, config);
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopPreview() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Records the canvas stream to produce a real downloadable video file (WebM / MP4)
   */
  public async renderVideoBlob(
    config: RenderConfig,
    onProgress?: (p: number) => void
  ): Promise<{ blobUrl: string; blob: Blob }> {
    this.stopPreview();
    this.recordedChunks = [];

    const fps = config.fps || 30;
    const totalFrames = Math.round(config.duration * fps);
    const stream = this.canvas.captureStream(fps);

    // Support webm with vp9 / h264 if available
    let mimeType = "video/webm;codecs=vp9";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }

    return new Promise((resolve, reject) => {
      try {
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6000000, // 6 Mbps high quality
        });

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);
          this.isRecording = false;
          resolve({ blobUrl, blob });
        };

        this.mediaRecorder.start();
        this.isRecording = true;

        let frame = 0;
        const frameInterval = 1000 / fps;

        const renderNext = () => {
          if (frame > totalFrames) {
            if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
              this.mediaRecorder.stop();
            }
            return;
          }

          const progress = frame / totalFrames;
          this.drawFrame(progress, config);
          if (onProgress) onProgress(Math.round(progress * 100));

          frame++;
          setTimeout(renderNext, frameInterval);
        };

        renderNext();
      } catch (err) {
        reject(err);
      }
    });
  }
}
